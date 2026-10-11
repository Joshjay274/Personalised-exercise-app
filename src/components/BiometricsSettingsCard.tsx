import React, { useState } from 'react';
import {
  User,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Scale,
  Ruler,
  Calendar,
  Layers,
  CheckCircle2,
  Bot,
  RotateCcw
} from 'lucide-react';
import { UserProfile } from '../types';

interface BiometricsSettingsCardProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onConsultAICoach?: (question: string) => void;
  onResetBaselineAndPhase?: () => void;
}

export const BiometricsSettingsCard: React.FC<BiometricsSettingsCardProps> = ({
  userProfile,
  onUpdateProfile,
  onConsultAICoach,
  onResetBaselineAndPhase
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true); // Pull-down menu open state
  const [saveFeedback, setSaveFeedback] = useState<string>('');

  const heightCm = userProfile.heightCm || 175;
  const age = userProfile.age || 24;
  const weightKg = userProfile.weightKg || 70;
  const leverType = userProfile.limbLeverType || (heightCm >= 180 ? 'long_levers' : heightCm <= 168 ? 'short_compact' : 'balanced');

  // Feet & inches formatting helper
  const formatHeightFeet = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  // Generate height options from 145cm to 210cm
  const heightOptions: number[] = [];
  for (let h = 145; h <= 210; h += 1) {
    heightOptions.push(h);
  }

  // Generate age options from 14 to 80
  const ageOptions: number[] = [];
  for (let a = 14; a <= 80; a += 1) {
    ageOptions.push(a);
  }

  // Generate weight options from 45kg to 140kg
  const weightOptions: number[] = [];
  for (let w = 45; w <= 140; w += 1) {
    weightOptions.push(w);
  }

  const handleHeightChange = (newHeight: number) => {
    const autoLever = newHeight >= 180 ? 'long_levers' : newHeight <= 168 ? 'short_compact' : 'balanced';
    const updated: UserProfile = {
      ...userProfile,
      heightCm: newHeight,
      limbLeverType: autoLever
    };
    onUpdateProfile(updated);
    showSaved(`AI tuned for ${newHeight}cm (${formatHeightFeet(newHeight)})`);
  };

  const handleAgeChange = (newAge: number) => {
    const updated: UserProfile = {
      ...userProfile,
      age: newAge
    };
    onUpdateProfile(updated);
    showSaved(`AI tuned for age ${newAge}`);
  };

  const handleWeightChange = (newWeight: number) => {
    const updated: UserProfile = {
      ...userProfile,
      weightKg: newWeight
    };
    onUpdateProfile(updated);
    showSaved(`Weight set to ${newWeight}kg`);
  };

  const handleLeverChange = (newLever: 'short_compact' | 'balanced' | 'long_levers') => {
    const updated: UserProfile = {
      ...userProfile,
      limbLeverType: newLever
    };
    onUpdateProfile(updated);
    showSaved(`Lever mechanics set to ${newLever.replace('_', ' ')}`);
  };

  const showSaved = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(''), 3000);
  };

  // AI Biomechanical Calculations
  const isTall = heightCm >= 178;
  const isCompact = heightCm <= 168;

  const squatStanceTuning = isTall
    ? '1.25× shoulder width with 30° toe flare to accommodate long femurs without spinal flexion'
    : isCompact
    ? '1.0× shoulder width with 15° toe flare (compact lever efficiency minimizes patellar shear)'
    : '1.1× shoulder width with 20° toe flare for standard mechanical alignment';

  const pushupAngleTuning = isTall
    ? 'Elevate incline angle to 45° or use neutral pushup handles to reduce high carpometacarpal wrist torque'
    : isCompact
    ? 'Floor neutral-grip pushups with tucked 45° elbows for high pec tension'
    : 'Standard 45° wall/incline pushups with locked neutral wrist alignment';

  const calisthenicsLeverTuning = isTall
    ? 'Longer body levers increase rotational core torque; tuck knees 15° on hollow body holds to spare lumbar'
    : isCompact
    ? 'High mechanical leverage allows extended 35–45s isometric hollow body and plank holds'
    : 'Balanced core moment arm; 30s hollow tuck progression recommended';

  const ageTendonPacing = age < 25
    ? `Age ${age}: High tendon elasticity. Focus on strict 3-second controlled eccentrics to prevent impulsive weight jumps.`
    : age <= 39
    ? `Age ${age}: Standard synovial fluid secretion. Mandatory 30-second wrist tendon glides before dumbbell loading.`
    : `Age ${age}: Tendon stiffness defense active. Maintain 4–6 week adaptation phases before micro-loading. Zero hyperextension.`;

  return (
    <div className="bg-[#12141c] border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Pull-Down Header / Accordion Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 cursor-pointer select-none border-b border-white/5 pb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Basic Information & AI Exercise Tuning</h3>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                AI Calibrated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pull down to customize your height, age, and lever mechanics to auto-tune exercises.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveFeedback && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 hidden sm:inline animate-pulse">
              ✓ {saveFeedback}
            </span>
          )}
          <button className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Pull-Down Dropdown Menu Content */}
      {isOpen && (
        <div className="space-y-5 animate-fadeIn">
          {/* Quick Summary Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Height</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {heightCm} cm <span className="text-xs text-slate-400">({formatHeightFeet(heightCm)})</span>
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Age</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {age} <span className="text-xs text-slate-400">Years</span>
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Body Weight</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {weightKg} kg <span className="text-xs text-slate-400">({Math.round(weightKg * 2.20462)} lbs)</span>
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Lever Architecture</span>
              <span className="font-mono font-bold text-purple-400 text-sm capitalize">
                {leverType === 'long_levers' ? 'Long Levers' : leverType === 'short_compact' ? 'Compact' : 'Balanced'}
              </span>
            </div>
          </div>

          {/* Form Pull-Down Menus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Height Pull-Down Menu */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Ruler size={14} className="text-emerald-400" />
                  <span>Height (Pull-Down Select)</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {heightCm} cm ({formatHeightFeet(heightCm)})
                </span>
              </label>
              <select
                value={heightCm}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                {heightOptions.map((h) => (
                  <option key={h} value={h} className="bg-[#12141c] text-white">
                    {h} cm ({formatHeightFeet(h)}) {h === 175 ? '· Average' : h >= 185 ? '· Tall' : ''}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block">
                The AI uses your height to calculate squat stance width and moment arm torque.
              </span>
            </div>

            {/* Age Pull-Down Menu */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-400" />
                  <span>Age (Pull-Down Select)</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {age} Years Old
                </span>
              </label>
              <select
                value={age}
                onChange={(e) => handleAgeChange(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                {ageOptions.map((a) => (
                  <option key={a} value={a} className="bg-[#12141c] text-white">
                    {a} years old {a === 24 ? '· Peak tendon capacity' : a >= 40 ? '· Joint protection active' : ''}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block">
                The AI tunes tendon recovery time, synovial warm-up length, and eccentric tempos.
              </span>
            </div>

            {/* Weight Pull-Down Menu */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Scale size={14} className="text-cyan-400" />
                  <span>Body Weight (Pull-Down Select)</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)
                </span>
              </label>
              <select
                value={weightKg}
                onChange={(e) => handleWeightChange(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                {weightOptions.map((w) => (
                  <option key={w} value={w} className="bg-[#12141c] text-white">
                    {w} kg ({Math.round(w * 2.20462)} lbs)
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block">
                Used to calibrate bodyweight percentage on pushups, planks, and rows.
              </span>
            </div>

            {/* Limb / Lever Architecture Pull-Down Menu */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-purple-400" />
                  <span>Limb Lever Architecture</span>
                </span>
                <span className="font-mono text-purple-400 font-bold capitalize">
                  {leverType.replace('_', ' ')}
                </span>
              </label>
              <select
                value={leverType}
                onChange={(e) => handleLeverChange(e.target.value as any)}
                className="w-full bg-black/50 border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                <option value="balanced" className="bg-[#12141c] text-white">
                  Balanced Proportions (Standard femur and arm ratio)
                </option>
                <option value="long_levers" className="bg-[#12141c] text-white">
                  Longer Limbs / Long Femurs (Wider squats & elevated pushup angles)
                </option>
                <option value="short_compact" className="bg-[#12141c] text-white">
                  Compact / Shorter Limbs (High calisthenics leverage advantage)
                </option>
              </select>
              <span className="text-[10px] text-slate-500 block">
                Calibrates biomechanical angles to prevent lumbar flexion and wrist shear.
              </span>
            </div>
          </div>

          {/* AI BIOMECHANICAL TUNING BLUEPRINT (Live Updated for their Height & Age) */}
          <div className="bg-[#0b0d13] border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  AI Biomechanical Blueprint (Tuned for {heightCm}cm · {age} yrs)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Calibration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Squat Stance Tuning */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Squat Stance & Knee Track</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {squatStanceTuning}
                </p>
              </div>

              {/* Pushup Angle & Wrist Armor Tuning */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck size={13} className="text-cyan-400" />
                  <span>Pushup Angle & Wrist Shield</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {pushupAngleTuning}
                </p>
              </div>

              {/* Calisthenics Core Lever Tuning */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                  <Zap size={13} className="text-amber-400" />
                  <span>Calisthenics Moment Arm</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {calisthenicsLeverTuning}
                </p>
              </div>

              {/* Age Tendon Pacing Tuning */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                  <Bot size={13} className="text-purple-400" />
                  <span>Age & Tendon Remodeling</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {ageTendonPacing}
                </p>
              </div>
            </div>

            {/* Quick Ask AI Coach Consultation */}
            {onConsultAICoach && (
              <div className="pt-1">
                <button
                  onClick={() =>
                    onConsultAICoach(
                      `Dr. Marcus, please calibrate my exercise form and angles for my height (${heightCm}cm) and age (${age} years) with ${leverType.replace('_', ' ')}.`
                    )
                  }
                  className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Ask AI Coach: Review My Height & Age Biomechanics</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset Exercises, Baseline & Phase to Zero */}
          {onResetBaselineAndPhase && (
            <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-red-400" />
                  <span>Reset Exercise, Baseline & Remodeling Phase to Zero</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Initializes your training progress back to Week 0 Baseline (0 completed sessions, 0 days streak, Phase 1 start).
                </p>
              </div>
              <button
                type="button"
                onClick={onResetBaselineAndPhase}
                className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-medium transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset to Week 0 Baseline</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
