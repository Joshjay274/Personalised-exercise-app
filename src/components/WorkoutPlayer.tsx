import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Volume2,
  VolumeX,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  HeartHandshake,
  Timer,
  Check,
  Dumbbell,
  Clock,
  Repeat,
  Trash2,
  Zap,
  Layers,
  Activity,
  Bot,
  MessageSquare
} from 'lucide-react';
import { Exercise, WorkoutTemplate, UserProfile, CompletedWorkoutSummary, ExerciseSessionSet } from '../types';
import { EXERCISE_DATABASE } from '../data/exercises';
import { ExerciseVisualizer } from './ExerciseVisualizer';
import { PlateCalculator } from './PlateCalculator';
import { DumbbellPlateLoader } from './DumbbellPlateLoader';
import { InWorkoutAIChat } from './InWorkoutAIChat';
import { generateAllAchievableDumbbellLoads } from '../utils/plateSolver';
import { speakCoachVoice, playTimerBeep } from '../utils/audio';
import { getBiometricTuning } from '../utils/exerciseTuning';

// 5-MINUTE WARM-UP SEQUENCE (10 movements x 30 seconds each = 300 seconds = 5:00)
export const WARMUP_SEQUENCE: Exercise[] = [
  {
    id: 'warmup_wrist_circles',
    name: 'Wrist Circles & Tendon Mobilization',
    category: 'warmup',
    target: ['wrists'],
    equipmentNeeded: [],
    description: 'Smooth 360-degree wrist rotations to stimulate synovial fluid and lubricate carpal tendons prior to loading.',
    jointSafetyNotes: 'Keeps carpal joint pressure low; mandatory before any dumbbell, barbell, or pushup exercise.',
    formTips: [
      'Perform 15 seconds clockwise, then 15 seconds counter-clockwise',
      'Keep elbows bent at 90 degrees tucked close to ribs',
      'Maintain loose, relaxed fists without clenching'
    ],
    mistakesToAvoid: [
      'Snapping or jerking wrists aggressively',
      'Forcing painful end-range angles'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'wrist_circle'
  },
  {
    id: 'warmup_wrist_pulses',
    name: 'Wrist Flexor & Extensor Dynamic Pulses',
    category: 'warmup',
    target: ['wrists', 'arms'],
    equipmentNeeded: [],
    description: 'Gentle forearm dynamic stretches that prepare both flexor and extensor tendon bundles for neutral grip stability.',
    jointSafetyNotes: 'Prevents forearm pump and strain on the median nerve during pressing movements.',
    formTips: [
      'Extend right arm forward with palm out, gently pulse fingers backward for 15s',
      'Switch to left arm and repeat for 15s',
      'Keep shoulders depressed away from ears'
    ],
    mistakesToAvoid: [
      'Pulling aggressively on finger joints',
      'Locking elbows out with hyperextension'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'wrist_circle'
  },
  {
    id: 'warmup_arm_circles',
    name: 'Arm Circles & Rotator Cuff Openers',
    category: 'warmup',
    target: ['shoulders', 'chest'],
    equipmentNeeded: [],
    description: 'Dynamic circumduction of shoulders from small to large orbits, warming the rotator cuff and scapular stabilizers.',
    jointSafetyNotes: 'Builds glenohumeral space, eliminating shoulder impingement during overhead presses and floor presses.',
    formTips: [
      'Start with small forward circles for 15 seconds',
      'Reverse to backward circles for 15 seconds',
      'Maintain active core tension to prevent lumbar hyperextension'
    ],
    mistakesToAvoid: [
      'Shrugging traps up toward the neck',
      'Arching lower back when arms pass overhead'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'overhead_press'
  },
  {
    id: 'warmup_torso_rotations',
    name: 'Torso Twists & Thoracic Spine Mobilizer',
    category: 'warmup',
    target: ['core'],
    equipmentNeeded: [],
    description: 'Controlled rotational twists through the thoracic spine to activate obliques, serratus, and spinal erecters.',
    jointSafetyNotes: 'Rotates from mid-back while keeping hips relatively square to protect lumbar vertebrae.',
    formTips: [
      'Feet shoulder-width apart, arms bent at chest height',
      'Rotate smoothly side to side, letting the trailing heel pivot',
      'Breathe rhythmically with each twist'
    ],
    mistakesToAvoid: [
      'Whipping spine with uncontrolled momentum',
      'Keeping feet glued which twists the knee joints'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'dead_bug'
  },
  {
    id: 'warmup_hip_hinge_sweeps',
    name: 'Hip Hinge & Hamstring Dynamic Sweeps',
    category: 'warmup',
    target: ['knees'],
    equipmentNeeded: [],
    description: 'Dynamic hinge pulses with soft knees to lengthen hamstrings and activate the posterior chain glute complex.',
    jointSafetyNotes: 'Soft micro-bend in knees protects both the ACL/PCL and lower lumbar discs.',
    formTips: [
      'Push hips backward as if touching a wall behind you',
      'Keep back flat and sweep hands downward toward shins',
      'Squeeze glutes to stand tall at the top of each sweep'
    ],
    mistakesToAvoid: [
      'Rounding the lower back to reach lower',
      'Locking knees out rigid'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'glute_bridge'
  },
  {
    id: 'warmup_air_squats',
    name: 'Bodyweight Squat Pulses (Knee Tracking)',
    category: 'warmup',
    target: ['knees'],
    equipmentNeeded: [],
    description: 'Shallow to parallel bodyweight squats establishing proper knee-over-toes path and ankle dorsiflexion.',
    jointSafetyNotes: 'Tracks patella directly over the 2nd and 3rd toes to prevent medial knee collapse.',
    formTips: [
      'Feet slightly wider than shoulders, toes angled out 15 degrees',
      'Drive knees actively outward as you descend',
      'Keep chest proud and heels firmly anchored'
    ],
    mistakesToAvoid: [
      'Allowing knees to cave inward (valgus collapse)',
      'Lifting heels off the floor'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'squat'
  },
  {
    id: 'warmup_ankle_rotations',
    name: 'Ankle Rotations & Heel-to-Toe Rockers',
    category: 'warmup',
    target: ['ankles'],
    equipmentNeeded: [],
    description: 'Full ankle circumduction and heel-to-toe rocking to activate the calf tendons and ankle stabilizers.',
    jointSafetyNotes: 'Prevents Achilles strain and provides the dorsiflexion mobility needed for deep squats.',
    formTips: [
      'Circle left ankle for 15s, then right ankle for 15s',
      'Rock forward onto toes, then backward onto heels',
      'Brace core or hold a wall for balance'
    ],
    mistakesToAvoid: [
      'Rolling ankles violently onto outer edges',
      'Bouncing rapidly without control'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'ankle_rotation'
  },
  {
    id: 'warmup_high_knees',
    name: 'Standing High Knee March',
    category: 'warmup',
    target: ['core', 'knees'],
    equipmentNeeded: [],
    description: 'Deliberate, rhythmic high knee marching that fires the hip flexors, deep core, and quadriceps.',
    jointSafetyNotes: 'Low-impact version: no jumping required, preserving joints while elevating core body temperature.',
    formTips: [
      'Drive knees up to waist height with dorsiflexed toes',
      'Pump opposite arms in synchronization with legs',
      'Maintain an upright posture without leaning backward'
    ],
    mistakesToAvoid: [
      'Slouching or rounding forward as knees rise',
      'Stomping feet down heavily'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'calf_raise'
  },
  {
    id: 'warmup_butt_kicks',
    name: 'Dynamic Butt Kicks & Quad Flushes',
    category: 'warmup',
    target: ['knees'],
    equipmentNeeded: [],
    description: 'Dynamic heel-to-glute kicks that stretch the anterior quadriceps while warming the knee joint capsule.',
    jointSafetyNotes: 'Promotes blood flow through the patellar tendon without heavy impact.',
    formTips: [
      'Alternate kicking heels up toward your glutes',
      'Keep thighs pointing straight down toward floor',
      'Stay light on the balls of your feet'
    ],
    mistakesToAvoid: [
      'Swinging thighs forward instead of kicking backward',
      'Arching lower back'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'calf_raise'
  },
  {
    id: 'warmup_step_jacks',
    name: 'Low-Impact Step Jacks & Dynamic Blood Flow',
    category: 'warmup',
    target: ['shoulders', 'core'],
    equipmentNeeded: [],
    description: 'Systemic warm-up finisher: side-to-side steps with overhead arm reaches to elevate heart rate and prime the CNS.',
    jointSafetyNotes: 'Zero-impact alternative to jumping jacks that protects ankles, knees, and shin splints.',
    formTips: [
      'Step right foot wide while sweeping arms overhead',
      'Return to center and step left foot wide',
      'Breathe steadily to complete the 5-minute warm-up sequence'
    ],
    mistakesToAvoid: [
      'Locking elbows when raising arms',
      'Holding breath'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'overhead_press'
  }
];

// 5-MINUTE COOL-DOWN SEQUENCE (10 movements x 30 seconds each = 300 seconds = 5:00)
export const COOLDOWN_SEQUENCE: Exercise[] = [
  {
    id: 'cooldown_childs_pose',
    name: "Child's Pose & Latissimus Decompression",
    category: 'cooldown',
    target: ['shoulders', 'core'],
    equipmentNeeded: [],
    description: 'Restorative prone posture that gently decompresses lumbar discs, thoracic spine, and lat tendons.',
    jointSafetyNotes: 'Relieves axial loading pressure from barbell and dumbbell training sessions.',
    formTips: [
      'Kneel on the floor, sit hips back onto heels, and reach arms forward',
      'Rest forehead gently on the mat',
      'Take slow, deep 4-second breaths into the lower ribcage'
    ],
    mistakesToAvoid: [
      'Tensing shoulders up into ears',
      'Forcing hips lower if knees feel pinched'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'plank'
  },
  {
    id: 'cooldown_cobra_pose',
    name: 'Gentle Cobra / Sphinx Abdominal Opener',
    category: 'cooldown',
    target: ['core', 'chest'],
    equipmentNeeded: [],
    description: 'Gentle prone extension on forearms that opens the anterior chest, abs, and hip flexors after heavy pressing.',
    jointSafetyNotes: 'Sphinx posture keeps lumbar hyperextension mild and safe for spinal health.',
    formTips: [
      'Lie face down, resting forearms flat under shoulders',
      'Press palms down and lift chest smoothly off floor',
      'Keep glutes relaxed and gaze forward'
    ],
    mistakesToAvoid: [
      'Pushing up aggressively into sharp lower back pain',
      'Shrugging shoulders into the neck'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'plank'
  },
  {
    id: 'cooldown_downward_dog',
    name: 'Downward Dog & Calf Pedal Stretch',
    category: 'cooldown',
    target: ['ankles', 'knees'],
    equipmentNeeded: [],
    description: 'Inverted V-shape stretch releasing tension across the entire superficial back line, calves, and Achilles.',
    jointSafetyNotes: 'Alternate pedaling heels to avoid over-stretching tight calves.',
    formTips: [
      'Push floor away with neutral hands, send hips up and back',
      'Alternate pressing right heel then left heel toward floor',
      'Keep knees micro-bent if hamstrings are tight'
    ],
    mistakesToAvoid: [
      'Dumping heavy bodyweight into wrists (push through base of knuckles)',
      'Rounding upper spine'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'ankle_rotation'
  },
  {
    id: 'cooldown_kneeling_hip_left',
    name: 'Kneeling Hip Flexor Stretch (Left Side)',
    category: 'cooldown',
    target: ['knees', 'core'],
    equipmentNeeded: [],
    description: 'Half-kneeling posture targeting the left iliopsoas and rectus femoris to relieve lower back tension.',
    jointSafetyNotes: 'Posterior pelvic tilt (tucking pelvis under) protects the sacroiliac joint.',
    formTips: [
      'Left knee down, right foot flat forward at 90 degrees',
      'Tuck pelvis under (squeeze left glute) and shift weight forward gently',
      'Hold position with tall spine and deep belly breathing'
    ],
    mistakesToAvoid: [
      'Arching lower back forward excessively',
      'Allowing front knee to drift far past toes'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'glute_bridge'
  },
  {
    id: 'cooldown_kneeling_hip_right',
    name: 'Kneeling Hip Flexor Stretch (Right Side)',
    category: 'cooldown',
    target: ['knees', 'core'],
    equipmentNeeded: [],
    description: 'Half-kneeling posture targeting the right iliopsoas and rectus femoris for bilateral pelvic balance.',
    jointSafetyNotes: 'Maintains pelvic symmetry and decompresses lumbar spine after leg and full body sessions.',
    formTips: [
      'Right knee down, left foot flat forward at 90 degrees',
      'Tuck pelvis under (squeeze right glute) and shift forward gently',
      'Breathe deeply into diaphragm for the full 30 seconds'
    ],
    mistakesToAvoid: [
      'Collapsing chest forward',
      'Hyperextending spine'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'glute_bridge'
  },
  {
    id: 'cooldown_standing_quad_left',
    name: 'Standing Quad & Patellar Relief (Left Leg)',
    category: 'cooldown',
    target: ['knees'],
    equipmentNeeded: [],
    description: 'Standing quadriceps stretch releasing tension along the patellar tendon and front thigh.',
    jointSafetyNotes: 'Keep knees aligned together to prevent hip abduction strain.',
    formTips: [
      'Hold left ankle with left hand, keeping knees close together',
      'Tuck tailbone under to intensify stretch along front of thigh',
      'Hold a wall with right hand for stable balance'
    ],
    mistakesToAvoid: [
      'Pulling heel out to the side',
      'Arching lower back'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'squat'
  },
  {
    id: 'cooldown_standing_quad_right',
    name: 'Standing Quad & Patellar Relief (Right Leg)',
    category: 'cooldown',
    target: ['knees'],
    equipmentNeeded: [],
    description: 'Standing quadriceps stretch releasing tension along right patellar tendon and front thigh.',
    jointSafetyNotes: 'Balances quadriceps length and reduces compressive force on the kneecap.',
    formTips: [
      'Hold right ankle with right hand, keeping knees aligned together',
      'Tuck tailbone under to feel the front thigh lengthen',
      'Hold a wall with left hand for balance'
    ],
    mistakesToAvoid: [
      'Flaring knee outward',
      'Jerking ankle upward'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'squat'
  },
  {
    id: 'cooldown_wrist_extensor_stretch',
    name: 'Wrist Extensor & Carpal Release Stretch',
    category: 'cooldown',
    target: ['wrists', 'arms'],
    equipmentNeeded: [],
    description: 'Gentle static stretch releasing forearm flexors and extensors after gripping weights and barbells.',
    jointSafetyNotes: 'Critical for carpal decompression; eliminates wrist ache and stiffness post-workout.',
    formTips: [
      'Extend right arm with fingers pointing down, gently draw fingers toward you with left hand for 15s',
      'Switch and repeat on left arm for 15s',
      'Keep arm relaxed with zero forced tension'
    ],
    mistakesToAvoid: [
      'Pulling hard enough to cause pain or numbness',
      'Bending at the elbow'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'wrist_circle'
  },
  {
    id: 'cooldown_shoulder_crossbody',
    name: 'Cross-Body Shoulder & Deltoid Release',
    category: 'cooldown',
    target: ['shoulders', 'arms'],
    equipmentNeeded: [],
    description: 'Cross-body arm hug releasing posterior deltoids, infraspinatus, and rhomboids.',
    jointSafetyNotes: 'Keeps shoulders depressed to maximize rear deltoid and rotator cuff decompression.',
    formTips: [
      'Bring right arm across chest, gently hug arm with left forearm for 15s',
      'Switch and bring left arm across chest for 15s',
      'Keep shoulder dropped down away from ear'
    ],
    mistakesToAvoid: [
      'Pressing directly on the elbow joint',
      'Rotating torso toward the arm'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'row'
  },
  {
    id: 'cooldown_box_breathing',
    name: 'Deep Diaphragmatic Box Breathing & Shakedown',
    category: 'cooldown',
    target: ['core'],
    equipmentNeeded: [],
    description: 'Parasympathetic recovery reset: 4-4-4-4 box breathing combined with gentle limbs shakedown to lower cortisol.',
    jointSafetyNotes: 'Down-regulates the sympathetic nervous system and accelerates muscle tissue recovery.',
    formTips: [
      'Inhale deep into belly for 4 seconds',
      'Hold breath for 4 seconds, exhale smoothly for 4 seconds, hold for 4 seconds',
      'Shake hands, wrists, and legs loose to conclude the session'
    ],
    mistakesToAvoid: [
      'Shallow chest breathing',
      'Tensing shoulders during the breath hold'
    ],
    defaultDurationSec: 30,
    defaultSets: 1,
    svgAnimationType: 'dead_bug'
  }
];

export type WorkoutPhase = 'warmup' | 'main' | 'cooldown';

interface WorkoutPlayerProps {
  template: WorkoutTemplate;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onFinishWorkout: (summary: CompletedWorkoutSummary) => void;
  onCancelWorkout: () => void;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  template,
  userProfile,
  onUpdateProfile,
  onFinishWorkout,
  onCancelWorkout
}) => {
  // Current Phase: 'warmup' (5 min) -> 'main' -> 'cooldown' (5 min)
  const [currentPhase, setCurrentPhase] = useState<WorkoutPhase>('warmup');
  const [warmupIndex, setWarmupIndex] = useState<number>(0);
  const [cooldownIndex, setCooldownIndex] = useState<number>(0);

  // 30-Second Phase Countdown Timer for Warm-up & Cool-down
  const [drillTimeLeft, setDrillTimeLeft] = useState<number>(30);
  const [isDrillTimerRunning, setIsDrillTimerRunning] = useState<boolean>(true);

  // Main Workout State
  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Exercise Countdown Timer for Main Workout duration-based exercises
  const currentExId = template.exercises[currentExIndex];
  const activeExercise = EXERCISE_DATABASE.find((e) => e.id === currentExId) || EXERCISE_DATABASE[0];

  const defaultDuration = activeExercise.defaultDurationSec || 0;
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState<number>(defaultDuration);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(defaultDuration > 0);

  // Rest Timer State for Main Workout
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restTimeLeft, setRestTimeLeft] = useState<number>(30);
  const [totalRestGiven, setTotalRestGiven] = useState<number>(30);

  // Voice toggle local state
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(userProfile.voiceCoachEnabled);

  // Substituted exercises map for current session
  const [exerciseOverrides, setExerciseOverrides] = useState<Record<string, string>>({});

  // Active exercise accounting for substitutions
  const effectiveExerciseId = exerciseOverrides[activeExercise.id] || activeExercise.id;
  const effectiveExercise = EXERCISE_DATABASE.find((e) => e.id === effectiveExerciseId) || activeExercise;

  // Active weight tracking
  const currentWeight = effectiveExercise.category === 'barbell'
    ? userProfile.maxBarbellWeightKg
    : effectiveExercise.category === 'dumbbell'
    ? userProfile.maxDumbbellWeightKg
    : 0;

  // DRS (Duration / Drop Sets) and Reps Session Tracking
  const [sessionLoggedSets, setSessionLoggedSets] = useState<ExerciseSessionSet[]>([]);
  const [currentSetReps, setCurrentSetReps] = useState<number>(effectiveExercise.defaultReps || 10);
  const [currentSetWeight, setCurrentSetWeight] = useState<number>(currentWeight);
  const [currentSetTutSec, setCurrentSetTutSec] = useState<number>(effectiveExercise.defaultDurationSec || 30);
  const [isDropSetToggle, setIsDropSetToggle] = useState<boolean>(false);
  const [isSetStopwatchRunning, setIsSetStopwatchRunning] = useState<boolean>(false);
  const [showAIChatModal, setShowAIChatModal] = useState<boolean>(false);

  // Sync set inputs when active exercise changes
  useEffect(() => {
    const defaultReps = effectiveExercise.defaultReps || 10;
    const initialW = effectiveExercise.category === 'barbell'
      ? userProfile.maxBarbellWeightKg
      : effectiveExercise.category === 'dumbbell'
      ? userProfile.maxDumbbellWeightKg
      : 0;
    const defaultSec = effectiveExercise.defaultDurationSec || 30;

    setCurrentSetReps(defaultReps);
    setCurrentSetWeight(initialW);
    setCurrentSetTutSec(defaultSec);
    setIsDropSetToggle(false);
    setIsSetStopwatchRunning(false);
  }, [currentExIndex, effectiveExerciseId, userProfile.maxBarbellWeightKg, userProfile.maxDumbbellWeightKg]);

  // Live DRS stopwatch for time under tension during active set
  useEffect(() => {
    let interval: any = null;
    if (currentPhase === 'main' && isSetStopwatchRunning && !isResting) {
      interval = setInterval(() => {
        setCurrentSetTutSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPhase, isSetStopwatchRunning, isResting]);

  // Total session clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 30-Second Drill Timer for Warm-Up and Cool-Down
  useEffect(() => {
    let interval: any = null;
    if (isDrillTimerRunning && (currentPhase === 'warmup' || currentPhase === 'cooldown') && drillTimeLeft > 0) {
      interval = setInterval(() => {
        setDrillTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playTimerBeep('tick');
          }
          if (prev === 4 && voiceEnabled) {
            speakCoachVoice('3, 2, 1, finish movement!', voiceEnabled);
          }
          if (prev <= 1) {
            playTimerBeep('finish');
            handleNextDrill();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDrillTimerRunning, currentPhase, drillTimeLeft, warmupIndex, cooldownIndex, voiceEnabled]);

  // Voice announcement on new Warm-Up or Cool-Down drill
  useEffect(() => {
    if (currentPhase === 'warmup') {
      const activeWarmup = WARMUP_SEQUENCE[warmupIndex];
      setDrillTimeLeft(30);
      setIsDrillTimerRunning(true);
      if (voiceEnabled) {
        speakCoachVoice(`Warm-up ${warmupIndex + 1} of 10: ${activeWarmup.name}. 30 seconds.`, voiceEnabled);
      }
    } else if (currentPhase === 'cooldown') {
      const activeCooldown = COOLDOWN_SEQUENCE[cooldownIndex];
      setDrillTimeLeft(30);
      setIsDrillTimerRunning(true);
      if (voiceEnabled) {
        speakCoachVoice(`Cool-down ${cooldownIndex + 1} of 10: ${activeCooldown.name}. 30 seconds.`, voiceEnabled);
      }
    }
  }, [currentPhase, warmupIndex, cooldownIndex]);

  // Main Workout Duration Countdown
  useEffect(() => {
    let interval: any = null;
    if (currentPhase === 'main' && isTimerRunning && !isResting && exerciseTimeLeft > 0) {
      interval = setInterval(() => {
        setExerciseTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playTimerBeep('tick');
          }
          if (prev === 4 && voiceEnabled) {
            speakCoachVoice('3, 2, 1, finish strong!', voiceEnabled);
          }
          if (prev <= 1) {
            playTimerBeep('finish');
            handleSetCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPhase, isTimerRunning, isResting, exerciseTimeLeft, voiceEnabled]);

  // Rest Timer Countdown (Main Workout)
  useEffect(() => {
    let interval: any = null;
    if (currentPhase === 'main' && isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playTimerBeep('tick');
          }
          if (prev === 4 && voiceEnabled) {
            const nextIdx = currentSet >= (effectiveExercise.defaultSets || 3) ? currentExIndex + 1 : currentExIndex;
            const nextExName = template.exercises[nextIdx]
              ? (EXERCISE_DATABASE.find(e => e.id === template.exercises[nextIdx])?.name || 'Next exercise')
              : 'Cool-down sequence';
            speakCoachVoice(`3, 2, 1, begin ${nextExName}`, voiceEnabled);
          }
          if (prev <= 1) {
            playTimerBeep('go');
            endRestAndProceed();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPhase, isResting, restTimeLeft, voiceEnabled]);

  // Voice announcement on new main workout exercise
  useEffect(() => {
    if (currentPhase === 'main') {
      if (voiceEnabled) {
        const msg = `Exercise ${currentExIndex + 1}: ${effectiveExercise.name}. ${effectiveExercise.jointSafetyNotes}`;
        speakCoachVoice(msg, voiceEnabled);
      }
      if (effectiveExercise.defaultDurationSec) {
        setExerciseTimeLeft(effectiveExercise.defaultDurationSec);
        setIsTimerRunning(true);
      } else {
        setIsTimerRunning(false);
        setExerciseTimeLeft(0);
      }
      setCurrentSet(1);
    }
  }, [currentPhase, currentExIndex, effectiveExerciseId]);

  // Advance Warm-Up or Cool-Down Movement (30 seconds per drill)
  const handleNextDrill = () => {
    if (currentPhase === 'warmup') {
      if (warmupIndex < WARMUP_SEQUENCE.length - 1) {
        setWarmupIndex((prev) => prev + 1);
        setDrillTimeLeft(30);
        setIsDrillTimerRunning(true);
      } else {
        // Completed all 10 warm-up movements (5 minutes total)
        playTimerBeep('finish');
        speakCoachVoice(`Warm-up complete! Commencing main workout: ${template.name}`, voiceEnabled);
        setCurrentPhase('main');
        setCurrentExIndex(0);
        setCurrentSet(1);
      }
    } else if (currentPhase === 'cooldown') {
      if (cooldownIndex < COOLDOWN_SEQUENCE.length - 1) {
        setCooldownIndex((prev) => prev + 1);
        setDrillTimeLeft(30);
        setIsDrillTimerRunning(true);
      } else {
        // Completed all 10 cool-down movements (5 minutes total)
        finishEntireSession();
      }
    }
  };

  const handlePrevDrill = () => {
    if (currentPhase === 'warmup') {
      if (warmupIndex > 0) {
        setWarmupIndex((prev) => prev - 1);
        setDrillTimeLeft(30);
        setIsDrillTimerRunning(true);
      }
    } else if (currentPhase === 'cooldown') {
      if (cooldownIndex > 0) {
        setCooldownIndex((prev) => prev - 1);
        setDrillTimeLeft(30);
        setIsDrillTimerRunning(true);
      }
    }
  };

  const handleSkipWarmup = () => {
    speakCoachVoice(`Warm-up bypassed. Commencing main workout: ${template.name}`, voiceEnabled);
    setCurrentPhase('main');
    setCurrentExIndex(0);
    setCurrentSet(1);
  };

  const handleSkipCooldown = () => {
    finishEntireSession();
  };

  const handleSetCompletion = (feedback?: 'easy' | 'perfect' | 'hard') => {
    // 1. Record completed set with load, reps, and DRS (duration in seconds & drop-set status)
    const newSetRecord: ExerciseSessionSet = {
      setNumber: currentSet,
      exerciseId: effectiveExercise.id,
      exerciseName: effectiveExercise.name,
      weightKg: currentSetWeight,
      reps: currentSetReps,
      durationSec: currentSetTutSec,
      isDropSet: isDropSetToggle,
      completed: true,
      timestamp: Date.now()
    };

    setSessionLoggedSets((prev) => [...prev, newSetRecord]);
    setIsSetStopwatchRunning(false);

    // Haptic vibration feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(45); } catch {}
    }

    if (feedback) {
      applyProgressionFeedback(feedback);
    }

    if (voiceEnabled) {
      const dropLabel = isDropSetToggle ? 'Drop set logged!' : 'Set logged!';
      speakCoachVoice(`${dropLabel} ${currentSetReps} reps at ${currentSetWeight} kilos, ${currentSetTutSec} seconds duration.`, voiceEnabled);
    }

    // Reset drop set toggle for subsequent set
    setIsDropSetToggle(false);

    const totalSets = effectiveExercise.defaultSets || 3;
    if (currentSet < totalSets) {
      // Trigger rest period between sets
      setIsResting(true);
      setRestTimeLeft(45);
      setTotalRestGiven(45);
    } else {
      // Completed all sets for this exercise, rest before next exercise
      if (currentExIndex < template.exercises.length - 1) {
        setIsResting(true);
        setRestTimeLeft(60);
        setTotalRestGiven(60);
      } else {
        // Completed all main exercises -> automatically transition into 5-minute cool-down!
        playTimerBeep('finish');
        speakCoachVoice('Main workout complete! Starting restorative 5-minute cool-down sequence.', voiceEnabled);
        setCurrentPhase('cooldown');
        setCooldownIndex(0);
        setDrillTimeLeft(30);
        setIsDrillTimerRunning(true);
      }
    }
  };

  const handleDeleteLoggedSet = (timestamp?: number) => {
    if (!timestamp) return;
    setSessionLoggedSets((prev) => prev.filter((s) => s.timestamp !== timestamp));
  };

  const endRestAndProceed = () => {
    setIsResting(false);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([60, 40, 60]); } catch {}
    }
    const totalSets = effectiveExercise.defaultSets || 3;
    if (currentSet < totalSets) {
      setCurrentSet((s) => s + 1);
      // Reset TUT for next set
      setCurrentSetTutSec(effectiveExercise.defaultDurationSec || 30);
      if (effectiveExercise.defaultDurationSec) {
        setExerciseTimeLeft(effectiveExercise.defaultDurationSec);
        setIsTimerRunning(true);
      }
    } else {
      advanceToNextExercise();
    }
  };

  const handlePrevExercise = () => {
    if (currentExIndex > 0) {
      setCurrentExIndex((prev) => prev - 1);
      setCurrentSet(1);
    }
  };

  const advanceToNextExercise = (feedback?: 'easy' | 'perfect' | 'hard') => {
    if (feedback) {
      applyProgressionFeedback(feedback);
    }

    if (currentExIndex < template.exercises.length - 1) {
      setCurrentExIndex((prev) => prev + 1);
    } else {
      // Completed all main exercises -> start cool-down!
      playTimerBeep('finish');
      speakCoachVoice('Main workout complete! Starting restorative 5-minute cool-down sequence.', voiceEnabled);
      setCurrentPhase('cooldown');
      setCooldownIndex(0);
      setDrillTimeLeft(30);
      setIsDrillTimerRunning(true);
    }
  };

  // Hands-free keyboard controls for training sessions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName || '')) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (currentPhase === 'warmup' || currentPhase === 'cooldown') {
          setIsDrillTimerRunning((prev) => !prev);
        } else if (isResting) {
          endRestAndProceed();
        } else if (effectiveExercise.defaultDurationSec) {
          setIsTimerRunning((prev) => !prev);
        } else {
          setIsSetStopwatchRunning((prev) => !prev);
        }
      } else if (e.code === 'KeyN' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentPhase === 'warmup' || currentPhase === 'cooldown') {
          handleNextDrill();
        } else if (isResting) {
          endRestAndProceed();
        } else {
          handleSetCompletion();
        }
      } else if (e.code === 'KeyP' || e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentPhase === 'warmup' || currentPhase === 'cooldown') {
          handlePrevDrill();
        } else {
          handlePrevExercise();
        }
      } else if (e.code === 'KeyR' && isResting) {
        e.preventDefault();
        setRestTimeLeft((r) => r + 30);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setVoiceEnabled((v) => !v);
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (isResting) {
          endRestAndProceed();
        } else if (currentPhase === 'main') {
          handleSetCompletion();
        } else {
          handleNextDrill();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhase, isResting, isDrillTimerRunning, isTimerRunning, isSetStopwatchRunning, effectiveExercise, warmupIndex, cooldownIndex, currentExIndex, currentSet, currentSetWeight, currentSetReps, currentSetTutSec, isDropSetToggle]);

  const applyProgressionFeedback = (feedback: 'easy' | 'perfect' | 'hard') => {
    if (effectiveExercise.category === 'dumbbell') {
      const dbConfig = {
        handleWeightKg: userProfile.dumbbellHandleWeightKg || 2,
        availablePlateDenominations: userProfile.availableDumbbellPlateDenoms || [2.5, 2.0, 1.5],
        maxPlatesPerSleeve: userProfile.maxPlatesPerSleeve || 5
      };
      const achievableMap = generateAllAchievableDumbbellLoads(dbConfig);
      const achievableWeights = Array.from(achievableMap.keys()).sort((a, b) => a - b);
      const current = userProfile.maxDumbbellWeightKg;
      const currentIdx = achievableWeights.findIndex((w) => w === current);

      let nextIdx = currentIdx !== -1 ? currentIdx : 0;
      if (feedback === 'easy') {
        nextIdx = Math.min(achievableWeights.length - 1, nextIdx + 1);
      } else if (feedback === 'hard') {
        nextIdx = Math.max(0, nextIdx - 1);
      }

      const updated = achievableWeights[nextIdx];
      onUpdateProfile({ ...userProfile, maxDumbbellWeightKg: updated });
      setCurrentSetWeight(updated);
      if (voiceEnabled && updated !== current) {
        speakCoachVoice(`Dumbbell load adjusted to ${updated} kilograms`, voiceEnabled);
      }
    } else if (effectiveExercise.category === 'barbell') {
      const current = userProfile.maxBarbellWeightKg;
      const minBarWeight = userProfile.barbellBarWeightKg || 8;
      const delta = feedback === 'easy' ? 2.0 : feedback === 'hard' ? -2.0 : 0;
      const updated = Math.max(minBarWeight, Math.round((current + delta) * 10) / 10);
      onUpdateProfile({ ...userProfile, maxBarbellWeightKg: updated });
      setCurrentSetWeight(updated);
      if (voiceEnabled && delta !== 0) {
        speakCoachVoice(`Bedroom barbell target adjusted to ${updated} kilograms`, voiceEnabled);
      }
    }
  };

  const finishEntireSession = () => {
    playTimerBeep('finish');
    speakCoachVoice('Workout complete! 5-minute warm-up, main routine, and 5-minute cool-down completed with exceptional form.', voiceEnabled);

    const totalRepsLogged = sessionLoggedSets.reduce((sum, s) => sum + s.reps, 0);
    const totalTutSec = sessionLoggedSets.reduce((sum, s) => sum + s.durationSec, 0);
    const dropSetsCount = sessionLoggedSets.filter((s) => s.isDropSet).length;

    const summary: CompletedWorkoutSummary = {
      templateName: template.name,
      durationSec: sessionSeconds,
      exercisesCompleted: template.exercises.length + WARMUP_SEQUENCE.length + COOLDOWN_SEQUENCE.length,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ratingFeedback: `${sessionLoggedSets.length} sets logged (${totalRepsLogged} total reps, ${Math.round(totalTutSec / 60)}m DRS TUT${dropSetsCount > 0 ? `, ${dropSetsCount} drop sets` : ''}). Zero joint pain.`,
      loggedSets: sessionLoggedSets,
      totalRepsLogged,
      totalTutSec
    };

    onFinishWorkout(summary);
  };

  // Instant substitution handler for joint comfort
  const handleSwapExercise = (altId: string) => {
    setExerciseOverrides((prev) => ({
      ...prev,
      [activeExercise.id]: altId
    }));
    speakCoachVoice('Substituted for joint comfort and wrist preservation.', voiceEnabled);
  };

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Active item for warm-up and cool-down views
  const activeDrill = currentPhase === 'warmup'
    ? WARMUP_SEQUENCE[warmupIndex]
    : COOLDOWN_SEQUENCE[cooldownIndex];

  // Overall progress percentage across all 3 phases
  const totalPhaseSteps = WARMUP_SEQUENCE.length + template.exercises.length + COOLDOWN_SEQUENCE.length;
  const currentStepProgress = currentPhase === 'warmup'
    ? warmupIndex + 1
    : currentPhase === 'main'
    ? WARMUP_SEQUENCE.length + currentExIndex + 1
    : WARMUP_SEQUENCE.length + template.exercises.length + cooldownIndex + 1;
  const overallProgressPercent = Math.min(100, Math.round((currentStepProgress / totalPhaseSteps) * 100));

  const mainTotalSets = effectiveExercise.defaultSets || 3;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-20">
      {/* 3-PHASE PROGRESSION HEADER */}
      <div className="bg-[#12141c] border border-white/10 rounded-2xl p-4 shadow-lg space-y-3">
        {/* Phase Badges & Session Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Phase 1: Warm-up (5:00) */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                currentPhase === 'warmup'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              <Flame size={13} className={currentPhase === 'warmup' ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
              <span>1. Warm-Up (5:00)</span>
              {currentPhase === 'warmup' && (
                <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.2 rounded text-white ml-0.5">
                  {warmupIndex + 1}/10
                </span>
              )}
              {currentPhase !== 'warmup' && (
                <Check size={11} className="text-emerald-400 stroke-[3]" />
              )}
            </div>

            <ChevronRight size={14} className="text-slate-600 shrink-0" />

            {/* Phase 2: Main Routine */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                currentPhase === 'main'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : currentPhase === 'cooldown'
                  ? 'bg-white/5 text-slate-400'
                  : 'bg-white/5 text-slate-500'
              }`}
            >
              <TrendingUp size={13} className={currentPhase === 'main' ? 'text-cyan-400 animate-pulse' : 'text-slate-500'} />
              <span>2. Main Workout</span>
              {currentPhase === 'main' && (
                <span className="text-[10px] bg-cyan-500/30 px-1.5 py-0.2 rounded text-white ml-0.5">
                  {currentExIndex + 1}/{template.exercises.length}
                </span>
              )}
              {currentPhase === 'cooldown' && (
                <Check size={11} className="text-emerald-400 stroke-[3]" />
              )}
            </div>

            <ChevronRight size={14} className="text-slate-600 shrink-0" />

            {/* Phase 3: Cool-Down (5:00) */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                currentPhase === 'cooldown'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-500'
              }`}
            >
              <HeartHandshake size={13} className={currentPhase === 'cooldown' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
              <span>3. Cool-Down (5:00)</span>
              {currentPhase === 'cooldown' && (
                <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.2 rounded text-white ml-0.5">
                  {cooldownIndex + 1}/10
                </span>
              )}
            </div>
          </div>

          {/* Voice Coach Toggle, AI Coach & Elapsed Session Time */}
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setShowAIChatModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Open In-Activity AI Coach for form, joint safety, or weight math"
            >
              <Bot size={14} className="text-emerald-400" />
              <span>AI Coach</span>
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                voiceEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-500 border-white/5'
              }`}
              title={voiceEnabled ? 'Audio Coach Muted' : 'Enable Audio Coach'}
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <div className="text-xs font-mono tabular-nums text-slate-300">
              Total: <span className="text-white font-bold">{formatMinSec(sessionSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              {currentPhase === 'warmup' && `Warm-Up Movement ${warmupIndex + 1} of 10 (30s each · 5:00 total)`}
              {currentPhase === 'main' && `Main Exercise ${currentExIndex + 1} of ${template.exercises.length} · Set ${currentSet}/${mainTotalSets}`}
              {currentPhase === 'cooldown' && `Restorative Cool-Down ${cooldownIndex + 1} of 10 (30s each · 5:00 total)`}
            </span>
            <span className="font-bold text-white">{overallProgressPercent}% Complete</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentPhase === 'warmup'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : currentPhase === 'main'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  : 'bg-gradient-to-r from-teal-400 to-emerald-500'
              }`}
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. WARM-UP (5:00) OR 3. COOL-DOWN (5:00) VIEW                   */}
      {/* ============================================================== */}
      {(currentPhase === 'warmup' || currentPhase === 'cooldown') && activeDrill && (
        <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 shadow-xl space-y-5">
          {/* Drill Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                    currentPhase === 'warmup'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {currentPhase === 'warmup'
                    ? `Warm-Up Drill ${warmupIndex + 1} of 10`
                    : `Cool-Down Drill ${cooldownIndex + 1} of 10`}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 font-mono">30s Duration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeDrill.name}
              </h2>
            </div>

            {/* Skip Phase Action */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {currentPhase === 'warmup' ? (
                <button
                  onClick={handleSkipWarmup}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-colors border border-white/10 cursor-pointer"
                  title="Skip 5-min warm-up and start main workout directly"
                >
                  Skip Warm-Up → Main
                </button>
              ) : (
                <button
                  onClick={handleSkipCooldown}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-colors border border-white/10 cursor-pointer"
                  title="Skip remaining cool-down and finish session"
                >
                  Skip to Finish →
                </button>
              )}
            </div>
          </div>

          {/* Large 30-Second Countdown Dial & Controls */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Circular Timer Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="58" stroke="#1f2430" strokeWidth="8" fill="none" />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke={currentPhase === 'warmup' ? '#f59e0b' : '#10b981'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * drillTimeLeft) / 30}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-mono font-extrabold text-white tabular-nums">
                  {drillTimeLeft}
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-400">Seconds</span>
              </div>
            </div>

            {/* Timer Playback Buttons */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setIsDrillTimerRunning(!isDrillTimerRunning)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                    isDrillTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  }`}
                >
                  {isDrillTimerRunning ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isDrillTimerRunning ? 'Pause (30s)' : 'Resume'}</span>
                </button>

                <button
                  onClick={() => setDrillTimeLeft(30)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs transition-colors border border-white/10 cursor-pointer"
                  title="Reset 30-second drill timer"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  onClick={() => setDrillTimeLeft((t) => t + 15)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-colors border border-white/10 cursor-pointer"
                  title="Add 15 seconds to drill"
                >
                  +15s
                </button>
              </div>

              {/* Movement Navigator */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={handlePrevDrill}
                  disabled={currentPhase === 'warmup' ? warmupIndex === 0 : cooldownIndex === 0}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs transition-colors border border-white/5 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev Drill</span>
                </button>

                <button
                  onClick={handleNextDrill}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-medium transition-colors border border-white/10 flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {(currentPhase === 'warmup' && warmupIndex === WARMUP_SEQUENCE.length - 1)
                      ? 'Start Main Workout →'
                      : (currentPhase === 'cooldown' && cooldownIndex === COOLDOWN_SEQUENCE.length - 1)
                      ? 'Finish Workout →'
                      : 'Next Drill (30s) →'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Kinematic Visualizer */}
          <div className="my-2">
            <ExerciseVisualizer exercise={activeDrill} isPlaying={isDrillTimerRunning} userProfile={userProfile} />
          </div>

          {/* Guidance Cards */}
          <div className="space-y-3 pt-1">
            {/* Description */}
            <div className="bg-[#161a24] border border-white/10 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                <Info size={14} className="text-cyan-400" />
                <span>How To Perform (30 Seconds)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeDrill.description}
              </p>
            </div>

            {/* Joint Safety */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1">
                <ShieldAlert size={14} />
                <span>Biomechanical Joint Protection</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeDrill.jointSafetyNotes}
              </p>
            </div>

            {/* Form tips */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
              <span className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Form & Rhythm Cues</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-400">
                {activeDrill.formTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <button
              onClick={onCancelWorkout}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
            >
              Cancel Workout
            </button>

            <button
              onClick={handleNextDrill}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Done Drill (Advance)</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN WORKOUT VIEW                                           */}
      {/* ============================================================== */}
      {currentPhase === 'main' && (
        <>
          {/* REST TIMER POPUP OVERLAY */}
          {isResting && (
            <div className="bg-[#161a26] border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                <Sparkles size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Active Joint Recovery</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Catch Your Breath</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Rotate wrists and practice deep diaphragmatic breathing. Preparing for the next interval.
              </p>

              {/* Large Countdown Circle */}
              <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="#27272a" strokeWidth="8" fill="none" />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * restTimeLeft) / totalRestGiven}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-mono font-bold text-white tabular-nums">{restTimeLeft}</span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Seconds</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setRestTimeLeft((r) => r + 30)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-medium transition-colors border border-white/10 cursor-pointer"
                >
                  +30s Rest
                </button>
                <button
                  onClick={endRestAndProceed}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Skip Rest & Begin Set
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE EXERCISE CARD */}
          {!isResting && (
            <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono capitalize">
                      {effectiveExercise.category}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-emerald-400 font-medium">Set {currentSet} of {mainTotalSets}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {effectiveExercise.name}
                  </h2>
                </div>

                {/* Rep / Time Targets */}
                <div className="bg-black/40 px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-4 text-right">
                  {effectiveExercise.defaultDurationSec ? (
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Time Remaining</div>
                      <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">
                        {exerciseTimeLeft}s
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Target Reps</div>
                      <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                        {effectiveExercise.defaultReps || 10}
                      </div>
                    </div>
                  )}

                  {currentWeight > 0 && (
                    <div className="border-l border-white/10 pl-3">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Load</div>
                      <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
                        {currentWeight} <span className="text-xs font-normal">kg</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Substitution Prompt if wrist sensitivity exists */}
              {(effectiveExercise.wristSafeAlternativeId || effectiveExercise.calisthenicsAlternativeId) &&
                effectiveExercise.id !== effectiveExercise.wristSafeAlternativeId && (
                  <div className="my-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-300">
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>Joint feeling sensitive? Swap to safe regression:</span>
                    </div>
                    <button
                      onClick={() => handleSwapExercise(effectiveExercise.wristSafeAlternativeId || effectiveExercise.calisthenicsAlternativeId!)}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-[11px] shrink-0 transition-colors cursor-pointer"
                    >
                      Swap Safe
                    </button>
                  </div>
                )}

              {/* Kinematic Visualizer */}
              <div className="my-4">
                <ExerciseVisualizer exercise={effectiveExercise} isPlaying={true} userProfile={userProfile} />
              </div>

              {/* AI Biometric Height & Age Tuning Banner */}
              {(() => {
                const tuning = getBiometricTuning(userProfile, effectiveExercise);
                return (
                  <div className="my-3 p-3.5 bg-gradient-to-r from-cyan-950/40 via-emerald-950/20 to-black/50 border border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5 border border-cyan-500/30">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white font-mono">
                            AI Tuned for Your {tuning.heightFormatted} Frame & {tuning.age}y Tendons
                          </span>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {tuning.aiTunedTempo}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {tuning.aiTunedRestSec}s Rest
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          {tuning.currentExerciseSpecificCue}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAIChatModal(true)}
                      className="self-end sm:self-auto px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-[11px] font-mono border border-cyan-500/30 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <Bot size={13} />
                      <span>Ask AI Coach</span>
                    </button>
                  </div>
                );
              })()}

              {/* Barbell Plate Calculator (Bedroom-friendly) */}
              {effectiveExercise.category === 'barbell' && (
                <div className="my-4">
                  <PlateCalculator
                    initialWeight={userProfile.maxBarbellWeightKg}
                    barWeightKg={userProfile.barbellBarWeightKg || 8}
                    onWeightChange={(w) => {
                      onUpdateProfile({ ...userProfile, maxBarbellWeightKg: w });
                      setCurrentSetWeight(w);
                    }}
                    onBarWeightChange={(bw) => onUpdateProfile({ ...userProfile, barbellBarWeightKg: bw })}
                    compact={false}
                  />
                </div>
              )}

              {/* Adjustable Dumbbell Plate Loader (if applicable) */}
              {effectiveExercise.category === 'dumbbell' && (
                <div className="my-4">
                  <DumbbellPlateLoader
                    initialWeight={userProfile.maxDumbbellWeightKg}
                    handleWeightKg={userProfile.dumbbellHandleWeightKg || 2}
                    maxPlatesPerSleeve={userProfile.maxPlatesPerSleeve || 5}
                    availablePlateDenoms={userProfile.availableDumbbellPlateDenoms || [2.5, 2.0, 1.5]}
                    onWeightChange={(w) => {
                      onUpdateProfile({ ...userProfile, maxDumbbellWeightKg: w });
                      setCurrentSetWeight(w);
                    }}
                    compact={false}
                  />
                </div>
              )}

              {/* Exercise Guidance, Mistakes to Avoid, and Joint Protection */}
              <div className="space-y-3 pt-2">
                {/* Detailed Description */}
                <div className="bg-[#161a24] border border-white/10 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                    <Info size={14} className="text-cyan-400" />
                    <span>How To Perform Correctly</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {effectiveExercise.description}
                  </p>
                </div>

                {/* Joint Preservation Note */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1.5">
                    <ShieldAlert size={14} />
                    <span>Joint Preservation & Safety Note</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {effectiveExercise.jointSafetyNotes}
                  </p>
                </div>

                {/* Execution Cues */}
                <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Step-by-Step Form Cues</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {effectiveExercise.formTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Mistakes to Avoid */}
                {effectiveExercise.mistakesToAvoid && effectiveExercise.mistakesToAvoid.length > 0 && (
                  <div className="bg-rose-500/10 rounded-xl p-3.5 border border-rose-500/20">
                    <span className="text-xs font-semibold text-rose-300 block mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-rose-400" />
                      <span>Common Mistakes to Avoid (What NOT To Do)</span>
                    </span>
                    <ul className="space-y-1 text-xs text-rose-200/80">
                      {effectiveExercise.mistakesToAvoid.map((mistake, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0">✕</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ============================================================== */}
              {/* INTERACTIVE DRS & REPS SET LOGGER CONSOLE                      */}
              {/* ============================================================== */}
              <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
                <div className="bg-gradient-to-b from-[#161a26] to-[#0f1118] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                  {/* Console Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Activity size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white tracking-tight font-mono">
                            Set {currentSet} of {mainTotalSets} Logger
                          </span>
                          {effectiveExercise.category === 'barbell' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Bedroom Bar ({userProfile.barbellBarWeightKg || 8}kg)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Track Weight, Reps & DRS (Duration / Drop Sets)
                        </span>
                      </div>
                    </div>

                    {/* Drop Set (DRS) Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsDropSetToggle(!isDropSetToggle)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isDropSetToggle
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 animate-pulse'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      <Flame size={14} className={isDropSetToggle ? 'text-black fill-black' : 'text-amber-400'} />
                      <span>{isDropSetToggle ? '🔥 Drop Set (DRS) Active' : '+ Log as Drop Set (DRS)'}</span>
                    </button>
                  </div>

                  {/* 3-Parameter Console: Weight, Reps, DRS (Duration) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. LOAD / WEIGHT */}
                    <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          <Dumbbell size={13} className="text-amber-400" />
                          <span>Weight (kg)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {effectiveExercise.category === 'barbell' ? 'Bar+Plates' : effectiveExercise.category === 'dumbbell' ? 'Per DB' : 'Load'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 my-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentSetWeight((w) => Math.max(0, Math.round((w - 2) * 10) / 10))}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            -2
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentSetWeight((w) => Math.max(0, Math.round((w - 1) * 10) / 10))}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            -1
                          </button>
                        </div>

                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={currentSetWeight}
                            onChange={(e) => setCurrentSetWeight(parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 bg-black/60 border border-white/10 rounded text-center font-mono font-bold text-amber-400 text-lg focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-xs font-mono text-slate-400 ml-1">kg</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentSetWeight((w) => Math.round((w + 1) * 10) / 10)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentSetWeight((w) => Math.round((w + 2) * 10) / 10)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            +2
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 text-center font-mono mt-1">
                        {currentSetWeight === 0 ? 'Bodyweight Only' : `${currentSetWeight}kg target load`}
                      </div>
                    </div>

                    {/* 2. REPS */}
                    <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          <Repeat size={13} className="text-emerald-400" />
                          <span>Reps</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Target: {effectiveExercise.defaultReps || 10}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 my-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentSetReps((r) => Math.max(1, r - 2))}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            -2
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentSetReps((r) => Math.max(1, r - 1))}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            -1
                          </button>
                        </div>

                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={currentSetReps}
                            onChange={(e) => setCurrentSetReps(parseInt(e.target.value) || 1)}
                            className="w-16 px-1.5 py-1 bg-black/60 border border-white/10 rounded text-center font-mono font-bold text-emerald-400 text-lg focus:outline-none focus:border-emerald-400"
                          />
                          <span className="text-xs font-mono text-slate-400 ml-1">reps</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentSetReps((r) => r + 1)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentSetReps((r) => r + 2)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            +2
                          </button>
                        </div>
                      </div>

                      {/* Reps Presets */}
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[6, 8, 10, 12, 15].map((rp) => (
                          <button
                            key={rp}
                            type="button"
                            onClick={() => setCurrentSetReps(rp)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                              currentSetReps === rp
                                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                                : 'text-slate-400 hover:text-white bg-white/5'
                            }`}
                          >
                            {rp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. DRS (DURATION / TUT IN SECONDS) */}
                    <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          <Clock size={13} className="text-cyan-400" />
                          <span>DRS (Duration / TUT)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsSetStopwatchRunning(!isSetStopwatchRunning)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all ${
                            isSetStopwatchRunning
                              ? 'bg-cyan-500 text-black font-bold animate-pulse'
                              : 'bg-white/10 text-cyan-300 hover:bg-white/15'
                          }`}
                          title="Live Time Under Tension stopwatch for this set"
                        >
                          {isSetStopwatchRunning ? <Pause size={10} /> : <Play size={10} />}
                          <span>{isSetStopwatchRunning ? 'Ticking' : 'Live TUT'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 my-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentSetTutSec((s) => Math.max(5, s - 5))}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            -5s
                          </button>
                        </div>

                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            min="5"
                            max="600"
                            value={currentSetTutSec}
                            onChange={(e) => setCurrentSetTutSec(parseInt(e.target.value) || 30)}
                            className="w-16 px-1.5 py-1 bg-black/60 border border-white/10 rounded text-center font-mono font-bold text-cyan-400 text-lg focus:outline-none focus:border-cyan-400"
                          />
                          <span className="text-xs font-mono text-slate-400 ml-1">sec</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentSetTutSec((s) => s + 5)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-mono border border-white/5 cursor-pointer"
                          >
                            +5s
                          </button>
                        </div>
                      </div>

                      {/* Duration Presets */}
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[15, 30, 45, 60].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setCurrentSetTutSec(sec)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                              currentSetTutSec === sec
                                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                                : 'text-slate-400 hover:text-white bg-white/5'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Complete Set & Progression Actions */}
                  <div className="pt-2 space-y-2">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span className="font-medium text-slate-300">
                        Log Set {currentSet} ({currentSetReps} Reps · {currentSetTutSec}s DRS{isDropSetToggle ? ' · Drop Set' : ''}) & Rate Effort:
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        Auto-updates progression
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSetCompletion('easy')}
                        className="py-3 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-center transition-colors group cursor-pointer"
                      >
                        <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">Light Effort</div>
                        <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Log & +2kg Next</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetCompletion('perfect')}
                        className="py-3 px-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-center transition-colors group cursor-pointer"
                      >
                        <div className="text-xs font-bold text-white">Target Hit</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Log & Maintain Load</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetCompletion('hard')}
                        className="py-3 px-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl text-center transition-colors group cursor-pointer"
                      >
                        <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200">Near Limit</div>
                        <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">Log & -2kg Recovery</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* LOGGED SETS TABLE FOR CURRENT EXERCISE                         */}
                {/* ============================================================== */}
                {(() => {
                  const currentExLoggedSets = sessionLoggedSets.filter(
                    (s) => s.exerciseId === effectiveExercise.id
                  );

                  if (currentExLoggedSets.length === 0) return null;

                  const totalRepsCurrent = currentExLoggedSets.reduce((sum, s) => sum + s.reps, 0);
                  const totalTutCurrent = currentExLoggedSets.reduce((sum, s) => sum + s.durationSec, 0);

                  return (
                    <div className="bg-[#12141c] border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                            Logged Sets for {effectiveExercise.name}
                          </h4>
                        </div>
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
                          <span>
                            Total: <strong className="text-emerald-400">{totalRepsCurrent} reps</strong>
                          </span>
                          <span>·</span>
                          <span>
                            DRS TUT: <strong className="text-cyan-400">{totalTutCurrent}s</strong>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {currentExLoggedSets.map((loggedSet, sIdx) => (
                          <div
                            key={loggedSet.timestamp || sIdx}
                            className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[11px]">
                                #{loggedSet.setNumber}
                              </span>

                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-amber-300 font-semibold">{loggedSet.weightKg} kg</span>
                                <span className="text-slate-600">×</span>
                                <span className="text-emerald-300 font-semibold">{loggedSet.reps} reps</span>
                                <span className="text-slate-600">·</span>
                                <span className="text-cyan-300 font-semibold">{loggedSet.durationSec}s DRS</span>
                              </div>

                              {loggedSet.isDropSet && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <Flame size={10} className="fill-amber-300" />
                                  <span>Drop Set</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                                <Check size={12} className="stroke-[3]" />
                                <span>Complete</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteLoggedSet(loggedSet.timestamp)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Remove this logged set"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom Navigation Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={onCancelWorkout}
                    className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
                  >
                    Cancel Session
                  </button>

                  <button
                    onClick={() => advanceToNextExercise()}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>
                      {currentExIndex < template.exercises.length - 1
                        ? 'Skip Exercise'
                        : 'Proceed to Cool-Down (5:00) →'}
                    </span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Discreet Keyboard Shortcuts Hint */}
      <div className="hidden md:flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500 pt-3">
        <span>Space: Pause / Resume</span>
        <span aria-hidden="true">·</span>
        <span>Enter: Log Set / Advance</span>
        <span aria-hidden="true">·</span>
        <span>N / P: Next / Prev</span>
        <span aria-hidden="true">·</span>
        <span>R: +30s Rest</span>
        <span aria-hidden="true">·</span>
        <span>M: Coach Voice</span>
      </div>

      {/* In-Activity Floating AI Coach Quick Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowAIChatModal(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-2xl shadow-emerald-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 border-emerald-300"
          title="Ask In-Activity AI Coach"
        >
          <Bot size={17} />
          <span>Ask Coach</span>
        </button>
      </div>

      {/* In-Workout AI Chat Modal */}
      <InWorkoutAIChat
        isOpen={showAIChatModal}
        onClose={() => setShowAIChatModal(false)}
        activeExercise={effectiveExercise}
        userProfile={userProfile}
        currentWeightKg={currentWeight}
        onSwapExercise={handleSwapExercise}
      />
    </div>
  );
};
