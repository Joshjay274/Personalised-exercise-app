import React, { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

interface PlateSpec {
  weight: number;
  color: string;
  borderColor: string;
  heightPx: number;
  widthPx: number;
  textColor: string;
}

const PLATE_CONFIGS: Record<number, PlateSpec> = {
  25: { weight: 25, color: '#dc2626', borderColor: '#b91c1c', heightPx: 96, widthPx: 18, textColor: '#ffffff' },
  20: { weight: 20, color: '#2563eb', borderColor: '#1d4ed8', heightPx: 92, widthPx: 16, textColor: '#ffffff' },
  15: { weight: 15, color: '#eab308', borderColor: '#ca8a04', heightPx: 84, widthPx: 14, textColor: '#000000' },
  10: { weight: 10, color: '#16a34a', borderColor: '#15803d', heightPx: 76, widthPx: 12, textColor: '#ffffff' },
  5: { weight: 5, color: '#ffffff', borderColor: '#d4d4d8', heightPx: 64, widthPx: 10, textColor: '#18181b' },
  2.5: { weight: 2.5, color: '#3f3f46', borderColor: '#27272a', heightPx: 54, widthPx: 9, textColor: '#fafafa' },
  2: { weight: 2, color: '#4b5563', borderColor: '#374151', heightPx: 50, widthPx: 9, textColor: '#fafafa' },
  1.5: { weight: 1.5, color: '#6b7280', borderColor: '#4b5563', heightPx: 48, widthPx: 8, textColor: '#ffffff' },
  1.25: { weight: 1.25, color: '#a1a1aa', borderColor: '#71717a', heightPx: 46, widthPx: 8, textColor: '#18181b' }
};

export function calculatePlatesBreakdown(targetWeightKg: number, barWeightKg: number = 8): number[] {
  let remainingPerSide = (targetWeightKg - barWeightKg) / 2;
  if (remainingPerSide <= 0) return [];

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1.25];
  const platesPerSide: number[] = [];

  for (const plate of availablePlates) {
    while (remainingPerSide >= plate - 0.01) {
      platesPerSide.push(plate);
      remainingPerSide -= plate;
    }
  }
  return platesPerSide;
}

interface PlateCalculatorProps {
  initialWeight?: number;
  barWeightKg?: number;
  onWeightChange?: (weight: number) => void;
  onBarWeightChange?: (barWeight: number) => void;
  compact?: boolean;
}

