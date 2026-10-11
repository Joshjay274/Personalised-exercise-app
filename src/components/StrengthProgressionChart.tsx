import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Dumbbell,
  Calendar,
  Plus,
  ShieldCheck,
  Check,
  Sparkles,
  Award,
  Zap,
  Activity,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  History
} from 'lucide-react';
import { StrengthHistoryEntry } from '../types';
import {
  saveStrengthCheckpoint,
  exportStrengthHistoryToCsv,
  deleteStrengthHistoryEntry,
  resetStrengthHistory,
  isPreCreationDate,
  getLocalDateString
} from '../utils/historyStorage';
import { EXERCISE_DATABASE } from '../data/exercises';

interface StrengthProgressionChartProps {
  historyData: StrengthHistoryEntry[];
  currentDumbbellKg: number;
  currentBarbellKg: number;
  onHistoryUpdate: (updated: StrengthHistoryEntry[]) => void;
}

export const StrengthProgressionChart: React.FC<StrengthProgressionChartProps> = ({
  historyData,
  currentDumbbellKg,
  currentBarbellKg,
  onHistoryUpdate
}) => {
  const [visibleSeries, setVisibleSeries] = useState<'both' | 'dumbbell' | 'barbell'>('both');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | 'recent5'>('all');
  const [isLoggingModalOpen, setIsLoggingModalOpen] = useState<boolean>(false);
  const [isExportedRecently, setIsExportedRecently] = useState<boolean>(false);
  const [showHistoryList, setShowHistoryList] = useState<boolean>(true);

  const handleDeleteEntry = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" record from progression history?`)) {
      const updated = deleteStrengthHistoryEntry(id);
      onHistoryUpdate(updated);
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all strength history to zero baseline (0kg DB / 0kg BB)? All past test records will be cleared.')) {
      const updated = resetStrengthHistory();
      onHistoryUpdate(updated);
    }
  };

  const handleExportCsv = () => {
    const success = exportStrengthHistoryToCsv(historyData);
    if (success) {
      setIsExportedRecently(true);
      setTimeout(() => setIsExportedRecently(false), 2500);
    }
  };

  // Manual checkpoint state
  const [manualDbKg, setManualDbKg] = useState<number>(currentDumbbellKg);
  const [manualBbKg, setManualBbKg] = useState<number>(currentBarbellKg);
  const [manualNote, setManualNote] = useState<string>('');
  const [manualSelectedExercises, setManualSelectedExercises] = useState<string[]>([
    'Incline Wall Pushups (Wrist-Safe)',
    'Dumbbell Floor Press'
  ]);

  // Ensure history never starts from a day before the app was created (filters out September 18th while preserving genuine sessions)
  const activeHistory = React.useMemo(() => {
    const valid = historyData.filter((d) => {
      if (!d || !d.date) return false;
      if (isPreCreationDate(d.date)) return false;
      if (typeof d.id === 'string' && /^hist_[1-6]$/.test(d.id)) return false;
      return true;
    });
    return valid.length > 0 ? valid : historyData.length > 0 ? historyData : [];
  }, [historyData]);

  // Filter history based on timeRange
  const filteredData = React.useMemo(() => {
    let data = [...activeHistory].sort((a, b) => a.timestamp - b.timestamp);
    if (timeRange === 'recent5') {
      data = data.slice(-5);
    } else if (timeRange === '30d') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      data = data.filter((d) => d.timestamp >= thirtyDaysAgo);
    }
    return data;
  }, [activeHistory, timeRange]);

  // Progression Deltas
  const firstEntry = activeHistory[0];
  const latestEntry = activeHistory[activeHistory.length - 1];

  const dbGain = latestEntry && firstEntry
    ? latestEntry.maxDumbbellWeightKg - firstEntry.maxDumbbellWeightKg
    : 0;
  const bbGain = latestEntry && firstEntry
    ? latestEntry.maxBarbellWeightKg - firstEntry.maxBarbellWeightKg
    : 0;

  const toggleManualExercise = (exName: string) => {
    if (manualSelectedExercises.includes(exName)) {
      setManualSelectedExercises(manualSelectedExercises.filter((e) => e !== exName));
    } else {
      setManualSelectedExercises([...manualSelectedExercises, exName]);
    }
  };

  const handleSaveCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdMsg = `Threshold Update: DB ${manualDbKg}kg / BB ${manualBbKg}kg`;
    const updated = saveStrengthCheckpoint(
      manualDbKg,
      manualBbKg,
      'Manual PR Checkpoint',
      manualNote || 'Progression verified with neutral wrists',
      manualSelectedExercises,
      thresholdMsg
    );
    onHistoryUpdate(updated);
    setIsLoggingModalOpen(false);
    setManualNote('');
  };

  // Custom Dark Theme Tooltip showing Date, Threshold Details, and Specific Exercises Performed
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: StrengthHistoryEntry = payload[0].payload;
      const formattedDate = dataPoint.date
        ? new Date(dataPoint.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : dataPoint.displayDate;

      return (
        <div className="bg-[#151926]/95 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl space-y-2.5 max-w-sm w-80 text-xs animate-in fade-in zoom-in-95 duration-100">
          {/* Header with Full Date & Workout Title */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5 text-white font-mono font-bold">
              <Calendar size={13} className="text-cyan-400" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
              {dataPoint.workoutName || 'Training Session'}
            </span>
          </div>

          {/* Threshold Milestone Banner */}
          {dataPoint.thresholdCrossed && (
            <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/10 border border-amber-500/30 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-amber-300">
              <Zap size={14} className="text-amber-400 shrink-0 animate-pulse" />
              <div className="leading-tight">
                <span className="text-[10px] font-mono uppercase text-amber-400/80 block font-bold">
                  Weight Threshold Crossed:
                </span>
                <span className="text-xs font-semibold text-white">
                  {dataPoint.thresholdCrossed}
                </span>
              </div>
            </div>
          )}

          {/* Max Load Readings */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-black/40 rounded-xl border border-white/5 font-mono">
            {(visibleSeries === 'both' || visibleSeries === 'dumbbell') && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-cyan-400 uppercase flex items-center gap-1 font-sans">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Max Dumbbell
                </span>
                <div className="text-sm font-bold text-white">
                  {dataPoint.maxDumbbellWeightKg} <span className="text-[10px] text-slate-400">kg</span>
                </div>
              </div>
            )}

            {(visibleSeries === 'both' || visibleSeries === 'barbell') && (
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-400 uppercase flex items-center gap-1 font-sans">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Max Barbell
                </span>
                <div className="text-sm font-bold text-white">
                  {dataPoint.maxBarbellWeightKg} <span className="text-[10px] text-slate-400">kg</span>
                </div>
              </div>
            )}
          </div>

          {/* Specific Exercises Performed on that Day */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Activity size={12} />
                Exercises Performed ({dataPoint.exercisesPerformed?.length || 0}):
              </span>
              <span className="text-[10px] text-slate-500">Recorded</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {dataPoint.exercisesPerformed && dataPoint.exercisesPerformed.length > 0 ? (
                dataPoint.exercisesPerformed.map((exName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] text-slate-200 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 leading-snug"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{exName}</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-500 italic p-1">
                  Routine exercises recorded in session
                </div>
              )}
            </div>
          </div>

          {/* Session Note & Kinematic Joint Safety */}
          {dataPoint.note && (
            <div className="text-[10px] text-slate-400 pt-1.5 border-t border-white/5 flex items-start gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{dataPoint.note}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#12141c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Strength Progression Over Time
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Biomechanical Overload
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking Max Dumbbell Load (5-plate limit) & Max Barbell Load stored in local history.
          </p>
        </div>

        {/* Action buttons: Export CSV, Log Checkpoint & Reset Baseline */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${isExportedRecently ? 'bg-emerald-500 text-black font-semibold border-emerald-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}
            title="Download complete strength progression history to a CSV spreadsheet"
          >
            {isExportedRecently ? (
              <Check size={14} className="stroke-[3]" />
            ) : (
              <Download size={14} />
            )}
            <span>{isExportedRecently ? 'CSV Downloaded!' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsLoggingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition-colors border border-white/10"
          >
            <Plus size={14} />
            <span>Log Checkpoint</span>
          </button>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl text-xs font-medium transition-colors border border-red-500/20"
            title="Reset history to fresh beginner baseline (removes test/mock records)"
          >
            <RotateCcw size={13} />
            <span>Reset History</span>
          </button>
        </div>
      </div>

      {/* Metric Deltas Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Current DB Load</span>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">
            {currentDumbbellKg} <span className="text-xs text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
            +{dbGain}kg ({firstEntry && firstEntry.maxDumbbellWeightKg ? Math.round((dbGain / firstEntry.maxDumbbellWeightKg) * 100) : 0}% gain)
          </span>
        </div>

        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Barbell Load</span>
          <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">
            {currentBarbellKg} <span className="text-xs text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
            +{bbGain}kg ({firstEntry && firstEntry.maxBarbellWeightKg ? Math.round((bbGain / firstEntry.maxBarbellWeightKg) * 100) : 0}% gain)
          </span>
        </div>

        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">History Points</span>
          <div className="text-xl font-mono font-bold text-white mt-0.5">
            {historyData.length}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Stored in localStorage</span>
        </div>

        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Joint Armor Status</span>
          <div className="text-xs font-bold text-emerald-300 mt-1 flex items-center gap-1">
            <ShieldCheck size={14} />
            <span>Zero Injury Flares</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Neutral wrist path</span>
        </div>
      </div>

      {/* Filter Toggles Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Series Filter */}
        <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/5">
          <button
            onClick={() => setVisibleSeries('both')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${visibleSeries === 'both' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Both Weights
          </button>
          <button
            onClick={() => setVisibleSeries('dumbbell')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${visibleSeries === 'dumbbell' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Dumbbell Only (Cyan)
          </button>
          <button
            onClick={() => setVisibleSeries('barbell')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${visibleSeries === 'barbell' ? 'bg-amber-500 text-black font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Barbell Only (Amber)
          </button>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setTimeRange('recent5')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${timeRange === 'recent5' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Recent 5
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${timeRange === '30d' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${timeRange === 'all' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* RECHARTS LINE CHART CONTAINER */}
      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              dy={8}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              unit="kg"
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />

            {(visibleSeries === 'both' || visibleSeries === 'dumbbell') && (
              <Line
                name="Max Dumbbell Load"
                type="monotone"
                dataKey="maxDumbbellWeightKg"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4, strokeWidth: 2, stroke: '#0c0d12' }}
                activeDot={{ r: 7, fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={800}
              />
            )}

            {(visibleSeries === 'both' || visibleSeries === 'barbell') && (
              <Line
                name="Max Barbell Load"
                type="monotone"
                dataKey="maxBarbellWeightKg"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: '#0c0d12' }}
                activeDot={{ r: 7, fill: '#fbbf24', stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={800}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LOGGED PROGRESSION RECORDS TABLE / LIST */}
      <div className="pt-2 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-cyan-400" />
            <h4 className="text-xs font-bold font-mono uppercase text-slate-300">
              Recorded Strength Sessions ({historyData.length})
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowHistoryList(!showHistoryList)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            {showHistoryList ? 'Hide Records' : 'Show All Records'}
          </button>
        </div>

        {showHistoryList && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {activeHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                No past records. Complete a workout to record your first progression checkpoint.
              </div>
            ) : (
              [...activeHistory].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md font-mono text-[11px] font-bold">
                        {entry.displayDate || entry.date}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {entry.workoutName || 'Strength Session'}
                      </span>
                      {entry.thresholdCrossed && (
                        <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                          {entry.thresholdCrossed}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>DB: <strong className="text-cyan-300">{entry.maxDumbbellWeightKg}kg</strong></span>
                      <span>·</span>
                      <span>BB: <strong className="text-amber-300">{entry.maxBarbellWeightKg}kg</strong></span>
                      {entry.note && (
                        <>
                          <span>·</span>
                          <span className="text-[11px] text-slate-500 font-sans italic truncate max-w-xs">{entry.note}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id, entry.workoutName || entry.displayDate)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete this record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MANUAL CHECKPOINT LOGGING MODAL */}
      {isLoggingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCheckpoint}
            className="bg-[#12141c] border border-cyan-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-cyan-400" />
                Log Weight Checkpoint
              </h4>
              <button
                type="button"
                onClick={() => setIsLoggingModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Max Dumbbell Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="40"
                value={manualDbKg}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setManualDbKg(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                0kg baseline (bodyweight) up to 27kg (5 plates/side)
              </span>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Max Barbell Weight (kg)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="120"
                value={manualBbKg}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setManualBbKg(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Session Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Clean 10 reps with zero wrist strain"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Exercises Performed ({manualSelectedExercises.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-black/40 rounded-xl border border-white/5">
                {EXERCISE_DATABASE.map((ex) => {
                  const isSelected = manualSelectedExercises.includes(ex.name);
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => toggleManualExercise(ex.name)}
                      className={`px-2 py-1 rounded text-[11px] transition-colors flex items-center gap-1 ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                      <span className="truncate max-w-[140px]">{ex.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLoggingModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-colors"
              >
                Save to History
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
