import React, { useState } from 'react';
import {
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  solveDumbbellLoad,
  generateAllAchievableDumbbellLoads,
  DumbbellConfig,
  DEFAULT_DUMBBELL_CONFIG
} from '../utils/plateSolver';

interface DumbbellPlateLoaderProps {
  initialWeight?: number;
  handleWeightKg?: number;
  maxPlatesPerSleeve?: number;
  availablePlateDenoms?: number[];
  onWeightChange?: (weight: number) => void;
  compact?: boolean;
}

const DUMBBELL_PLATE_SPECS: Record<number, { color: string; border: string; heightPx: number; text: string }> = {
  2.5: { color: '#3b82f6', border: '#2563eb', heightPx: 72, text: '#ffffff' },
  2.0: { color: '#10b981', border: '#059669', heightPx: 64, text: '#ffffff' },
  1.5: { color: '#f59e0b', border: '#d97706', heightPx: 56, text: '#000000' }
};

export const DumbbellPlateLoader: React.FC<DumbbellPlateLoaderProps> = ({
  initialWeight = 10,
  handleWeightKg = 2,
  maxPlatesPerSleeve = 5,
  availablePlateDenoms = [2.5, 2.0, 1.5],
  onWeightChange,
  compact = false
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight);

  const config: DumbbellConfig = {
    handleWeightKg,
    availablePlateDenominations: availablePlateDenoms,
    maxPlatesPerSleeve
  };

  const solution = solveDumbbellLoad(targetWeight, config);
  const allAchievableMap = generateAllAchievableDumbbellLoads(config);
  const achievableWeights = Array.from(allAchievableMap.keys()).sort((a, b) => a - b);

  const handleSelectWeight = (w: number) => {
    setTargetWeight(w);
    if (onWeightChange) onWeightChange(w);
  };

  const stepNextWeight = (deltaDirection: 1 | -1) => {
    const currentIdx = achievableWeights.findIndex((w) => w === solution.actualWeightKg);
    let nextIdx = currentIdx !== -1 ? currentIdx + deltaDirection : 0;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx >= achievableWeights.length) nextIdx = achievableWeights.length - 1;
    handleSelectWeight(achievableWeights[nextIdx]);
  };

  const sleeveUsed = solution.totalPlatesPerSide;
  const isAtCapacity = sleeveUsed >= maxPlatesPerSleeve;

  return (
    <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-tight">Adjustable Dumbbell Loader</h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              5-Plate Sleeve Limit Enforced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Handle: <span className="text-slate-300 font-mono font-medium">{handleWeightKg}kg</span>
            <span className="mx-2 text-slate-600">·</span>
            Plates Owned: <span className="text-slate-300 font-mono">2.5kg, 2kg, 1.5kg</span>
          </p>
        </div>

        {/* Capacity Indicator Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border ${sleeveUsed > maxPlatesPerSleeve ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : isAtCapacity ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/5 text-slate-300 border-white/10'}`}>
            <span>Sleeve Capacity:</span>
            <span className="font-bold">{sleeveUsed} / {maxPlatesPerSleeve}</span>
          </div>
        </div>
      </div>

      {/* Visual Dumbbell Graphic */}
      <div className="py-6 px-4 bg-gradient-to-b from-[#0c0d12] to-[#141722] border border-white/5 rounded-xl flex items-center justify-center min-h-[150px] overflow-x-auto relative">
        <div className="flex items-center justify-center relative min-w-[320px]">
          {/* Left Sleeve (Loaded from collar inwards) */}
          <div className="flex items-center justify-end flex-row-reverse gap-1.5 pr-2 relative">
            {/* Threaded bar sleeve ghost track showing max 5 slots */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 w-28 h-2.5 bg-slate-700/40 rounded-sm -z-0" />
            
            {solution.platesPerSide.map((p, idx) => {
              const spec = DUMBBELL_PLATE_SPECS[p] || DUMBBELL_PLATE_SPECS[2];
              return (
                <div
                  key={`left-db-${idx}`}
                  style={{
                    backgroundColor: spec.color,
                    borderColor: spec.border,
                    height: `${spec.heightPx}px`,
                    width: '18px',
                    color: spec.text
                  }}
                  className="rounded border flex items-center justify-center shadow-lg select-none shrink-0 z-10 transition-all hover:scale-105"
                  title={`${p}kg Plate`}
                >
                  <span className="text-[10px] font-bold font-mono rotate-90 whitespace-nowrap">{p}</span>
                </div>
              );
            })}

            {/* Spinlock collar clamp */}
            {solution.platesPerSide.length > 0 && (
              <div className="w-3.5 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-sm border border-amber-300 shadow-md flex items-center justify-center z-10 shrink-0" title="Spinlock Collar">
                <div className="w-1 h-6 bg-black/40 rounded-full" />
              </div>
            )}
          </div>

          {/* Central Handle (Knurled Bar Grip) */}
          <div className="relative flex items-center z-10">
            {/* Left inside stopper */}
            <div className="w-3 h-16 bg-slate-400 rounded-sm border border-slate-300 shadow-md shrink-0" />

            {/* Knurled Handle Center */}
            <div className="w-24 h-6 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 border-y border-slate-200 flex items-center justify-center shadow-inner relative">
              <span className="text-[9px] font-mono font-bold text-slate-800 tracking-wider">
                {handleWeightKg}KG BAR
              </span>
            </div>

            {/* Right inside stopper */}
            <div className="w-3 h-16 bg-slate-400 rounded-sm border border-slate-300 shadow-md shrink-0" />
          </div>

          {/* Right Sleeve */}
          <div className="flex items-center justify-start gap-1.5 pl-2 relative">
            <div className="absolute top-1/2 -translate-y-1/2 left-2 w-28 h-2.5 bg-slate-700/40 rounded-sm -z-0" />

            {solution.platesPerSide.map((p, idx) => {
              const spec = DUMBBELL_PLATE_SPECS[p] || DUMBBELL_PLATE_SPECS[2];
              return (
                <div
                  key={`right-db-${idx}`}
                  style={{
                    backgroundColor: spec.color,
                    borderColor: spec.border,
                    height: `${spec.heightPx}px`,
                    width: '18px',
                    color: spec.text
                  }}
                  className="rounded border flex items-center justify-center shadow-lg select-none shrink-0 z-10 transition-all hover:scale-105"
                  title={`${p}kg Plate`}
                >
                  <span className="text-[10px] font-bold font-mono rotate-90 whitespace-nowrap">{p}</span>
                </div>
              );
            })}

            {/* Spinlock collar clamp */}
            {solution.platesPerSide.length > 0 && (
              <div className="w-3.5 h-12 bg-gradient-to-r from-amber-600 to-amber-400 rounded-sm border border-amber-300 shadow-md flex items-center justify-center z-10 shrink-0" title="Spinlock Collar">
                <div className="w-1 h-6 bg-black/40 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Instructions Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Loading Recipe (Per Sleeve):</span>
          <span className="font-mono text-emerald-400 font-medium">
            {solution.actualWeightKg === 0
              ? '0 kg Total (Bodyweight / Unweighted)'
              : `${solution.actualWeightKg} kg Total (${((solution.actualWeightKg - handleWeightKg) / 2).toFixed(1)}kg per side)`}
          </span>
        </div>

        {solution.platesPerSide.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/5">
            {Object.entries(solution.plateCounts).map(([weightStr, count]) => {
              const w = parseFloat(weightStr);
              const spec = DUMBBELL_PLATE_SPECS[w];
              return (
                <div
                  key={w}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: spec?.color || '#fff' }}
                  />
                  <span className="text-white font-bold">{count}× {w} kg</span>
                  <span className="text-slate-400 text-[10px]">({count * w}kg)</span>
                </div>
              );
            })}
            <div className="text-xs text-slate-400 font-mono ml-auto">
              + Spinlock Collar
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-400">
            {solution.actualWeightKg === 0
              ? '0 kg baseline · Unweighted / bodyweight movement (no plates loaded).'
              : `Bare handle only (${handleWeightKg} kg). Select a weight below to load plates.`}
          </div>
        )}

        {/* Warning or status message */}
        {!solution.isExact && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{solution.message}</span>
          </div>
        )}
      </div>

      {/* Weight Selector & Quick Presets */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => stepNextWeight(-1)}
            disabled={solution.actualWeightKg <= achievableWeights[0]}
            className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white rounded-xl transition-colors border border-white/5"
            title="Step down to previous achievable weight"
          >
            <Minus size={18} />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-mono font-extrabold text-cyan-400 tabular-nums">
                {solution.actualWeightKg}
              </span>
              <span className="text-sm font-mono font-bold text-slate-400">KG</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {solution.platesPerSide.length} of {maxPlatesPerSleeve} plates per side
            </span>
          </div>

          <button
            onClick={() => stepNextWeight(1)}
            disabled={solution.actualWeightKg >= achievableWeights[achievableWeights.length - 1]}
            className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white rounded-xl transition-colors border border-white/5"
            title="Step up to next achievable weight"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Achievable Weight Buttons Grid */}
        <div>
          <div className="text-[11px] text-slate-400 font-mono mb-1.5 flex items-center justify-between">
            <span>Achievable Weight Steps (Max 5 plates/sleeve):</span>
            <span className="text-slate-500">Max: {achievableWeights[achievableWeights.length - 1]}kg</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-black/20 rounded-xl border border-white/5">
            {achievableWeights.map((w) => {
              const isSelected = w === solution.actualWeightKg;
              const combo = allAchievableMap.get(w) || [];
              const count = combo.length;

              return (
                <button
                  key={w}
                  onClick={() => handleSelectWeight(w)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${isSelected ? 'bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/20' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'}`}
                >
                  <span>{w}kg</span>
                  <span className={`text-[10px] ${isSelected ? 'text-black/80 font-bold' : 'text-slate-500'}`}>
                    ({count}p)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
