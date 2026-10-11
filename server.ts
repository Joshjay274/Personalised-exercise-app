import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Robust retry wrapper for Gemini calls to gracefully handle transient 503/429 spikes
async function callGeminiWithRetry(fn: () => Promise<any>, maxRetries = 4, delayMs = 1500): Promise<any> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || err?.error?.code;
      const errStr = (err?.message || '') + ' ' + (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.warn(`[Gemini Call] Attempt ${attempt} error: ${status || ''} - ${errStr.slice(0, 150)}`);
      const isTransient = status === 503 || status === 429 || errStr.includes('503') || errStr.includes('429') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE') || errStr.includes('RESOURCE_EXHAUSTED');
      if (attempt < maxRetries && isTransient) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Available exercise catalog for workout generator matching
const CATALOG_EXERCISES = [
  { id: 'incline_pushup_wall', name: 'Incline Wall / Elevated Pushup (Wrist-Safe)', category: 'calisthenics', target: 'chest, wrists, shoulders' },
  { id: 'forearm_plank_hold', name: 'Forearm Core Plank (Zero Wrist Pressure)', category: 'calisthenics', target: 'core, shoulders' },
  { id: 'dead_bug_core', name: 'Dead Bug Spine Decompression & Core Bracing', category: 'calisthenics', target: 'core' },
  { id: 'hollow_body_tuck', name: 'Hollow Body Compression Tuck', category: 'calisthenics', target: 'core' },
  { id: 'reverse_crunch_tuck', name: 'Reverse Pelvic Tuck & Crunch', category: 'calisthenics', target: 'core' },
  { id: 'bird_dog_hold', name: 'Bird Dog Quadruped Cross-Reach', category: 'calisthenics', target: 'core' },
  { id: 'side_plank_forearm', name: 'Side Forearm Plank (Zero Wrist Strain)', category: 'calisthenics', target: 'core' },
  { id: 'seated_tuck_hold', name: 'Seated Calisthenics L-Sit Tuck Hold', category: 'calisthenics', target: 'core' },
  { id: 'pike_pushup_elevated', name: 'Elevated Pike Pushup (Shoulder Overhead)', category: 'calisthenics', target: 'shoulders' },
  { id: 'doorframe_bodyweight_row', name: 'Doorframe / Towel Neutral Bodyweight Row', category: 'calisthenics', target: 'back' },
  { id: 'bench_chair_dip', name: 'Chair / Bench Triceps Dip (Neutral Palms)', category: 'calisthenics', target: 'arms' },
  { id: 'superman_back_arch', name: 'Superman Lumbar & Scapular Arch', category: 'calisthenics', target: 'back' },
  { id: 'bear_crawl_hold', name: 'Bear Crawl Isometric Quad & Core Hover', category: 'calisthenics', target: 'core, legs' },
  { id: 'pushup_neutral_handles', name: 'Neutral-Grip Dumbbell Pushup (Straight Wrists)', category: 'calisthenics', target: 'chest, wrists' },
  { id: 'db_floor_press', name: 'Dumbbell Neutral-Grip Floor Press', category: 'dumbbell', target: 'chest, shoulders' },
  { id: 'db_bicep_hammer_curl', name: 'Dumbbell Neutral-Grip Hammer Curl', category: 'dumbbell', target: 'arms, wrists' },
  { id: 'db_single_arm_row', name: 'Dumbbell Single-Arm Neutral Bench Row', category: 'dumbbell', target: 'back, core' },
  { id: 'db_neutral_shoulder_press', name: 'Dumbbell Neutral Overhead Press', category: 'dumbbell', target: 'shoulders, wrists' },
  { id: 'wrist_flexor_curl_db', name: 'Dumbbell Neutral Wrist Fortifier', category: 'joint_health', target: 'wrists' },
  { id: 'bb_goblet_squat', name: 'Barbell Front Goblet Squat (Knee-Safe Track)', category: 'barbell', target: 'legs' },
  { id: 'bb_romanian_deadlift', name: 'Barbell Romanian Deadlift (Hip Hinge Focus)', category: 'barbell', target: 'legs, back' },
  { id: 'bodyweight_glute_bridge', name: 'Bodyweight Glute Bridge & Hip Drive', category: 'calisthenics', target: 'legs' },
  { id: 'standing_calf_raise', name: 'Standing Calf Raise & Ankle Stabilizer', category: 'calisthenics', target: 'ankles' }
];

// Helper to assemble system prompt by coach persona
function buildCoachSystemInstruction(personaId: string, userProfile: any, customPersona?: any): string {
  const athleteContext = `Athlete Profile:
- Name: ${userProfile?.name || 'Athlete'}
- Age: ${userProfile?.age || 24} years old
- Height: ${userProfile?.heightCm || 175} cm (${Math.floor((userProfile?.heightCm || 175) / 30.48)} ft ${Math.round(((userProfile?.heightCm || 175) / 2.54) % 12)} in)
- Weight: ${userProfile?.weightKg || 70} kg
- Limb / Lever Profile: ${userProfile?.limbLeverType || 'balanced'} (${(userProfile?.heightCm || 175) >= 180 ? 'Longer levers: higher joint moment arms on squats, pushups, and calisthenics' : (userProfile?.heightCm || 175) <= 168 ? 'Compact levers: favorable mechanical advantage for bodyweight control' : 'Balanced levers'})
- Dumbbell load target: ${userProfile?.maxDumbbellWeightKg || 10} kg
- Barbell load target: ${userProfile?.maxBarbellWeightKg || 18} kg
- Barbell Bar Weight: ${userProfile?.barbellBarWeightKg || 8} kg (Compact Bedroom Barbell — NOT a heavy 20kg Olympic gym bar)
- Training Environment: Bedroom Setup (room-friendly space, compact home barbell, adjustable dumbbells, calisthenics).
- Session Structure: Exercise sets track DRS (Duration / Drop Sets in seconds) and Reps for progressive overload and time-under-tension.
- Target weekly workouts: ${userProfile?.workoutsPerWeek || 4} days per week: scheduled strictly on Monday, Wednesday, Thursday, and Friday (Tuesday, Saturday, and Sunday are dedicated rest, mobility, and tendon remodeling recovery days).
- Joint areas flagged with sensitivity/pain: ${userProfile?.jointPainAreas?.join(', ') || 'wrists'}
- DUMBBELL HARDWARE CONSTRAINTS: The athlete owns adjustable dumbbells with a 2kg handle and ONLY 2.5kg, 2.0kg, and 1.5kg plates.
- SLEEVE CAPACITY LIMIT: Each dumbbell sleeve can hold AT MOST 5 plates per side (maximum 10 plates total per dumbbell). Maximum achievable dumbbell load is 27kg (5× 2.5kg per side + 2kg handle).
- Always verify plate combos use only 2.5, 2.0, and 1.5kg plates and fit within 5 plates per side.
- For barbell calculations: Calculate for the athlete's compact bedroom barbell (${userProfile?.barbellBarWeightKg || 8}kg bar). Do NOT assume a 20kg Olympic bar.

CRITICAL BIOMECHANICAL HEIGHT & AGE TUNING DIRECTIVES:
1. HEIGHT-BASED LEVER TUNING:
   - If athlete is taller (>= 178cm): Longer femurs require a wider squat stance (1.15x–1.3x shoulder width) with slightly greater hip abduction (30° toe flare) to prevent excessive forward trunk lean. For pushups, longer arm levers create greater torque at the wrist; advocate 45° elevated incline pushups or neutral pushup handles rather than flat floor. For levers and hollow body holds, recommend tucked regressions first because longer leg moment arms dramatically increase lower back shear.
   - If athlete is shorter (<= 168cm): Shorter levers provide superior mechanical advantage in calisthenics. Coach can prescribe longer isometric holds (35–45s) and narrower squat stances.
2. AGE-BASED TENDON ELASTICITY & RECOVERY TUNING:
   - If athlete is under 25: Emphasize strict form discipline and controlled 3-second eccentrics to prevent impulsive ego lifting while tendons are adapting.
   - If athlete is 25-39: Synovial fluid secretion requires structured pre-workout circles. Prescribe mandatory 30-second wrist tendon glides before dumbbell loading.
   - If athlete is 40+: Collagen turnover slows down. Mandate 4–6 week adaptation phases before micro-loading. Prohibit ballistic or bounce movements. Emphasize neutral wrist alignments, stacked joints, and extended recovery.`;

  if (personaId === 'jax-calisthenics') {
    return `You are Coach Jax, elite Calisthenics Master and Bodyweight Movement Specialist in the Smart Hybrid Coach app.
${athleteContext}
Your specialization:
1. Master progressive bodyweight biomechanics: hollow body positioning, scapular retraction/protraction, leverage modulation, and core compression.
2. Prioritize wrist-sparing calisthenics (forearm planks, incline wall pushups, neutral-grip handles) to keep wrists pain-free in a bedroom training space.
3. Tone: High energy, technical precision, encouraging mastery of body-over-mind discipline.
4. Keep answers concise, actionable, and formatted with clear bullet points.`;
  }

  if (personaId === 'titan-strength') {
    return `You are Titan, Barbell & Dumbbell Micro-Loading Strategist in the Smart Hybrid Coach app.
${athleteContext}
Your specialization:
1. Progressive overload math: calculate exact dumbbell plate breakdowns (2kg handle + 2.5kg, 2kg, 1.5kg plates, max 5 per side) and compact bedroom barbell loading (${userProfile?.barbellBarWeightKg || 8}kg bar, light home plates).
2. Optimize DRS (Duration / Time-Under-Tension / Drop Sets) and Rep schemes so the athlete gains strength even with lighter bedroom weights.
3. Teach strict joint-stacked lifting form (knuckles over wrists over elbows) to protect tendons under load.
4. Tone: Direct, analytical, focused on deliberate steady weight gains without ego lifting.
5. Keep answers concise, actionable, with explicit plate math whenever weights are mentioned.`;
  }

  if (personaId === 'aura-recovery') {
    return `You are Aura, Kinematic Flow, Mobility & Active Recovery Coach in the Smart Hybrid Coach app.
${athleteContext}
Your specialization:
1. Synovial fluid stimulation, joint decompression, warm-up sequencing, and parasympathetic cool-down routines.
2. Help athletes rebound from joint stiffness, wrist tendonitis flare-ups, and knee inflammation with gentle active mobilization.
3. Tone: Centered, calming, scientific, compassionate, and restorative.
4. Keep answers gentle, clear, concise, and structured with step-by-step guidance.`;
  }

  if (personaId === 'custom' && customPersona) {
    return `You are ${customPersona.name || 'Custom AI Coach'}, ${customPersona.title || 'Personal Fitness Coach'} in the Smart Hybrid Coach app.
${athleteContext}
Persona details:
- Coaching Style / Tone: ${customPersona.tone || 'Supportive and rigorous'}
- Special Focus & Rules: ${customPersona.systemRules || 'Prioritize wrist health and consistent daily progress.'}
Always abide by the athlete's joint safety profile and hardware constraints. Provide clear, concise, and motivating responses.`;
  }

  // Default: Dr. Marcus (Kinematic Joint Longevity Specialist)
  return `You are Dr. Marcus, AI Biomechanical & Joint Longevity Specialist in the Smart Hybrid Coach app.
${athleteContext}
Your philosophy:
1. Prioritize joint longevity, wrist preservation (neutral wrist alignments, forearm planks, pushup handles/wall variations), and knee-tracking safety.
2. Balance hybrid calisthenics (bodyweight levers, planks, pushups) with progressive barbell/dumbbell overload.
3. Be encouraging, concise, evidence-based, and practical.
4. Keep responses direct (under 3-4 concise paragraphs or bullet points). If advising exercise regressions or swaps, give concrete setup cues.`;
}

// 1. Status Endpoint
app.get('/api/ai-coach/status', (req, res) => {
  const aiClient = getAiClient();
  res.json({
    online: true,
    geminiActive: !!aiClient,
    model: 'gemini-3.8-flash',
    provider: 'Google Gemini GenAI SDK',
    personas: [
      { id: 'dr-marcus', name: 'Dr. Marcus', title: 'Joint Longevity Specialist', badge: 'Kinematic Guard' },
      { id: 'jax-calisthenics', name: 'Coach Jax', title: 'Elite Calisthenics Master', badge: 'Bodyweight & Levers' },
      { id: 'titan-strength', name: 'Titan', title: 'Progressive Overload Strategist', badge: 'Plate & Load Math' },
      { id: 'aura-recovery', name: 'Aura', title: 'Mobility & Recovery Flow', badge: 'Active Rehab' }
    ]
  });
});

// 2. Main AI Coach Chat Endpoint
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { message, userProfile, conversationHistory, personaId = 'dr-marcus', customPersona } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const aiClient = getAiClient();

    if (aiClient) {
      const systemInstruction = buildCoachSystemInstruction(personaId, userProfile, customPersona);

      let promptText = message;
      if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5).map((m: any) => `${m.sender === 'user' ? 'Athlete' : 'Coach'}: ${m.text}`).join('\n');
        promptText = `Context of recent discussion:\n${recentHistory}\n\nAthlete asks: ${message}`;
      }

      const response = await callGeminiWithRetry(() =>
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        })
      );

      const text = response.text || "I've analyzed your movement request and calibrated your protocol for optimal joint longevity.";
      return res.json({ reply: text, modelUsed: 'gemini-3.8-flash', personaId });
    }

    // Smart algorithmic fallback if GEMINI_API_KEY is not configured
    const lower = message.toLowerCase();
    let fallbackReply = `As your Hybrid Coach, I recommend balancing progressive overload with active recovery. Ensure you maintain neutral wrists and track your knee angle over toes.`;

    if (lower.includes('plate') || lower.includes('dumbbell') || lower.includes('2.5') || lower.includes('1.5') || lower.includes('sleeve') || lower.includes('room')) {
      fallbackReply = `Based on your adjustable dumbbells (2kg handle, 2.5kg / 2kg / 1.5kg plates, max 5 plates per side):
• 6kg: 1× 2kg per side (1/5 plates used)
• 8kg: 2× 1.5kg per side (2/5 plates used)
• 10kg: 1× 2.5kg + 1× 1.5kg per side (2/5 plates used)
• 12kg: 2× 2.5kg per side (2/5 plates used)
• 14kg: 1× 2.5kg + 1× 2kg + 1× 1.5kg per side (3/5 plates used)
• 16kg: 2× 2.5kg + 1× 2kg per side (3/5 plates used)
• Max load: 5× 2.5kg per side + 2kg handle = 27kg (5/5 capacity limit).`;
    } else if (lower.includes('wrist') || lower.includes('hand') || lower.includes('forearm')) {
      fallbackReply = `For wrist protection: 1) Swap floor pushups for neutral-grip dumbbell pushups or wall incline pushups to eliminate hyperextension. 2) Use forearm planks instead of tall planks. 3) Incorporate light dumbbell wrist curls (15 reps) and wrist circles to nourish the carpal joints.`;
    } else if (lower.includes('calisthenic') || lower.includes('core') || lower.includes('hollow') || lower.includes('lever')) {
      fallbackReply = `Calisthenics progression: Master the Hollow Body Tuck (30s) and Forearm Plank (45s) before advancing to full levers. Focus on depressing and retracting your shoulder blades to anchor your upper body.`;
    } else if (lower.includes('knee') || lower.includes('squat')) {
      fallbackReply = `For knee health during squats: Ensure your knees track in line with your 2nd and 3rd toes without caving inward (valgus). Goblet squats with a slight pause at parallel recruit the adductors and glutes safely while reducing patellar shear.`;
    } else if (lower.includes('plate') || lower.includes('barbell') || lower.includes('weight')) {
      const barWeight = userProfile?.barbellBarWeightKg || 8;
      const target = userProfile?.maxBarbellWeightKg || 18;
      const sideWeight = Math.max(0, (target - barWeight) / 2);
      fallbackReply = `For a ${target}kg bedroom barbell lift (using your ${barWeight}kg compact bar): Load ${sideWeight}kg per sleeve (e.g., using your home 2.5kg/2.0kg/1.5kg plates). Always clamp with collars and maintain a stacked wrist directly over the bar shaft.`;
    } else if (lower.includes('height') || lower.includes('tall') || lower.includes('age') || lower.includes('tune') || lower.includes('biometric') || lower.includes('lever') || lower.includes('stance')) {
      const height = userProfile?.heightCm || 175;
      const age = userProfile?.age || 24;
      const isTall = height >= 178;
      const isCompact = height <= 168;
      fallbackReply = `Biomechanical calibration for your ${height}cm frame and ${age} years age:
1. Height-Lever Tuning: ${isTall ? `Because you are ${height}cm tall with longer limbs, your femur moment arm is extended. Widen your squat stance to 1.25× shoulder width with 30° toe flare to keep your spine upright. On pushups, use 45° elevated incline pushups or neutral handles to eliminate excessive wrist hyperextension torque.` : isCompact ? `At ${height}cm, your compact levers grant superior mechanical efficiency in calisthenics! Emphasize extended isometric pauses (30–40s) on planks and hollow body holds with narrower shoulder-width pushup tracks.` : `At ${height}cm with balanced levers, shoulder-width squat stances and neutral-grip pushups maintain ideal kinetic stack alignment.`}
2. Age & Tendon Adaptation: At ${age} years old, your connective tissues remodel safely when keeping working weights steady for 4–6 weeks with strict 3-second eccentric negatives before adding load.`;
    } else if (lower.includes('warmup') || lower.includes('warm up')) {
      fallbackReply = `Dynamic warm-up recommendation: 30s Wrist Mobilization Circles, 30s Ankle Rotations, 10 Wall Pushups, and 30s Dead Bug trunk bracing. This elevates synovial fluid in the joints before loading weights.`;
    }

    return res.json({ reply: fallbackReply, modelUsed: 'algorithmic-fallback', personaId });
  } catch (error: any) {
    console.error('Error in /api/ai-coach:', error);
    return res.status(500).json({
      error: 'Failed to generate response',
      reply: 'Maintain neutral joint angles and stop immediately if you feel sharp discomfort. Let’s adjust the exercise angle or reduce weight by 2kg.'
    });
  }
});