export const PlateCalculator: React.FC<PlateCalculatorProps> = ({
  initialWeight = 18,
  barWeightKg = 8,
  onWeightChange,
  onBarWeightChange,
  compact = false
}) => {
  const [barWeight, setBarWeight] = useState<number>(barWeightKg);
  const [targetWeight, setTargetWeight] = useState<number>(Math.max(barWeightKg, initialWeight));

  const updateWeight = (newWeight: number) => {
    const clamped = Math.max(barWeight, Math.round(newWeight * 10) / 10);
    setTargetWeight(clamped);
    if (onWeightChange) onWeightChange(clamped);
  };

  const handleBarWeightChange = (newBarWeight: number) => {
    setBarWeight(newBarWeight);
    if (onBarWeightChange) onBarWeightChange(newBarWeight);
    if (targetWeight < newBarWeight) {
      updateWeight(newBarWeight);
    }
  };

  const platesPerSide = calculatePlatesBreakdown(targetWeight, barWeight);
  const perSideTotal = (targetWeight - barWeight) / 2;
  const isBedroomSetup = barWeight <= 10;

  return (
    <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-white tracking-tight">Barbell Plate Calculator</h4>
            {isBedroomSetup && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Bedroom Barbell
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Load: <span className="text-emerald-400 font-mono font-bold tabular-nums text-sm">{targetWeight} kg</span>
            <span className="mx-2 text-slate-600">·</span>
            Per Sleeve: <span className="text-slate-300 font-mono tabular-nums">{perSideTotal > 0 ? `${perSideTotal} kg` : '0 kg'}</span>
            <span className="mx-2 text-slate-600">·</span>
            Bar: <span className="text-amber-400 font-mono">{barWeight} kg</span>
          </p>
        </div>

        {/* Bar Weight Selector with Bedroom Presets */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 overflow-x-auto">
          {[
            { label: '6kg Bed', weight: 6 },
            { label: '8kg Bed', weight: 8 },
            { label: '10kg Mid', weight: 10 },
            { label: '15kg Bar', weight: 15 },
            { label: '20kg Oly', weight: 20 },
          ].map((bar) => (
            <button
              key={bar.weight}
              onClick={() => handleBarWeightChange(bar.weight)}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                barWeight === bar.weight
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={`${bar.weight}kg Barbell shaft`}
            >
              {bar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Barbell Sleeve */}
      <div className="relative my-6 py-6 px-4 bg-gradient-to-b from-[#0c0d12] to-[#12141c] border border-white/5 rounded-xl flex items-center justify-center min-h-[140px] overflow-x-auto">
        <div className="flex items-center justify-center relative min-w-[340px]">
          {/* Left sleeve (mirrored) */}
          <div className="flex items-center justify-end flex-row-reverse gap-1 pr-2 relative">
            {platesPerSide.map((p, idx) => {
              const spec = PLATE_CONFIGS[p] || PLATE_CONFIGS[5];
              return (
                <div
                  key={`left-${idx}`}
                  style={{
                    backgroundColor: spec.color,
                    borderColor: spec.borderColor,
                    height: `${spec.heightPx}px`,
                    width: `${spec.widthPx}px`,
                    color: spec.textColor
                  }}
                  className="rounded-sm border flex items-center justify-center shadow-md select-none shrink-0"
                  title={`${p}kg Plate`}
                >
                  <span className="text-[9px] font-bold font-mono rotate-90 whitespace-nowrap">{p}</span>
                </div>
              );
            })}
            {platesPerSide.length > 0 && (
              <div className="w-2.5 h-16 bg-slate-400 rounded-sm border border-slate-300 shadow-sm shrink-0" title="Safety Collar" />
            )}
          </div>

          {/* Bar Shaft & Bushing Center */}
          <div className="relative flex items-center">
            {/* Left sleeve stopper */}
            <div className="w-4 h-24 bg-gradient-to-r from-slate-500 to-slate-400 rounded-sm border border-slate-300 z-10 shrink-0" />
            
            {/* Center knurled bar */}
            <div className="w-28 h-5 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 border-y border-slate-200 flex items-center justify-center shadow-inner relative">
              <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
                {barWeight}KG
              </span>
            </div>

            {/* Right sleeve stopper */}
            <div className="w-4 h-24 bg-gradient-to-r from-slate-400 to-slate-500 rounded-sm border border-slate-300 z-10 shrink-0" />
          </div>

          {/* Right sleeve (loaded sequence) */}
          <div className="flex items-center justify-start gap-1 pl-2 relative">
            {platesPerSide.map((p, idx) => {
              const spec = PLATE_CONFIGS[p] || PLATE_CONFIGS[5];
              return (
                <div
                  key={`right-${idx}`}
                  style={{
                    backgroundColor: spec.color,
                    borderColor: spec.borderColor,
                    height: `${spec.heightPx}px`,
                    width: `${spec.widthPx}px`,
                    color: spec.textColor
                  }}
                  className="rounded-sm border flex items-center justify-center shadow-md select-none shrink-0"
                  title={`${p}kg Plate`}
                >
                  <span className="text-[9px] font-bold font-mono rotate-90 whitespace-nowrap">{p}</span>
                </div>
              );
            })}
            {platesPerSide.length > 0 && (
              <div className="w-2.5 h-16 bg-slate-400 rounded-sm border border-slate-300 shadow-sm shrink-0" title="Safety Collar" />
            )}
          </div>
        </div>
      </div>

      {/* Plates Checklist Summary */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
          <span>Load each side with:</span>
          {platesPerSide.length === 0 && (
            <span className="text-amber-400 font-mono text-[11px]">Unloaded Barbell Only</span>
          )}
        </div>
        
        {platesPerSide.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {platesPerSide.map((p, idx) => {
              const spec = PLATE_CONFIGS[p];
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10 rounded-md text-xs font-mono"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: spec?.color || '#fff' }}
                  />
                  <span className="text-white font-medium">{p} kg</span>
                </div>
              );
            })}
            <div className="inline-flex items-center px-2 py-1 bg-slate-800/80 border border-white/5 rounded-md text-xs font-mono text-slate-400">
              + Collar
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-slate-900/60 border border-white/5 rounded-lg text-xs text-slate-400">
            Current target matches bare bar weight ({barWeight} kg). Add weight below to calculate plates.
          </div>
        )}
      </div>

      {/* Target Weight Controls & Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateWeight(targetWeight - 5)}
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5 cursor-pointer"
              title="Minus 5kg"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={() => updateWeight(targetWeight - 2.5)}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-mono transition-colors border border-white/5 cursor-pointer"
            >
              -2.5
            </button>
            <button
              onClick={() => updateWeight(targetWeight - 1)}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-colors border border-white/5 cursor-pointer"
              title="Minus 1kg (micro-adjustment)"
            >
              -1
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min={barWeight}
              value={targetWeight}
              onChange={(e) => updateWeight(parseFloat(e.target.value) || barWeight)}
              className="w-20 px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-center font-mono font-bold text-emerald-400 text-base focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-slate-400 font-mono">KG</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateWeight(targetWeight + 1)}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-colors border border-white/5 cursor-pointer"
              title="Plus 1kg (micro-adjustment)"
            >
              +1
            </button>
            <button
              onClick={() => updateWeight(targetWeight + 2.5)}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-mono transition-colors border border-white/5 cursor-pointer"
            >
              +2.5
            </button>
            <button
              onClick={() => updateWeight(targetWeight + 5)}
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5 cursor-pointer"
              title="Plus 5kg"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Quick Weight Presets (adapted for bedroom barbell loads) */}
        {!compact && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider shrink-0 mr-1">Presets:</span>
            {(barWeight <= 10
              ? [barWeight, barWeight + 4, barWeight + 6, barWeight + 8, barWeight + 10, barWeight + 12, barWeight + 16, barWeight + 20, 30]
              : [20, 25, 30, 40, 50, 60, 70, 80]
            ).map((kg) => (
              <button
                key={kg}
                onClick={() => updateWeight(kg)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 cursor-pointer ${targetWeight === kg ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                {kg}kg
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
