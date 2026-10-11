import { WorkoutTemplate, UserProfile, WeeklyRoutineDay, RoutinePreset } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Athlete',
  email: 'ellajoshua660@gmail.com',
  heightCm: 175,
  weightKg: 70,
  age: 24,
  limbLeverType: 'balanced',
  experienceLevel: 'intermediate',
  maxPushups: 10,
  maxDumbbellWeightKg: 0, // 0kg baseline (unweighted / bodyweight start)
  maxBarbellWeightKg: 0, // 0kg baseline (clean start)
  barbellBarWeightKg: 8, // Compact 8kg bedroom barbell (not a heavy 20kg Olympic gym bar)
  workoutEnvironment: 'bedroom', // Bedroom workout setup
  dumbbellHandleWeightKg: 2,
  maxPlatesPerSleeve: 5,
  availableDumbbellPlateDenoms: [4.0, 2.5, 2.0, 1.5],
  workoutsPerWeek: 4,
  spotifyConnected: false,
  spotifyPlaylistUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN2aqioXM',
  notificationsEnabled: true,
  notificationTime: '08:00',
  availableEquipment: ['dumbbell', 'barbell', 'plates'],
  jointPainAreas: ['wrists', 'knees'],
  voiceCoachEnabled: true,
  completedWorkoutsCount: 0,
  currentStreakDays: 0,
  lastWorkoutDate: '',
  activeRoutinePresetId: 'routine_ppl_calisthenics_hybrid',
  cloudSyncConnected: false,
  cloudSyncEmail: '',
  tendonAdaptationWeeks: 0,
  connectiveTissueReadiness: 0,
  adaptationPhaseTitle: 'Phase 1: Baseline Joint & Ligament Remodeling (Week 0 of 6)',
  adaptationGuidance: 'Starting fresh at Week 0 Baseline. Tendons and ligaments take 6 weeks to remodel before load increases. Emphasize controlled 3s negatives and DRS time-under-tension to build foundational joint collagen.'
};

