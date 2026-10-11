import React from 'react';
import {
  TrendingUp,
  Award,
  Flame,
  Calendar,
  Download,
  Dumbbell,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { UserProfile, StrengthHistoryEntry, NavTab } from '../types';
import { StrengthProgressionChart } from './StrengthProgressionChart';
import { exportStrengthHistoryToCsv } from '../utils/historyStorage';

interface StatisticsPageProps {
  userProfile: UserProfile;
  strengthHistory: StrengthHistoryEntry[];
  onHistoryUpdate: (updated: StrengthHistoryEntry[]) => void;
  onNavigate: (tab: NavTab) => void;
  streakCelebrated?: boolean;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({
  userProfile,
  strengthHistory,
  onHistoryUpdate,
  onNavigate,
  streakCelebrated = false
}) => {
  const [copiedCsv, setCopiedCsv] = React.useState(false);

  const handleExportCsv = () => {
    const success = exportStrengthHistoryToCsv(strengthHistory);
    if (success) {
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2500);
    }
  };

  // Compute summary stats
  const totalCheckpoints = strengthHistory.length;
  const latestEntry = strengthHistory[strengthHistory.length - 1];
  const firstEntry = strengthHistory[0];

  // Calculate delta if multiple checkpoints exist
  const dbGain = firstEntry && latestEntry
    ? Number((latestEntry.maxDumbbellWeightKg - firstEntry.maxDumbbellWeightKg).toFixed(1))
    : 0;
  const bbGain = firstEntry && latestEntry
    ? Number((latestEntry.maxBarbellWeightKg - firstEntry.maxBarbellWeightKg).toFixed(1))
    : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Export CTA */}
      <div className="bg-gradient-to-r from-[#12141c] via-[#151926] to-[#12141c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-emerald-400">Performance Analytics</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Progressive Overload & Joint Health</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Strength Progression & Statistics
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Track your verified load trajectories, bedroom barbell milestones, repetition volume, and joint safety records across all 4-day split cycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white rounded-xl text-xs font-mono transition-colors border border-cyan-500/20 cursor-pointer shadow-sm"
            title="Download your full strength checkpoint log as CSV spreadsheet"
          >
            <Download size={14} className="text-cyan-400" />
            <span>{copiedCsv ? 'Exported!' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => onNavigate('weights')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-medium transition-colors border border-emerald-500/20 cursor-pointer"
          >
            <Dumbbell size={14} className="text-emerald-400" />
            <span>Adjust Weight Settings</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12141c] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Workouts Logged</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 tabular-nums">
              {userProfile.completedWorkoutsCount || 0}
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
            <Award size={12} />
            <span>Target: {userProfile.workoutsPerWeek}x / week</span>
          </span>
        </div>

        <div className={`rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all relative overflow-hidden ${
          streakCelebrated
            ? 'bg-[#151926] border-2 border-amber-400 animate-streak-celebrate shadow-2xl shadow-amber-500/30 ring-2 ring-amber-400/40'
            : 'bg-[#12141c] border border-white/10'
        }`}>
          {streakCelebrated && (
            <div className="absolute top-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-black animate-streak-badge shadow-md">
              VERIFIED!
            </div>
          )}
          <div>
            <span className={`text-[11px] uppercase font-mono block ${streakCelebrated ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>Current Streak</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mt-1 tabular-nums flex items-center gap-1.5">
              <Flame size={24} className={`text-amber-400 ${streakCelebrated ? 'animate-flame-bounce' : userProfile.currentStreakDays > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
              <span className={streakCelebrated ? 'text-amber-300 scale-105 transition-transform' : ''}>{userProfile.currentStreakDays || 0}d</span>
            </div>
          </div>
          <span className={`text-[10px] mt-2 block font-mono ${streakCelebrated ? 'text-amber-200 font-semibold' : 'text-slate-400'}`}>
            {streakCelebrated ? '🔥 Workout completed today!' : userProfile.currentStreakDays > 0 ? 'Active training momentum' : 'Ready for next session'}
          </span>
        </div>

        <div className="bg-[#12141c] border border-cyan-500/20 bg-cyan-950/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-cyan-300 uppercase font-mono block">Dumbbell Working Load</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400 mt-1 tabular-nums">
              {userProfile.maxDumbbellWeightKg} <span className="text-xs text-slate-400">kg</span>
            </div>
          </div>
          <span className="text-[10px] text-cyan-300 mt-2 block font-mono">
            {dbGain > 0 ? `+${dbGain}kg overall gain` : 'Neutral grip standard'}
          </span>
        </div>

        <div className="bg-[#12141c] border border-amber-500/20 bg-amber-950/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-amber-300 uppercase font-mono block">Bedroom Barbell Target</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 mt-1 tabular-nums">
              {userProfile.maxBarbellWeightKg} <span className="text-xs text-slate-400">kg</span>
            </div>
          </div>
          <span className="text-[10px] text-amber-300 mt-2 block font-mono">
            {userProfile.barbellBarWeightKg || 8}kg bar calibrated
          </span>
        </div>
      </div>

      {/* Core Interactive Strength Progression Chart Component */}
      <StrengthProgressionChart
        historyData={strengthHistory}
        currentDumbbellKg={userProfile.maxDumbbellWeightKg}
        currentBarbellKg={userProfile.maxBarbellWeightKg}
        onHistoryUpdate={onHistoryUpdate}
      />

      {/* Joint Health & Overload Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Joint Longevity Score
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your workout prescriptions are filtered through kinematic joint guards. 
            Calisthenics levers and floor pressing eliminate dangerous valgus stress and extreme carpal hyperextension.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg">
              Carpal Wrist Shield: Active
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg">
              Patellar Tracking: Enforced
            </span>
            <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg">
              Neutral Grip Angle: 45°
            </span>
          </div>
        </div>

        <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Zap size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Overload Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Since your barbell is in your bedroom, load progression combines micro-weight adjustments (+1kg to +2.5kg) with Time Under Tension (DRS 30s-45s) and strict eccentric cadences.
          </p>
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Back to Daily Workout</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
