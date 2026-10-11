import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  User,
  ShieldCheck,
  RotateCcw,
  Zap,
  Dumbbell,
  Heart,
  Flame,
  Brain,
  Plus,
  Trash2,
  Play,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Layers,
  Activity,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, UserProfile, WorkoutTemplate, AICoachPersona, GeneratedAIWorkout } from '../types';
import { EXERCISE_DATABASE } from '../data/exercises';
import { speakCoachVoice } from '../utils/audio';

interface AIChatCoachProps {
  userProfile: UserProfile;
  onStartWorkout?: (template: WorkoutTemplate) => void;
  onSaveTemplate?: (template: WorkoutTemplate) => void;
}

const PRESET_PERSONAS: AICoachPersona[] = [
  {
    id: 'dr-marcus',
    name: 'Dr. Marcus',
    title: 'Joint Longevity Specialist',
    badge: 'Kinematic Guard',
    avatarIcon: 'shield',
    specialty: 'Wrist preservation, tendon adaptation, neutral kinematic alignment',
    description: 'Specializes in biomechanics, eliminating wrist pain, and knee-tracking safety during load.',
    tone: 'Clinical, supportive, and scientifically grounded.'
  },
  {
    id: 'jax-calisthenics',
    name: 'Coach Jax',
    title: 'Elite Calisthenics Master',
    badge: 'Bodyweight & Levers',
    avatarIcon: 'zap',
    specialty: 'Hollow body compression, levers, floor presses, and gravity mastery',
    description: 'Masters bodyweight movement progressions while strictly protecting vulnerable joints.',
    tone: 'High energy, disciplined, and technique-focused.'
  },
  {
    id: 'titan-strength',
    name: 'Titan',
    title: 'Progressive Overload Strategist',
    badge: 'Plate & Load Math',
    avatarIcon: 'dumbbell',
    specialty: 'Dumbbell micro-loading (2.5/2.0/1.5kg plates), Olympic barbell math, RPE tracking',
    description: 'Calculates exact sleeve capacities (max 5 plates/side) and progressive overload jumps.',
    tone: 'Direct, analytical, and numbers-focused.'
  },
  {
    id: 'aura-recovery',
    name: 'Aura',
    title: 'Mobility & Recovery Flow',
    badge: 'Active Rehab',
    avatarIcon: 'heart',
    specialty: 'Synovial fluid elevation, 5-minute warm-up/cool-down flows, nervous system de-stress',
    description: 'Guides pre-workout joint lubrication and post-workout parasympathetic recovery.',
    tone: 'Calm, mindful, and restorative.'
  }
];

const PROMPT_SUGGESTIONS: Record<string, string[]> = {
  'dr-marcus': [
    'How do I protect my wrists during pressing exercises?',
    'I feel wrist pressure on floor pushups. What is the safest regression?',
    'Give me a 5-minute knee & ankle mobilization routine',
    'How do I position my elbows during dumbbell floor press?'
  ],
  'jax-calisthenics': [
    'How do I progress to a full hollow body hold?',
    'What calisthenics exercises build chest without bending the wrist back?',
    'How do I perform doorframe bodyweight rows with strict form?',
    'Give me a 10-minute pure core compression protocol'
  ],
  'titan-strength': [
    'What is the plate breakdown for a 14kg dumbbell using my 2kg handle?',
    'How much should I load on a 20kg barbell for a 36kg target?',
    'Can my dumbbell sleeve fit 16kg within the 5-plate limit?',
    'What is the ideal micro-loading jump from 10kg to 12kg?'
  ],
  'aura-recovery': [
    'Walk me through a 5-minute wrist synovial decompression routine',
    'How can I loosen tight ankles to improve squat depth?',
    'What cool-down stretches reduce next-day soreness after heavy lifts?',
    'How do I practice diaphragmatic breathing between intense sets?'
  ]
};

