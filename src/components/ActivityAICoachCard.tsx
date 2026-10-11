import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, ShieldCheck, Zap, Dumbbell, Heart, Flame } from 'lucide-react';
import { UserProfile } from '../types';

interface ActivityAICoachCardProps {
  userProfile: UserProfile;
}

interface Message {
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export const ActivityAICoachCard: React.FC<ActivityAICoachCardProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'coach',
      text: `Hello Athlete! I'm Dr. Marcus, your Kinematic Joint & Recovery Specialist. You're currently on a ${userProfile.currentStreakDays || 0}-day streak with ${userProfile.completedWorkoutsCount || 0} completed workouts. How are your wrists and joints recovering after your 4-day PPL sessions?`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [persona, setPersona] = useState<'dr-marcus' | 'jax-calisthenics' | 'titan-strength'>('dr-marcus');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickQuestions = [
    `How is my 4-day PPL recovery looking?`,
    `When can I increase my dumbbell weight from ${userProfile.maxDumbbellWeightKg}kg?`,
    `Wrist stretches for post-workout recovery`,
    `Calisthenics progression tips for hollow body`
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text,
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
          message: `Athlete Activity & Progress Review: Streak: ${userProfile.currentStreakDays || 0} days, Completed sessions: ${userProfile.completedWorkoutsCount || 0}, Dumbbell weight: ${userProfile.maxDumbbellWeightKg}kg, Barbell: ${userProfile.maxBarbellWeightKg}kg, Joint focus: ${userProfile.jointPainAreas.join(', ')}. Question: "${text}"`,
          userProfile,
          personaId: persona,
          conversationHistory: messages.map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'ai',
            text: m.text
          }))
        })
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: data.reply || 'Your joint preservation protocol is working well. Remember to allow 4–6 weeks for collagen matrix remodeling before increasing working weights.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: 'Great work maintaining consistency! For joint and ligament adaptation: keep your working weight stable for 4–6 weeks while focusing on 3-second controlled negatives. This protects tendon insertion points while building foundational strength.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#12141c] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI Activity & Recovery Coach</h3>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized recovery, joint remodeling, and 4-day PPL progression analysis.
            </p>
          </div>
        </div>

        {/* Persona Toggles */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setPersona('dr-marcus')}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              persona === 'dr-marcus' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={12} />
            <span>Joints</span>
          </button>
          <button
            onClick={() => setPersona('jax-calisthenics')}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              persona === 'jax-calisthenics' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap size={12} />
            <span>Calisthenics</span>
          </button>
          <button
            onClick={() => setPersona('titan-strength')}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              persona === 'titan-strength' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell size={12} />
            <span>Overload</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-500 text-black font-semibold'
                  : 'bg-black/40 border border-white/5 text-slate-200'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 font-mono px-1">
              {m.time}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 p-2 rounded-xl max-w-fit">
            <Sparkles size={13} className="text-emerald-400 animate-spin" />
            <span>Calculating joint recovery & load adaptation...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Dr. Marcus about tendon healing, soreness, or weight increases..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold rounded-xl transition-colors cursor-pointer"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
