import { Exercise, UserProfile } from '../types';

export interface ExerciseBiometricTuning {
  heightCm: number;
  heightFormatted: string;
  age: number;
  weightKg: number;
  leverCategory: 'compact' | 'balanced' | 'tall';
  ageCategory: 'youth' | 'prime' | 'veteran';
  squatStanceCue: string;
  pushupCue: string;
  calisthenicsLeverCue: string;
  dumbbellCue: string;
  tendonTempoCue: string;
  recoveryGuidance: string;
  currentExerciseSpecificCue: string;
  aiTunedTempo: string;
  aiTunedRestSec: number;
  summaryHighlights: string[];
}

/**
 * Returns comprehensive AI biomechanical calibration tailored to the athlete's height, age, and levers.
 */
export function getBiometricTuning(
  userProfile?: UserProfile,
  exercise?: Exercise
): ExerciseBiometricTuning {
  const height = userProfile?.heightCm || 175;
  const age = userProfile?.age || 24;
  const weight = userProfile?.weightKg || 70;
  const explicitLimb = userProfile?.limbLeverType;

  // Height / Lever analysis
  let leverCategory: 'compact' | 'balanced' | 'tall' = 'balanced';
  if (explicitLimb === 'long_levers' || (!explicitLimb && height >= 178)) {
    leverCategory = 'tall';
  } else if (explicitLimb === 'short_compact' || (!explicitLimb && height <= 168)) {
    leverCategory = 'compact';
  }

  // Age / Tendon remodeling analysis
  let ageCategory: 'youth' | 'prime' | 'veteran' = 'youth';
  if (age >= 40) {
    ageCategory = 'veteran';
  } else if (age >= 25) {
    ageCategory = 'prime';
  }

  // Formatted height (cm + feet/inches)
  const feet = Math.floor(height / 30.48);
  const inches = Math.round((height / 2.54) % 12);
  const heightFormatted = `${height} cm (${feet}'${inches}")`;

  // Biomechanical Squat Tuning based on femur length
  const squatStanceCue =
    leverCategory === 'tall'
      ? `Wide stance (1.2×–1.3× shoulder width) with 30° toe flare to accommodate long femurs and reduce knee shear.`
      : leverCategory === 'compact'
      ? `Compact stance (1.0× shoulder width) with forward-facing toes; take advantage of short femurs for deep pause depth.`
      : `Balanced stance (1.1× shoulder width) with 15° slight outward flare for optimal hip socket alignment.`;

  // Upper Body Pressing / Pushup Tuning based on arm length & wrist torque
  const pushupCue =
    leverCategory === 'tall'
      ? `Use neutral dumbbell handles or elevated incline (30–45°). Long arm levers generate 35% higher carpal torque on flat ground.`
      : leverCategory === 'compact'
      ? `Standard floor pushups with tight hollow-body core; compact levers grant high power-to-weight ratio.`
      : `Neutral-grip pushups or floor handles with strict 45° arrowhead elbow tuck; avoid 90° T-flaring.`;

  // Calisthenics Core & Lever Tuning based on total body length
  const calisthenicsLeverCue =
    leverCategory === 'tall'
      ? `Tucked levers and bent-knee hollow holds required. Long leg levers multiply lumbar shear; progress conservatively.`
      : leverCategory === 'compact'
      ? `Full hollow body and straight-leg progressions; short levers provide maximum leverage for bodyweight holds.`
      : `Hollow body tuck progressing to single-leg extension with lumbar spine glued flat to the floor.`;

  // Dumbbell & Barbell Bedroom Tuning
  const dumbbellCue =
    leverCategory === 'tall'
      ? `Maintain 45° elbow angle on floor press; avoid over-stretching long humerus bones beyond floor contact.`
      : leverCategory === 'compact'
      ? `Full range floor press with 1-second pause at chest; tight lat engagement.`
      : `Neutral-grip dumbbell floor press with knuckles aligned vertically over forearms.`;

  // Tendon & Age Tempo Tuning
  const tendonTempoCue =
    ageCategory === 'veteran'
      ? `4s ultra-smooth eccentric negative + mandatory 30s wrist tendon warmup; zero bouncing to protect collagen.`
      : ageCategory === 'prime'
      ? `3s eccentric negative + 1s pause at contraction peak; promotes synovial lubrication and carpal health.`
      : `3s controlled negative to build ligament durability before advancing dumbbell load.`;

  const recoveryGuidance =
    ageCategory === 'veteran'
      ? `75–90s rest between sets; allow complete ATP replenishment and tendon cooling.`
      : ageCategory === 'prime'
      ? `60–75s rest between sets; balances hypertrophy stimulus with joint recovery.`
      : `45–60s rest between sets; fast recovery window.`;

  const aiTunedTempo =
    ageCategory === 'veteran' ? '4-1-1 Tempo' : '3-1-1 Tempo';
  const aiTunedRestSec =
    ageCategory === 'veteran' ? 75 : ageCategory === 'prime' ? 60 : 50;

  // Specific exercise tuning
  let currentExerciseSpecificCue = '';
  if (exercise) {
    const exId = exercise.id.toLowerCase();
    const exCat = exercise.category;

    if (exId.includes('squat') || exCat === 'barbell' && exercise.target.includes('legs')) {
      currentExerciseSpecificCue = `${squatStanceCue} Keep knees tracking in line with toes without caving inward.`;
    } else if (exId.includes('pushup') || exId.includes('dip')) {
      currentExerciseSpecificCue = `${pushupCue} Keep elbows tucked at 45° to safeguard the rotator cuffs.`;
    } else if (exId.includes('plank') || exId.includes('hollow') || exId.includes('bug') || exId.includes('tuck')) {
      currentExerciseSpecificCue = `${calisthenicsLeverCue} Press lumbar spine firmly into the ground to protect lower back.`;
    } else if (exId.includes('press') || exId.includes('dumbbell') || exId.includes('curl')) {
      currentExerciseSpecificCue = `${dumbbellCue} Keep wrists stacked straight without hyperextension under load.`;
    } else if (exCat === 'warmup') {
      currentExerciseSpecificCue = `Dynamic joint prep: Focus on slow 360° lubrication. Critical for ${heightFormatted} frame and ${age}y tendons.`;
    } else {
      currentExerciseSpecificCue = `Tuned for ${heightFormatted} athlete: Maintain ${aiTunedTempo} and keep joints strictly stacked.`;
    }
  } else {
    currentExerciseSpecificCue = `Tuned for ${heightFormatted} & ${age} yrs: ${squatStanceCue}`;
  }

  const summaryHighlights = [
    leverCategory === 'tall'
      ? `Height ${heightFormatted}: Calibrated for Long Levers (1.25× Squat Stance, Incline/Neutral Pushups)`
      : leverCategory === 'compact'
      ? `Height ${heightFormatted}: Calibrated for Compact Levers (High Calisthenics Mechanical Power)`
      : `Height ${heightFormatted}: Calibrated for Balanced Levers (Standard 1.1× Stance, Arrowhead Pressing)`,
    ageCategory === 'veteran'
      ? `Age ${age}y: Calibrated for Joint Longevity (4s Smooth Eccentric, 75s Rest, Synovial Warmup)`
      : ageCategory === 'prime'
      ? `Age ${age}y: Calibrated for Active Tendon Armor (3s Eccentric, 60s Rest)`
      : `Age ${age}y: Calibrated for Fast Elastic Remodeling (3s Eccentric Control)`,
    `Equipment & Floor: Tuned for Bedroom Space & 2kg Dumbbells (Max 5 plates/side)`
  ];

  return {
    heightCm: height,
    heightFormatted,
    age,
    weightKg: weight,
    leverCategory,
    ageCategory,
    squatStanceCue,
    pushupCue,
    calisthenicsLeverCue,
    dumbbellCue,
    tendonTempoCue,
    recoveryGuidance,
    currentExerciseSpecificCue,
    aiTunedTempo,
    aiTunedRestSec,
    summaryHighlights
  };
}