export const INITIAL_TEMPLATES: WorkoutTemplate[] = [
  // --- PRESET 1 TEMPLATES (ATHLETIC HYBRID & JOINT ARMOR) ---
  {
    id: 'routine_day_1_push',
    name: 'Day 1: Upper Push & Wrist Armor (Mon)',
    splitType: 'Upper_Push',
    estimatedMinutes: 30,
    jointFocus: ['wrists', 'shoulders'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'incline_pushup_wall',
      'db_floor_press',
      'wrist_flexor_curl_db',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_day_2_legs',
    name: 'Day 2: Lower Body & Knee Tracking (Wed)',
    splitType: 'Lower_Legs',
    estimatedMinutes: 32,
    jointFocus: ['knees', 'ankles'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_ankle_rotations',
      'bb_goblet_squat',
      'bb_romanian_deadlift',
      'dead_bug_core',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_day_4_pull',
    name: 'Day 3: Upper Pull, Arms & Core Stability (Thu)',
    splitType: 'Upper_Pull',
    estimatedMinutes: 28,
    jointFocus: ['wrists', 'core'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'db_single_arm_row',
      'db_bicep_hammer_curl',
      'forearm_plank_hold',
      'dead_bug_core',
      'wrist_flexor_curl_db',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_day_5_hybrid',
    name: 'Day 4: Full Body Hybrid & Kinetic Power (Fri)',
    splitType: 'Full_Hybrid',
    estimatedMinutes: 36,
    jointFocus: ['wrists', 'knees', 'core'],
    difficulty: 'Advanced',
    exercises: [
      'warmup_wrist_circles',
      'warmup_ankle_rotations',
      'incline_pushup_wall',
      'bb_goblet_squat',
      'db_floor_press',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },

  // --- PRESET 2 TEMPLATES (UPPER / LOWER POWER & HYPERTROPHY) ---
  {
    id: 'routine_ul_day_1_power',
    name: 'Day 1: Upper Body Power & Grip Force (Mon)',
    splitType: 'Upper_Push',
    estimatedMinutes: 32,
    jointFocus: ['wrists', 'shoulders'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'db_floor_press',
      'db_single_arm_row',
      'db_neutral_shoulder_press',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_ul_day_2_power',
    name: 'Day 2: Lower Body Power & Hip Drive (Wed)',
    splitType: 'Lower_Legs',
    estimatedMinutes: 34,
    jointFocus: ['knees', 'ankles'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_ankle_rotations',
      'bb_goblet_squat',
      'bb_romanian_deadlift',
      'bodyweight_glute_bridge',
      'dead_bug_core',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_ul_day_4_hypertrophy',
    name: 'Day 3: Upper Hypertrophy & Arm Sculpt (Thu)',
    splitType: 'Upper_Pull',
    estimatedMinutes: 30,
    jointFocus: ['wrists', 'core'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'incline_pushup_wall',
      'db_bicep_hammer_curl',
      'wrist_flexor_curl_db',
      'db_floor_press',
      'dead_bug_core',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_ul_day_5_hypertrophy',
    name: 'Day 4: Lower Hypertrophy & Knee Fortifier (Fri)',
    splitType: 'Lower_Legs',
    estimatedMinutes: 32,
    jointFocus: ['knees', 'ankles'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_ankle_rotations',
      'bb_goblet_squat',
      'bodyweight_glute_bridge',
      'standing_calf_raise',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },

  // --- PRESET 3 TEMPLATES (PUSH / PULL / LEGS / FULL BODY) ---
  {
    id: 'routine_pplf_day_1_push',
    name: 'Day 1: Pure Push & Chest Expansion (Mon)',
    splitType: 'PPL_Push',
    estimatedMinutes: 30,
    jointFocus: ['wrists', 'shoulders'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'incline_pushup_wall',
      'db_floor_press',
      'db_neutral_shoulder_press',
      'wrist_flexor_curl_db',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_pplf_day_2_pull',
    name: 'Day 2: Pure Pull & Back Thickness (Wed)',
    splitType: 'PPL_Pull',
    estimatedMinutes: 28,
    jointFocus: ['wrists', 'core'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'db_single_arm_row',
      'db_bicep_hammer_curl',
      'dead_bug_core',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_pplf_day_4_legs',
    name: 'Day 3: Legs & Posterior Pillar (Thu)',
    splitType: 'PPL_Legs',
    estimatedMinutes: 34,
    jointFocus: ['knees', 'ankles'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_ankle_rotations',
      'bb_goblet_squat',
      'bb_romanian_deadlift',
      'standing_calf_raise',
      'bodyweight_glute_bridge',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_pplf_day_5_full',
    name: 'Day 4: Full Body Functional Engine (Fri)',
    splitType: 'Hybrid_FullBody',
    estimatedMinutes: 35,
    jointFocus: ['wrists', 'knees', 'core'],
    difficulty: 'Advanced',
    exercises: [
      'warmup_wrist_circles',
      'warmup_ankle_rotations',
      'incline_pushup_wall',
      'bb_goblet_squat',
      'db_bicep_hammer_curl',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },

  // --- PRESET 4 TEMPLATES (ISOLATED MUSCLE GROUPS) ---
  {
    id: 'routine_iso_day_1_chest_tri',
    name: 'Day 1: Chest & Triceps Density (Mon)',
    splitType: 'Upper_Push',
    estimatedMinutes: 28,
    jointFocus: ['wrists', 'shoulders'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'db_floor_press',
      'incline_pushup_wall',
      'wrist_flexor_curl_db',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_iso_day_2_back_bi',
    name: 'Day 2: Back & Biceps Overload (Wed)',
    splitType: 'Upper_Pull',
    estimatedMinutes: 28,
    jointFocus: ['wrists', 'core'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'db_single_arm_row',
      'db_bicep_hammer_curl',
      'wrist_flexor_curl_db',
      'dead_bug_core',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_iso_day_4_legs_abs',
    name: 'Day 3: Quads, Glutes & Core Armor (Thu)',
    splitType: 'Lower_Legs',
    estimatedMinutes: 32,
    jointFocus: ['knees', 'ankles'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_ankle_rotations',
      'bb_goblet_squat',
      'bodyweight_glute_bridge',
      'standing_calf_raise',
      'dead_bug_core',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },
  {
    id: 'routine_iso_day_5_delts_post',
    name: 'Day 4: Deltoids & Posterior Chain (Fri)',
    splitType: 'Full_Hybrid',
    estimatedMinutes: 32,
    jointFocus: ['shoulders', 'wrists', 'knees'],
    difficulty: 'Intermediate',
    exercises: [
      'warmup_wrist_circles',
      'warmup_ankle_rotations',
      'db_neutral_shoulder_press',
      'bb_romanian_deadlift',
      'standing_calf_raise',
      'dead_bug_core',
      'cooldown_knee_extension_stretch'
    ]
  },

  // --- RECOVERY / GENERAL TEMPLATES ---
  {
    id: 'temp_joint_rehab',
    name: 'Active Recovery & Joint Mobility',
    splitType: 'Joint_Core_Focus',
    estimatedMinutes: 15,
    jointFocus: ['wrists', 'knees', 'ankles'],
    difficulty: 'Beginner',
    exercises: [
      'warmup_wrist_circles',
      'warmup_ankle_rotations',
      'wrist_flexor_curl_db',
      'dead_bug_core',
      'forearm_plank_hold',
      'cooldown_knee_extension_stretch'
    ]
  },
  // --- DEDICATED CALISTHENICS & CORE PROGRESSION TEMPLATES ---
  {
    id: 'template_calisthenics_core_mastery',
    name: 'Calisthenics Core & Trunk Armor (No Sit-Ups / Feet Held)',
    splitType: 'Joint_Core_Focus',
    estimatedMinutes: 22,
    jointFocus: ['core', 'wrists'],
    difficulty: 'Beginner',
    exercises: [
      'hollow_body_tuck',
      'reverse_crunch_tuck',
      'forearm_plank_hold',
      'bird_dog_hold',
      'side_plank_forearm',
      'seated_tuck_hold',
      'bear_crawl_hold',
      'dead_bug_core'
    ]
  },
  {
    id: 'template_calisthenics_bodyweight_strength',
    name: 'Bodyweight Calisthenics Fundamentals (No Pull-Up Bar)',
    splitType: 'Hybrid_FullBody',
    estimatedMinutes: 28,
    jointFocus: ['chest', 'back', 'core', 'wrists'],
    difficulty: 'Beginner',
    exercises: [
      'incline_pushup_wall',
      'doorframe_bodyweight_row',
      'pushup_neutral_handles',
      'bench_chair_dip',
      'hollow_body_tuck',
      'superman_back_arch',
      'seated_tuck_hold',
      'bodyweight_glute_bridge'
    ]
  },
  {
    id: 'template_calisthenics_upper_push_pull',
    name: 'Calisthenics Push, Pull & Core Foundations',
    splitType: 'PPL_Push',
    estimatedMinutes: 26,
    jointFocus: ['shoulders', 'arms', 'core'],
    difficulty: 'Beginner',
    exercises: [
      'pushup_neutral_handles',
      'doorframe_bodyweight_row',
      'pike_pushup_elevated',
      'bench_chair_dip',
      'reverse_crunch_tuck',
      'forearm_plank_hold'
    ]
  },
  // --- PRESET 5 TEMPLATES (PURE CALISTHENICS & CORE ARMOR) ---
  {
    id: 'routine_cali_day_1_push_core',
    name: 'Day 1: Calisthenics Push & Trunk Hollow Body (Mon)',
    splitType: 'Upper_Push',
    estimatedMinutes: 28,
    jointFocus: ['wrists', 'core', 'chest'],
    difficulty: 'Beginner',
    exercises: [
      'pushup_neutral_handles',
      'incline_pushup_wall',
      'hollow_body_tuck',
      'forearm_plank_hold',
      'bench_chair_dip'
    ]
  },
  {
    id: 'routine_cali_day_2_legs_core',
    name: 'Day 2: Calisthenics Lower Body & Pelvic Core (Wed)',
    splitType: 'Lower_Legs',
    estimatedMinutes: 26,
    jointFocus: ['knees', 'ankles', 'core'],
    difficulty: 'Beginner',
    exercises: [
      'bodyweight_glute_bridge',
      'standing_calf_raise',
      'reverse_crunch_tuck',
      'bird_dog_hold',
      'superman_back_arch'
    ]
  },
  {
    id: 'routine_cali_day_3_pull_lsit',
    name: 'Day 3: Calisthenics Pull & L-Sit Compression (Fri)',
    splitType: 'Upper_Pull',
    estimatedMinutes: 28,
    jointFocus: ['back', 'core', 'wrists'],
    difficulty: 'Beginner',
    exercises: [
      'doorframe_bodyweight_row',
      'seated_tuck_hold',
      'side_plank_forearm',
      'hollow_body_tuck',
      'dead_bug_core'
    ]
  },
  {
    id: 'routine_cali_day_4_full_armor',
    name: 'Day 4: Full Body Calisthenics Engine & Core Armor (Sat)',
    splitType: 'Full_Hybrid',
    estimatedMinutes: 30,
    jointFocus: ['core', 'shoulders', 'legs'],
    difficulty: 'Intermediate',
    exercises: [
      'pike_pushup_elevated',
      'doorframe_bodyweight_row',
      'bear_crawl_hold',
      'bench_chair_dip',
      'reverse_crunch_tuck',
      'bodyweight_glute_bridge'
    ]
  }
];

// ============================================================
// 4-DAY SPLIT ROUTINE PRESETS (MONDAY, WEDNESDAY, THURSDAY, FRIDAY)
// REST DAYS: TUESDAY, SATURDAY, SUNDAY
// ============================================================

export const FOUR_DAY_ROUTINES: RoutinePreset[] = [
  // 0. 4-DAY PPL + CALISTHENICS HYBRID (BEDROOM GEAR)
  {
    id: 'routine_ppl_calisthenics_hybrid',
    name: '4-Day PPL + Calisthenics Hybrid',
    tagline: 'Mon (Push & Cali) · Wed (Pull & Cali) · Thu (Legs & Barbell) · Fri (Full Cali & Hypertrophy)',
    badge: 'PPL + Calisthenics · Joint Safe',
    focus: 'Calisthenics bodyweight mastery + Bedroom Dumbbells (2-27kg) & Bedroom Barbell (8kg bar)',
    description: 'Precision 4-day workout schedule calibrated for your bedroom equipment. Push on Monday, Pull on Wednesday, Legs on Thursday, and Full Calisthenics & Overload on Friday. Rest days on Tuesday, Saturday, and Sunday provide optimal time for your tendons, ligaments, and joints to remodel safely before increasing intensity.',
    days: [
      {
        dayId: 'r0_mon',
        dayName: 'Monday',
        dayShort: 'Mon',
        dayNumber: 1,
        isWorkoutDay: true,
        splitLabel: 'Day 1: PPL Push & Calisthenics (Wrist-Safe)',
        routineType: 'Push & Calisthenics',
        targetMuscles: 'Chest, Anterior Delts, Triceps, Scapular Push',
        jointFocusNote: 'Neutral pushup handles / 45° wall pushups + neutral floor presses (Zero wrist torque)',
        estimatedMinutes: 30,
        templateId: 'routine_day_1_push',
        exercises: [
          'warmup_wrist_circles',
          'incline_pushup_wall',
          'db_floor_press',
          'bench_chair_dip',
          'wrist_flexor_curl_db',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r0_tue',
        dayName: 'Tuesday',
        dayShort: 'Tue',
        dayNumber: 2,
        isWorkoutDay: false,
        splitLabel: 'Active Recovery & Wrist Lubrication',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Full Body Synovial Fluid & Tendon Nourishment',
        jointFocusNote: 'Ligament recovery day: synovial circles, deep diaphragmatic breathing, and tendon de-stress',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r0_wed',
        dayName: 'Wednesday',
        dayShort: 'Wed',
        dayNumber: 3,
        isWorkoutDay: true,
        splitLabel: 'Day 2: PPL Pull & Calisthenics (Back & Biceps)',
        routineType: 'Pull & Calisthenics',
        targetMuscles: 'Lats, Rhomboids, Biceps, Core Compression',
        jointFocusNote: 'Doorframe bodyweight rows + neutral hammer curls + hollow body compression',
        estimatedMinutes: 28,
        templateId: 'routine_day_4_pull',
        exercises: [
          'warmup_wrist_circles',
          'doorframe_bodyweight_row',
          'db_single_arm_row',
          'db_bicep_hammer_curl',
          'hollow_body_tuck',
          'wrist_flexor_curl_db',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r0_thu',
        dayName: 'Thursday',
        dayShort: 'Thu',
        dayNumber: 4,
        isWorkoutDay: true,
        splitLabel: 'Day 3: PPL Legs & Bedroom Barbell (Knee Tracking)',
        routineType: 'Legs & Lower Chain',
        targetMuscles: 'Quads, Hamstrings, Glutes, Calves, Ankle Stabilizers',
        jointFocusNote: 'Compact 8kg barbell goblet squats + hip hinge deadlifts with laser knee alignment',
        estimatedMinutes: 32,
        templateId: 'routine_day_2_legs',
        exercises: [
          'warmup_ankle_rotations',
          'bb_goblet_squat',
          'bb_romanian_deadlift',
          'bodyweight_glute_bridge',
          'standing_calf_raise',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r0_fri',
        dayName: 'Friday',
        dayShort: 'Fri',
        dayNumber: 5,
        isWorkoutDay: true,
        splitLabel: 'Day 4: Full Calisthenics Mastery & Hybrid Overload',
        routineType: 'Full Calisthenics & Hybrid',
        targetMuscles: 'Total Body Kinetic Chains & Scapular Control',
        jointFocusNote: 'Pike pushups + hollow tucks + dumbbell floor presses with 3-second negatives',
        estimatedMinutes: 35,
        templateId: 'routine_day_5_hybrid',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'incline_pushup_wall',
          'db_floor_press',
          'seated_tuck_hold',
          'bear_crawl_hold',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r0_sat',
        dayName: 'Saturday',
        dayShort: 'Sat',
        dayNumber: 6,
        isWorkoutDay: false,
        splitLabel: 'Weekend Joint Reset & Tendon Remodeling',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Connective Tissue Matrix Adaptation & Collagen Repair',
        jointFocusNote: 'Allow collagen fiber cross-linking; light mobility flow and carpal/patellar decompression',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r0_sun',
        dayName: 'Sunday',
        dayShort: 'Sun',
        dayNumber: 7,
        isWorkoutDay: false,
        splitLabel: 'Weekly Recharge & CNS Recovery',
        routineType: 'Rest / Prep',
        targetMuscles: 'Full CNS & Collagen Regeneration',
        jointFocusNote: 'Complete sleep, nutrition, and hydration preparing your body for Monday',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      }
    ]
  },

  // 1. ATHLETIC HYBRID & JOINT ARMOR
  {
    id: 'routine_hybrid_armor',
    name: 'Athletic Hybrid & Joint Armor',
    tagline: 'Monday (Push) · Wednesday (Legs) · Thursday (Pull) · Friday (Hybrid)',
    badge: 'Balanced & Joint-Safe',
    focus: 'Ideal for calisthenics levers, free weights, and wrist preservation',
    description: 'A scientifically structured 4-day hybrid split on Monday, Wednesday, Thursday, and Friday. Spacing upper pushing, lower knee tracking, pulling/grip stability, and full-body athletic power, with recovery days on Tuesday, Saturday, and Sunday.',
    days: [
      {
        dayId: 'r1_mon',
        dayName: 'Monday',
        dayShort: 'Mon',
        dayNumber: 1,
        isWorkoutDay: true,
        splitLabel: 'Day 1: Upper Push & Wrist Armor',
        routineType: 'Upper Push',
        targetMuscles: 'Chest, Anterior Deltoids, Triceps, Forearms',
        jointFocusNote: 'Strict 45° incline wall pushups + neutral DB floor presses (Zero wrist hyperextension)',
        estimatedMinutes: 30,
        templateId: 'routine_day_1_push',
        exercises: [
          'warmup_wrist_circles',
          'incline_pushup_wall',
          'db_floor_press',
          'wrist_flexor_curl_db',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r1_tue',
        dayName: 'Tuesday',
        dayShort: 'Tue',
        dayNumber: 2,
        isWorkoutDay: false,
        splitLabel: 'Active Recovery & Joint Mobility',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Full Body Joint Fluid Circulation',
        jointFocusNote: 'Deep diaphragmatic breathing, wrist circles, and joint lubrication rest day',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r1_wed',
        dayName: 'Wednesday',
        dayShort: 'Wed',
        dayNumber: 3,
        isWorkoutDay: true,
        splitLabel: 'Day 2: Lower Body & Knee Tracking',
        routineType: 'Lower Body',
        targetMuscles: 'Quads, Glutes, Hamstrings, Ankles',
        jointFocusNote: 'Patellar tracking guide lines + talocrural heel pumps (No valgus knee collapse)',
        estimatedMinutes: 32,
        templateId: 'routine_day_2_legs',
        exercises: [
          'warmup_ankle_rotations',
          'bb_goblet_squat',
          'bb_romanian_deadlift',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r1_thu',
        dayName: 'Thursday',
        dayShort: 'Thu',
        dayNumber: 4,
        isWorkoutDay: true,
        splitLabel: 'Day 3: Upper Pull, Arms & Core Stability',
        routineType: 'Upper Pull & Core',
        targetMuscles: 'Back, Lats, Biceps, Core, Carpal Flexors',
        jointFocusNote: 'Neutral thumb-up hammer curls + neutral row + elbow-stacked planks (Prevents forearm tendonitis)',
        estimatedMinutes: 28,
        templateId: 'routine_day_4_pull',
        exercises: [
          'warmup_wrist_circles',
          'db_single_arm_row',
          'db_bicep_hammer_curl',
          'forearm_plank_hold',
          'dead_bug_core',
          'wrist_flexor_curl_db',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r1_fri',
        dayName: 'Friday',
        dayShort: 'Fri',
        dayNumber: 5,
        isWorkoutDay: true,
        splitLabel: 'Day 4: Full Body Hybrid & Kinetic Power',
        routineType: 'Full Body Hybrid',
        targetMuscles: 'Total Body Kinetic Chains',
        jointFocusNote: 'Sub-maximal calisthenics integration with controlled tempo overload',
        estimatedMinutes: 36,
        templateId: 'routine_day_5_hybrid',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'incline_pushup_wall',
          'bb_goblet_squat',
          'db_floor_press',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r1_sat',
        dayName: 'Saturday',
        dayShort: 'Sat',
        dayNumber: 6,
        isWorkoutDay: false,
        splitLabel: 'Weekend Joint Reset & Recovery',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Synovial Joint Nutrition & Tendon Reset',
        jointFocusNote: 'Gentle stretching, hydration, and myofascial recovery',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r1_sun',
        dayName: 'Sunday',
        dayShort: 'Sun',
        dayNumber: 7,
        isWorkoutDay: false,
        splitLabel: 'Weekly Recharge & CNS Recovery',
        routineType: 'Rest / Prep',
        targetMuscles: 'Complete Recovery & Sleep Optimization',
        jointFocusNote: 'Nutrient absorption, rest, and preparing muscles for Monday',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      }
    ]
  },

  // 2. UPPER / LOWER STRENGTH & HYPERTROPHY
  {
    id: 'routine_upper_lower',
    name: 'Upper / Lower Strength & Hypertrophy',
    tagline: 'Monday (Upper Power) · Wednesday (Lower Power) · Thursday (Upper Hyp) · Friday (Lower Hyp)',
    badge: 'Strength & Muscle Mass',
    focus: 'Higher frequency hitting each muscle group twice weekly with dedicated power and hypertrophy days',
    description: 'The classic 4-day Upper/Lower split mapped to Monday, Wednesday, Thursday, and Friday. Two dedicated upper sessions and two dedicated lower sessions separated by rest days on Tuesday, Saturday, and Sunday.',
    days: [
      {
        dayId: 'r2_mon',
        dayName: 'Monday',
        dayShort: 'Mon',
        dayNumber: 1,
        isWorkoutDay: true,
        splitLabel: 'Day 1: Upper Body Power & Grip Force',
        routineType: 'Upper Power',
        targetMuscles: 'Chest, Upper Back, Shoulders, Triceps',
        jointFocusNote: 'Explosive floor press and heavy neutral rows with packed scapulae',
        estimatedMinutes: 32,
        templateId: 'routine_ul_day_1_power',
        exercises: [
          'warmup_wrist_circles',
          'db_floor_press',
          'db_single_arm_row',
          'db_neutral_shoulder_press',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r2_tue',
        dayName: 'Tuesday',
        dayShort: 'Tue',
        dayNumber: 2,
        isWorkoutDay: false,
        splitLabel: 'Midweek Joint Reset & Mobility',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Tendon Remodeling & Cellular Repair',
        jointFocusNote: 'Carpal tendon gliding and lumbar decompression',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r2_wed',
        dayName: 'Wednesday',
        dayShort: 'Wed',
        dayNumber: 3,
        isWorkoutDay: true,
        splitLabel: 'Day 2: Lower Body Power & Hip Drive',
        routineType: 'Lower Power',
        targetMuscles: 'Quads, Posterior Chain, Glutes, Core',
        jointFocusNote: 'Upright goblet squats and Romanian hinges protecting lumbar spine',
        estimatedMinutes: 34,
        templateId: 'routine_ul_day_2_power',
        exercises: [
          'warmup_ankle_rotations',
          'bb_goblet_squat',
          'bb_romanian_deadlift',
          'bodyweight_glute_bridge',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r2_thu',
        dayName: 'Thursday',
        dayShort: 'Thu',
        dayNumber: 4,
        isWorkoutDay: true,
        splitLabel: 'Day 3: Upper Hypertrophy & Arm Sculpt',
        routineType: 'Upper Hypertrophy',
        targetMuscles: 'Chest, Biceps, Forearms, Core',
        jointFocusNote: 'Higher volume, continuous tension, neutral hammer curls avoiding elbow strain',
        estimatedMinutes: 30,
        templateId: 'routine_ul_day_4_hypertrophy',
        exercises: [
          'warmup_wrist_circles',
          'incline_pushup_wall',
          'db_bicep_hammer_curl',
          'wrist_flexor_curl_db',
          'db_floor_press',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r2_fri',
        dayName: 'Friday',
        dayShort: 'Fri',
        dayNumber: 5,
        isWorkoutDay: true,
        splitLabel: 'Day 4: Lower Hypertrophy & Knee Fortifier',
        routineType: 'Lower Hypertrophy',
        targetMuscles: 'Quads, Gluteus Medius, Calves, Trunk',
        jointFocusNote: 'Strict time under tension squats, high-rep glute bridges, and ankle stabilizers',
        estimatedMinutes: 32,
        templateId: 'routine_ul_day_5_hypertrophy',
        exercises: [
          'warmup_ankle_rotations',
          'bb_goblet_squat',
          'bodyweight_glute_bridge',
          'standing_calf_raise',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r2_sat',
        dayName: 'Saturday',
        dayShort: 'Sat',
        dayNumber: 6,
        isWorkoutDay: false,
        splitLabel: 'Weekend Joint Reset & Rest',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Tendon Recovery & Cellular Repair',
        jointFocusNote: 'Hydration and active tissue decompression',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r2_sun',
        dayName: 'Sunday',
        dayShort: 'Sun',
        dayNumber: 7,
        isWorkoutDay: false,
        splitLabel: 'Weekly Recharge & Rest',
        routineType: 'Rest',
        targetMuscles: 'Full CNS Recovery',
        jointFocusNote: 'Sleep, nutrition, mental preparation',
        estimatedMinutes: 0,
        exercises: []
      }
    ]
  },

  // 3. PUSH / PULL / LEGS / FULL BODY HYBRID
  {
    id: 'routine_ppl_full',
    name: 'Push / Pull / Legs / Full Body Hybrid',
    tagline: 'Monday (Push) · Wednesday (Pull) · Thursday (Legs) · Friday (Full Body)',
    badge: 'Functional Movement',
    focus: 'Great for athletes who enjoy movement-pattern based splits with a full-body finisher',
    description: 'Combines the classic Push/Pull/Legs movement patterns with an end-of-week Full-Body athletic conditioning session on Monday, Wednesday, Thursday, and Friday. Rest days on Tuesday, Saturday, and Sunday.',
    days: [
      {
        dayId: 'r3_mon',
        dayName: 'Monday',
        dayShort: 'Mon',
        dayNumber: 1,
        isWorkoutDay: true,
        splitLabel: 'Day 1: Pure Push & Chest Expansion',
        routineType: 'Push',
        targetMuscles: 'Chest, Triceps, Anterior Delts',
        jointFocusNote: 'Incline wall pushups + neutral DB press ensuring zero wrist hyperextension',
        estimatedMinutes: 30,
        templateId: 'routine_pplf_day_1_push',
        exercises: [
          'warmup_wrist_circles',
          'incline_pushup_wall',
          'db_floor_press',
          'db_neutral_shoulder_press',
          'wrist_flexor_curl_db',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r3_tue',
        dayName: 'Tuesday',
        dayShort: 'Tue',
        dayNumber: 2,
        isWorkoutDay: false,
        splitLabel: 'Midweek Joint Reset & Recovery',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Joint Synovial Restoration',
        jointFocusNote: 'Ankle and wrist rotational therapy',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r3_wed',
        dayName: 'Wednesday',
        dayShort: 'Wed',
        dayNumber: 3,
        isWorkoutDay: true,
        splitLabel: 'Day 2: Pure Pull & Back Thickness',
        routineType: 'Pull',
        targetMuscles: 'Lats, Rhomboids, Biceps, Core',
        jointFocusNote: 'Single-arm DB rows with neutral wrist support + forearm plank holds',
        estimatedMinutes: 28,
        templateId: 'routine_pplf_day_2_pull',
        exercises: [
          'warmup_wrist_circles',
          'db_single_arm_row',
          'db_bicep_hammer_curl',
          'dead_bug_core',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r3_thu',
        dayName: 'Thursday',
        dayShort: 'Thu',
        dayNumber: 4,
        isWorkoutDay: true,
        splitLabel: 'Day 3: Legs & Posterior Pillar',
        routineType: 'Legs',
        targetMuscles: 'Quads, Hamstrings, Glutes, Calves',
        jointFocusNote: 'Knee-tracking goblet squats + hip hinge Romanian deadlifts',
        estimatedMinutes: 34,
        templateId: 'routine_pplf_day_4_legs',
        exercises: [
          'warmup_ankle_rotations',
          'bb_goblet_squat',
          'bb_romanian_deadlift',
          'standing_calf_raise',
          'bodyweight_glute_bridge',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r3_fri',
        dayName: 'Friday',
        dayShort: 'Fri',
        dayNumber: 5,
        isWorkoutDay: true,
        splitLabel: 'Day 4: Full Body Functional Engine',
        routineType: 'Full Body',
        targetMuscles: 'Total Body Functional Strength',
        jointFocusNote: 'Compound movement pacing protecting all major joints',
        estimatedMinutes: 35,
        templateId: 'routine_pplf_day_5_full',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'incline_pushup_wall',
          'bb_goblet_squat',
          'db_bicep_hammer_curl',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r3_sat',
        dayName: 'Saturday',
        dayShort: 'Sat',
        dayNumber: 6,
        isWorkoutDay: false,
        splitLabel: 'Weekend Reset & Recovery',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Full Body Reset',
        jointFocusNote: 'Gentle stretching and mobility',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r3_sun',
        dayName: 'Sunday',
        dayShort: 'Sun',
        dayNumber: 7,
        isWorkoutDay: false,
        splitLabel: 'Weekly Reset & Rest',
        routineType: 'Rest',
        targetMuscles: 'Full Recovery',
        jointFocusNote: 'Relaxation and sleep',
        estimatedMinutes: 0,
        exercises: []
      }
    ]
  },

  // 4. TARGETED MUSCLE GROUPS
  {
    id: 'routine_muscle_groups',
    name: 'Targeted Muscle Groups Split',
    tagline: 'Monday (Chest/Tri) · Wednesday (Back/Bi) · Thursday (Legs/Abs) · Friday (Delts/Post)',
    badge: 'Targeted Hypertrophy',
    focus: 'Direct muscle isolation split with high mind-muscle connection and zero wrist strain',
    description: 'A 4-day isolated body part split pairing synergistic muscle groups (Monday: Chest+Triceps, Wednesday: Back+Biceps, Thursday: Legs+Core, Friday: Shoulders+Posterior Chain) with rest days on Tuesday, Saturday, and Sunday.',
    days: [
      {
        dayId: 'r4_mon',
        dayName: 'Monday',
        dayShort: 'Mon',
        dayNumber: 1,
        isWorkoutDay: true,
        splitLabel: 'Day 1: Chest & Triceps Density',
        routineType: 'Chest & Triceps',
        targetMuscles: 'Pectorals, Triceps Brachii, Forearm Stabilizers',
        jointFocusNote: 'Neutral dumbbell floor presses with tucked elbows saving shoulders',
        estimatedMinutes: 28,
        templateId: 'routine_iso_day_1_chest_tri',
        exercises: [
          'warmup_wrist_circles',
          'db_floor_press',
          'incline_pushup_wall',
          'wrist_flexor_curl_db',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r4_tue',
        dayName: 'Tuesday',
        dayShort: 'Tue',
        dayNumber: 2,
        isWorkoutDay: false,
        splitLabel: 'Active Recovery & Tendon Flush',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Synovial Joint Nutrition',
        jointFocusNote: 'Controlled articular rotations for wrists and knees',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r4_wed',
        dayName: 'Wednesday',
        dayShort: 'Wed',
        dayNumber: 3,
        isWorkoutDay: true,
        splitLabel: 'Day 2: Back & Biceps Overload',
        routineType: 'Back & Biceps',
        targetMuscles: 'Latissimus Dorsi, Trapezius, Biceps, Core',
        jointFocusNote: 'Neutral hammer curls and rows avoiding wrist pronation/supination torque',
        estimatedMinutes: 28,
        templateId: 'routine_iso_day_2_back_bi',
        exercises: [
          'warmup_wrist_circles',
          'db_single_arm_row',
          'db_bicep_hammer_curl',
          'wrist_flexor_curl_db',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r4_thu',
        dayName: 'Thursday',
        dayShort: 'Thu',
        dayNumber: 4,
        isWorkoutDay: true,
        splitLabel: 'Day 3: Quads, Glutes & Core Armor',
        routineType: 'Legs & Abs',
        targetMuscles: 'Quadriceps, Glutes, Calves, Rectus Abdominis',
        jointFocusNote: 'Knee-tracking goblet squats and zero-wrist dead bugs',
        estimatedMinutes: 32,
        templateId: 'routine_iso_day_4_legs_abs',
        exercises: [
          'warmup_ankle_rotations',
          'bb_goblet_squat',
          'bodyweight_glute_bridge',
          'standing_calf_raise',
          'dead_bug_core',
          'forearm_plank_hold',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r4_fri',
        dayName: 'Friday',
        dayShort: 'Fri',
        dayNumber: 5,
        isWorkoutDay: true,
        splitLabel: 'Day 4: Deltoids & Posterior Chain',
        routineType: 'Shoulders & Posterior',
        targetMuscles: 'Deltoids, Hamstrings, Erector Spinae, Calves',
        jointFocusNote: 'Neutral overhead pressing saving rotator cuff + soft knee Romanian deadlifts',
        estimatedMinutes: 32,
        templateId: 'routine_iso_day_5_delts_post',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'db_neutral_shoulder_press',
          'bb_romanian_deadlift',
          'standing_calf_raise',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r4_sat',
        dayName: 'Saturday',
        dayShort: 'Sat',
        dayNumber: 6,
        isWorkoutDay: false,
        splitLabel: 'Weekend Tendon Flush & Recovery',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Joint Recovery & Active Rest',
        jointFocusNote: 'Controlled articular rotations for wrists and knees',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: [
          'warmup_wrist_circles',
          'warmup_ankle_rotations',
          'dead_bug_core',
          'cooldown_knee_extension_stretch'
        ]
      },
      {
        dayId: 'r4_sun',
        dayName: 'Sunday',
        dayShort: 'Sun',
        dayNumber: 7,
        isWorkoutDay: false,
        splitLabel: 'Weekly Recharge & Rest',
        routineType: 'Rest',
        targetMuscles: 'Full System Regeneration',
        jointFocusNote: 'Hydration, mobility, and preparation for Monday',
        estimatedMinutes: 0,
        exercises: []
      }
    ]
  },

  // 5. CALISTHENICS MASTERY & CORE ARMOR
  {
    id: 'routine_calisthenics_core_armor',
    name: 'Calisthenics Mastery & Core Armor',
    tagline: 'Monday (Push/Hollow) · Wednesday (Legs/Pelvic Core) · Thursday (Pull/L-Sit) · Friday (Full Body)',
    badge: 'Pure Calisthenics & Core',
    focus: 'Zero feet held needed, zero pull-up bar needed, 100% wrist-safe bodyweight control',
    description: 'Specialized 4-day bodyweight and core split on Monday, Wednesday, Thursday, and Friday designed to build total bodyweight mastery, gymnastics hollow body tension, and L-sit compression with recovery days on Tuesday, Saturday, and Sunday.',
    days: [
      {
        dayId: 'r5_mon',
        dayName: 'Monday',
        dayShort: 'Mon',
        dayNumber: 1,
        isWorkoutDay: true,
        splitLabel: 'Day 1: Calisthenics Push & Trunk Hollow Body',
        routineType: 'Calisthenics Push & Core',
        targetMuscles: 'Chest, Triceps, Anterior Shoulders, Core Wall',
        jointFocusNote: 'Neutral handle pushups + hollow body tuck (Zero wrist hyperextension)',
        estimatedMinutes: 28,
        templateId: 'routine_cali_day_1_push_core',
        exercises: [
          'pushup_neutral_handles',
          'incline_pushup_wall',
          'hollow_body_tuck',
          'forearm_plank_hold',
          'bench_chair_dip'
        ]
      },
      {
        dayId: 'r5_tue',
        dayName: 'Tuesday',
        dayShort: 'Tue',
        dayNumber: 2,
        isWorkoutDay: false,
        splitLabel: 'Active Recovery & Core Decompression',
        routineType: 'Rest / Mobility',
        targetMuscles: 'Spinal Decompression & Synovial Fluid',
        jointFocusNote: 'Gentle joint mobility and deep diaphragmatic breathing',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: ['dead_bug_core']
      },
      {
        dayId: 'r5_wed',
        dayName: 'Wednesday',
        dayShort: 'Wed',
        dayNumber: 3,
        isWorkoutDay: true,
        splitLabel: 'Day 2: Calisthenics Lower Body & Pelvic Core',
        routineType: 'Calisthenics Legs & Core',
        targetMuscles: 'Glutes, Hamstrings, Calves, Lower Abs',
        jointFocusNote: 'Reverse crunches (no partner feet held needed) and zero-axial glute bridges',
        estimatedMinutes: 26,
        templateId: 'routine_cali_day_2_legs_core',
        exercises: [
          'bodyweight_glute_bridge',
          'standing_calf_raise',
          'reverse_crunch_tuck',
          'bird_dog_hold',
          'superman_back_arch'
        ]
      },
      {
        dayId: 'r5_thu',
        dayName: 'Thursday',
        dayShort: 'Thu',
        dayNumber: 4,
        isWorkoutDay: true,
        splitLabel: 'Day 3: Calisthenics Pull & L-Sit Compression',
        routineType: 'Calisthenics Pull & Obliques',
        targetMuscles: 'Lats, Upper Back, Biceps, L-Sit Compression Core',
        jointFocusNote: 'Doorframe incline rows (no pull-up bar needed) + forearm side planks',
        estimatedMinutes: 28,
        templateId: 'routine_cali_day_3_pull_lsit',
        exercises: [
          'doorframe_bodyweight_row',
          'seated_tuck_hold',
          'side_plank_forearm',
          'hollow_body_tuck',
          'dead_bug_core'
        ]
      },
      {
        dayId: 'r5_fri',
        dayName: 'Friday',
        dayShort: 'Fri',
        dayNumber: 5,
        isWorkoutDay: true,
        splitLabel: 'Day 4: Full Body Calisthenics Engine & Core Armor',
        routineType: 'Full Body Calisthenics',
        targetMuscles: 'Full Body Kinetic Chain & Deep Transverse Core',
        jointFocusNote: 'Pike pushup overhead strength + bear crawl isometric hover',
        estimatedMinutes: 30,
        templateId: 'routine_cali_day_4_full_armor',
        exercises: [
          'pike_pushup_elevated',
          'doorframe_bodyweight_row',
          'bear_crawl_hold',
          'bench_chair_dip',
          'reverse_crunch_tuck',
          'bodyweight_glute_bridge'
        ]
      },
      {
        dayId: 'r5_sat',
        dayName: 'Saturday',
        dayShort: 'Sat',
        dayNumber: 6,
        isWorkoutDay: false,
        splitLabel: 'Weekend Joint Reset & Recovery',
        routineType: 'Rest / Mobility',
        targetMuscles: 'System Regeneration',
        jointFocusNote: 'Active rest for muscle tendon adaptation',
        estimatedMinutes: 15,
        templateId: 'temp_joint_rehab',
        exercises: ['dead_bug_core']
      },
      {
        dayId: 'r5_sun',
        dayName: 'Sunday',
        dayShort: 'Sun',
        dayNumber: 7,
        isWorkoutDay: false,
        splitLabel: 'Weekly Rest & Reset',
        routineType: 'Rest',
        targetMuscles: 'Full Body Regeneration',
        jointFocusNote: 'Deep sleep, nutrition, and mental prep for Monday',
        estimatedMinutes: 0,
        exercises: []
      }
    ]
  }
];