// 3. Dedicated Gemini AI Workout Generator Endpoint
app.post('/api/ai-coach/generate-workout', async (req, res) => {
  try {
    const { focus, targetMinutes = 30, jointPainAreas = ['wrists'], userProfile, customPrompt } = req.body;
    const aiClient = getAiClient();

    const catalogListText = CATALOG_EXERCISES.map(
      (e) => `- ID: "${e.id}", Name: "${e.name}", Category: "${e.category}", Target: "${e.target}"`
    ).join('\n');

    const prompt = `You are the Gemini AI Workout Generator for Smart Hybrid Coach.
Athlete Context:
- Target Duration: ${targetMinutes} minutes
- Goal/Focus: ${focus || 'Full Hybrid Strength & Calisthenics'}
- Sensitive Joint Areas to Protect: ${jointPainAreas.join(', ') || 'wrists'}
- Max Dumbbell Load: ${userProfile?.maxDumbbellWeightKg || 10}kg
- Max Barbell Load: ${userProfile?.maxBarbellWeightKg || 40}kg
- Custom Athlete Request: ${customPrompt || 'None'}

Available Exercise Catalog (YOU MUST SELECT ONLY EXERCISE IDs FROM THIS LIST):
${catalogListText}

Instructions:
1. Select 4 to 6 exercise IDs from the catalog that best achieve the goal while strictly protecting the flagged joint areas (especially ${jointPainAreas.join(', ')}).
2. For wrists, choose exercises like 'incline_pushup_wall', 'forearm_plank_hold', 'dead_bug_core', 'pushup_neutral_handles', 'db_floor_press', 'db_bicep_hammer_curl'.
3. Assign appropriate Split Type ('Hybrid_FullBody' | 'Upper_Push' | 'Upper_Pull' | 'Lower_Legs' | 'Joint_Core_Focus').
4. Formulate a motivating routine name and a 2-sentence biomechanical rationale explaining why this workout is optimal.`;

    if (aiClient) {
      const response = await callGeminiWithRetry(() =>
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                routineName: { type: Type.STRING },
                splitType: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                estimatedMinutes: { type: Type.NUMBER },
                rationale: { type: Type.STRING },
                selectedExerciseIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                coachingCues: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['routineName', 'splitType', 'difficulty', 'estimatedMinutes', 'rationale', 'selectedExerciseIds']
            }
          }
        })
      );

      const parsed = JSON.parse(response.text || '{}');
      // Validate that exercise IDs exist in our catalog
      const validIds = (parsed.selectedExerciseIds || []).filter((id: string) =>
        CATALOG_EXERCISES.some((ce) => ce.id === id)
      );

      // Ensure at least 4 valid exercises
      if (validIds.length < 3) {
        validIds.push('incline_pushup_wall', 'forearm_plank_hold', 'dead_bug_core', 'db_floor_press');
      }

      const generatedTemplate = {
        id: `gemini_custom_${Date.now()}`,
        name: parsed.routineName || 'Gemini Biomechanical Hybrid Routine',
        splitType: parsed.splitType || 'Hybrid_FullBody',
        difficulty: parsed.difficulty || 'Intermediate',
        estimatedMinutes: parsed.estimatedMinutes || targetMinutes,
        jointFocus: jointPainAreas,
        exercises: Array.from(new Set(validIds)),
        rationale: parsed.rationale || 'Engineered by Gemini 3.8 Flash for progressive overload with neutral joint angles.',
        coachingCues: parsed.coachingCues || ['Maintain neutral wrist alignment', 'Brace core before every rep']
      };

      return res.json({ workout: generatedTemplate, poweredBy: 'gemini-3.8-flash' });
    }

    // Algorithmic fallback workout generator
    const defaultIds = ['incline_pushup_wall', 'forearm_plank_hold', 'dead_bug_core', 'db_floor_press', 'bb_goblet_squat'];
    return res.json({
      workout: {
        id: `algo_custom_${Date.now()}`,
        name: `${focus || 'Hybrid'} Joint-Shield Protocol`,
        splitType: 'Hybrid_FullBody',
        difficulty: 'Intermediate',
        estimatedMinutes: targetMinutes,
        jointFocus: jointPainAreas,
        exercises: defaultIds,
        rationale: 'Algorithmically assembled with zero-hyperextension exercises for joint longevity.',
        coachingCues: ['Keep wrists aligned with forearms', 'Execute smooth 3-second negatives']
      },
      poweredBy: 'algorithmic-engine'
    });
  } catch (error: any) {
    console.error('Error generating AI workout:', error);
    const fallbackIds = ['incline_pushup_wall', 'forearm_plank_hold', 'dead_bug_core', 'bodyweight_glute_bridge', 'db_floor_press'];
    return res.json({
      workout: {
        id: `gemini_fallback_${Date.now()}`,
        name: `${req.body.focus || 'Hybrid'} Joint-Shield Protocol`,
        splitType: 'Joint_Core_Focus',
        difficulty: 'Beginner',
        estimatedMinutes: req.body.targetMinutes || 25,
        jointFocus: req.body.jointPainAreas || ['wrists'],
        exercises: fallbackIds,
        rationale: 'Calibrated for strict zero-wrist-hyperextension and progressive core/scapular control.',
        coachingCues: ['Maintain straight neutral wrists', 'Focus on 3-second controlled negatives']
      },
      poweredBy: 'adaptive-engine'
    });
  }
});

