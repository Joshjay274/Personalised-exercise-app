import React from 'react';
import {
  Check,
  Dumbbell,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { DumbbellPlateLoader } from './DumbbellPlateLoader';

interface EquipmentManagerProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  category: 'Weights' | 'Bodyweight' | 'Accessories';
  calisthenicsFallback: string;
}

export const ALL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'dumbbell',
    name: 'Adjustable Dumbbells',
    description: 'Allows neutral grip pressing and curling which prevents wrist rotation torque.',
    category: 'Weights',
    calisthenicsFallback: 'Incline Wall Pushups & Dynamic Isometric Holds'
  },
  {
    id: 'barbell',
    name: 'Bedroom / Compact Barbell',
    description: 'Lightweight standard 1-inch or curl bar (6-10kg) suited for bedroom floor space, front squats, and Romanian hinges.',
    category: 'Weights',
    calisthenicsFallback: 'Goblet Squats & Single-Leg Romanian Hinges'
  },
  {
    id: 'plates',
    name: 'Home / Bedroom Weight Plates',
    description: 'Compact 1.25kg, 1.5kg, 2.0kg, 2.5kg, 5kg, and 10kg plates shared between barbell and dumbbells.',
    category: 'Weights',
    calisthenicsFallback: 'Tempo variations (3-second eccentric pauses)'
  },
  {
    id: 'pullup_bar',
    name: 'Pull-Up Bar / Rings',
    description: 'Vertical pulling for lats and grip strength with neutral hand position options.',
    category: 'Bodyweight',
    calisthenicsFallback: 'Dead Bug Arm Bracing & Prone Floor Scapular Rows'
  },
  {
    id: 'resistance_bands',
    name: 'Resistance Bands',
    description: 'Accommodating resistance ideal for wrist rehabilitation and rotator cuff warmups.',
    category: 'Accessories',
    calisthenicsFallback: 'Wrist Circles & Isometric Palm Press'
  },
  {
    id: 'bench',
    name: 'Flat Exercise Bench',
    description: 'Elevated surface for presses, step-ups, and wrist curl support.',
    category: 'Accessories',
    calisthenicsFallback: 'Floor Press (Floor acts as built-in safety stopper)'
  }
];

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  userProfile,
  onUpdateProfile
}) => {
  const toggleEquipment = (id: string) => {
    const current = userProfile.availableEquipment;
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [...current, id];
    onUpdateProfile({ ...userProfile, availableEquipment: updated });
  };

  const selectAll = () => {
    onUpdateProfile({
      ...userProfile,
      availableEquipment: ALL_EQUIPMENT.map((e) => e.id)
    });
  };

  const selectBodyweightOnly = () => {
    onUpdateProfile({
      ...userProfile,
      availableEquipment: []
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Available Equipment & Auto-Swap</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            The coach automatically substitutes missing gym gear with wrist-safe calisthenics regressions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-white/5"
          >
            All Equipment
          </button>
          <button
            onClick={selectBodyweightOnly}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20"
          >
            Pure Calisthenics Only
          </button>
        </div>
      </div>

      {/* Athlete's Specific Dumbbell Hardware Profile */}
      <div className="bg-[#12141c] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Dumbbell size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Your Adjustable Dumbbell Setup</h3>
              <p className="text-xs text-slate-400">
                Calibrated to: <span className="text-cyan-400 font-mono font-medium">2.5kg, 2kg, 1.5kg plates</span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-emerald-400 font-mono font-medium">Max 5 plates per side</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/5 text-slate-300 rounded-lg text-xs font-mono">
              Handle: {userProfile.dumbbellHandleWeightKg || 2}kg
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-mono">
              Max Load: 27kg
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The hybrid coach calculates all dumbbell set progressions strictly within your 5-plate sleeve limit. Every working weight is guaranteed to be achievable using your physical plate collection.
        </p>

        {/* Embedded Dumbbell Loader Interactive Tool */}
        <DumbbellPlateLoader
          initialWeight={userProfile.maxDumbbellWeightKg}
          handleWeightKg={userProfile.dumbbellHandleWeightKg || 2}
          maxPlatesPerSleeve={userProfile.maxPlatesPerSleeve || 5}
          availablePlateDenoms={userProfile.availableDumbbellPlateDenoms || [2.5, 2.0, 1.5]}
          onWeightChange={(w) => onUpdateProfile({ ...userProfile, maxDumbbellWeightKg: w })}
          compact={false}
        />
      </div>

      {/* Equipment Checklist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {ALL_EQUIPMENT.map((item) => {
          const isOwned = userProfile.availableEquipment.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleEquipment(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${isOwned ? 'bg-[#151926] border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-[#12141c] border-white/5 opacity-75 hover:opacity-100 hover:border-white/10'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isOwned ? 'bg-emerald-500 text-black font-bold' : 'border border-white/20'}`}>
                    {isOwned && <Check size={13} strokeWidth={3} />}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {/* Substitution footnote */}
              <div className="pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Auto-Fallback:</span>
                <span className={`font-medium truncate ${isOwned ? 'text-slate-400' : 'text-emerald-400'}`}>
                  {item.calisthenicsFallback}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hybrid Substitution Guarantee Banner */}
      <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <Sparkles size={16} />
          <span>Biomechanical Substitution Guarantee</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          If you travel or lack barbell equipment, the Smart Hybrid Coach recalculates equivalent load vectors using bodyweight levers, time-under-tension (TUT), and neutral-grip floor variations. Your progressive overload score never resets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs">
            <span className="text-slate-400 block text-[11px] uppercase font-mono">Barbell Floor Press</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium mt-1">
              <ArrowRight size={13} />
              <span>Incline Wall/Chair Pushup</span>
            </div>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs">
            <span className="text-slate-400 block text-[11px] uppercase font-mono">Heavy Barbell Squat</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium mt-1">
              <ArrowRight size={13} />
              <span>Tempo Goblet Squat (3s)</span>
            </div>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs">
            <span className="text-slate-400 block text-[11px] uppercase font-mono">Floor Pushups</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium mt-1">
              <ArrowRight size={13} />
              <span>Forearm Plank (Zero Wrist)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
