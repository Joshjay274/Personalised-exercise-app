import React, { useState } from 'react';
import {
  Calendar,
  Play,
  Clock,
  ShieldCheck,
  Coffee,
  Sparkles,
  ArrowRight,
  Flame,
  ChevronRight,
  Layers,
  Dumbbell,
  CheckCircle2,
  Info
} from 'lucide-react';
import { WeeklyRoutineDay, WorkoutTemplate, RoutinePreset } from '../types';
import { FOUR_DAY_ROUTINES } from '../data/templates';
import { EXERCISE_DATABASE } from '../data/exercises';
import {
  getLocalDateString,
  isPreCreationDate,
  getDayNumberFromDateString,
  getDateStringForDayNumber
} from '../utils/historyStorage';

interface WeeklyRoutinePlannerProps {
  onStartWorkoutByTemplate: (template: WorkoutTemplate) => void;
  templates: WorkoutTemplate[];
  activeRoutineId?: string;
  onSelectRoutineId?: (routineId: string) => void;
  scheduleDate?: string;
  onSelectScheduleDate?: (dateStr: string) => void;
  lastWorkoutDate?: string;
  selectedDayNumber?: number;
  onSelectDayNumber?: (dayNum: number) => void;
}

export const WeeklyRoutinePlanner: React.FC<WeeklyRoutinePlannerProps> = ({
  onStartWorkoutByTemplate,
  templates,
  activeRoutineId = 'routine_hybrid_armor',
  onSelectRoutineId,
  scheduleDate,
  onSelectScheduleDate,
  lastWorkoutDate,
  selectedDayNumber,
  onSelectDayNumber
}) => {
  // Currently active 4-day routine preset
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(activeRoutineId);

  const currentRoutine: RoutinePreset =
    FOUR_DAY_ROUTINES.find((r) => r.id === selectedRoutineId) || FOUR_DAY_ROUTINES[0];

  const todayDateStr = getLocalDateString();
  const effectiveScheduleDate = scheduleDate && !isPreCreationDate(scheduleDate) ? scheduleDate : todayDateStr;
  const todayDayNumber = getDayNumberFromDateString(todayDateStr);

  const activeDayNum = selectedDayNumber ?? getDayNumberFromDateString(effectiveScheduleDate);
  const [internalDayNumber, setInternalDayNumber] = useState<number>(activeDayNum);
  const currentDayNum = selectedDayNumber !== undefined ? selectedDayNumber : internalDayNumber;

  const selectedDay: WeeklyRoutineDay =
    currentRoutine.days.find((d) => d.dayNumber === currentDayNum) || currentRoutine.days[0];

  const handleDaySelect = (dayNum: number) => {
    setInternalDayNumber(dayNum);
    if (onSelectDayNumber) {
      onSelectDayNumber(dayNum);
    }
    if (onSelectScheduleDate) {
      const targetDateStr = getDateStringForDayNumber(effectiveScheduleDate, dayNum);
      onSelectScheduleDate(targetDateStr);
    }
  };

  const handleSetToToday = () => {
    if (onSelectScheduleDate) {
      onSelectScheduleDate(todayDateStr);
    }
    if (onSelectDayNumber) {
      onSelectDayNumber(todayDayNumber);
    }
    setInternalDayNumber(todayDayNumber);
  };

  const handleSetToLastSession = () => {
    if (lastWorkoutDate && !isPreCreationDate(lastWorkoutDate)) {
      const lastSessionDayNum = getDayNumberFromDateString(lastWorkoutDate);
      if (onSelectScheduleDate) {
        onSelectScheduleDate(lastWorkoutDate);
      }
      if (onSelectDayNumber) {
        onSelectDayNumber(lastSessionDayNum);
      }
      setInternalDayNumber(lastSessionDayNum);
    }
  };

  // Formatted date string for display
  const [ey, em, ed] = effectiveScheduleDate.split('-').map(Number);
  const formattedActiveDate = new Date(ey, em - 1, ed).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isAnchoredToToday = effectiveScheduleDate === todayDateStr;
  const isAnchoredToLastSession = Boolean(
    lastWorkoutDate && !isPreCreationDate(lastWorkoutDate) && effectiveScheduleDate === lastWorkoutDate
  );

  const handleRoutineChange = (routineId: string) => {
    setSelectedRoutineId(routineId);
    if (onSelectRoutineId) {
      onSelectRoutineId(routineId);
    }
  };

  const handleLaunchRoutine = (routineDay: WeeklyRoutineDay) => {
    // Find matching template by templateId or fallback to title matching
    const matchedTemplate =
      templates.find((t) => t.id === routineDay.templateId) ||
      templates.find((t) => t.name.toLowerCase().includes(routineDay.splitLabel.toLowerCase())) ||
      templates[0];

    if (matchedTemplate) {
      onStartWorkoutByTemplate(matchedTemplate);
    }
  };

  return (
    <div className="bg-[#12141c] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              4-Day Weekly Workout Routine
            </h3>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              4 Exercise Days · 3 Recovery Days
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Targeted split for each training day designed with kinematic joint protection, progressive overload, and scheduled recovery days.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-white/5 rounded-xl text-xs font-mono text-slate-300 border border-white/5 flex items-center gap-1.5">
            <Flame size={13} className="text-amber-400" />
            <span>4 Workouts / Week</span>
          </span>
        </div>
      </div>

      {/* Routine Preset Switcher (Different 4-Day Split Styles) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Layers size={13} className="text-emerald-400" />
            <span>Choose Your 4-Day Routine Split Style:</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">
            {currentRoutine.badge}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {FOUR_DAY_ROUTINES.map((routine) => {
            const isSelected = routine.id === currentRoutine.id;
            return (
              <button
                key={routine.id}
                type="button"
                onClick={() => handleRoutineChange(routine.id)}
                className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#1a2333] to-[#121622] border-emerald-400 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                    : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                      isSelected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-300'
                    }`}>
                      {routine.badge}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                    )}
                  </div>
                  <h4 className={`text-xs font-bold leading-snug mt-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {routine.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {routine.tagline}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className={isSelected ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
                    4 Training Splits
                  </span>
                  <span className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                    {isSelected ? 'Active Routine' : 'Select'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Date & Reference Anchor Bar */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Schedule Anchor:</span>
              <span className="text-xs font-bold text-white font-mono">{formattedActiveDate}</span>
              {isAnchoredToToday && (
                <span className="text-[9px] font-mono font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                  Current Date (Today)
                </span>
              )}
              {isAnchoredToLastSession && !isAnchoredToToday && (
                <span className="text-[9px] font-mono font-bold bg-cyan-400 text-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                  Last Session Date
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified local calendar initialization · Automatically defaults to current date or last session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSetToToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer border ${
              isAnchoredToToday
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
            }`}
          >
            Today ({todayDateStr})
          </button>

          {lastWorkoutDate && !isPreCreationDate(lastWorkoutDate) && (
            <button
              type="button"
              onClick={handleSetToLastSession}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer border ${
                isAnchoredToLastSession
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm ring-1 ring-cyan-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
              }`}
            >
              Last Session ({lastWorkoutDate})
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Interactive Day Selector Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400">
            Weekly Schedule (Click Day to Inspect Split):
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Today is <span className="text-emerald-400 font-bold">{currentRoutine.days.find((d) => d.dayNumber === todayDayNumber)?.dayName}</span>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 select-none">
          {currentRoutine.days.map((day) => {
            const isToday = day.dayNumber === todayDayNumber;
            const isSelected = day.dayNumber === currentDayNum;
            const dayDateStr = getDateStringForDayNumber(effectiveScheduleDate, day.dayNumber);
            const dateParts = dayDateStr.split('-');
            const shortDateLabel = `${Number(dateParts[1])}/${Number(dateParts[2])}`;

            // Compute workout day index (W1=Mon, W2=Wed, W3=Thu, W4=Fri)
            const workoutIndex = day.dayNumber === 1 ? 1 : day.dayNumber === 3 ? 2 : day.dayNumber === 4 ? 3 : day.dayNumber === 5 ? 4 : 0;

            return (
              <button
                key={day.dayId}
                type="button"
                onClick={() => handleDaySelect(day.dayNumber)}
                className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all relative border text-center cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1a2333] to-[#12141c] border-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-black/40 border-white/5 hover:border-white/15'
                }`}
              >
                {isToday && (
                  <span className="absolute -top-1.5 right-1/2 translate-x-1/2 px-1.5 py-0.2 bg-emerald-500 text-black font-extrabold text-[8px] sm:text-[9px] rounded-full uppercase tracking-tighter shadow-sm z-10">
                    Today
                  </span>
                )}

                <div className="flex flex-col items-center mt-0.5">
                  <span className={`text-[11px] font-mono uppercase font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {day.dayShort}
                  </span>
                  <span className={`text-[9px] font-mono mt-0.5 leading-none ${isSelected ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                    {shortDateLabel}
                  </span>
                </div>

                {/* Status icon/pill */}
                <div className="my-1.5 flex items-center justify-center">
                  {day.isWorkoutDay ? (
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono ${
                        isSelected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-emerald-400'
                      }`}
                    >
                      W{workoutIndex}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                      <Coffee size={12} />
                    </div>
                  )}
                </div>

                <span
                  className={`text-[9px] sm:text-[10px] truncate max-w-full font-medium ${
                    day.isWorkoutDay ? (isSelected ? 'text-emerald-300' : 'text-slate-300') : 'text-slate-500'
                  }`}
                >
                  {day.isWorkoutDay ? day.routineType : 'Rest'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Routine Detailed Inspector */}
      <div className="bg-gradient-to-br from-[#161a26] to-[#0c0d12] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                {selectedDay.dayName}
              </span>
              <span className="text-slate-600">·</span>
              <span className={`text-xs font-semibold ${selectedDay.isWorkoutDay ? 'text-cyan-400' : 'text-slate-400'}`}>
                {selectedDay.isWorkoutDay ? `Scheduled Workout Split (${selectedDay.routineType})` : 'Active Recovery & Rest Day'}
              </span>
              {selectedDay.dayNumber === todayDayNumber && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  Scheduled for Today
                </span>
              )}
            </div>

            <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {selectedDay.splitLabel}
            </h4>

            <p className="text-xs text-slate-300 mt-1">
              Target Focus: <span className="text-white font-medium">{selectedDay.targetMuscles}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            {selectedDay.estimatedMinutes > 0 && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Est. Duration</span>
                <span className="text-sm font-mono font-bold text-white flex items-center justify-end gap-1">
                  <Clock size={13} className="text-slate-400" />
                  ~{selectedDay.estimatedMinutes} mins
                </span>
              </div>
            )}

            {selectedDay.isWorkoutDay ? (
              <button
                onClick={() => handleLaunchRoutine(selectedDay)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>Start {selectedDay.dayShort} Split</span>
              </button>
            ) : (
              <button
                onClick={() => handleLaunchRoutine(selectedDay)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-xs transition-colors border border-white/10 cursor-pointer"
              >
                <Sparkles size={13} className="text-cyan-400" />
                <span>Start Mobility Session (15m)</span>
              </button>
            )}
          </div>
        </div>

        {/* Biomechanical Joint Preservation Cue */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-300">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-white text-[11px] uppercase font-mono mb-0.5">
              Kinematic Joint Armor Focus:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedDay.jointFocusNote}
            </p>
          </div>
        </div>

        {/* Exercises In This Daily Split */}
        {selectedDay.exercises && selectedDay.exercises.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 block">
                Routine Movement Sequence ({selectedDay.exercises.length} Exercises):
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Click any movement for instructions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedDay.exercises.map((exId: string, idx: number) => {
                const ex = EXERCISE_DATABASE.find((e) => e.id === exId);
                if (!ex) return null;
                return (
                  <div
                    key={`${exId}-${idx}`}
                    className="p-3 bg-black/40 hover:bg-black/60 rounded-xl border border-white/5 flex items-center justify-between gap-2.5 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono text-[10px] text-slate-300 font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-white leading-tight truncate">{ex.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                          {ex.category} · {ex.defaultDurationSec ? `${ex.defaultDurationSec}s timer` : `${ex.defaultSets} sets × ${ex.defaultReps} reps`}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-mono shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                      {ex.target.slice(0, 2).join(' · ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-black/30 rounded-xl border border-white/5 text-center text-xs text-slate-400 space-y-1">
            <Coffee size={20} className="mx-auto text-slate-500 mb-1" />
            <p className="font-medium text-slate-300">Active Rest & Myofascial Recovery Day</p>
            <p className="text-[11px] text-slate-500">
              Zero lifting required. Focus on hydration, muscle protein synthesis, sleep, and restorative walking.
            </p>
          </div>
        )}
      </div>

      {/* 4-Day Periodization Breakdown Blueprint */}
      <div className="p-4 sm:p-5 bg-black/30 rounded-2xl border border-white/5 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
            4-Day Periodization Blueprint ({currentRoutine.name}):
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            4 Days On · 3 Days Recovery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {currentRoutine.days
            .filter((d) => d.isWorkoutDay)
            .map((day, idx) => {
              const colors = [
                'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
                'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
                'text-amber-400 border-amber-500/20 bg-amber-500/5',
                'text-teal-400 border-teal-500/20 bg-teal-500/5'
              ];
              const colorClass = colors[idx % colors.length];

              return (
                <div key={day.dayId} className={`p-3 rounded-xl border ${colorClass}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-[11px]">
                      {day.dayName} (Day {idx === 0 ? 1 : idx === 1 ? 2 : idx === 2 ? 4 : 5})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ~{day.estimatedMinutes}m
                    </span>
                  </div>
                  <div className="text-white font-medium mt-1 truncate">
                    {day.splitLabel.replace(/^Day \d+:\s*/, '')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {day.targetMuscles}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {day.exercises.length} exercises
                    </span>
                    <button
                      onClick={() => handleLaunchRoutine(day)}
                      className="text-[10px] font-semibold text-white hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Start</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
