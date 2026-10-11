import React, { useState } from 'react';
import {
  Dumbbell,
  Layers,
  Save,
  Check,
  ShieldCheck,
  HelpCircle,
  Home,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { UserProfile, NavTab } from '../types';
import { DumbbellPlateLoader } from './DumbbellPlateLoader';
import { PlateCalculator } from './PlateCalculator';

interface WeightSettingsPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigate: (tab: NavTab) => void;
}

export const WeightSettingsPage: React.FC<WeightSettingsPageProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate
}) => {
  const [activeTool, setActiveTool] = useState<'dumbbell' | 'barbell'>('barbell');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Quick state for local adjustments
  const [dbTarget, setDbTarget] = useState<number>(userProfile.maxDumbbellWeightKg ?? 0);
  const [bbTarget, setBbTarget] = useState<number>(userProfile.maxBarbellWeightKg ?? 0);
  const [barWeight, setBarWeight] = useState<number>(userProfile.barbellBarWeightKg || 8);
  const [handleWeight, setHandleWeight] = useState<number>(userProfile.dumbbellHandleWeightKg || 2);

  const handleSaveWeights = () => {
    const updated: UserProfile = {
      ...userProfile,
      maxDumbbellWeightKg: dbTarget,
      maxBarbellWeightKg: bbTarget,
      barbellBarWeightKg: barWeight,
      dumbbellHandleWeightKg: handleWeight
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBarWeightChange = (newBarWeight: number) => {
    setBarWeight(newBarWeight);
    const updated: UserProfile = {
      ...userProfile,
      barbellBarWeightKg: newBarWeight
    };
    onUpdateProfile(updated);
  };

  const handleBarbellWeightChange = (newTotalWeight: number) => {
    setBbTarget(newTotalWeight);
    const updated: UserProfile = {
      ...userProfile,
      maxBarbellWeightKg: newTotalWeight
    };
    onUpdateProfile(updated);
  };

  const handleDumbbellWeightChange = (newTotalWeight: number) => {
    setDbTarget(newTotalWeight);
    const updated: UserProfile = {
      ...userProfile,
      maxDumbbellWeightKg: newTotalWeight
    };
    onUpdateProfile(updated);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#12141c] via-[#151926] to-[#12141c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-emerald-400">Hardware Calibration</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Bedroom Setup & Plate Management</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Weight Settings & Plate Calculator
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Configure your bedroom barbell bar weight, dumbbell handle specs, and calculate exact sleeve plate loading so you never waste workout time guessing plate combos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('stats')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors border border-white/5 cursor-pointer"
          >
            <TrendingUp size={14} className="text-emerald-400" />
            <span>View Progression Stats</span>
          </button>
        </div>
      </div>

      {/* Target Setting Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bedroom Barbell Working Target Card */}
        <div className="bg-[#12141c] border border-amber-500/20 bg-amber-950/5 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bedroom Barbell Setup</h3>
                <span className="text-xs text-slate-400 font-mono">Compact home barbell calibration</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-amber-400 tabular-nums">{bbTarget}</span>
              <span className="text-xs text-slate-400 font-mono ml-1">kg</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                Barbell Bar Weight:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[6, 8, 10, 15, 20].map((w) => (
                  <button
                    key={w}
                    onClick={() => handleBarWeightChange(w)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      (userProfile.barbellBarWeightKg || 8) === w
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {w}kg
                    <span className="block text-[9px] opacity-75 font-normal">
                      {w === 8 ? 'Bedroom' : w === 20 ? 'Olympic' : 'Standard'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                Working Weight Target:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBarbellWeightChange(Math.max(userProfile.barbellBarWeightKg || 8, bbTarget - 2.5))}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                >
                  -2.5kg
                </button>
                <button
                  onClick={() => handleBarbellWeightChange(Math.max(userProfile.barbellBarWeightKg || 8, bbTarget - 1))}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                >
                  -1kg
                </button>
                <div className="flex-1 text-center py-2 bg-black/40 rounded-xl border border-white/5 font-mono text-lg font-bold text-amber-300">
                  {bbTarget} kg
                </div>
                <button
                  onClick={() => handleBarbellWeightChange(bbTarget + 1)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                >
                  +1kg
                </button>
                <button
                  onClick={() => handleBarbellWeightChange(bbTarget + 2.5)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                >
                  +2.5kg
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Barbell is set to a {userProfile.barbellBarWeightKg || 8}kg bedroom bar. Side load: {Math.max(0, (bbTarget - (userProfile.barbellBarWeightKg || 8)) / 2).toFixed(1)}kg per sleeve.
            </p>
          </div>
        </div>

        {/* Adjustable Dumbbell Working Target Card */}
        <div className="bg-[#12141c] border border-cyan-500/20 bg-cyan-950/5 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Adjustable Dumbbells</h3>
                <span className="text-xs text-slate-400 font-mono">Max 5 plates per side sleeve</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">{dbTarget}</span>
              <span className="text-xs text-slate-400 font-mono ml-1">kg</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                Dumbbell Handle Weight:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1.5, 2.0, 2.5].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setHandleWeight(w);
                      onUpdateProfile({ ...userProfile, dumbbellHandleWeightKg: w });
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      (userProfile.dumbbellHandleWeightKg || 2) === w
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {w}kg Handle
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                Working Weight Target:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDumbbellWeightChange(0)}
                  className={`px-2.5 py-2 text-xs font-mono rounded-xl border transition-colors cursor-pointer ${dbTarget === 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'}`}
                  title="Set dumbbell load to 0kg (unweighted bodyweight)"
                >
                  0kg
                </button>
                <button
                  onClick={() => handleDumbbellWeightChange(Math.max(0, dbTarget - 2))}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                  title="Decrease dumbbell load by 2kg"
                >
                  -2kg
                </button>
                <button
                  onClick={() => handleDumbbellWeightChange(Math.max(0, dbTarget - 1))}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                  title="Decrease dumbbell load by 1kg"
                >
                  -1kg
                </button>
                <div className="flex-1 text-center py-2 bg-black/40 rounded-xl border border-white/5 font-mono text-lg font-bold text-cyan-300">
                  {dbTarget} kg
                </div>
                <button
                  onClick={() => handleDumbbellWeightChange(Math.min(27, dbTarget + 1))}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                  title="Increase dumbbell load by 1kg"
                >
                  +1kg
                </button>
                <button
                  onClick={() => handleDumbbellWeightChange(Math.min(27, dbTarget + 2))}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                  title="Increase dumbbell load by 2kg"
                >
                  +2kg
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Sleeve capacity: 5 plates per side. Compatible with 2.5kg, 2.0kg, and 1.5kg plates.
            </p>
          </div>
        </div>
      </div>

      {/* Plate Loading Assistant Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Interactive Plate Calculator</h2>
            <p className="text-xs text-slate-400">
              Visualizes how to build your exact target weight on either the barbell or dumbbells.
            </p>
          </div>

          {/* Toggle between Dumbbell vs Barbell Loader */}
          <div className="inline-flex p-1 bg-[#12141c] rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTool('barbell')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTool === 'barbell'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Barbell Calculator ({userProfile.barbellBarWeightKg || 8}kg Bar)</span>
            </button>
            <button
              onClick={() => setActiveTool('dumbbell')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTool === 'dumbbell'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dumbbell size={14} />
              <span>Dumbbell Loader (Max 5/side)</span>
            </button>
          </div>
        </div>

        {activeTool === 'barbell' ? (
          <PlateCalculator
            initialWeight={userProfile.maxBarbellWeightKg || 18}
            barWeightKg={userProfile.barbellBarWeightKg || 8}
            onWeightChange={handleBarbellWeightChange}
            onBarWeightChange={handleBarWeightChange}
          />
        ) : (
          <DumbbellPlateLoader
            initialWeight={userProfile.maxDumbbellWeightKg ?? 0}
            handleWeightKg={userProfile.dumbbellHandleWeightKg || 2}
            maxPlatesPerSleeve={userProfile.maxPlatesPerSleeve || 5}
            availablePlateDenoms={userProfile.availableDumbbellPlateDenoms || [2.5, 2.0, 1.5]}
            onWeightChange={handleDumbbellWeightChange}
            compact={false}
          />
        )}
      </div>

      {/* Bedroom Training Guidelines & Safety Tips */}
      <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
          <Home size={16} />
          <span>Bedroom Weight Lifting Safety Protocol</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
            <span className="font-bold text-white block">1. Floor Press Safety</span>
            <p className="text-slate-400 leading-relaxed">
              In your bedroom without a spotter rack, execute floor presses rather than elevated bench presses. The floor acts as a physical stop preventing the bar from ever pinning your chest.
            </p>
          </div>

          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
            <span className="font-bold text-white block">2. Micro-Loading & TUT</span>
            <p className="text-slate-400 leading-relaxed">
              Because bedroom barbells are lighter, progress through Time Under Tension (DRS 30s-45s) and 3-second eccentric lowering to trigger maximum hypertrophy without needing massive plates.
            </p>
          </div>

          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
            <span className="font-bold text-white block">3. Carpal Wrist Neutrality</span>
            <p className="text-slate-400 leading-relaxed">
              Stack your knuckles directly over your wrists. With adjustable dumbbells and standard 1-inch bars, keep the weight vector perpendicular to your forearms to shield your carpal joints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
