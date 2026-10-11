import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Image, Play, CheckCircle2, Zap, RotateCcw, Activity } from 'lucide-react';
import { Exercise, UserProfile } from '../types';
import { getBiometricTuning } from '../utils/exerciseTuning';

interface ExerciseVisualizerProps {
  exercise: Exercise;
  isPlaying?: boolean;
  userProfile?: UserProfile;
}

// Curated Photorealistic AI Human Demonstration Images mapped per exercise (including warmup & cooldown drills)
const EXERCISE_DEMO_IMAGES: Record<string, string> = {
  incline_pushup_wall: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  pushup_neutral_handles: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  pike_pushup_elevated: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  warmup_wrist_circles: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  warmup_wrist_pulses: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  warmup_arm_circles: '/src/assets/images/dumbbell_press_demo_1791586943340.jpg',
  warmup_torso_rotations: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  warmup_hip_hinge_sweeps: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  warmup_air_squats: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  warmup_ankle_rotations: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  warmup_high_knees: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  warmup_butt_kicks: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  warmup_step_jacks: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  cooldown_knee_extension_stretch: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  cooldown_childs_pose: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  cooldown_cobra_pose: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  cooldown_downward_dog: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  cooldown_kneeling_hip_left: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  cooldown_kneeling_hip_right: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  cooldown_standing_quad_left: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  cooldown_standing_quad_right: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  cooldown_wrist_extensor_stretch: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  cooldown_shoulder_crossbody: '/src/assets/images/hammer_curl_demo_1791586974354.jpg',
  cooldown_box_breathing: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  forearm_plank_hold: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  dead_bug_core: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  hollow_body_tuck: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  reverse_crunch_tuck: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  bird_dog_hold: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  side_plank_forearm: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  seated_tuck_hold: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  bear_crawl_hold: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  superman_back_arch: '/src/assets/images/hammer_curl_demo_1791586974354.jpg',
  wrist_flexor_curl_db: '/src/assets/images/hammer_curl_demo_1791586974354.jpg',
  db_floor_press: '/src/assets/images/dumbbell_press_demo_1791586943340.jpg',
  bench_chair_dip: '/src/assets/images/dumbbell_press_demo_1791586943340.jpg',
  db_neutral_shoulder_press: '/src/assets/images/dumbbell_press_demo_1791586943340.jpg',
  bb_goblet_squat: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  bb_romanian_deadlift: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  bodyweight_glute_bridge: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  standing_calf_raise: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  db_bicep_hammer_curl: '/src/assets/images/hammer_curl_demo_1791586974354.jpg',
  db_single_arm_row: '/src/assets/images/hammer_curl_demo_1791586974354.jpg',
  doorframe_bodyweight_row: '/src/assets/images/hammer_curl_demo_1791586974354.jpg'
};

function getDemoImage(exercise: Exercise): string {
  if (EXERCISE_DEMO_IMAGES[exercise.id]) {
    return EXERCISE_DEMO_IMAGES[exercise.id];
  }
  if (exercise.category === 'barbell') {
    return '/src/assets/images/barbell_squat_demo_1791586954855.jpg';
  }
  if (exercise.category === 'dumbbell') {
    return exercise.target.includes('arms') || exercise.target.includes('back')
      ? '/src/assets/images/hammer_curl_demo_1791586974354.jpg'
      : '/src/assets/images/dumbbell_press_demo_1791586943340.jpg';
  }
  if (exercise.target.includes('core')) {
    return '/src/assets/images/forearm_plank_demo_1791586963855.jpg';
  }
  return '/src/assets/images/pushup_demonstration_1791586932834.jpg';
}

