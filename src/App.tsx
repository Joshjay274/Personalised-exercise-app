import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Flame,
  ShieldCheck,
  Dumbbell,
  Sliders,
  Settings,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  Wrench,
  Check,
  Award,
  Zap,
  Cloud,
  RefreshCw,
  Bot,
  Send
} from 'lucide-react';
import { NavTab, UserProfile, WorkoutTemplate, CompletedWorkoutSummary, BodyTarget, Exercise } from './types';
import { INITIAL_USER_PROFILE, INITIAL_TEMPLATES, FOUR_DAY_ROUTINES } from './data/templates';
import { EXERCISE_DATABASE } from './data/exercises';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ActivityAICoachCard } from './components/ActivityAICoachCard';
import { CloudSyncCard } from './components/CloudSyncCard';
import { BiometricsSettingsCard } from './components/BiometricsSettingsCard';
import { fetchCloudData, saveCloudData } from './utils/cloudSync';
import {
  getStrengthHistory,
  saveStrengthCheckpoint,
  resetStrengthHistory,
  getLocalDateString,
  isPreCreationDate,
  getDayNumberFromDateString
} from './utils/historyStorage';
import { StrengthHistoryEntry } from './types';
import { speakCoachVoice } from './utils/audio';

// Visual demonstration previews for the 4 split routines
const ROUTINE_HERO_IMAGES: Record<string, string> = {
  template_ppl_push: '/src/assets/images/pushup_demonstration_1791586932834.jpg',
  template_joint_core: '/src/assets/images/forearm_plank_demo_1791586963855.jpg',
  template_ppl_legs: '/src/assets/images/barbell_squat_demo_1791586954855.jpg',
  template_ppl_pull: '/src/assets/images/hammer_curl_demo_1791586974354.jpg'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'stats' | 'profile'>('dashboard');

  // Persisted User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window === 'undefined') return INITIAL_USER_PROFILE;
    try {
      localStorage.removeItem('shc_user_profile');
    } catch {}

    const saved = localStorage.getItem('shc_user_profile_v2');
    if (!saved) return INITIAL_USER_PROFILE;
    try {
      const parsed = JSON.parse(saved);
      parsed.maxDumbbellWeightKg = 0; // User request: Change longest dumbbell weight to 0
      if (parsed.lastWorkoutDate && isPreCreationDate(parsed.lastWorkoutDate)) {
        parsed.lastWorkoutDate = '';
        parsed.currentStreakDays = 0;
        parsed.completedWorkoutsCount = 0;
      }
      if (!parsed.lastWorkoutDate || !parsed.completedWorkoutsCount || parsed.completedWorkoutsCount === 0) {
        parsed.currentStreakDays = 0;
        parsed.completedWorkoutsCount = 0;
        parsed.tendonAdaptationWeeks = 0;
        parsed.connectiveTissueReadiness = 0;
        parsed.maxBarbellWeightKg = 0;
        parsed.adaptationPhaseTitle = 'Phase 1: Baseline Joint & Ligament Remodeling (Week 0 of 6)';
        parsed.adaptationGuidance = 'Starting fresh at Week 0 Baseline. Tendons and ligaments take 6 weeks to remodel before load increases. Emphasize controlled 3s negatives and DRS time-under-tension to build foundational joint collagen.';
      }
      if ((parsed.completedWorkoutsCount || 0) < 4) {
        parsed.tendonAdaptationWeeks = 0;
        parsed.connectiveTissueReadiness = 0;
        parsed.adaptationPhaseTitle = 'Phase 1: Baseline Joint & Ligament Remodeling (Week 0 of 6)';
      }
      return { ...INITIAL_USER_PROFILE, ...parsed, maxDumbbellWeightKg: 0 };
    } catch {
      return { ...INITIAL_USER_PROFILE, maxDumbbellWeightKg: 0 };
    }
  });

  // Schedule date (defaults to today)
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    const todayStr = getLocalDateString();
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('shc_user_profile_v2') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastWorkoutDate && !isPreCreationDate(parsed.lastWorkoutDate)) {
          return parsed.lastWorkoutDate;
        }
      }
    } catch {}
    return todayStr;
  });

  // Templates list
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TEMPLATES;
    const saved = localStorage.getItem('shc_templates_v2');
    if (!saved) return INITIAL_TEMPLATES;
    try {
      const parsed = JSON.parse(saved);
      const initialMap = new Map<string, WorkoutTemplate>();
      INITIAL_TEMPLATES.forEach((t) => initialMap.set(t.id, t));
      if (Array.isArray(parsed)) {
        parsed.forEach((t: WorkoutTemplate) => {
          if (t && t.id && (t.id.startsWith('custom_') || !initialMap.has(t.id))) {
            initialMap.set(t.id, t);
          }
        });
      }
      return Array.from(initialMap.values());
    } catch {
      return INITIAL_TEMPLATES;
    }
  });

  // Active workout state
  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState<WorkoutTemplate | null>(null);
  const [completedSummary, setCompletedSummary] = useState<CompletedWorkoutSummary | null>(null);
  const [streakCelebrated, setStreakCelebrated] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<WorkoutTemplate | null>(null);
  const [showWeightAdjustModal, setShowWeightAdjustModal] = useState<boolean>(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState<boolean>(false);

  // Strength progression history
  const [strengthHistory, setStrengthHistory] = useState<StrengthHistoryEntry[]>(() => {
    return getStrengthHistory();
  });

  // Auto-dismiss streak celebration after 10s
  useEffect(() => {
    if (streakCelebrated) {
      const timer = setTimeout(() => setStreakCelebrated(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [streakCelebrated]);

  // Sync profile & templates
  useEffect(() => {
    localStorage.setItem('shc_user_profile_v2', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('shc_templates_v2', JSON.stringify(templates));
  }, [templates]);

  // Cloud sync state
  const [emailInput, setEmailInput] = useState<string>(userProfile.cloudSyncEmail || userProfile.email || '');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Auto-fetch from cloud on startup if email is saved
  useEffect(() => {
    const syncEmail = userProfile.cloudSyncEmail || userProfile.email;
    if (syncEmail && syncEmail.includes('@')) {
      fetchCloudData(syncEmail).then((res) => {
        if (res.found && res.userProfile) {
          setUserProfile((prev) => ({
            ...prev,
            ...res.userProfile,
            cloudSyncEmail: syncEmail,
            cloudSyncConnected: true,
            lastSyncTimestamp: res.lastUpdated
          }));
          if (res.strengthHistory && res.strengthHistory.length > 0) {
            setStrengthHistory(res.strengthHistory);
          }
          if (res.templates && res.templates.length > 0) {
            setTemplates(res.templates);
          }
        }
      }).catch(console.error);
    }
  }, []);

  const handleSaveCloudSync = async (emailOverride?: string) => {
    const target = (emailOverride || emailInput).trim();
    if (!target || !target.includes('@')) {
      setSyncMessage('Please enter a valid email address');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Syncing to cloud...');
    try {
      const updatedProfile = {
        ...userProfile,
        cloudSyncEmail: target,
        email: target,
        cloudSyncConnected: true
      };
      const res = await saveCloudData(target, updatedProfile, strengthHistory, templates);
      if (res.success) {
        setUserProfile({
          ...updatedProfile,
          lastSyncTimestamp: res.lastUpdated
        });
        setSyncMessage(`✓ Synced across devices with ${target}!`);
        setTimeout(() => setSyncMessage(''), 5000);
      } else {
        setSyncMessage(`Sync error: ${res.error || 'Server error'}`);
      }
    } catch (e: any) {
      setSyncMessage(`Sync error: ${e?.message || 'Network error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFetchCloudSync = async (emailOverride?: string) => {
    const target = (emailOverride || emailInput).trim();
    if (!target || !target.includes('@')) {
      setSyncMessage('Please enter a valid email address');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Connecting to cloud...');
    try {
      const res = await fetchCloudData(target);
      if (res.found && res.userProfile) {
        setUserProfile((prev) => ({
          ...prev,
          ...res.userProfile,
          cloudSyncEmail: target,
          email: target,
          cloudSyncConnected: true,
          lastSyncTimestamp: res.lastUpdated
        }));
        if (res.strengthHistory && res.strengthHistory.length > 0) {
          setStrengthHistory(res.strengthHistory);
        }
        if (res.templates && res.templates.length > 0) {
          setTemplates(res.templates);
        }
        setSyncMessage(`✓ Loaded data from cloud for ${target}!`);
        setTimeout(() => setSyncMessage(''), 5000);
      } else {
        setSyncMessage(`No remote profile found. Creating cloud backup for ${target}...`);
        await handleSaveCloudSync(target);
      }
    } catch (e: any) {
      setSyncMessage(`Fetch error: ${e?.message || 'Network error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset exercise progress, baseline load assessment, and 6-week remodeling phase to zero
  const handleResetAllBaselineAndPhase = () => {
    setIsResetConfirmModalOpen(true);
  };

  const handleExecuteReset = () => {
    const resetProfile: UserProfile = {
      ...userProfile,
      maxDumbbellWeightKg: 0,
      maxBarbellWeightKg: 0,
      completedWorkoutsCount: 0,
      currentStreakDays: 0,
      lastWorkoutDate: '',
      tendonAdaptationWeeks: 0,
      connectiveTissueReadiness: 0,
      adaptationPhaseTitle: 'Phase 1: Baseline Joint & Ligament Remodeling (Week 0 of 6)',
      adaptationGuidance: 'Starting fresh at Week 0 Baseline. Tendons and ligaments take 6 weeks to remodel before load increases. Emphasize controlled 3s negatives and DRS time-under-tension to build foundational joint collagen.'
    };
    setUserProfile(resetProfile);
    try {
      localStorage.setItem('shc_user_profile_v2', JSON.stringify(resetProfile));
    } catch {}

    const cleanHistory = resetStrengthHistory();
    setStrengthHistory(cleanHistory);
    setStreakCelebrated(false);
    setIsResetConfirmModalOpen(false);
    speakCoachVoice('Reset complete. Exercise and baseline initialized to Week 0 with 0 kilogram dumbbell load.', userProfile.voiceCoachEnabled);
  };

  // Workout Handlers
  const handleStartWorkout = (template: WorkoutTemplate) => {
    setPreviewTemplate(null);
    setActiveWorkoutTemplate(template);
    setActiveTab('workout');
    speakCoachVoice(`Starting session: ${template.name}. Joint protections active.`, userProfile.voiceCoachEnabled);
  };

  const handleFinishWorkout = (summary: CompletedWorkoutSummary) => {
    const performedNames = activeWorkoutTemplate?.exercises
      .map((id) => EXERCISE_DATABASE.find((e) => e.id === id)?.name)
      .filter((name): name is string => Boolean(name)) || [];

    setActiveWorkoutTemplate(null);
    setCompletedSummary(summary);

    const todayStr = getLocalDateString();
    setScheduleDate(todayStr);
    const prevDate = userProfile.lastWorkoutDate && !isPreCreationDate(userProfile.lastWorkoutDate) ? userProfile.lastWorkoutDate : '';
    let nextStreak = userProfile.currentStreakDays || 0;

    if (!prevDate) {
      nextStreak = 1;
    } else if (prevDate === todayStr) {
      nextStreak = Math.max(1, nextStreak);
    } else {
      const now = new Date();
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
      const twoDaysAgoStr = getLocalDateString(twoDaysAgo);

      if (prevDate === yesterdayStr || prevDate === twoDaysAgoStr) {
        nextStreak = nextStreak + 1;
      } else {
        nextStreak = 1;
      }
    }

    const totalDone = (userProfile.completedWorkoutsCount || 0) + 1;
    const targetWk = userProfile.workoutsPerWeek || 4;
    const newTendonWeeks = Math.min(6, Math.floor(totalDone / targetWk));
    const newReadiness = Math.min(100, Math.round((totalDone / (targetWk * 6)) * 100));
    const newPhaseTitle = newTendonWeeks >= 6
      ? 'Phase 2: Progressive Overload & Connective Strength'
      : `Phase 1: Baseline Joint & Ligament Remodeling (Week ${newTendonWeeks} of 6)`;

    const updatedProfile: UserProfile = {
      ...userProfile,
      completedWorkoutsCount: totalDone,
      currentStreakDays: nextStreak,
      lastWorkoutDate: todayStr,
      tendonAdaptationWeeks: newTendonWeeks,
      connectiveTissueReadiness: newReadiness,
      adaptationPhaseTitle: newPhaseTitle
    };
    setUserProfile(updatedProfile);

    const updated = saveStrengthCheckpoint(
      userProfile.maxDumbbellWeightKg,
      userProfile.maxBarbellWeightKg,
      summary.templateName,
      'Session completed with zero joint pain',
      performedNames
    );
    setStrengthHistory(updated);
    setStreakCelebrated(true);
    setActiveTab('dashboard');

    // Auto-sync to cloud across devices
    const syncEmail = updatedProfile.cloudSyncEmail || updatedProfile.email;
    if (syncEmail && syncEmail.includes('@')) {
      saveCloudData(syncEmail, updatedProfile, updated, templates).then((res) => {
        if (res.success) {
          setUserProfile((p) => ({ ...p, lastSyncTimestamp: res.lastUpdated }));
        }
      }).catch(console.error);
    }
  };

  const handleCancelWorkout = () => {
    setActiveWorkoutTemplate(null);
    setActiveTab('dashboard');
  };

  const toggleWristProtection = () => {
    const hasWristPain = userProfile.jointPainAreas.includes('wrists');
    const updated: BodyTarget[] = hasWristPain
      ? userProfile.jointPainAreas.filter((j) => j !== 'wrists')
      : [...userProfile.jointPainAreas, 'wrists'];
    setUserProfile({ ...userProfile, jointPainAreas: updated });
    speakCoachVoice(
      hasWristPain ? 'Wrist protection mode relaxed.' : 'Wrist armor activated. Neutral grips and forearm planks enforced.',
      userProfile.voiceCoachEnabled
    );
  };

  const toggleEquipment = (id: string) => {
    const current = userProfile.availableEquipment || [];
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [...current, id];
    setUserProfile({ ...userProfile, availableEquipment: updated });
  };

  // Today's scheduled routine
  const activeRoutine = FOUR_DAY_ROUTINES[0];
  const currentScheduleDayNumber = useMemo(() => getDayNumberFromDateString(scheduleDate), [scheduleDate]);
  const scheduledRoutineDay = activeRoutine.days.find((d) => d.dayNumber === currentScheduleDayNumber) || activeRoutine.days[0];
  const todaysRecommendedTemplate =
    (scheduledRoutineDay && templates.find((t) => t.id === scheduledRoutineDay.templateId)) ||
    templates[0] ||
    INITIAL_TEMPLATES[0];

  // Next upcoming workout day in the 4-day cycle
  const nextWorkoutDay = useMemo(() => {
    const workoutDays = activeRoutine.days.filter((d) => d.isWorkoutDay);
    return workoutDays.find((d) => d.dayNumber > currentScheduleDayNumber) || workoutDays[0];
  }, [activeRoutine, currentScheduleDayNumber]);

  const nextWorkoutTemplate = useMemo(() => {
    return (nextWorkoutDay && templates.find((t) => t.id === nextWorkoutDay.templateId)) || templates[0];
  }, [nextWorkoutDay, templates]);

  const handleNudgeDumbbellWeight = (delta: number) => {
    const minW = 0; // Allow down to 0kg (unweighted / clean baseline)
    const nextW = Math.max(minW, Math.min(40, Math.round((userProfile.maxDumbbellWeightKg + delta) * 10) / 10));
    setUserProfile((prev) => ({ ...prev, maxDumbbellWeightKg: nextW }));
    speakCoachVoice(nextW === 0 ? 'Dumbbell load set to 0 kilograms bodyweight' : `Dumbbell load set to ${nextW} kilograms`, userProfile.voiceCoachEnabled);
  };

  const handleNudgeBarbellWeight = (delta: number) => {
    const minW = 0; // Allow down to 0kg
    const nextW = Math.max(minW, Math.min(80, Math.round((userProfile.maxBarbellWeightKg + delta) * 10) / 10));
    setUserProfile((prev) => ({ ...prev, maxBarbellWeightKg: nextW }));
    speakCoachVoice(nextW === 0 ? 'Barbell load set to 0 kilograms' : `Barbell load set to ${nextW} kilograms`, userProfile.voiceCoachEnabled);
  };

  const hasWristArmor = userProfile.jointPainAreas.includes('wrists');

  // If workout player is active, render the focused workout session immediately
  if (activeTab === 'workout' && activeWorkoutTemplate) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
        <WorkoutPlayer
          template={activeWorkoutTemplate}
          userProfile={userProfile}
          onUpdateProfile={setUserProfile}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={handleCancelWorkout}
        />
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black pb-20 md:pb-6"
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* ==================================================== */}
      {/* CLEAN HOME WORKOUT APP HEADER */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Wordmark */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-sm shadow-md shadow-emerald-500/20">
              <Dumbbell size={16} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                Home Workout
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wide">
                Bedroom Hybrid · Joint Safe
              </span>
            </div>
          </div>

          {/* Quick Status Badges & Controls */}
          <div className="flex items-center gap-2">
            {/* Streak Counter Pill */}
            <button
              onClick={() => {
                setStreakCelebrated(true);
                setActiveTab('stats');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                streakCelebrated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-streak-celebrate shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
              title="Click to celebrate streak and view progress"
            >
              <Flame size={15} className={`text-amber-400 ${streakCelebrated ? 'animate-flame-bounce' : ''}`} />
              <span>{userProfile.currentStreakDays || 0}d</span>
            </button>

            {/* Wrist Armor Mode Toggle */}
            <button
              onClick={toggleWristProtection}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                hasWristArmor
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
              title={hasWristArmor ? 'Wrist Armor Active: Neutral grips prioritized' : 'Click to enable Wrist Armor Mode'}
            >
              <ShieldCheck size={14} className={hasWristArmor ? 'text-emerald-400' : 'text-slate-500'} />
              <span className="hidden sm:inline text-[11px] font-medium">
                {hasWristArmor ? 'Wrist Armor ON' : 'Standard'}
              </span>
            </button>

            {/* PWA Install Button (Header) */}
            <PWAInstallButton variant="header" />
          </div>
        </div>
      </header>

      {/* ==================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ==================================================== */}
        {/* TAB 1: WORKOUTS (MAIN HOME TRAINING HUB) */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6" style={{ fontSize: '18px' }}>
            {/* Streak Reward Celebration Banner */}
            {streakCelebrated && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/70 via-[#181510] to-emerald-950/70 border-2 border-amber-400 p-5 shadow-2xl shadow-amber-500/20 animate-reward-border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold text-xl shadow-md animate-flame-bounce shrink-0">
                      <Flame size={28} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-extrabold uppercase text-amber-300 tracking-wider">
                        Workout Verified!
                      </span>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {userProfile.currentStreakDays} Day Streak Unlocked 🔥
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Session logged with verified joint protection. Keep the momentum going!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStreakCelebrated(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* HERO CARD: TODAY'S RECOMMENDED WORKOUT */}
            {/* HERO CARD: TODAY'S SCHEDULED SESSION (WORKOUT OR ACTIVE RECOVERY) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#12141c] border border-emerald-500/30 p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono uppercase font-bold tracking-wider ${scheduledRoutineDay.isWorkoutDay ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {scheduledRoutineDay.isWorkoutDay ? "Today's Workout" : "Active Recovery Day"}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {scheduledRoutineDay.dayName}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                    {scheduledRoutineDay.isWorkoutDay ? todaysRecommendedTemplate.name : scheduledRoutineDay.splitLabel}
                  </h2>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 font-mono shrink-0">
                  <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <Clock size={13} className={scheduledRoutineDay.isWorkoutDay ? "text-emerald-400" : "text-cyan-400"} />
                    <span>~{todaysRecommendedTemplate.estimatedMinutes || 15} Mins</span>
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <Dumbbell size={13} className="text-cyan-400" />
                    <span>{todaysRecommendedTemplate.exercises.length} Exercises</span>
                  </span>
                </div>
              </div>

              {/* Visual Hero Banner with Human Demonstration Preview */}
              <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-black border border-white/10 group">
                <img
                  src={ROUTINE_HERO_IMAGES[todaysRecommendedTemplate.id] || (scheduledRoutineDay.isWorkoutDay ? '/src/assets/images/pushup_demonstration_1791586932834.jpg' : '/src/assets/images/forearm_plank_demo_1791586963855.jpg')}
                  alt={todaysRecommendedTemplate.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {scheduledRoutineDay.isWorkoutDay ? "Kinematic Form Ready" : "Tendon Recovery Flow"}
                    </span>
                    <p className="text-xs text-slate-200 line-clamp-1">
                      {scheduledRoutineDay.isWorkoutDay
                        ? `Focus: ${todaysRecommendedTemplate.jointFocus.join(', ')} · ${todaysRecommendedTemplate.difficulty}`
                        : scheduledRoutineDay.jointFocusNote}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(todaysRecommendedTemplate)}
                    className="shrink-0 text-xs text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 transition-colors cursor-pointer"
                  >
                    View Drills
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                {scheduledRoutineDay.isWorkoutDay ? (
                  <>
                    <button
                      onClick={() => handleStartWorkout(todaysRecommendedTemplate)}
                      className="w-full sm:flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <Play size={20} fill="currentColor" />
                      <span>START WORKOUT NOW</span>
                    </button>

                    <button
                      onClick={() => setPreviewTemplate(todaysRecommendedTemplate)}
                      className="w-full sm:w-auto px-5 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-2xl border border-white/10 transition-colors cursor-pointer"
                    >
                      Exercise List
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartWorkout(todaysRecommendedTemplate)}
                      className="w-full sm:flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <Play size={20} fill="currentColor" />
                      <span>START RECOVERY MOBILITY FLOW (~15m)</span>
                    </button>

                    <button
                      onClick={() => handleStartWorkout(nextWorkoutTemplate)}
                      className="w-full sm:w-auto px-5 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title={`Jump forward to next scheduled workout: ${nextWorkoutTemplate.name}`}
                    >
                      <span>Jump to {nextWorkoutDay.dayShort} Workout</span>
                      <ArrowRight size={14} className="text-emerald-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* MINIMALIST BEDROOM GEAR QUICK LOAD TUNER */}
            <div className="bg-[#12141c] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Dumbbell Quick Stepper */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-slate-400">Dumbbells</span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                        {((userProfile.maxDumbbellWeightKg - (userProfile.dumbbellHandleWeightKg || 2)) / 2).toFixed(1)}kg/side
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        onClick={() => handleNudgeDumbbellWeight(-1)}
                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center font-mono text-xs cursor-pointer border border-white/10 transition-colors"
                        title="Decrease dumbbell load by 1kg"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white text-base">
                        {userProfile.maxDumbbellWeightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
                      </span>
                      <button
                        onClick={() => handleNudgeDumbbellWeight(1)}
                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center font-mono text-xs cursor-pointer border border-white/10 transition-colors"
                        title="Increase dumbbell load by 1kg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barbell Quick Stepper */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-slate-400">Bedroom Barbell</span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {userProfile.barbellBarWeightKg || 8}kg bar + {((userProfile.maxBarbellWeightKg - (userProfile.barbellBarWeightKg || 8)) / 2).toFixed(1)}kg/side
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        onClick={() => handleNudgeBarbellWeight(-2)}
                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center font-mono text-xs cursor-pointer border border-white/10 transition-colors"
                        title="Decrease barbell load by 2kg"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white text-base">
                        {userProfile.maxBarbellWeightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
                      </span>
                      <button
                        onClick={() => handleNudgeBarbellWeight(2)}
                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center font-mono text-xs cursor-pointer border border-white/10 transition-colors"
                        title="Increase barbell load by 2kg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowWeightAdjustModal(true)}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono border border-white/10 transition-colors shrink-0 cursor-pointer self-start md:self-center"
              >
                Configure Plates →
              </button>
            </div>

            {/* CONNECTIVE TISSUE & LIGAMENT ADAPTATION PERIOD */}
            <div className="bg-[#12141c] border border-amber-500/30 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{userProfile.adaptationPhaseTitle || 'Phase 1: Baseline Joint & Ligament Remodeling (Week 0 of 6)'}</span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {userProfile.connectiveTissueReadiness ?? 0}% Adapted
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Biological tendon & ligament remodeling cycle · Week {userProfile.tendonAdaptationWeeks ?? 0} of 6
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleResetAllBaselineAndPhase}
                    className="text-[10px] font-mono text-slate-400 hover:text-amber-300 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset phase, completed weeks, and baseline to zero"
                  >
                    <RotateCcw size={11} />
                    <span>Reset to Week 0</span>
                  </button>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                    Load Pacing Protected
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${userProfile.connectiveTissueReadiness ?? 0}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                💡 <strong>Biomechanical Rule:</strong> {userProfile.adaptationGuidance || 'Tendons and ligaments remodel 2–3x slower than skeletal muscles. Maintain your current working weight for 4–6 weeks using DRS Time-Under-Tension and 3s negatives to allow carpal and patellar collagen to adapt safely before increasing load.'}
              </p>
            </div>

            {/* 4-DAY PPL + CALISTHENICS SPLIT (Mon, Wed, Thu, Fri) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>4-Day PPL + Calisthenics Schedule</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      4 Workouts / Week
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Mon (Push & Cali) · Wed (Pull & Cali) · Thu (Legs & Barbell) · Fri (Full Cali & Hypertrophy) · Tue, Sat, Sun (Recovery)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRoutine.days.map((day) => {
                  const dayTemplate = templates.find((t) => t.id === day.templateId) || templates[0];
                  const heroImg = ROUTINE_HERO_IMAGES[day.templateId || ''] || '/src/assets/images/pushup_demonstration_1791586932834.jpg';

                  return (
                    <div
                      key={day.dayId}
                      className={`rounded-2xl p-4 transition-all shadow-lg flex flex-col justify-between gap-3 ${
                        day.isWorkoutDay
                          ? 'bg-[#12141c] hover:bg-[#151824] border border-white/10 hover:border-emerald-500/40'
                          : 'bg-[#0f1118] border border-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={heroImg}
                          alt={day.routineType}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                              Day {day.dayNumber} · {day.dayName}
                            </span>
                            {day.isWorkoutDay ? (
                              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                WORKOUT
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
                                RECOVERY
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
                            {day.routineType}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {day.targetMuscles}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            ~{day.estimatedMinutes} Mins · {day.exercises.length} Drills
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleStartWorkout(dayTemplate)}
                          className={`flex-1 py-2 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                            day.isWorkoutDay
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                              : 'bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/30'
                          }`}
                        >
                          <Play size={13} fill="currentColor" />
                          <span>{day.isWorkoutDay ? 'Start Workout' : 'Start Active Recovery'}</span>
                        </button>
                        <button
                          onClick={() => setPreviewTemplate(dayTemplate)}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs rounded-xl border border-white/5 transition-colors cursor-pointer"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PWA Home-Screen Install Prompt */}
            <PWAInstallButton variant="card" />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: ACTIVITY & PROGRESS (CLEAN & PUNCHY, NO DUMP) */}
        {/* ==================================================== */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Activity & Progression
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your workout milestones, current streak, and verified session logs.
              </p>
            </div>

            {/* 3 High-Impact KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`rounded-2xl p-4 shadow-lg flex items-center justify-between transition-all ${
                streakCelebrated
                  ? 'bg-[#151926] border-2 border-amber-400 animate-streak-celebrate shadow-2xl shadow-amber-500/30'
                  : 'bg-[#12141c] border border-amber-500/30'
              }`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-amber-300 font-mono uppercase font-semibold">Active Streak</span>
                    {streakCelebrated && (
                      <span className="text-[9px] font-mono bg-amber-400 text-black px-1.5 py-0.2 rounded font-extrabold animate-bounce">
                        +1 CELEBRATION!
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-amber-400 mt-1">
                    {userProfile.currentStreakDays || 0} <span className="text-xs text-slate-400 font-normal">Days</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">Verified consecutive training</span>
                    <button
                      onClick={() => setStreakCelebrated(true)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
                    >
                      Replay Celebration
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setStreakCelebrated(true)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    streakCelebrated
                      ? 'bg-amber-400 text-black animate-flame-bounce shadow-lg shadow-amber-400/50'
                      : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                  }`}
                  title="Click to trigger streak celebration reward"
                >
                  <Flame size={26} />
                </button>
              </div>

              <div className="bg-[#12141c] border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-300 font-mono uppercase font-semibold">Workouts Logged</span>
                  <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">
                    {userProfile.completedWorkoutsCount || 0} <span className="text-xs text-slate-400 font-normal">Sessions</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Target: {userProfile.workoutsPerWeek}x / week</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <Award size={26} />
                </div>
              </div>

              <div className="bg-[#12141c] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-cyan-300 font-mono uppercase font-semibold">Working Load</span>
                  <div className="text-xl font-mono font-extrabold text-cyan-400 mt-1">
                    DB: {userProfile.maxDumbbellWeightKg}kg · BB: {userProfile.maxBarbellWeightKg}kg
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Bedroom compact bar calibrated</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                  <Dumbbell size={24} />
                </div>
              </div>
            </div>

            {/* Recent Completed Workouts History */}
            <div className="bg-[#12141c] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  <span>Recent Training Checkpoints</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {strengthHistory.length} Recorded
                </span>
              </div>

              {strengthHistory.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-xs text-slate-400">No completed workouts logged yet.</p>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      handleStartWorkout(todaysRecommendedTemplate);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Start Your First Session Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {strengthHistory.slice(0, 8).map((entry, idx) => (
                    <div
                      key={idx}
                      className="bg-black/30 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{entry.workoutName || 'Bedroom Routine'}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded font-mono">
                            Verified
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{entry.date}</span>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-300">
                        <span>DB: {entry.maxDumbbellWeightKg}kg · BB: {entry.maxBarbellWeightKg}kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI ACTIVITY & RECOVERY COACH CHATBOX */}
            <ActivityAICoachCard userProfile={userProfile} />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SETTINGS & EQUIPMENT (CLEAR & ESSENTIAL) */}
        {/* ==================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Settings & Equipment
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure your owned bedroom gear, bar weight, and joint protections.
              </p>
            </div>

            {/* BASIC INFORMATION & AI EXERCISE TUNING PULL-DOWN MENU */}
            <BiometricsSettingsCard
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              onConsultAICoach={() => setActiveTab('stats')}
              onResetBaselineAndPhase={handleResetAllBaselineAndPhase}
            />

            {/* CROSS-DEVICE EMAIL CLOUD SYNC CARD */}
            <CloudSyncCard
              userProfile={userProfile}
              onSaveCloudSync={handleSaveCloudSync}
              onFetchCloudSync={handleFetchCloudSync}
              isSyncing={isSyncing}
              syncMessage={syncMessage}
            />

            {/* Owned Equipment Checklist */}
            <div className="bg-[#12141c] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench size={16} className="text-emerald-400" />
                  <span>Owned Equipment Checklist</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {(userProfile.availableEquipment || []).length} Enabled
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'adjustable_dumbbells', name: 'Adjustable Dumbbells (2kg handle + 1.5/2/2.5kg plates)' },
                  { id: 'light_barbell', name: 'Light Bedroom Barbell (8kg compact bar)' },
                  { id: 'weight_plates', name: 'Weight Plates (1.5kg, 2.0kg, 2.5kg)' },
                  { id: 'flat_bench', name: 'Exercise Mat / Floor Space' },
                  { id: 'pullup_bar', name: 'Doorframe / Pull-Up Bar' },
                  { id: 'resistance_bands', name: 'Resistance Bands' }
                ].map((item) => {
                  const isChecked = (userProfile.availableEquipment || []).includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleEquipment(item.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : 'bg-black/20 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-medium pr-2">{item.name}</span>
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/20'
                      }`}>
                        {isChecked && <Check size={13} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weight Sliders */}
            <div className="bg-[#12141c] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Dumbbell size={16} className="text-amber-400" />
                <span>Working Weight Calibration</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-300 font-medium">Bedroom Barbell Bar Weight</span>
                    <span className="font-mono font-bold text-amber-400">{userProfile.barbellBarWeightKg || 8} kg</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.5"
                    value={userProfile.barbellBarWeightKg || 8}
                    onChange={(e) => setUserProfile({ ...userProfile, barbellBarWeightKg: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Compact bedroom bars are typically 6kg–10kg (NOT a 20kg Olympic gym bar).
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-300 font-medium">Target Barbell Load</span>
                    <span className="font-mono font-bold text-amber-400">{userProfile.maxBarbellWeightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="40"
                    step="1"
                    value={userProfile.maxBarbellWeightKg}
                    onChange={(e) => setUserProfile({ ...userProfile, maxBarbellWeightKg: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-300 font-medium">Target Dumbbell Load (Per Hand)</span>
                    <span className="font-mono font-bold text-cyan-400">{userProfile.maxDumbbellWeightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="27"
                    step="1"
                    value={userProfile.maxDumbbellWeightKg}
                    onChange={(e) => setUserProfile({ ...userProfile, maxDumbbellWeightKg: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* PWA & Standalone App Setup */}
            <div className="bg-[#12141c] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white">Install Standalone App</h3>
              <p className="text-xs text-slate-300">
                Run Home Workout as a native standalone app without browser search bars or AI Studio wrapper frames.
              </p>
              <PWAInstallButton variant="card" />
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* EXERCISE PREVIEW MODAL */}
      {/* ==================================================== */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#12141c] border border-white/15 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Exercise Preview</span>
                <h3 className="text-lg font-bold text-white">{previewTemplate.name}</h3>
                <span className="text-xs text-slate-400 font-mono">
                  ~{previewTemplate.estimatedMinutes} Mins · {previewTemplate.exercises.length} Exercises
                </span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              {previewTemplate.exercises.map((id, idx) => {
                const ex = EXERCISE_DATABASE.find((e) => e.id === id);
                if (!ex) return null;
                return (
                  <div key={id} className="bg-black/40 p-3 rounded-2xl border border-white/5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{ex.description}</p>
                      <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                        {ex.defaultReps ? `${ex.defaultSets || 3} sets × ${ex.defaultReps} reps` : `${ex.defaultSets || 1} set × ${ex.defaultDurationSec || 30}s`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleStartWorkout(previewTemplate)}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Play size={15} fill="currentColor" />
                <span>Start This Workout Now</span>
              </button>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* QUICK WEIGHT ADJUST MODAL */}
      {/* ==================================================== */}
      {showWeightAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#12141c] border border-white/15 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders size={15} className="text-amber-400" />
                <span>Quick Weight Settings</span>
              </h3>
              <button
                onClick={() => setShowWeightAdjustModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300">Dumbbell Load (Per Hand)</span>
                  <span className="font-mono font-bold text-cyan-400">{userProfile.maxDumbbellWeightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="27"
                  step="1"
                  value={userProfile.maxDumbbellWeightKg}
                  onChange={(e) => setUserProfile({ ...userProfile, maxDumbbellWeightKg: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300">Bedroom Barbell Target</span>
                  <span className="font-mono font-bold text-amber-400">{userProfile.maxBarbellWeightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="40"
                  step="1"
                  value={userProfile.maxBarbellWeightKg}
                  onChange={(e) => setUserProfile({ ...userProfile, maxBarbellWeightKg: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            <button
              onClick={() => setShowWeightAdjustModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3-TAB BOTTOM NAVIGATION (JUST LIKE HOME WORKOUT APP) */}
      {/* ==================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d12]/95 backdrop-blur-lg border-t border-white/10 grid grid-cols-3 h-16 max-w-md mx-auto md:max-w-none px-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell size={18} />
          <span className="text-[10px] tracking-tight mt-1">Workouts</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'stats' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity size={18} />
          <span className="text-[10px] tracking-tight mt-1">Activity</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings size={18} />
          <span className="text-[10px] tracking-tight mt-1">Settings</span>
        </button>
      </nav>

      {/* Persistent PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