export const AIChatCoach: React.FC<AIChatCoachProps> = ({
  userProfile,
  onStartWorkout,
  onSaveTemplate
}) => {
  // Custom user-created coaches from localStorage
  const [customPersonas, setCustomPersonas] = useState<AICoachPersona[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('shc_custom_ai_coaches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allPersonas = [...PRESET_PERSONAS, ...customPersonas];
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('dr-marcus');

  const activePersona = allPersonas.find((p) => p.id === selectedPersonaId) || PRESET_PERSONAS[0];

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: '1',
        sender: 'ai',
        text: `Welcome back, ${userProfile.name}. I am ${PRESET_PERSONAS[0].name}, your ${PRESET_PERSONAS[0].title}. Powered by Google Gemini 3.8 Flash, all my recommendations are calibrated to guard your ${userProfile.jointPainAreas.join(' and ') || 'joints'} while driving progressive overload. How can I optimize your training today?`,
        timestamp: 'Just now'
      }
    ];
  });

  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voicePlayback, setVoicePlayback] = useState<boolean>(userProfile.voiceCoachEnabled);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showCreatePersonaModal, setShowCreatePersonaModal] = useState<boolean>(false);
  const [showWorkoutGenModal, setShowWorkoutGenModal] = useState<boolean>(false);
  const [showFormAnalysisModal, setShowFormAnalysisModal] = useState<boolean>(false);

  // New Custom Coach Form State
  const [newCoachName, setNewCoachName] = useState<string>('');
  const [newCoachTitle, setNewCoachTitle] = useState<string>('');
  const [newCoachBadge, setNewCoachBadge] = useState<string>('Custom Coach');
  const [newCoachIcon, setNewCoachIcon] = useState<AICoachPersona['avatarIcon']>('brain');
  const [newCoachTone, setNewCoachTone] = useState<string>('Supportive, technical, and motivating');
  const [newCoachRules, setNewCoachRules] = useState<string>(
    'Focus on zero wrist hyperextension, strict core bracing, and progressive dumbbell overload under 5 plates per side.'
  );

  // AI Workout Generator State
  const [workoutFocus, setWorkoutFocus] = useState<string>('Upper Push & Wrist Shield');
  const [workoutMinutes, setWorkoutMinutes] = useState<number>(30);
  const [workoutJoints, setWorkoutJoints] = useState<string[]>(userProfile.jointPainAreas || ['wrists']);
  const [workoutCustomPrompt, setWorkoutCustomPrompt] = useState<string>('');
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState<boolean>(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedAIWorkout | null>(null);
  const [savedWorkoutToast, setSavedWorkoutToast] = useState<string | null>(null);

  // Form Analysis State
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(EXERCISE_DATABASE[3]?.id || 'incline_pushup_wall');
  const [userFormConcern, setUserFormConcern] = useState<string>('');
  const [isAnalyzingForm, setIsAnalyzingForm] = useState<boolean>(false);
  const [formAnalysisResult, setFormAnalysisResult] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist custom personas
  const handleSaveCustomPersona = () => {
    if (!newCoachName.trim() || !newCoachTitle.trim()) return;

    const newPersona: AICoachPersona = {
      id: `custom_${Date.now()}`,
      name: newCoachName.trim(),
      title: newCoachTitle.trim(),
      badge: newCoachBadge.trim() || 'Custom Coach',
      avatarIcon: newCoachIcon,
      specialty: newCoachRules.slice(0, 70),
      description: newCoachRules,
      tone: newCoachTone,
      systemRules: newCoachRules,
      isCustom: true
    };

    const updated = [...customPersonas, newPersona];
    setCustomPersonas(updated);
    localStorage.setItem('shc_custom_ai_coaches', JSON.stringify(updated));
    setSelectedPersonaId(newPersona.id);
    setShowCreatePersonaModal(false);

    // Initial greeting from new custom AI
    const greetingMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `Hello ${userProfile.name}! I am ${newPersona.name}, your ${newPersona.title}. Powered by Gemini 3.8 Flash, I'm ready to coach your sessions with customized focus on: "${newPersona.systemRules}". What's on your mind today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, greetingMsg]);

    // Reset form
    setNewCoachName('');
    setNewCoachTitle('');
  };

  const handleDeleteCustomPersona = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPersonas.filter((p) => p.id !== id);
    setCustomPersonas(updated);
    localStorage.setItem('shc_custom_ai_coaches', JSON.stringify(updated));
    if (selectedPersonaId === id) {
      setSelectedPersonaId('dr-marcus');
    }
  };

  const handleSelectPersona = (persona: AICoachPersona) => {
    setSelectedPersonaId(persona.id);
    const greetingMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `Switching to ${persona.name} (${persona.title}). ${persona.description} How can I assist your session?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, greetingMsg]);
    if (voicePlayback) {
      speakCoachVoice(`Switching coach to ${persona.name}`, voicePlayback);
    }
  };

  // Send message to server Gemini endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userProfile,
          conversationHistory: messages,
          personaId: activePersona.id,
          customPersona: activePersona.isCustom ? activePersona : undefined
        })
      });

      const data = await response.json();
      const replyText = data.reply || "I've tailored your routine for joint safety and progressive strength development.";

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (voicePlayback) {
        speakCoachVoice(replyText, voicePlayback);
      }
    } catch (err) {
      console.error('Failed to communicate with AI Coach:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: 'For joint safety, always maintain stacked wrists directly over elbows during presses and avoid hyperextension. Stop immediately if you feel joint pinch.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = (text: string) => {
    speakCoachVoice(text, true);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `New coaching thread initiated with ${activePersona.name}. Powered by Gemini 3.8 Flash, ready for your training questions.`,
        timestamp: 'Just now'
      }
    ]);
  };

  // Generate Workout with Gemini
  const handleGenerateWorkout = async () => {
    setIsGeneratingWorkout(true);
    setGeneratedWorkout(null);

    try {
      const response = await fetch('/api/ai-coach/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: workoutFocus,
          targetMinutes: workoutMinutes,
          jointPainAreas: workoutJoints,
          userProfile,
          customPrompt: workoutCustomPrompt
        })
      });

      const data = await response.json();
      if (data.workout) {
        setGeneratedWorkout(data.workout);
      }
    } catch (err) {
      console.error('Failed to generate AI workout:', err);
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  // Launch generated workout
  const handleLaunchGeneratedWorkout = () => {
    if (!generatedWorkout || !onStartWorkout) return;
    const template: WorkoutTemplate = {
      id: generatedWorkout.id,
      name: generatedWorkout.name,
      splitType: generatedWorkout.splitType,
      exercises: generatedWorkout.exercises,
      estimatedMinutes: generatedWorkout.estimatedMinutes,
      jointFocus: generatedWorkout.jointFocus,
      difficulty: generatedWorkout.difficulty
    };
    setShowWorkoutGenModal(false);
    onStartWorkout(template);
  };

  // Save generated workout
  const handleSaveGeneratedWorkout = () => {
    if (!generatedWorkout || !onSaveTemplate) return;
    const template: WorkoutTemplate = {
      id: generatedWorkout.id,
      name: generatedWorkout.name,
      splitType: generatedWorkout.splitType,
      exercises: generatedWorkout.exercises,
      estimatedMinutes: generatedWorkout.estimatedMinutes,
      jointFocus: generatedWorkout.jointFocus,
      difficulty: generatedWorkout.difficulty
    };
    onSaveTemplate(template);
    setSavedWorkoutToast(`Saved "${template.name}" to your templates!`);
    setTimeout(() => setSavedWorkoutToast(null), 3000);
  };

  // Biomechanical Form Analysis
  const handleAnalyzeForm = async () => {
    const exercise = EXERCISE_DATABASE.find((e) => e.id === selectedExerciseId);
    if (!exercise) return;

    setIsAnalyzingForm(true);
    setFormAnalysisResult(null);

    try {
      const response = await fetch('/api/ai-coach/analyze-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseName: exercise.name,
          exerciseId: exercise.id,
          userConcern: userFormConcern
        })
      });

      const data = await response.json();
      if (data.analysis) {
        setFormAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Failed to analyze form:', err);
    } finally {
      setIsAnalyzingForm(false);
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck size={14} />;
      case 'zap':
        return <Zap size={14} />;
      case 'dumbbell':
        return <Dumbbell size={14} />;
      case 'heart':
        return <Heart size={14} />;
      case 'flame':
        return <Flame size={14} />;
      case 'brain':
        return <Brain size={14} />;
      default:
        return <Sparkles size={14} />;
    }
  };

  const activePrompts = [
    `Tune exercises for my ${userProfile.heightCm || 175}cm height & ${userProfile.age || 24}y age`,
    ...(PROMPT_SUGGESTIONS[activePersona.id] || [
      'How do I maintain neutral wrists during this exercise?',
      'What is the safest calisthenics progression for my chest?',
      'How do I calculate plate loading for my dumbbell handle?',
      'Give me a 5-minute warm-up for joint lubrication'
    ])
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner: Gemini 3.8 Flash Status & Quick AI Tools */}
      <div className="bg-[#12141c] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">AI Coach Engine</h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Google Gemini 3.8 Flash
                </span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Multi-Persona Kinematics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Active Guardian: <span className="text-slate-200 font-medium">{activePersona.name}</span> — {activePersona.title}
              </p>
            </div>
          </div>

          {/* Quick AI Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowWorkoutGenModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Zap size={14} />
              <span>Generate Workout</span>
            </button>

            <button
              onClick={() => setShowFormAnalysisModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Activity size={14} />
              <span>Form Checker</span>
            </button>

            <button
              onClick={() => setShowCreatePersonaModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Create a custom AI Coach with personalized rules"
            >
              <Plus size={14} />
              <span>+ Make New AI</span>
            </button>
          </div>
        </div>

        {/* Coach Persona Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Select Coach Persona:</span>
            <span className="text-slate-500 text-[10px]">Click any coach to switch perspective</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allPersonas.map((persona) => {
              const isActive = persona.id === selectedPersonaId;
              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-emerald-500 text-black font-bold' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {getPersonaIcon(persona.avatarIcon)}
                  </div>

                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-1.5 leading-tight">
                      <span>{persona.name}</span>
                      {persona.isCustom && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{persona.badge}</div>
                  </div>

                  {persona.isCustom && (
                    <button
                      onClick={(e) => handleDeleteCustomPersona(persona.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 text-slate-500 transition-opacity ml-1"
                      title="Delete custom coach"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-[#12141c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[620px]">
        {/* Chat Sub-Header */}
        <div className="p-3.5 bg-[#151926] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {getPersonaIcon(activePersona.avatarIcon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activePersona.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  {activePersona.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{activePersona.specialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors"
              title="Reset conversation"
            >
              <RotateCcw size={13} />
            </button>

            <button
              onClick={() => setVoicePlayback(!voicePlayback)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                voicePlayback
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 border-white/5'
              }`}
              title={voicePlayback ? 'Voice coach active' : 'Voice coach muted'}
            >
              {voicePlayback ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="text-[11px] font-medium hidden sm:inline">
                {voicePlayback ? 'Audio Readout On' : 'Muted'}
              </span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono ${
                    isUser ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-black font-bold'
                  }`}
                >
                  {isUser ? <User size={13} /> : getPersonaIcon(activePersona.avatarIcon)}
                </div>

                <div
                  className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600/30 text-white border border-blue-500/30 rounded-tr-sm'
                      : 'bg-black/40 text-slate-200 border border-white/10 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                    <span>{m.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(m.id, m.text)}
                        className="hover:text-slate-300 text-slate-500 flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === m.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span className="text-[9px]">{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => handleSpeakMessage(m.text)}
                          className="hover:text-emerald-400 text-slate-500 flex items-center gap-1 cursor-pointer"
                          title="Speak advice"
                        >
                          <Volume2 size={11} />
                          <span className="text-[9px]">Speak</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles size={13} className="animate-spin" />
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] font-mono text-emerald-300">
                  {activePersona.name} is computing with Gemini 3.8 Flash...
                </span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-3 py-2 bg-black/40 border-t border-white/5 overflow-x-auto flex gap-1.5 shrink-0 scrollbar-thin">
          {activePrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-[11px] whitespace-nowrap transition-colors border border-white/5 shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#151926] border-t border-white/10 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={`Ask ${activePersona.name} (e.g. Can I replace floor pushups with wall incline?)`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* MODAL 1: Create Custom AI Coach ("Make a New AI") */}
      {showCreatePersonaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Brain size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New AI Coach</h3>
                  <p className="text-xs text-slate-400">Design your own specialized Gemini AI trainer</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreatePersonaModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">AI Coach Name</label>
                <input
                  type="text"
                  placeholder="e.g. Coach Sarah, Sensei Kenji, Iron Monk"
                  value={newCoachName}
                  onChange={(e) => setNewCoachName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title & Role</label>
                <input
                  type="text"
                  placeholder="e.g. Wrist Rehab & Calisthenics Sensei"
                  value={newCoachTitle}
                  onChange={(e) => setNewCoachTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Short Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Strict Form"
                    value={newCoachBadge}
                    onChange={(e) => setNewCoachBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Icon Avatar</label>
                  <select
                    value={newCoachIcon}
                    onChange={(e) => setNewCoachIcon(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="brain">Brain (Strategic)</option>
                    <option value="shield">Shield (Kinematic Guard)</option>
                    <option value="zap">Zap (Calisthenics)</option>
                    <option value="dumbbell">Dumbbell (Strength)</option>
                    <option value="heart">Heart (Rehab & Recovery)</option>
                    <option value="flame">Flame (High Intensity)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coaching Tone & Style</label>
                <input
                  type="text"
                  placeholder="e.g. Rigorous, supportive, direct, encouraging"
                  value={newCoachTone}
                  onChange={(e) => setNewCoachTone(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom System Rules & Focus Directives
                </label>
                <textarea
                  rows={3}
                  placeholder="Instruct Gemini how to coach: e.g. Always prescribe neutral wrist hand placements. Never recommend heavy barbell benching. Emphasize forearm planks and hollow body holds."
                  value={newCoachRules}
                  onChange={(e) => setNewCoachRules(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreatePersonaModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomPersona}
                disabled={!newCoachName.trim() || !newCoachTitle.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Create AI Coach
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Gemini AI Workout Generator */}
      {showWorkoutGenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/15 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gemini AI Workout Generator</h3>
                  <p className="text-xs text-slate-400">Powered by Google Gemini 3.8 Flash</p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkoutGenModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Select Focus / Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Upper Push & Wrist Shield',
                    'Calisthenics Core & Levers',
                    'Full Body Hybrid Strength',
                    'Joint Rehab & Active Mobility',
                    'Dumbbell Progressive Overload'
                  ].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setWorkoutFocus(goal)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        workoutFocus === goal
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Target Duration</label>
                  <div className="flex gap-1.5">
                    {[15, 25, 35, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setWorkoutMinutes(mins)}
                        className={`flex-1 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          workoutMinutes === mins
                            ? 'bg-emerald-500 text-black font-bold border-emerald-500'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Joint Guard Priorities</label>
                  <div className="flex gap-1.5">
                    {['wrists', 'knees', 'ankles'].map((joint) => {
                      const isChecked = workoutJoints.includes(joint);
                      return (
                        <button
                          key={joint}
                          onClick={() => {
                            setWorkoutJoints(
                              isChecked ? workoutJoints.filter((j) => j !== joint) : [...workoutJoints, joint]
                            );
                          }}
                          className={`flex-1 py-1.5 rounded-lg border text-center capitalize transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-semibold'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {joint}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Optional Specific Instructions (for Gemini)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Include hollow body tucks and avoid any bench dips"
                  value={workoutCustomPrompt}
                  onChange={(e) => setWorkoutCustomPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleGenerateWorkout}
                disabled={isGeneratingWorkout}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Sparkles size={16} className={isGeneratingWorkout ? 'animate-spin' : ''} />
                <span>
                  {isGeneratingWorkout
                    ? 'Gemini 3.8 Flash is Assembling Routine...'
                    : 'Generate Tailored Workout with Gemini'}
                </span>
              </button>

              {/* Generated Workout Card Preview */}
              {generatedWorkout && (
                <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{generatedWorkout.name}</h4>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                          {generatedWorkout.difficulty}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {generatedWorkout.estimatedMinutes} mins • {generatedWorkout.splitType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded-xl border border-white/5">
                    "{generatedWorkout.rationale}"
                  </p>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                      Included Exercises ({generatedWorkout.exercises.length}):
                    </span>
                    <div className="space-y-1.5">
                      {generatedWorkout.exercises.map((exId, idx) => {
                        const ex = EXERCISE_DATABASE.find((e) => e.id === exId);
                        return (
                          <div
                            key={exId}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-200"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-4 text-[10px] font-mono text-emerald-400">{idx + 1}.</span>
                              <span className="font-medium">{ex?.name || exId}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono capitalize">
                              {ex?.category || 'Calisthenics'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions for Generated Workout */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={handleLaunchGeneratedWorkout}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play size={14} />
                      <span>Start in Workout Player Now</span>
                    </button>

                    <button
                      onClick={handleSaveGeneratedWorkout}
                      className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                    >
                      <Bookmark size={14} />
                      <span>Save to Templates</span>
                    </button>
                  </div>

                  {savedWorkoutToast && (
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium text-center border border-emerald-500/30">
                      {savedWorkoutToast}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Gemini Biomechanics Lab & Form Checker */}
      {showFormAnalysisModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/15 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gemini Biomechanics Lab</h3>
                  <p className="text-xs text-slate-400">Kinematic joint form analysis & injury prevention</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormAnalysisModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Exercise to Inspect</label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  {EXERCISE_DATABASE.filter((e) => e.category !== 'warmup' && e.category !== 'cooldown').map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Specific Form Concern or Joint Sensation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My wrist clicks on the bottom of the movement, how should I rotate?"
                  value={userFormConcern}
                  onChange={(e) => setUserFormConcern(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleAnalyzeForm}
                disabled={isAnalyzingForm}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
              >
                <Sparkles size={16} className={isAnalyzingForm ? 'animate-spin' : ''} />
                <span>
                  {isAnalyzingForm
                    ? 'Computing Kinematic Vectors...'
                    : 'Analyze Biomechanics with Gemini 3.8 Flash'}
                </span>
              </button>

              {formAnalysisResult && (
                <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-blue-400" />
                      Gemini Kinematic Report
                    </span>
                    <button
                      onClick={() => speakCoachVoice(formAnalysisResult, true)}
                      className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white cursor-pointer"
                    >
                      <Volume2 size={13} />
                      <span>Listen to Audio</span>
                    </button>
                  </div>

                  <p className="whitespace-pre-wrap text-slate-200 text-xs leading-relaxed">
                    {formAnalysisResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