// 4. Exercise Form & Kinematic Breakdown Endpoint
app.post('/api/ai-coach/analyze-form', async (req, res) => {
  try {
    const { exerciseName, exerciseId, userConcern = '', userProfile } = req.body;
    const aiClient = getAiClient();

    if (!exerciseName) {
      return res.status(400).json({ error: 'Exercise name is required' });
    }

    if (aiClient) {
      const prompt = `Analyze the biomechanics of "${exerciseName}" for an athlete prioritizing joint protection (especially wrists and knees).
Athlete Biometrics:
- Height: ${userProfile?.heightCm || 175} cm
- Age: ${userProfile?.age || 24} years old
- Lever profile: ${userProfile?.limbLeverType || 'balanced'}
Specific athlete concern: "${userConcern || 'How to tune this exercise for my exact height, age, and joint safety'}".

Provide a structured analysis with:
1. Primary Kinematic Focus (tune stance width, grip spacing, and incline angles specifically for this athlete's ${userProfile?.heightCm || 175}cm height and lever moment arms).
2. Wrist / Knee Safety Rules (prevent joint shear and hyperextension based on their age ${userProfile?.age || 24} and tendon health).
3. 3 Critical Setup Cues tailored to their body proportions.
4. Top 2 Common Mistakes and their personalized fixes.
Keep the explanation crisp, direct, and under 250 words.`;

      const response = await callGeminiWithRetry(() =>
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.6,
          }
        })
      );

      return res.json({ analysis: response.text, poweredBy: 'gemini-3.8-flash' });
    }

    return res.json({
      analysis: `Biomechanical analysis for ${exerciseName}:
1. Wrist Alignment: Keep wrists in a completely neutral, locked position. Never allow hyperextension under load.
2. Kinetic Chain: Brace your core and glutes prior to initiating movement.
3. Path of Motion: Move through a controlled 3-second eccentric tempo. Stop immediately if you feel joint impingement.`,
      poweredBy: 'algorithmic-engine'
    });
  } catch (error: any) {
    console.error('Error analyzing form:', error);
    return res.status(500).json({ error: 'Failed to analyze form' });
  }
});

