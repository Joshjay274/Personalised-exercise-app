import React, { useState } from 'react';
import {
  Save,
  ShieldCheck,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle,
  Activity,
  Award,
  AlertCircle,
  Mail,
  Cloud,
  CloudCheck,
  RefreshCw,
  Copy,
  Download,
  Upload,
  Check,
  Smartphone,
  RotateCcw,
  Wrench,
  Dumbbell,
  Layers,
  Sparkles,
  ArrowRight,
  User,
  ChevronDown,
  ChevronUp,
  Zap,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, BodyTarget } from '../types';
import { isPreCreationDate, resetStrengthHistory } from '../utils/historyStorage';
import { ALL_EQUIPMENT } from './EquipmentManager';
import { PWAInstallButton } from './PWAInstallButton';
import { getBiometricTuning } from '../utils/exerciseTuning';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onRestoreAllData?: (payloadJson: string) => boolean;
  defaultSection?: 'biometrics' | 'equipment' | 'hardware' | 'joints' | 'sync';
}

const ALL_JOINTS: { id: BodyTarget; label: string; description: string }[] = [
  { id: 'wrists', label: 'Wrists & Carpals', description: 'Enforces neutral grip, wall incline pushups, and dumbbell floor presses' },
  { id: 'knees', label: 'Knees & Patella', description: 'Enforces strict toe tracking, eliminates valgus knee collapse' },
  { id: 'ankles', label: 'Ankles & Achilles', description: 'Prioritizes dynamic talocrural rotations and heel pumps before squats' },
  { id: 'shoulders', label: 'Shoulders & Rotators', description: 'Limits 90° arm flaring; strictly promotes 45° arrowhead pressing' },
  { id: 'core', label: 'Lower Back & Lumbar', description: 'Replaces hanging crunching with ground-flush dead bugs and planks' }
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userProfile,
  onSaveProfile,
  onRestoreAllData,
  defaultSection = 'all'
}) => {
  const [form, setForm] = useState<UserProfile>(userProfile);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'all' | 'biometrics' | 'equipment' | 'hardware' | 'joints' | 'sync' | 'pwa'>('all');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');
  const [copiedSyncCode, setCopiedSyncCode] = useState<boolean>(false);
  const [restoreCodeInput, setRestoreCodeInput] = useState<string>('');
  const [restoreError, setRestoreError] = useState<string>('');
  const [restoreSuccess, setRestoreSuccess] = useState<boolean>(false);
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState<boolean>(true);
  const [customHeightMode, setCustomHeightMode] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [customAgeMode, setCustomAgeMode] = useState<boolean>(false);
  const [customWeightMode, setCustomWeightMode] = useState<boolean>(false);
  const [aiTuningFeedback, setAiTuningFeedback] = useState<string>('');

  const handleApplyAITuning = () => {
    const tuning = getBiometricTuning(form);
    const updated: UserProfile = {
      ...form,
      adaptationGuidance: `${tuning.squatStanceCue} ${tuning.pushupCue} ${tuning.tendonTempoCue}`,
      adaptationPhaseTitle: (form.age || 24) >= 40 ? 'Joint Longevity & Tendon Armor' : 'Tendon Remodeling & Progressive Load'
    };
    setForm(updated);
    onSaveProfile(updated);
    setAiTuningFeedback(`AI Biometrics Applied: Exercises tuned for your ${tuning.heightFormatted} frame & ${tuning.age}y tendons!`);
    setTimeout(() => setAiTuningFeedback(''), 4500);
  };

  const toggleJoint = (joint: BodyTarget) => {
    const current = form.jointPainAreas;
    const exists = current.includes(joint);
    const updated = exists ? current.filter((j) => j !== joint) : [...current, joint];
    const newForm = { ...form, jointPainAreas: updated };
    setForm(newForm);
    onSaveProfile(newForm);
  };

  const toggleEquipment = (id: string) => {
    const current = form.availableEquipment || [];
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [...current, id];
    const newForm = { ...form, availableEquipment: updated };
    setForm(newForm);
    onSaveProfile(newForm);
  };

  const selectAllEquipment = () => {
    const newForm = {
      ...form,
      availableEquipment: ALL_EQUIPMENT.map((e) => e.id)
    };
    setForm(newForm);
    onSaveProfile(newForm);
  };

  const selectBodyweightOnly = () => {
    const newForm = {
      ...form,
      availableEquipment: []
    };
    setForm(newForm);
    onSaveProfile(newForm);
  };

  const handleExecuteResetAll = () => {
    const updated: UserProfile = {
      ...form,
      maxDumbbellWeightKg: 0,
      maxBarbellWeightKg: 0,
      currentStreakDays: 0,
      completedWorkoutsCount: 0,
      lastWorkoutDate: '',
      tendonAdaptationWeeks: 0,
      connectiveTissueReadiness: 0,
      adaptationPhaseTitle: 'Phase 1: Baseline Joint & Ligament Remodeling (Week 0 of 6)',
      adaptationGuidance: 'Starting fresh at Week 0 Baseline. Tendons and ligaments take 6 weeks to remodel before load increases. Emphasize controlled 3s negatives and DRS time-under-tension to build foundational joint collagen.'
    };
    setForm(updated);
    onSaveProfile(updated);
    try {
      localStorage.setItem('shc_user_profile_v2', JSON.stringify(updated));
    } catch {}
    resetStrengthHistory();
    setShowResetConfirm(false);
    setSyncStatusMsg('Exercises, baseline, and remodeling phase successfully reset to Week 0.');
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Connect email for cross-device cloud sync
  const handleConnectEmail = () => {
    if (!form.cloudSyncEmail || !form.cloudSyncEmail.includes('@')) {
      setSyncStatusMsg('Please enter a valid email address.');
      setTimeout(() => setSyncStatusMsg(''), 3000);
      return;
    }

    const deviceToken = `SYNC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: UserProfile = {
      ...form,
      email: form.cloudSyncEmail,
      cloudSyncConnected: true,
      syncDeviceToken: deviceToken,
      lastSyncTimestamp: nowTime
    };
    setForm(updated);
    onSaveProfile(updated);
    setSyncStatusMsg(`Connected as ${form.cloudSyncEmail}. Sync active!`);
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  const handleDisconnectEmail = () => {
    const updated: UserProfile = {
      ...form,
      cloudSyncConnected: false,
      syncDeviceToken: undefined,
      lastSyncTimestamp: undefined
    };
    setForm(updated);
    onSaveProfile(updated);
    setSyncStatusMsg('Email account disconnected.');
    setTimeout(() => setSyncStatusMsg(''), 3000);
  };

  const handleManualSyncNow = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: UserProfile = {
      ...form,
      lastSyncTimestamp: nowTime
    };
    setForm(updated);
    onSaveProfile(updated);
    setSyncStatusMsg(`Data synced to cloud at ${nowTime}!`);
    setTimeout(() => setSyncStatusMsg(''), 3500);
  };

  // Generate portable cross-device sync payload
  const generateSyncPayload = () => {
    try {
      const payload = {
        app: 'smart-home-calisthenics-v2',
        version: 3,
        email: form.cloudSyncEmail || form.email || 'athlete@local',
        exportedAt: new Date().toISOString(),
        profile: form,
        templates: JSON.parse(localStorage.getItem('shc_templates_v2') || '[]'),
        history: JSON.parse(localStorage.getItem('shc_strength_history_v5') || '[]')
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch {
      return '';
    }
  };

  const handleCopySyncCode = () => {
    const code = generateSyncPayload();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedSyncCode(true);
      setTimeout(() => setCopiedSyncCode(false), 3000);
    }
  };

  const handleRestoreFromCode = () => {
    setRestoreError('');
    setRestoreSuccess(false);
    if (!restoreCodeInput.trim()) {
      setRestoreError('Please paste your device sync code first.');
      return;
    }

    try {
      const decodedJson = decodeURIComponent(escape(atob(restoreCodeInput.trim())));
      const parsed = JSON.parse(decodedJson);

      if (!parsed.profile) {
        setRestoreError('Invalid sync code format.');
        return;
      }

      if (parsed.templates && Array.isArray(parsed.templates)) {
        localStorage.setItem('shc_templates_v2', JSON.stringify(parsed.templates));
      }
      if (parsed.history && Array.isArray(parsed.history)) {
        const cleanHistory = parsed.history.filter((h: any) => h && h.date && !isPreCreationDate(h.date));
        localStorage.setItem('shc_strength_history_v5', JSON.stringify(cleanHistory));
        localStorage.removeItem('shc_strength_history_v3');
        localStorage.removeItem('shc_strength_history_v2');
      }

      const rawLastDate = parsed.profile?.lastWorkoutDate;
      const sanitizedLastDate = rawLastDate && !isPreCreationDate(rawLastDate) ? rawLastDate : '';

      const mergedProfile: UserProfile = {
        ...form,
        ...parsed.profile,
        lastWorkoutDate: sanitizedLastDate,
        cloudSyncConnected: true,
        lastSyncTimestamp: 'Just now'
      };

      setForm(mergedProfile);
      onSaveProfile(mergedProfile);

      if (onRestoreAllData) {
        onRestoreAllData(decodedJson);
      }

      setRestoreSuccess(true);
      setRestoreCodeInput('');
      setTimeout(() => setRestoreSuccess(false), 5000);
    } catch (err) {
      setRestoreError('Failed to decode sync payload. Check that the full code was copied.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Athlete Settings & Equipment</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal biometrics, owned gym equipment, bedroom barbell specs, joint protections, and cross-device sync.
        </p>
      </div>

      {/* Settings Navigation Tabs for Quick Organization */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/5 scrollbar-none">
        <button
          onClick={() => setActiveSettingsTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeSettingsTab === 'all'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          All Settings
        </button>

        <button
          onClick={() => setActiveSettingsTab('equipment')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeSettingsTab === 'equipment'
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <Wrench size={13} />
          <span>Owned Equipment ({form.availableEquipment.length})</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('biometrics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeSettingsTab === 'biometrics'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <User size={13} />
          <span>Biometrics & Goals</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('hardware')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeSettingsTab === 'hardware'
              ? 'bg-amber-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <Layers size={13} />
          <span>Bedroom Barbell & DBs</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('joints')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeSettingsTab === 'joints'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <ShieldCheck size={13} />
          <span>Joint Protections</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('sync')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeSettingsTab === 'sync'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <Cloud size={13} />
          <span>Cloud & Sync</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('pwa')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeSettingsTab === 'pwa'
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <Smartphone size={13} />
          <span>App & PWA Mode</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==================================================== */}
        {/* SECTION 1: OWNED EQUIPMENT & AUTO-SWAP (REQUESTED) */}
        {/* ==================================================== */}
        {(activeSettingsTab === 'all' || activeSettingsTab === 'equipment') && (
          <div className="bg-[#12141c] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Wrench size={16} className="text-emerald-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">Owned Equipment & Biomechanical Auto-Swap</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check the equipment you own in your room. The coach automatically substitutes missing gear with wrist-safe calisthenics regressions.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={selectAllEquipment}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-white/5 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={selectBodyweightOnly}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20 cursor-pointer"
                >
                  Bodyweight Only
                </button>
              </div>
            </div>

            {/* Equipment Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {ALL_EQUIPMENT.map((item) => {
                const isOwned = (form.availableEquipment || []).includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleEquipment(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isOwned
                        ? 'bg-[#151926] border-emerald-500/40 shadow-md shadow-emerald-500/5'
                        : 'bg-black/30 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isOwned ? 'bg-emerald-500 text-black font-bold' : 'border border-white/20'
                        }`}>
                          {isOwned && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-500">Auto-Fallback:</span>
                      <span className={`font-medium truncate ${isOwned ? 'text-slate-400' : 'text-emerald-400'}`}>
                        {item.calisthenicsFallback}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ==================================================== */}
        {/* SECTION 2: BASIC INFORMATION & AI EXERCISE TUNING    */}
        {/* ==================================================== */}
        {(activeSettingsTab === 'all' || activeSettingsTab === 'biometrics') && (() => {
          const tuning = getBiometricTuning(form);

          return (
            <div className="bg-[#12141c] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Pull-down Accordion Header */}
              <div
                onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                className="flex items-center justify-between cursor-pointer select-none border-b border-white/5 pb-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-cyan-400" />
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      Basic Information About Me
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Pull-Down Menus
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your height, age, weight, and body levers from the pull-down menus. AI dynamically tunes your exercises, squat stances, and tempos.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-xl">
                    <span className="text-cyan-400 font-bold">{tuning.heightFormatted}</span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">{tuning.age}y</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold uppercase">{tuning.leverCategory}</span>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  >
                    {isBasicInfoExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {isBasicInfoExpanded && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Grid of Pull-Down Menus */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. HEIGHT PULL-DOWN MENU */}
                    <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase text-cyan-300 font-bold flex items-center gap-1.5">
                          <span>1. Height (Pull-Down)</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tuning.heightFormatted}
                        </span>
                      </div>

                      {!customHeightMode ? (
                        <select
                          value={form.heightCm}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setCustomHeightMode(true);
                            } else {
                              const newHeight = parseFloat(val);
                              const newLimb: 'long_levers' | 'short_compact' | 'balanced' =
                                newHeight >= 178 ? 'long_levers' : newHeight <= 168 ? 'short_compact' : 'balanced';
                              const updated: UserProfile = { ...form, heightCm: newHeight, limbLeverType: newLimb };
                              setForm(updated);
                              onSaveProfile(updated);
                            }
                          }}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value={150}>150 cm (4'11") · Ultra-Compact Levers</option>
                          <option value={155}>155 cm (5'1") · Compact Levers</option>
                          <option value={160}>160 cm (5'3") · Compact Levers</option>
                          <option value={165}>165 cm (5'5") · Compact Power Levers</option>
                          <option value={168}>168 cm (5'6") · Compact Levers</option>
                          <option value={170}>170 cm (5'7") · Balanced Levers</option>
                          <option value={172}>172 cm (5'8") · Balanced Levers</option>
                          <option value={175}>175 cm (5'9") · Balanced Levers (Standard)</option>
                          <option value={178}>178 cm (5'10") · Extended Levers</option>
                          <option value={180}>180 cm (5'11") · Long Limb Levers</option>
                          <option value={183}>183 cm (6'0") · Long Limb Levers</option>
                          <option value={185}>185 cm (6'1") · Long Limb Levers</option>
                          <option value={188}>188 cm (6'2") · Long Limb Levers</option>
                          <option value={190}>190 cm (6'3") · Long Limb Levers</option>
                          <option value={195}>195 cm (6'5") · High Moment Arm Levers</option>
                          <option value={200}>200 cm (6'7") · High Moment Arm Levers</option>
                          <option value="custom">✏️ Enter Custom Height (cm)...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="120"
                            max="230"
                            value={form.heightCm}
                            onChange={(e) => {
                              const newHeight = parseFloat(e.target.value) || 175;
                              const updated = { ...form, heightCm: newHeight };
                              setForm(updated);
                              onSaveProfile(updated);
                            }}
                            className="flex-1 px-3 py-2 bg-black/60 border border-cyan-400 rounded-xl text-white font-mono text-xs focus:outline-none"
                            placeholder="Enter cm"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomHeightMode(false)}
                            className="px-2.5 py-2 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-[11px] font-mono cursor-pointer"
                          >
                            Menu
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Tunes your squat foot flare, stance width, and pushup moment arm.
                      </p>
                    </div>

                    {/* 2. AGE PULL-DOWN MENU */}
                    <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase text-amber-300 font-bold flex items-center gap-1.5">
                          <span>2. Age (Pull-Down)</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tuning.age} years old
                        </span>
                      </div>

                      {!customAgeMode ? (
                        <select
                          value={form.age || 24}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setCustomAgeMode(true);
                            } else {
                              const newAge = parseInt(val, 10);
                              const updated = { ...form, age: newAge };
                              setForm(updated);
                              onSaveProfile(updated);
                            }
                          }}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value={16}>16 yrs (Teen · High Tendon Elasticity)</option>
                          <option value={18}>18 yrs (Teen · High Tendon Elasticity)</option>
                          <option value={20}>20 yrs (Peak Elasticity & Fast Recovery)</option>
                          <option value={22}>22 yrs (Peak Elasticity & Fast Recovery)</option>
                          <option value={24}>24 yrs (Peak Elasticity · Standard 3s Negatives)</option>
                          <option value={26}>26 yrs (High Tendon Capacity · Pre-Hab Focus)</option>
                          <option value={28}>28 yrs (High Tendon Capacity · Tendon Armor)</option>
                          <option value={30}>30 yrs (Prime · Structured Tendon Warmups)</option>
                          <option value={32}>32 yrs (Prime · Joint Longevity Priority)</option>
                          <option value={35}>35 yrs (Prime · Synovial Mobility Focus)</option>
                          <option value={38}>38 yrs (Prime · Joint Protection Focus)</option>
                          <option value={40}>40 yrs (Master · Strict Joint Armor & 4s Negatives)</option>
                          <option value={45}>45 yrs (Master · Controlled Eccentrics & 75s Rest)</option>
                          <option value={50}>50 yrs (Master · Low Impact & Tendon Preservation)</option>
                          <option value={55}>55+ yrs (Master · Ultra-Safe Joint Armor)</option>
                          <option value="custom">✏️ Enter Custom Age...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="14"
                            max="90"
                            value={form.age || 24}
                            onChange={(e) => {
                              const newAge = parseInt(e.target.value, 10) || 24;
                              const updated = { ...form, age: newAge };
                              setForm(updated);
                              onSaveProfile(updated);
                            }}
                            className="flex-1 px-3 py-2 bg-black/60 border border-amber-400 rounded-xl text-white font-mono text-xs focus:outline-none"
                            placeholder="Enter age"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomAgeMode(false)}
                            className="px-2.5 py-2 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-[11px] font-mono cursor-pointer"
                          >
                            Menu
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Calibrates tendon remodeling speed, rest between sets, and negative tempo.
                      </p>
                    </div>

                    {/* 3. WEIGHT PULL-DOWN MENU */}
                    <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase text-emerald-300 font-bold flex items-center gap-1.5">
                          <span>3. Body Weight (Pull-Down)</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">
                          {form.weightKg} kg ({Math.round(form.weightKg * 2.20462)} lbs)
                        </span>
                      </div>

                      {!customWeightMode ? (
                        <select
                          value={form.weightKg}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setCustomWeightMode(true);
                            } else {
                              const newWeight = parseFloat(val);
                              const updated = { ...form, weightKg: newWeight };
                              setForm(updated);
                              onSaveProfile(updated);
                            }
                          }}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                        >
                          <option value={50}>50 kg (110 lbs)</option>
                          <option value={55}>55 kg (121 lbs)</option>
                          <option value={60}>60 kg (132 lbs)</option>
                          <option value={65}>65 kg (143 lbs)</option>
                          <option value={70}>70 kg (154 lbs) - Standard</option>
                          <option value={75}>75 kg (165 lbs)</option>
                          <option value={80}>80 kg (176 lbs)</option>
                          <option value={85}>85 kg (187 lbs)</option>
                          <option value={90}>90 kg (198 lbs)</option>
                          <option value={95}>95 kg (209 lbs)</option>
                          <option value={100}>100 kg (220 lbs)</option>
                          <option value={105}>105 kg (231 lbs)</option>
                          <option value={110}>110 kg (242 lbs)</option>
                          <option value="custom">✏️ Enter Custom Weight (kg)...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            min="35"
                            max="200"
                            value={form.weightKg}
                            onChange={(e) => {
                              const newWeight = parseFloat(e.target.value) || 70;
                              const updated = { ...form, weightKg: newWeight };
                              setForm(updated);
                              onSaveProfile(updated);
                            }}
                            className="flex-1 px-3 py-2 bg-black/60 border border-emerald-400 rounded-xl text-white font-mono text-xs focus:outline-none"
                            placeholder="Enter kg"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomWeightMode(false)}
                            className="px-2.5 py-2 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-[11px] font-mono cursor-pointer"
                          >
                            Menu
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Used for calisthenics bodyweight loading and relative power ratio.
                      </p>
                    </div>

                    {/* 4. LIMB & LEVER MECHANICS PULL-DOWN MENU */}
                    <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                      <label className="text-xs font-mono uppercase text-cyan-300 font-bold block">
                        4. Limb Lever Mechanics
                      </label>
                      <select
                        value={form.limbLeverType || (form.heightCm >= 178 ? 'long_levers' : form.heightCm <= 168 ? 'short_compact' : 'balanced')}
                        onChange={(e) => {
                          const updated = { ...form, limbLeverType: e.target.value as any };
                          setForm(updated);
                          onSaveProfile(updated);
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="balanced">Balanced Proportions (Equal femur / torso ratio)</option>
                        <option value="long_levers">Long Limbs & Femurs (High joint torque; wide squat stance)</option>
                        <option value="short_compact">Compact / Short Levers (Calisthenics mechanical advantage)</option>
                      </select>
                      <p className="text-[10px] text-slate-400">
                        Calibrates moment arms on hollow holds, floor presses, and squats.
                      </p>
                    </div>

                    {/* 5. WORKOUT SCHEDULE PULL-DOWN MENU (REQUESTED 4x/WEEK) */}
                    <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                      <label className="text-xs font-mono uppercase text-emerald-300 font-bold block">
                        5. Weekly Schedule
                      </label>
                      <select
                        value={form.workoutsPerWeek}
                        onChange={(e) => {
                          const updated = { ...form, workoutsPerWeek: parseInt(e.target.value, 10) || 4 };
                          setForm(updated);
                          onSaveProfile(updated);
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                      >
                        <option value={4}>4 sessions/week (Mon, Wed, Thu, Fri) - PPL + Calisthenics [Active]</option>
                        <option value={3}>3 sessions/week (Mon, Wed, Fri) - Full Body Armor</option>
                        <option value={5}>5 sessions/week (Mon - Fri) - Advanced Hybrid</option>
                      </select>
                      <p className="text-[10px] text-slate-400">
                        Includes Tue, Sat, Sun as dedicated rest & tendon remodeling days.
                      </p>
                    </div>

                    {/* 6. ATHLETE NAME */}
                    <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                      <label className="text-xs font-mono uppercase text-slate-300 font-bold block">
                        6. Athlete Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          const updated = { ...form, name: e.target.value };
                          setForm(updated);
                          onSaveProfile(updated);
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-white/20"
                        placeholder="Your Name"
                      />
                      <p className="text-[10px] text-slate-400">
                        Used across coaching chats, sync accounts, and milestone badges.
                      </p>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* LIVE AI BIOMECHANICAL EXERCISE TUNING CARD               */}
                  {/* ========================================================= */}
                  <div className="bg-gradient-to-br from-[#101420] via-[#0d1019] to-[#0a0c12] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white tracking-tight">
                              AI Biomechanical Tuning Engine
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active Live Calibration
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Dynamically calibrated for your <strong className="text-white">{tuning.heightFormatted}</strong> frame and <strong className="text-white">{tuning.age}y</strong> tendons.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyAITuning}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Zap size={14} />
                        <span>Apply AI Tuning to All Workouts</span>
                      </button>
                    </div>

                    {/* AI Feedback Banner */}
                    {aiTuningFeedback && (
                      <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>{aiTuningFeedback}</span>
                      </div>
                    )}

                    {/* 4 Dimension Calibration Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. Squat & Femur Lever Stance */}
                      <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                            <span className="text-cyan-400">🦵</span>
                            Squats & Knee-Tracking
                          </span>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {tuning.leverCategory === 'tall' ? '1.25× Wide Stance' : tuning.leverCategory === 'compact' ? 'Compact 1.0× Stance' : '1.1× Balanced Stance'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {tuning.squatStanceCue}
                        </p>
                      </div>

                      {/* 2. Pushups & Wrist Armor */}
                      <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                            <span className="text-emerald-400">🛡️</span>
                            Pushups & Pressing
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {tuning.leverCategory === 'tall' ? 'Neutral Handles / Incline' : 'Floor Pushups'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {tuning.pushupCue}
                        </p>
                      </div>

                      {/* 3. Calisthenics Core & Levers */}
                      <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                            <span className="text-amber-400">⚡</span>
                            Calisthenics Levers
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                            {tuning.leverCategory === 'tall' ? 'Tucked Holds Mandatory' : 'Full Leverage Progression'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {tuning.calisthenicsLeverCue}
                        </p>
                      </div>

                      {/* 4. Age & Tendon Remodeling Tempo */}
                      <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                            <span className="text-teal-400">⏳</span>
                            Tendon Tempo & Rest
                          </span>
                          <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded">
                            {tuning.aiTunedTempo} · {tuning.aiTunedRestSec}s Rest
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {tuning.tendonTempoCue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ==================================================== */}
        {/* SECTION 3: BEDROOM BARBELL & DUMBBELL HARDWARE */}
        {/* ==================================================== */}
        {(activeSettingsTab === 'all' || activeSettingsTab === 'hardware') && (
          <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
              <Layers size={15} className="text-amber-400" />
              <span>Bedroom Barbell & Dumbbell Hardware Specs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Barbell Bar Weight */}
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="block text-xs font-mono uppercase text-amber-300">
                  Bedroom Barbell Bar Weight
                </label>
                <select
                  value={form.barbellBarWeightKg || 8}
                  onChange={(e) => setForm({ ...form, barbellBarWeightKg: parseFloat(e.target.value) || 8 })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value={6}>6 kg (Compact Bedroom Bar)</option>
                  <option value={8}>8 kg (Standard Bedroom Bar)</option>
                  <option value={10}>10 kg (Medium Home Bar)</option>
                  <option value={15}>15 kg (Short Gym Bar)</option>
                  <option value={20}>20 kg (Full Olympic Gym Bar)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Your plate calculations subtract this bar weight before recommending plates per side.
                </p>
              </div>

              {/* Workout Environment */}
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="block text-xs font-mono uppercase text-emerald-300">
                  Workout Environment
                </label>
                <select
                  value={form.workoutEnvironment || 'bedroom'}
                  onChange={(e) => setForm({ ...form, workoutEnvironment: e.target.value as any })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="bedroom">Bedroom (Light Barbell & Adjustable Dumbbells)</option>
                  <option value="gym">Commercial Gym (Heavy Barbells & Racks)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Enforces bedroom safety protocols such as floor presses instead of unspotted benches.
                </p>
              </div>

              {/* Dumbbell Handle Weight */}
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="block text-xs font-mono uppercase text-cyan-300">
                  Dumbbell Handle Weight
                </label>
                <select
                  value={form.dumbbellHandleWeightKg || 2}
                  onChange={(e) => setForm({ ...form, dumbbellHandleWeightKg: parseFloat(e.target.value) || 2 })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value={1.5}>1.5 kg Light Handle</option>
                  <option value={2}>2.0 kg Standard Threaded Handle</option>
                  <option value={2.5}>2.5 kg Heavy Spinlock Handle</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Each dumbbell side sleeve accommodates up to {form.maxPlatesPerSleeve || 5} plates.
                </p>
              </div>

              {/* Max Plates per Sleeve */}
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Max Plates Per Dumbbell Sleeve
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={form.maxPlatesPerSleeve || 5}
                  onChange={(e) => setForm({ ...form, maxPlatesPerSleeve: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
                <p className="text-[11px] text-slate-400">
                  Physical collar safety limit to guarantee spinlock nut threads engage securely.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 4: JOINT PROTECTION ARMOR */}
        {/* ==================================================== */}
        {(activeSettingsTab === 'all' || activeSettingsTab === 'joints') && (
          <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Joint Sensitivity & Injury Prevention Armor</span>
              </h3>
              <span className="text-[11px] text-slate-400">Select any sensitive joints</span>
            </div>

            <div className="space-y-2.5">
              {ALL_JOINTS.map((j) => {
                const isChecked = form.jointPainAreas.includes(j.id);
                return (
                  <div
                    key={j.id}
                    onClick={() => toggleJoint(j.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-black/30 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{j.label}</span>
                        {isChecked && (
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/15 px-1.5 py-0.2 rounded">
                            Protection Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{j.description}</p>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'bg-emerald-500 text-black font-bold' : 'border border-white/20'
                    }`}>
                      {isChecked && <CheckCircle size={13} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 5: AUDIO EXPERIENCE & SPOTIFY */}
        {/* ==================================================== */}
        {activeSettingsTab === 'all' && (
          <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-white/5 pb-2">
              Audio Experience & Voice Coach
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-black/30 rounded-2xl border border-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${form.voiceCoachEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                    {form.voiceCoachEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Voice Coach Announcements</div>
                    <div className="text-[11px] text-slate-400">Synthesizes voice countdowns, cues, and form tips via browser speech</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.voiceCoachEnabled}
                  onChange={(e) => setForm({ ...form, voiceCoachEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-black/30 rounded-2xl border border-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#1ed760]/20 text-[#1ed760]">
                    <Activity size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Spotify Workout Sound Player</div>
                    <div className="text-[11px] text-slate-400">Shows floating workout music player in dashboard & workout session</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.spotifyConnected}
                  onChange={(e) => setForm({ ...form, spotifyConnected: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
              </label>

              {form.spotifyConnected && (
                <div className="pt-1">
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Spotify Embed URL</label>
                  <input
                    type="text"
                    value={form.spotifyPlaylistUrl}
                    onChange={(e) => setForm({ ...form, spotifyPlaylistUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#1ed760]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION 6: EMAIL & CROSS-DEVICE CLOUD SYNC */}
        {/* ==================================================== */}
        {(activeSettingsTab === 'all' || activeSettingsTab === 'sync') && (
          <div className="bg-[#12141c] border border-cyan-500/20 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Cloud size={16} className="text-cyan-400" />
                <span>Email Account & Cross-Device Cloud Sync</span>
              </h3>
              {form.cloudSyncConnected && (
                <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CloudCheck size={11} />
                  <span>Sync Active</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your email account to keep your workout routines, strength progression history, custom templates, and streaks synchronized across your phone, tablet, and computer.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400">Email Address</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="youremail@example.com"
                    value={form.cloudSyncEmail || form.email || ''}
                    onChange={(e) => setForm({ ...form, cloudSyncEmail: e.target.value, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                  />
                </div>

                {!form.cloudSyncConnected ? (
                  <button
                    type="button"
                    onClick={handleConnectEmail}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <Cloud size={14} />
                    <span>Connect & Sync</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleManualSyncNow}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                    >
                      <RefreshCw size={13} className="text-cyan-400" />
                      <span>Sync Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectEmail}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium rounded-xl text-xs transition-colors shrink-0 border border-rose-500/20 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Device Transfer & Restore Tools */}
            <div className="pt-3 border-t border-white/5 space-y-3">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Smartphone size={13} className="text-slate-400" />
                <span>Device-to-Device Sync Code Transfer:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-white block">Copy Device Sync Code</span>
                  <p className="text-[11px] text-slate-400">
                    Copies your full profile, workout templates, weights, and streak to clipboard.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopySyncCode}
                    className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                  >
                    {copiedSyncCode ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">Sync Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Sync Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-white block">Restore on New Device</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Paste sync code here..."
                      value={restoreCodeInput}
                      onChange={(e) => setRestoreCodeInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleRestoreFromCode}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                  {restoreError && <span className="text-[10px] text-rose-400 block">{restoreError}</span>}
                  {restoreSuccess && <span className="text-[10px] text-emerald-400 block font-medium">✓ Restored successfully!</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION: APP INSTALLATION & OFFLINE PWA */}
        {/* ==================================================== */}
        {(activeSettingsTab === 'all' || activeSettingsTab === 'pwa') && (
          <div className="bg-[#12141c] border border-cyan-500/20 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Smartphone size={16} className="text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">App Installation & Offline PWA</h3>
            </div>
            <p className="text-xs text-slate-300">
              Install Smart Hybrid Coach as a standalone app on iOS, Android, or your computer desktop. It opens directly in fullscreen without browser bars, runs fast, and caches all workout timers, bedroom barbell calculators, and plate math offline.
            </p>
            <PWAInstallButton variant="card" />
          </div>
        )}

        {/* ==================================================== */}
        {/* DANGER / RESET BASELINE & PHASE ZONE                 */}
        {/* ==================================================== */}
        <div className="bg-red-950/20 border border-red-500/20 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
              <RotateCcw size={16} className="text-red-400" />
              <span>Reset Exercise, Baseline & Remodeling Phase to Zero</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Reset all completed workout counters, streaks, exercise baseline records (0kg DB / 0kg BB), and joint adaptation cycle back to Week 0 Baseline.
            </p>
          </div>
          {showResetConfirm ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteResetAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-red-900/30"
              >
                Confirm Reset to 0
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset All to Zero</span>
            </button>
          )}
        </div>

        {/* Sticky/Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle size={15} />
              <span>Settings successfully saved!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500">Settings save automatically and persist across refreshes</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Save size={15} />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
