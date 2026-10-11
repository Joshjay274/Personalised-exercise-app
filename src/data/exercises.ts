import { Exercise } from '../types';

export const EXERCISE_DATABASE: Exercise[] = [
  // WARMUPS (30 Seconds each)
  {
    id: 'warmup_wrist_circles',
    name: 'Wrist Circles & Dynamic Mobilization',
    category: 'warmup',
    target: ['wrists'],
    equipmentNeeded: [],
    description: 'Rotate wrists smoothly clockwise and counter-clockwise to stimulate synovial fluid and prepare tendons for loading.',
    jointSafetyNotes: 'Keeps carpal joint pressure low; mandatory before any pressing or gripping exercise.',
    formTips: [
      'Keep elbows bent at 90 degrees tucked close to ribs',
      'Perform 15s clockwise followed by 15s counter-clockwise',
      'Make gentle fists without squeezing tightly'
    ],
    mistakesToAvoid: [
      'Snapping wrists aggressively',
      'Forcing painful end-range angles'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'wrist_circle'
  },
  {
    id: 'warmup_ankle_rotations',
    name: 'Ankle Rotations & Heel Pumps',
    category: 'warmup',
    target: ['ankles'],
    equipmentNeeded: [],
    description: 'Lift one foot slightly off the floor and circle through maximum dorsiflexion and plantar flexion.',
    jointSafetyNotes: 'Builds talocrural mobility which prevents knees from caving inward during squats.',
    formTips: [
      'Brace core for standing stability or hold a wall',
      'Slow controlled 360-degree rotations',
      'Pump heels up and down 10 times at the finish'
    ],
    mistakesToAvoid: [
      'Rolling weight excessively onto the pinky toe edge',
      'Rushing through tight sticky angles'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'ankle_rotation'
  },

  // COOLDOWNS (30-45 Seconds)
  {
    id: 'cooldown_knee_extension_stretch',
    name: 'Knee & Posterior Chain Decompression',
    category: 'cooldown',
    target: ['knees', 'ankles'],
    equipmentNeeded: [],
    description: 'Gentle standing hamstring hinge with soft knees to decompress patellar tendon tension and lower back strain.',
    jointSafetyNotes: 'Keep knees micro-bent (never lock out) to protect the posterior knee capsule.',
    formTips: [
      'Hinge strictly at the hips, maintaining a flat neutral spine',
      'Deep belly breathing: exhale to sink deeper into the hinge',
      'Hold position gently without bouncing'
    ],
    mistakesToAvoid: [
      'Hyperextending knees backwards',
      'Rounding the upper spine aggressively'
    ],
    defaultDurationSec: 35,
    defaultSets: 1,
    svgAnimationType: 'squat'
  },

  // CALISTHENICS & WRIST/CORE REHAB
  {
    id: 'incline_pushup_wall',
    name: 'Incline Wall / Elevated Pushup (Wrist-Safe)',
    category: 'calisthenics',
    target: ['chest', 'wrists', 'shoulders', 'arms'],
    equipmentNeeded: [],
    description: 'Elevated pushup reducing wrist dorsiflexion angle to ~45 degrees instead of harsh 90 degrees on flat floor.',
    jointSafetyNotes: 'Reduces peak carpal compression by up to 60% compared to standard floor pushups.',
    formTips: [
      'Keep palms flat or grip handles with straight neutral wrists',
      'Elbows tucked at a 45-degree angle (arrowhead shape, not T-shape)',
      'Maintain an unbroken rigid plank line from heels to ears'
    ],
    mistakesToAvoid: [
      'Flaring elbows out to 90 degrees (strains rotator cuff)',
      'Hips sagging or lower back arching'
    ],
    defaultReps: 12,
    defaultSets: 3,
    svgAnimationType: 'pushup',
    calisthenicsAlternativeId: 'forearm_plank_hold',
    wristSafeAlternativeId: 'incline_pushup_wall'
  },
  {
    id: 'forearm_plank_hold',
    name: 'Forearm Core Plank (Zero Wrist Pressure)',
    category: 'calisthenics',
    target: ['core', 'shoulders'],
    equipmentNeeded: [],
    description: 'Fundamental trunk stability pillar that bypasses wrist contact completely by resting on forearms.',
    jointSafetyNotes: '100% wrist-sparing exercise; reinforces anterior pelvic tilt correction.',
    formTips: [
      'Elbows placed directly beneath shoulder joints',
      'Squeeze glutes hard and pull belly button up toward spine',
      'Maintain neutral neck gazing slightly forward of hands'
    ],
    mistakesToAvoid: [
      'Letting the lower back dip into hyperextension',
      'Holding breath instead of diaphragmatic breathing'
    ],
    defaultDurationSec: 40,
    defaultSets: 3,
    svgAnimationType: 'plank',
    wristSafeAlternativeId: 'forearm_plank_hold'
  },
  {
    id: 'dead_bug_core',
    name: 'Dead Bug Spine Decompression & Core Bracing',
    category: 'calisthenics',
    target: ['core'],
    equipmentNeeded: [],
    description: 'Gold-standard spinal stability movement that teaches abdominal bracing while mobilizing hips and shoulders.',
    jointSafetyNotes: 'Completely unloads wrists, knees, and lumbar spine.',
    formTips: [
      'Press lower back firmly into the floor (zero gap)',
      'Extend opposite arm and leg slowly on a 3-second cadence',
      'Pause for 1 second before smoothly returning to 90/90 start position'
    ],
    mistakesToAvoid: [
      'Allowing lower back to arch off the mat',
      'Rushing limbs through momentum'
    ],
    defaultReps: 12,
    defaultSets: 3,
    svgAnimationType: 'dead_bug'
  },

  // JOINT HEALTH & PREHAB
  {
    id: 'wrist_flexor_curl_db',
    name: 'Dumbbell Neutral Wrist Fortifier',
    category: 'joint_health',
    target: ['wrists', 'arms'],
    equipmentNeeded: ['dumbbell'],
    description: 'Sub-maximal forearm flexion and extension designed to thicken carpal ligaments and enhance grip stamina.',
    jointSafetyNotes: 'Use very light weights (2–4kg); focus on time under tension rather than heavy load.',
    formTips: [
      'Rest forearm flat across your thigh or bench surface',
      'Lower weight slowly into fingers, then curl back up with control',
      'Keep forearm stationary throughout the movement'
    ],
    mistakesToAvoid: [
      'Jerking heavy weights with explosive momentum',
      'Lifting forearm off supporting surface'
    ],
    defaultReps: 15,
    defaultSets: 3,
    svgAnimationType: 'curl',
    calisthenicsAlternativeId: 'warmup_wrist_circles'
  },

  // WEIGHTED EXERCISES (DUMBBELL & BARBELL)
  {
    id: 'db_floor_press',
    name: 'Dumbbell Neutral-Grip Floor Press',
    category: 'dumbbell',
    target: ['chest', 'arms', 'shoulders'],
    equipmentNeeded: ['dumbbell'],
    description: 'Floor bench press variation with dumbbells in neutral grip (palms facing each other) to save wrists and anterior shoulders.',
    jointSafetyNotes: 'Floor prevents excessive shoulder extension; neutral grip prevents wrist carpal shearing.',
    formTips: [
      'Turn palms inward facing each other (neutral grip)',
      'Lower weights until triceps gently kiss the floor',
      'Keep wrists rigid and stacked directly over elbow joints'
    ],
    mistakesToAvoid: [
      'Bending wrists backwards under dumbbell weight',
      'Bouncing triceps hard off the hard floor'
    ],
    defaultReps: 10,
    defaultSets: 3,
    svgAnimationType: 'floor_press',
    calisthenicsAlternativeId: 'incline_pushup_wall'
  },
  {
    id: 'bb_goblet_squat',
    name: 'Barbell / Plate Front Squat (Knee-Tracking)',
    category: 'barbell',
    target: ['legs', 'knees', 'ankles', 'core'],
    equipmentNeeded: ['barbell', 'plates'],
    description: 'Anterior-loaded squat pattern encouraging an upright torso and deep quad activation with healthy patellar tracking.',
    jointSafetyNotes: 'Upright torso minimizes lumbar shear forces; requires ankles to hinge cleanly.',
    formTips: [
      'Initiate squat by sitting between your heels while pushing knees outward',
      'Keep chest elevated and gaze straight ahead',
      'Hit parallel depth where hip crease matches knee height'
    ],
    mistakesToAvoid: [
      'Allowing knees to collapse inward toward each other (valgus collapse)',
      'Heels lifting off the ground (sign of ankle mobility deficit)'
    ],
    defaultReps: 10,
    defaultSets: 3,
    svgAnimationType: 'squat',
    calisthenicsAlternativeId: 'dead_bug_core'
  },
  {
    id: 'db_bicep_hammer_curl',
    name: 'Dumbbell Neutral-Grip Hammer Curl',
    category: 'dumbbell',
    target: ['arms', 'wrists'],
    equipmentNeeded: ['dumbbell'],
    description: 'Brachioradialis and biceps builder using vertical thumbs-up grip that unloads wrist supination stress.',
    jointSafetyNotes: 'Significantly less wrist tendon irritation than barbell straight-bar curls.',
    formTips: [
      'Hold dumbbells with thumbs pointing toward ceiling throughout',
      'Lock upper arms to ribcage; do not sway torso',
      'Squeeze forearms and biceps at the top for 1 full second'
    ],
    mistakesToAvoid: [
      'Using hip swing momentum to heave the dumbbells',
      'Allowing wrists to bend backward at peak contraction'
    ],
    defaultReps: 12,
    defaultSets: 3,
    svgAnimationType: 'curl',
    calisthenicsAlternativeId: 'forearm_plank_hold'
  },
  {
    id: 'bb_romanian_deadlift',
    name: 'Barbell Romanian Deadlift (Hinge Focus)',
    category: 'barbell',
    target: ['back', 'legs', 'core'],
    equipmentNeeded: ['barbell', 'plates'],
    description: 'Posterior chain builder strengthening hamstrings and glutes while teaching hip hinge mechanics.',
    jointSafetyNotes: 'Keeps bar path flush against shins to reduce lower back moment arm.',
    formTips: [
      'Keep bar skimming thighs and shins throughout descent',
      'Push hips backward towards the wall behind you',
      'Maintain slight soft bend in knees and neutral cervical spine'
    ],
    mistakesToAvoid: [
      'Rounding the lumbar spine when lowering the bar',
      'Squatting down instead of hinging hips back'
    ],
    defaultReps: 8,
    defaultSets: 3,
    svgAnimationType: 'squat',
    calisthenicsAlternativeId: 'dead_bug_core'
  },
  {
    id: 'db_single_arm_row',
    name: 'Dumbbell Neutral Single-Arm Row',
    category: 'dumbbell',
    target: ['back', 'arms', 'wrists'],
    equipmentNeeded: ['dumbbell'],
    description: 'Unilateral lat and upper back builder using a rigid neutral wrist grip supported on a flat surface or knee.',
    jointSafetyNotes: 'Keeps wrist in line with forearm; zero rotational torque through carpal bones.',
    formTips: [
      'Pull dumbbell smoothly toward hip socket, not chest',
      'Keep elbow tucked close to torso',
      'Hold neutral wrist without flicking hand at top'
    ],
    mistakesToAvoid: [
      'Twisting shoulders aggressively to cheat weight up',
      'Dropping lower back into hyperextension'
    ],
    defaultReps: 10,
    defaultSets: 3,
    svgAnimationType: 'row',
    calisthenicsAlternativeId: 'forearm_plank_hold'
  },
  {
    id: 'db_neutral_shoulder_press',
    name: 'Dumbbell Neutral Overhead Press',
    category: 'dumbbell',
    target: ['shoulders', 'arms', 'core'],
    equipmentNeeded: ['dumbbell'],
    description: 'Shoulder builder keeping palms turned inward toward ears, preserving subacromial joint space and avoiding wrist torque.',
    jointSafetyNotes: 'Neutral plane avoids rotator cuff impingement and protects wrists compared to straight bar pressing.',
    formTips: [
      'Palms face inward towards your head throughout',
      'Press directly upward until arms are extended overhead',
      'Brace abdominal wall to prevent arching spine'
    ],
    mistakesToAvoid: [
      'Flaring elbows wide sideways',
      'Bending wrists backwards under weight'
    ],
    defaultReps: 10,
    defaultSets: 3,
    svgAnimationType: 'overhead_press',
    calisthenicsAlternativeId: 'incline_pushup_wall'
  },
  {
    id: 'bodyweight_glute_bridge',
    name: 'Posterior Glute Bridge & Pelvic Stability',
    category: 'calisthenics',
    target: ['legs', 'core', 'knees'],
    equipmentNeeded: [],
    description: 'Supine hip extension strengthening gluteus maximus and hamstrings without compressive axial spinal load or wrist stress.',
    jointSafetyNotes: 'Zero load on wrists or knees; therapeutic for anterior knee pain.',
    formTips: [
      'Drive evenly through heels into floor',
      'Squeeze glutes at top for 2 full seconds',
      'Maintain neutral pelvis without overarching lumbar spine'
    ],
    mistakesToAvoid: [
      'Pushing through toes instead of heels',
      'Hyper-extending lower back'
    ],
    defaultReps: 15,
    defaultSets: 3,
    svgAnimationType: 'glute_bridge'
  },
  {
    id: 'standing_calf_raise',
    name: 'Standing Calf & Achilles Elevation',
    category: 'calisthenics',
    target: ['ankles', 'legs'],
    equipmentNeeded: [],
    description: 'Controlled plantar flexion strengthening gastrocnemius, soleus, and Achilles tendon resilience.',
    jointSafetyNotes: 'Strengthens ankle stabilizing tendons which directly shields knees during squats.',
    formTips: [
      'Elevate onto balls of big toes with controlled 2-second lift',
      'Pause at peak contraction for 1 second',
      'Lower under 3-second eccentric tempo'
    ],
    mistakesToAvoid: [
      'Bouncing rapidly at bottom of movement',
      'Rolling ankles outward onto lateral edge'
    ],
    defaultReps: 15,
    defaultSets: 3,
    svgAnimationType: 'calf_raise'
  },
  // CORE & CALISTHENICS PROGRESSIONS (NO FEET ANCHORED / NO PULL-UP BAR NEEDED)
  {
    id: 'hollow_body_tuck',
    name: 'Hollow Body Tuck Hold (Beginner Core Pillar)',
    category: 'calisthenics',
    target: ['core'],
    equipmentNeeded: [],
    description: 'Foundational gymnastics bodyweight core hold. Press your lumbar spine flush against the mat, tuck knees toward chest, and reach hands forward. Zero feet anchoring or neck strain.',
    jointSafetyNotes: 'Completely eliminates lower back arching; zero wrist contact or compression.',
    formTips: [
      'Press lower back 100% flat into the floor (no gap under spine)',
      'Reach hands forward toward heels with active abdominal compression',
      'Keep neck relaxed, gazing upward at a 45-degree angle'
    ],
    mistakesToAvoid: [
      'Allowing lower back to arch off the floor',
      'Holding breath instead of steady diaphragm exhales'
    ],
    defaultDurationSec: 30,
    defaultSets: 3,
    svgAnimationType: 'dead_bug',
    wristSafeAlternativeId: 'hollow_body_tuck'
  },
  {
    id: 'reverse_crunch_tuck',
    name: 'Reverse Crunch & Pelvic Lift',
    category: 'calisthenics',
    target: ['core'],
    equipmentNeeded: [],
    description: 'The premier bodyweight lower abdominal builder that requires no partner holding your feet. Curl your pelvis and tailbone 2 inches off the mat using pure lower abdominal tension.',
    jointSafetyNotes: 'Unloads hip flexors and spares the neck from crunch strain.',
    formTips: [
      'Initiate movement by rolling pelvis upward with your abs, not swinging legs',
      'Pause for 1 second at the top of the hip lift',
      'Lower hips slowly under control back to the mat'
    ],
    mistakesToAvoid: [
      'Using leg momentum to heave hips upward',
      'Arching lower back on the eccentric descent'
    ],
    defaultReps: 12,
    defaultSets: 3,
    svgAnimationType: 'dead_bug',
    wristSafeAlternativeId: 'reverse_crunch_tuck'
  },
  {
    id: 'bird_dog_hold',
    name: 'Bird Dog Cross-Core Stability',
    category: 'calisthenics',
    target: ['core', 'back'],
    equipmentNeeded: [],
    description: 'Cross-body isometric stabilizer strengthening the transverse abdominis, multifidus, and glute complex. Performed on neutral fists or forearms to spare wrists.',
    jointSafetyNotes: 'Keeps the lumbar spine completely neutral; zero rotational stress.',
    formTips: [
      'Reach right arm straight forward and left leg straight back',
      'Keep hips square and parallel to the floor without tilting',
      'Hold for 2 seconds at full extension before alternating sides'
    ],
    mistakesToAvoid: [
      'Hyperextending spine like a scorpion',
      'Bending wrists backward (use flat fists)'
    ],
    defaultReps: 12,
    defaultSets: 3,
    svgAnimationType: 'plank',
    wristSafeAlternativeId: 'bird_dog_hold'
  },
  {
    id: 'side_plank_forearm',
    name: 'Forearm Side Plank (Zero Wrist Strain)',
    category: 'calisthenics',
    target: ['core'],
    equipmentNeeded: [],
    description: 'Lateral core and oblique fortifier resting directly on the forearm. Eliminates wrist hyperextension while carving obliques and stabilizing the pelvis.',
    jointSafetyNotes: 'Forearm base bypasses carpal joint completely; aligns elbow under shoulder.',
    formTips: [
      'Rest on forearm with elbow directly beneath shoulder joint',
      'Lift hips high forming a straight diagonal line from ear to ankle',
      'Squeeze lower oblique and glutes continuously'
    ],
    mistakesToAvoid: [
      'Allowing hips to sag down toward the floor',
      'Rotating top shoulder forward toward the floor'
    ],
    defaultDurationSec: 30,
    defaultSets: 3,
    svgAnimationType: 'plank',
    wristSafeAlternativeId: 'side_plank_forearm'
  },
  {
    id: 'seated_tuck_hold',
    name: 'Seated L-Sit Compression Tuck Hold',
    category: 'calisthenics',
    target: ['core', 'arms', 'shoulders'],
    equipmentNeeded: [],
    description: 'Progressive calisthenics floor compression drill building toward the L-sit. Press palms or flat fists down beside hips and compress thighs into chest to elevate body.',
    jointSafetyNotes: 'Use neutral fists, pushup handles, or flat palms with zero wrist torque.',
    formTips: [
      'Depress shoulder blades downward to create vertical clearance',
      'Compress knees tight against chest using lower abs',
      'Hold position for 20-30 seconds with calm controlled breathing'
    ],
    mistakesToAvoid: [
      'Shrugging shoulders into ears',
      'Leaning too far backward'
    ],
    defaultDurationSec: 25,
    defaultSets: 3,
    svgAnimationType: 'plank',
    wristSafeAlternativeId: 'seated_tuck_hold'
  },
  {
    id: 'pike_pushup_elevated',
    name: 'Pike Pushup (Overhead Calisthenics Press)',
    category: 'calisthenics',
    target: ['shoulders', 'chest', 'arms', 'core'],
    equipmentNeeded: [],
    description: 'Foundational vertical pushing calisthenics pattern in an inverted V stance. Builds the overhead pressing power and core bracing needed for handstands.',
    jointSafetyNotes: 'Can be gripped on dumbbell handles to keep wrists completely neutral.',
    formTips: [
      'Hips high in the air forming an inverted V with soft knees',
      'Lower head forward of hands creating an equilateral tripod base',
      'Press through palms/handles back up to locked arms'
    ],
    mistakesToAvoid: [
      'Flaring elbows out sideways (tuck elbows at 45 degrees)',
      'Dropping hips into a regular pushup'
    ],
    defaultReps: 8,
    defaultSets: 3,
    svgAnimationType: 'overhead_press',
    calisthenicsAlternativeId: 'incline_pushup_wall'
  },
  {
    id: 'doorframe_bodyweight_row',
    name: 'Doorframe / Towel Incline Bodyweight Row',
    category: 'calisthenics',
    target: ['back', 'arms', 'core'],
    equipmentNeeded: [],
    description: 'The ultimate bodyweight pulling solution when you do not have a pull-up bar! Grip a sturdy doorframe or looped towel with a neutral grip and row your chest in.',
    jointSafetyNotes: 'Vertical neutral grip completely protects wrists and elbows.',
    formTips: [
      'Hold doorframe at chest height with thumbs pointing up',
      'Walk feet forward to adjust resistance angle (steeper = easier)',
      'Pull chest to doorframe, driving elbows back and squeezing lats'
    ],
    mistakesToAvoid: [
      'Sagging hips (maintain rigid plank line)',
      'Jerking with hips instead of pulling with lats'
    ],
    defaultReps: 10,
    defaultSets: 3,
    svgAnimationType: 'row',
    calisthenicsAlternativeId: 'doorframe_bodyweight_row'
  },
  {
    id: 'bench_chair_dip',
    name: 'Chair / Bench Calisthenics Triceps Dip',
    category: 'calisthenics',
    target: ['arms', 'chest', 'shoulders'],
    equipmentNeeded: [],
    description: 'Bodyweight pressing drill using a chair or bench edge. Develops triceps extension and anterior chest strength to carry your own bodyweight.',
    jointSafetyNotes: 'Keep hips skimming close to the chair surface to prevent anterior shoulder roll.',
    formTips: [
      'Place palms or flat fists on edge of chair directly next to hips',
      'Bend elbows backward to 90 degrees while lowering hips',
      'Press firmly through hands to lockout arms'
    ],
    mistakesToAvoid: [
      'Drifting hips far away from chair (strains rotator cuff)',
      'Shrugging shoulders upward'
    ],
    defaultReps: 10,
    defaultSets: 3,
    svgAnimationType: 'pushup',
    calisthenicsAlternativeId: 'bench_chair_dip'
  },
  {
    id: 'superman_back_arch',
    name: 'Prone Superman Posterior Core Arch',
    category: 'calisthenics',
    target: ['back', 'core', 'legs'],
    equipmentNeeded: [],
    description: 'Prone bodyweight hold strengthening the spinal erectors, gluteus maximus, and scapular retractors without weights or pull-up bar.',
    jointSafetyNotes: 'Zero wrist, knee, or ankle strain; balances anterior core training.',
    formTips: [
      'Lie face down on mat with arms extended forward',
      'Simultaneously elevate chest, arms, and thighs 2-3 inches off floor',
      'Hold tension smoothly while breathing into ribcage'
    ],
    mistakesToAvoid: [
      'Jerking spine aggressively into sharp pain',
      'Holding breath'
    ],
    defaultDurationSec: 30,
    defaultSets: 3,
    svgAnimationType: 'glute_bridge',
    wristSafeAlternativeId: 'superman_back_arch'
  },
  {
    id: 'bear_crawl_hold',
    name: 'Bear Crawl Quadruped Isometric Hover',
    category: 'calisthenics',
    target: ['core', 'shoulders', 'legs'],
    equipmentNeeded: [],
    description: 'Quadruped anti-extension exercise hovering knees just 1 inch off the ground. Creates tremendous full-body tension and deep core activation.',
    jointSafetyNotes: 'Can be done on knuckles or forearms to spare wrists.',
    formTips: [
      'Hands under shoulders, knees under hips at 90-degree bend',
      'Hover knees exactly 1 inch off the floor and freeze',
      'Keep back flat like a tabletop and brace abdominal wall'
    ],
    mistakesToAvoid: [
      'Piking hips too high in the air',
      'Sagging lower back'
    ],
    defaultDurationSec: 30,
    defaultSets: 3,
    svgAnimationType: 'plank',
    wristSafeAlternativeId: 'bear_crawl_hold'
  },
  {
    id: 'pushup_neutral_handles',
    name: 'Neutral Dumbbell Handle Floor Pushup',
    category: 'calisthenics',
    target: ['chest', 'arms', 'shoulders', 'core'],
    equipmentNeeded: ['dumbbell'],
    description: 'Floor pushup performed gripping the handles of dumbbells. Maintains 100% straight, neutral wrists without the painful 90-degree dorsiflexion bend.',
    jointSafetyNotes: 'Completely eliminates wrist hyperextension pain while allowing deep chest stretch.',
    formTips: [
      'Grip dumbbell handles firmly with completely straight neutral wrists',
      'Keep elbows tracking back at 45 degrees in an arrowhead shape',
      'Maintain an unbroken rigid plank line from heels to head'
    ],
    mistakesToAvoid: [
      'Allowing wrists to buckle sideways under load',
      'Flaring elbows out to 90 degrees'
    ],
    defaultReps: 10,
    defaultSets: 3,
    svgAnimationType: 'pushup',
    wristSafeAlternativeId: 'pushup_neutral_handles'
  }
];

export const SPLIT_TYPE_LABELS: Record<string, string> = {
  PPL_Push: 'Push & Chest (Wrist-Protected)',
  PPL_Pull: 'Pull & Grip (Elbow & Joint Safe)',
  PPL_Legs: 'Legs & Mobility (Knee-Tracking)',
  Hybrid_FullBody: 'Hybrid Strength & Calisthenics',
  Joint_Core_Focus: 'Joint Rehab & Core Stability'
};