// 5. Cloud Sync across devices by Email
const SYNC_FILE_PATH = path.join(process.cwd(), '.user_cloud_sync.json');

function loadSyncStore(): Record<string, any> {
  try {
    if (fs.existsSync(SYNC_FILE_PATH)) {
      const data = fs.readFileSync(SYNC_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read sync store:', err);
  }
  return {};
}

function saveSyncStore(store: Record<string, any>) {
  try {
    fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write sync store:', err);
  }
}

app.get('/api/sync/get', (req, res) => {
  const email = (req.query.email as string || '').toLowerCase().trim();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required', found: false });
  }

  const store = loadSyncStore();
  const entry = store[email];
  if (!entry) {
    return res.json({ found: false, message: 'No existing cloud data found for this email' });
  }

  return res.json({
    found: true,
    email,
    userProfile: entry.userProfile,
    strengthHistory: entry.strengthHistory || [],
    templates: entry.templates || [],
    lastUpdated: entry.lastUpdated
  });
});

app.post('/api/sync/save', (req, res) => {
  try {
    const { email, userProfile, strengthHistory, templates } = req.body;
    const cleanEmail = (email || userProfile?.cloudSyncEmail || userProfile?.email || '').toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const store = loadSyncStore();
    const now = new Date().toISOString();

    store[cleanEmail] = {
      userProfile: {
        ...(userProfile || {}),
        cloudSyncEmail: cleanEmail,
        cloudSyncConnected: true,
        lastSyncTimestamp: now
      },
      strengthHistory: strengthHistory || [],
      templates: templates || [],
      lastUpdated: now
    };

    saveSyncStore(store);

    return res.json({
      success: true,
      email: cleanEmail,
      lastUpdated: now
    });
  } catch (err: any) {
    console.error('Error in /api/sync/save:', err);
    return res.status(500).json({ error: 'Failed to save cloud sync data' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  const server = http.createServer(app);

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      allowedHosts: true,
      hmr: false,
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Hybrid Coach running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