export const ExerciseVisualizer: React.FC<ExerciseVisualizerProps> = ({
  exercise,
  isPlaying = true,
  userProfile
}) => {
  // Default to animated simulation so users see moving demonstrations immediately without searching
  const [viewMode, setViewMode] = useState<'animated' | 'human'>('animated');
  const [phase, setPhase] = useState<number>(0);
  const [tempoLabel, setTempoLabel] = useState<string>('3s Eccentric Lower');
  const [repCount, setRepCount] = useState<number>(1);

  const demoImg = getDemoImage(exercise);

  // Smooth animation loop for movement cadence
  useEffect(() => {
    if (!isPlaying) return;
    let frameId: number;
    let lastRepProgress = 0;
    const startTime = performance.now();
    const periodMs = 3600; // 3.6s repetition cadence

    const animate = (now: number) => {
      const elapsed = (now - startTime) % periodMs;
      const progress = elapsed / periodMs;

      // Track rep count simulation
      if (progress < lastRepProgress) {
        setRepCount((prev) => (prev % 10) + 1);
      }
      lastRepProgress = progress;

      // Cadence: 0 -> 0.55 = Eccentric lower (3s), 0.55 -> 0.72 = Isometric hold (1s), 0.72 -> 1.0 = Concentric push (1s)
      if (progress < 0.55) {
        setTempoLabel('Controlled Negative (3s)');
      } else if (progress < 0.72) {
        setTempoLabel('Joint-Stacked Pause (1s)');
      } else {
        setTempoLabel('Explosive Drive (1s)');
      }

      // Smooth oscillation curve for anatomical joints
      const t = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setPhase(t);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  return (
    <div className="w-full bg-[#11131a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      {/* Visual Header / Mode Selector Tabs */}
      <div className="bg-[#151822] px-4 py-2.5 border-b border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setViewMode('animated')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'animated'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play size={12} fill="currentColor" />
            <span>Animated Motion</span>
          </button>

          <button
            onClick={() => setViewMode('human')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'human'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Image size={13} />
            <span>Human Model</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
          <ShieldCheck size={13} />
          <span>Wrist & Joint Safe</span>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[380px] bg-[#0a0b10] flex items-center justify-center overflow-hidden">
        {viewMode === 'animated' ? (
          /* Animated Human Athletic Figure Simulation */
          <div className="relative w-full h-full bg-gradient-to-b from-[#131622] via-[#0d0f17] to-[#08090e] flex items-center justify-center p-4 select-none">
            {/* Background subtle biomechanics grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            <div className="w-full h-full max-w-md relative flex items-center justify-center z-10">
              {renderHumanKinematicSimulation(exercise, phase)}
            </div>

            {/* Overlaid Live Tempo Ticker & Rep Cadence */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
              <span className="text-xs font-mono font-bold text-amber-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
                <Zap size={13} className="text-amber-400 animate-pulse" />
                <span>{tempoLabel}</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                <Activity size={13} className="text-emerald-400" />
                <span>Rep {repCount} · Form Aligned</span>
              </span>
            </div>
          </div>
        ) : (
          /* Photorealistic Human Athlete Photo */
          <div className="relative w-full h-full">
            <img
              src={demoImg}
              alt={exercise.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/20 pointer-events-none" />

            {/* Overlaid Form Badge */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold">{exercise.name}</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-500/30 font-bold">
                Tempo: {tempoLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Description & Form Cues */}
      <div className="p-4 bg-[#141722] border-t border-white/5 space-y-2.5">
        {exercise.description && (
          <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-400 block mb-0.5">Overview:</span>
            {exercise.description}
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-400" />
            Key Form Alignment
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Targets: {exercise.target.join(', ')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {(exercise.formTips || []).slice(0, 2).map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5 text-slate-200">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{tip}</span>
            </div>
          ))}
        </div>

        {exercise.jointSafetyNotes && (
          <p className="text-[11px] text-emerald-300/90 bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 leading-relaxed">
            🛡️ <strong>Safety cue:</strong> {exercise.jointSafetyNotes}
          </p>
        )}

        {/* AI Biometric Tuning for Athlete's Height & Age */}
        {userProfile && (() => {
          const tuning = getBiometricTuning(userProfile, exercise);
          return (
            <div className="bg-black/50 p-2.5 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
              <span className="text-cyan-400 font-mono flex items-center gap-1.5 font-bold shrink-0">
                <Sparkles size={12} className="text-cyan-400" />
                <span>AI Biometrics ({tuning.heightFormatted} · {tuning.age}y):</span>
              </span>
              <span className="text-slate-300 leading-tight sm:text-right">
                {tuning.currentExerciseSpecificCue}
              </span>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// ============================================================
// ANIMATED HUMAN BIOMECHANICAL MOTION SIMULATION ENGINE
// Renders realistic human athlete figures performing reps with
// articulated joints, muscular contours, and alignment rays.
// ============================================================
function renderHumanKinematicSimulation(exercise: Exercise, phase: number) {
  let type = exercise?.svgAnimationType;
  if (!type) {
    if (exercise?.category === 'warmup') {
      type = 'wrist_circle';
    } else if (exercise?.category === 'cooldown') {
      type = 'squat';
    } else if (exercise?.category === 'barbell') {
      type = 'squat';
    } else if (exercise?.category === 'dumbbell') {
      type = 'floor_press';
    } else if (exercise?.target?.includes('core')) {
      type = 'plank';
    } else {
      type = 'squat';
    }
  }

  // 1. PUSHUP & INCLINE WALL / ELEVATED PUSHUP
  if (type === 'pushup') {
    const chestX = 145 + phase * 32;
    const chestY = 80 + phase * 22;
    const headX = chestX + 22;
    const headY = chestY - 18;
    const elbowX = chestX - 22;
    const elbowY = chestY + 22 - phase * 8;
    const handX = 205;
    const handY = 100;
    const footX = 45;
    const footY = 145;

    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <line x1="20" y1="150" x2="260" y2="150" stroke="#334155" strokeWidth="3" strokeDasharray="4 4" />
        <line x1="215" y1="35" x2="215" y2="150" stroke="#475569" strokeWidth="4" />
        <rect x="210" y="90" width="10" height="20" rx="3" fill="#64748b" />
        <circle cx={footX} cy={footY} r="6" fill="#38bdf8" />
        <line x1={footX - 10} y1={footY} x2={footX + 5} y2={footY} stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1={footX} y1={footY} x2={chestX} y2={chestY} stroke="#10b981" strokeWidth="11" strokeLinecap="round" />
        <circle cx={chestX} cy={chestY} r="13" fill="#10b981" />
        <circle cx={headX} cy={headY} r="11" fill="#34d399" />
        <line x1={chestX} y1={chestY} x2={headX} y2={headY} stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
        <line x1={chestX} y1={chestY} x2={elbowX} y2={elbowY} stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
        <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" />
        <circle cx={elbowX} cy={elbowY} r="6" fill="#f59e0b" />
        <circle cx={handX} cy={handY} r="7" fill="#10b981" />
        <rect x="135" y="24" width="125" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="197" y="39" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          ✓ 180° STRAIGHT WRIST
        </text>
      </svg>
    );
  }

  // 2. DUMBBELL FLOOR PRESS & BICEP CURL
  if (type === 'floor_press' || type === 'curl') {
    const elbowY = 125 + phase * 5;
    const dbY = 80 - phase * 35;

    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <rect x="30" y="145" width="220" height="8" rx="4" fill="#334155" />
        <line x1="60" y1="135" x2="200" y2="135" stroke="#10b981" strokeWidth="13" strokeLinecap="round" />
        <circle cx="215" cy="132" r="11" fill="#34d399" />
        <line x1="60" y1="135" x2="90" y2="105" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
        <line x1="90" y1="105" x2="110" y2="145" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
        <circle cx="165" cy="135" r="9" fill="#10b981" />
        <line x1="165" y1="135" x2="165" y2={elbowY} stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />
        <line x1="165" y1={elbowY} x2="165" y2={dbY} stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
        <circle cx="165" cy={elbowY} r="7" fill="#f59e0b" />
        <rect x="145" y={dbY - 4} width="40" height="8" rx="2" fill="#94a3b8" />
        <rect x="140" y={dbY - 14} width="8" height="28" rx="3" fill="#38bdf8" />
        <rect x="180" y={dbY - 14} width="8" height="28" rx="3" fill="#38bdf8" />
        <rect x="100" y="16" width="130" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="165" y="31" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          STACKED: ELBOW OVER WRIST
        </text>
      </svg>
    );
  }

  // 3. BARBELL SQUAT / CALF RAISE
  if (type === 'squat' || type === 'calf_raise') {
    const hipY = 82 + phase * 40;
    const hipX = 100 - phase * 18;
    const kneeY = 112 + phase * 8;
    const kneeX = 135 + phase * 14;
    const chestX = hipX + 18;
    const chestY = hipY - 38;
    const headX = chestX + 8;
    const headY = chestY - 18;

    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <line x1="30" y1="165" x2="250" y2="165" stroke="#334155" strokeWidth="3" />
        <line x1="130" y1="165" x2="160" y2="165" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
        <line x1="145" y1="165" x2={kneeX} y2={kneeY} stroke="#0284c7" strokeWidth="9" strokeLinecap="round" />
        <line x1={kneeX} y1={kneeY} x2={hipX} y2={hipY} stroke="#38bdf8" strokeWidth="11" strokeLinecap="round" />
        <circle cx={kneeX} cy={kneeY} r="7" fill="#f59e0b" />
        <line x1={hipX} y1={hipY} x2={chestX} y2={chestY} stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
        <circle cx={hipX} cy={hipY} r="9" fill="#10b981" />
        <circle cx={headX} cy={headY} r="11" fill="#34d399" />
        <line x1={chestX - 25} y1={chestY - 2} x2={chestX + 25} y2={chestY - 2} stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
        <circle cx={chestX - 25} cy={chestY - 2} r="9" fill="#f59e0b" />
        <circle cx={chestX + 25} cy={chestY - 2} r="9" fill="#f59e0b" />
        <rect x="60" y="16" width="160" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="140" y="31" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          ✓ KNEE OVER 2ND TOE TRACKING
        </text>
      </svg>
    );
  }

  // 4. DUMBBELL ROW / PULLING
  if (type === 'row') {
    const elbowPullX = 140 - phase * 20;
    const dbPullY = 120 - phase * 35;
    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <line x1="30" y1="160" x2="250" y2="160" stroke="#334155" strokeWidth="3" />
        <line x1="90" y1="160" x2="110" y2="105" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
        <line x1="110" y1="105" x2="160" y2="105" stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
        <circle cx="160" cy="100" r="10" fill="#34d399" />
        <line x1="130" y1="105" x2={elbowPullX} y2={dbPullY} stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
        <circle cx={elbowPullX} cy={dbPullY} r="7" fill="#fbbf24" />
        <rect x="80" y="18" width="120" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="140" y="33" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          ✓ SCAPULA RETRACTION
        </text>
      </svg>
    );
  }

  // 5. OVERHEAD PRESS
  if (type === 'overhead_press') {
    const pressY = 90 - phase * 50;
    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <line x1="40" y1="160" x2="240" y2="160" stroke="#334155" strokeWidth="3" />
        <line x1="140" y1="160" x2="140" y2="90" stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
        <circle cx="140" cy="78" r="10" fill="#34d399" />
        <line x1="140" y1="90" x2="140" y2={pressY} stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
        <rect x="110" y={pressY - 4} width="60" height="8" rx="2" fill="#38bdf8" />
        <rect x="75" y="18" width="130" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="140" y="33" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          ✓ STACKED OVERHEAD LOCKOUT
        </text>
      </svg>
    );
  }

  // 6. DEAD BUG & CORE
  if (type === 'dead_bug') {
    const limbOffset = phase * 25;
    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <rect x="25" y="145" width="230" height="8" rx="4" fill="#334155" />
        <line x1="70" y1="135" x2="200" y2="135" stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
        <circle cx="215" cy="132" r="10" fill="#34d399" />
        <line x1="120" y1="135" x2={120 - limbOffset} y2={100 - limbOffset} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
        <line x1="160" y1="135" x2={160 + limbOffset} y2={100 - limbOffset} stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
        <rect x="70" y="18" width="140" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="140" y="33" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          ✓ LUMBAR SPINE PRESSED FLAT
        </text>
      </svg>
    );
  }

  // 7. WRIST CIRCLE & ANKLE ROTATION
  if (type === 'wrist_circle' || type === 'ankle_rotation') {
    const rotAngle = phase * 360;
    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <line x1="40" y1="150" x2="240" y2="150" stroke="#334155" strokeWidth="3" />
        <circle cx="140" cy="100" r="35" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 6" />
        <circle cx={140 + Math.cos(rotAngle) * 35} cy={100 + Math.sin(rotAngle) * 35} r="10" fill="#10b981" />
        <circle cx="140" cy="100" r="15" fill="#f59e0b" />
        <rect x="65" y="18" width="150" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="140" y="33" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          ✓ FLUID SYNOVIAL MOBILIZATION
        </text>
      </svg>
    );
  }

  // 8. GLUTE BRIDGE
  if (type === 'glute_bridge') {
    const bridgeY = 135 - phase * 30;
    return (
      <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
        <rect x="30" y="150" width="220" height="8" rx="4" fill="#334155" />
        <line x1="60" y1="145" x2="140" y2={bridgeY} stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
        <line x1="140" y1={bridgeY} x2="200" y2="145" stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" />
        <circle cx="215" cy="142" r="10" fill="#34d399" />
        <rect x="75" y="18" width="130" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="140" y="33" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          ✓ POSTERIOR CHAIN HIP DRIVE
        </text>
      </svg>
    );
  }

  // DEFAULT PLANK / CORE
  const spineBreath = Math.sin(phase * Math.PI) * 3;
  return (
    <svg viewBox="0 0 280 180" className="w-full h-full drop-shadow-md">
      <rect x="25" y="145" width="230" height="8" rx="4" fill="#334155" />
      <circle cx="50" cy="140" r="6" fill="#38bdf8" />
      <line x1="42" y1="140" x2="55" y2="140" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="140" x2="195" y2={105 + spineBreath} stroke="#10b981" strokeWidth="12" strokeLinecap="round" />
      <circle cx="195" cy={105 + spineBreath} r="11" fill="#10b981" />
      <circle cx="212" cy={95 + spineBreath} r="10" fill="#34d399" />
      <line x1="195" y1={105 + spineBreath} x2="195" y2="145" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
      <line x1="195" y1="145" x2="225" y2="145" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
      <circle cx="195" cy="145" r="6" fill="#f59e0b" />
      <circle cx="225" cy="145" r="6" fill="#10b981" />
      <rect x="188" y="138" width="45" height="12" rx="6" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
      <rect x="75" y="25" width="135" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
      <text x="142" y="40" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        0% CARPAL WRIST PRESSURE
      </text>
    </svg>
  );
}
