export type NavTab = 'dashboard' | 'workout' | 'templates' | 'weights' | 'stats' | 'ai-chat' | 'profile' | 'equipment';

export type BodyTarget = 'wrists' | 'ankles' | 'knees' | 'core' | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs';

export type ExerciseCategory = 'calisthenics' | 'barbell' | 'dumbbell' | 'joint_health' | 'warmup' | 'cooldown';

export type SplitType =
  | 'PPL_Push'
  | 'PPL_Pull'
  | 'PPL_Legs'
  | 'Hybrid_FullBody'
  | 'Joint_Core_Focus'
  | 'Upper_Push'
  | 'Lower_Legs'
  | 'Upper_Pull'
  | 'Full_Hybrid';

export interface WeeklyRoutineDay {
  dayId: string;
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dayShort: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dayNumber: number; // 1 = Mon ... 7 = Sun
  isWorkoutDay: boolean;
  splitLabel: string;
  routineType: string;
  targetMuscles: string;
  jointFocusNote: string;
  estimatedMinutes: number;
  templateId?: string;
  exercises: string[];
}

export interface RoutinePreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  focus: string;
  days: WeeklyRoutineDay[];
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  target: BodyTarget[];
  equipmentNeeded: string[];
  description: string;
  jointSafetyNotes: string;
  formTips: string[];
  mistakesToAvoid: string[];
  defaultDurationSec?: number;
  defaultReps?: number;
  defaultSets?: number;
  svgAnimationType:
    | 'pushup'
    | 'squat'
    | 'plank'
    | 'curl'
    | 'wrist_circle'
    | 'ankle_rotation'
    | 'floor_press'
    | 'dead_bug'
    | 'row'
    | 'overhead_press'
    | 'calf_raise'
    | 'glute_bridge';
  calisthenicsAlternativeId?: string;
  wristSafeAlternativeId?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  splitType: SplitType;
  exercises: string[]; // Exercise IDs
  estimatedMinutes: number;
  jointFocus: BodyTarget[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface UserProfile {
  name: string;
  email?: string;
  heightCm: number;
  weightKg: number;
  age?: number; // Athlete age for joint/tendon elasticity calibration
  limbLeverType?: 'short_compact' | 'balanced' | 'long_levers'; // Lever mechanics for squats and calisthenics
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxPushups: number;
  maxDumbbellWeightKg: number;
  maxBarbellWeightKg: number;
  barbellBarWeightKg?: number; // Bedroom barbell bar weight (default 8kg, e.g. 6kg, 8kg, 10kg standard bars vs 20kg Olympic)
  workoutEnvironment?: 'bedroom' | 'gym'; // Bedroom setup with light barbell and compact adjustable dumbbells
  dumbbellHandleWeightKg: number;
  maxPlatesPerSleeve: number;
  availableDumbbellPlateDenoms: number[];
  workoutsPerWeek: number;
  spotifyConnected: boolean;
  spotifyPlaylistUrl: string;
  notificationsEnabled: boolean;
  notificationTime: string;
  availableEquipment: string[];
  jointPainAreas: BodyTarget[];
  voiceCoachEnabled: boolean;
  completedWorkoutsCount: number;
  currentStreakDays: number;
  activeRoutinePresetId?: string;
  lastWorkoutDate?: string;
  cloudSyncConnected?: boolean;
  cloudSyncEmail?: string;
  lastSyncTimestamp?: string;
  syncDeviceToken?: string;
  tendonAdaptationWeeks?: number; // Current week in 6-week joint/ligament remodeling cycle
  connectiveTissueReadiness?: number; // 0-100% readiness score for increasing weight
  adaptationPhaseTitle?: string;
  adaptationGuidance?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ExerciseSessionSet {
  setNumber: number;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  durationSec: number; // DRS (duration / time-under-tension in seconds)
  isDropSet?: boolean; // DRS (drop set indicator)
  completed: boolean;
  timestamp?: number;
}

export interface CompletedWorkoutSummary {
  templateName: string;
  durationSec: number;
  exercisesCompleted: number;
  date: string;
  ratingFeedback: string;
  loggedSets?: ExerciseSessionSet[];
  totalRepsLogged?: number;
  totalTutSec?: number;
}

export interface StrengthHistoryEntry {
  id: string;
  date: string;
  displayDate: string;
  timestamp: number;
  maxDumbbellWeightKg: number;
  maxBarbellWeightKg: number;
  workoutName?: string;
  note?: string;
  exercisesPerformed?: string[];
  thresholdCrossed?: string;
  isThresholdUpdate?: boolean;
}

export interface AICoachPersona {
  id: string;
  name: string;
  title: string;
  badge: string;
  avatarIcon: 'shield' | 'zap' | 'dumbbell' | 'heart' | 'sparkles' | 'flame' | 'brain';
  specialty: string;
  description: string;
  tone?: string;
  systemRules?: string;
  isCustom?: boolean;
}

export interface GeneratedAIWorkout {
  id: string;
  name: string;
  splitType: SplitType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  jointFocus: BodyTarget[];
  exercises: string[];
  rationale: string;
  coachingCues?: string[];
}
