import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Zap,
  Dumbbell,
  Heart,
  RotateCcw,
  Bot
} from 'lucide-react';
import { Exercise, UserProfile } from '../types';

interface InWorkoutAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  activeExercise: Exercise;
  userProfile: UserProfile;
  currentWeightKg: number;
  onSwapExercise?: (altId: string) => void;
}

interface Message {
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export const InWorkoutAIChat: React.FC<InWorkoutAIChatProps> = ({
  isOpen,
  onClose,
  activeExercise,
  userProfile,
  currentWeightKg,
  onSwapExercise
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'coach',
      text: `Hey Athlete! I'm Dr. Marcus, your Kinematic Joint Coach. You're currently on "${activeExercise.name}". How are your wrists feeling, or do you need loading guidance?`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [coachPersona, setCoachPersona] = useState<'dr-marcus' | 'jax-calisthenics' | 'titan-strength'>('dr-marcus');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const quickPrompts = [
    `Tune form for my ${userProfile.heightCm || 175}cm height & ${userProfile.age || 24}y age`,
    `Wrist discomfort on ${activeExercise.name}`,
    `How to load ${currentWeightKg}kg on my dumbbell?`,
    `What tempo should I use for this rep?`,
    `Swap to a pure calisthenics alternative`
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Active Workout In-Session Question: Current exercise: "${activeExercise.name}" (${activeExercise.category}). Current load: ${currentWeightKg}kg. Athlete question: "${textToSend}"`,
          userProfile,
          personaId: coachPersona,
          conversationHistory: messages.map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'ai',
            text: m.text
          }))
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get coach reply');
      }

      const data = await res.json();
      const coachMsg: Message = {
        sender: 'coach',
        text: data.reply || 'Maintain neutral wrist alignment and breathe through your eccentric phase.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: `For joint protection on ${activeExercise.name}: Keep your wrists straight in line with forearms. If feeling strain, switch to neutral-grip dumbbell handles or incline wall pushups immediately.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#12141c] border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#151824] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">In-Activity AI Coach</h3>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Drill: {activeExercise.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Coach Selector */}
        <div className="px-4 py-2 bg-[#0e1017] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setCoachPersona('dr-marcus')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shrink-0 transition-colors ${
              coachPersona === 'dr-marcus'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={12} />
            <span>Dr. Marcus (Joints)</span>
          </button>
          <button
            onClick={() => setCoachPersona('jax-calisthenics')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shrink-0 transition-colors ${
              coachPersona === 'jax-calisthenics'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap size={12} />
            <span>Jax (Calisthenics)</span>
          </button>
          <button
            onClick={() => setCoachPersona('titan-strength')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shrink-0 transition-colors ${
              coachPersona === 'titan-strength'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell size={12} />
            <span>Titan (Plates)</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-500 text-black font-medium'
                    : 'bg-[#1a1e2b] text-slate-100 border border-white/10'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-mono px-1">
                {m.time}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-xl max-w-fit">
              <Sparkles size={13} className="text-emerald-400 animate-spin" />
              <span>Analyzing movement kinematics...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-[#0e1017] border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 whitespace-nowrap shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#151824] border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your coach anything about this drill..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
