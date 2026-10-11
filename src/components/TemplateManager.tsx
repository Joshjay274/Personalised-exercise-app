import React, { useState } from 'react';
import {
  Plus,
  Play,
  Clock,
  ShieldCheck,
  Dumbbell,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Flame,
  Calendar,
  Layers
} from 'lucide-react';
import { WorkoutTemplate, Exercise, SplitType, BodyTarget } from '../types';
import { EXERCISE_DATABASE, SPLIT_TYPE_LABELS } from '../data/exercises';
import { WeeklyRoutinePlanner } from './WeeklyRoutinePlanner';

interface TemplateManagerProps {
  templates: WorkoutTemplate[];
  onStartWorkout: (template: WorkoutTemplate) => void;
  onSaveTemplate: (newTemplate: WorkoutTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  activeRoutineId?: string;
  onSelectRoutineId?: (routineId: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onStartWorkout,
  onSaveTemplate,
  onDeleteTemplate,
  activeRoutineId,
  onSelectRoutineId
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'routines' | 'library'>('routines');
  const [filterSplit, setFilterSplit] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(templates[0]?.id || null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // New template form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSplit, setNewSplit] = useState<SplitType>('Hybrid_FullBody');
  const [selectedExIds, setSelectedExIds] = useState<string[]>([
    'warmup_wrist_circles',
    'incline_pushup_wall',
    'forearm_plank_hold',
    'cooldown_knee_extension_stretch'
  ]);
  const [exerciseFilterCategory, setExerciseFilterCategory] = useState<string>('all');

  const filteredTemplates = templates.filter((t) => {
    if (filterSplit === 'all') return true;
    return t.splitType === filterSplit;
  });

  const toggleSelectExercise = (id: string) => {
    if (selectedExIds.includes(id)) {
      setSelectedExIds(selectedExIds.filter((e) => e !== id));
    } else {
      setSelectedExIds([...selectedExIds, id]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || selectedExIds.length === 0) return;

    const newTemplate: WorkoutTemplate = {
      id: `custom_${Date.now()}`,
      name: newTitle.trim(),
      splitType: newSplit,
      estimatedMinutes: Math.round(selectedExIds.length * 6),
      jointFocus: ['wrists', 'core'],
      difficulty: 'Intermediate',
      exercises: selectedExIds
    };

    onSaveTemplate(newTemplate);
    setIsCreating(false);
    setNewTitle('');
    setExpandedId(newTemplate.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header & New Template Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Workout Splits & Routines</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            4-Day weekly periodized routines & custom split library engineered for safe progressive overload.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setActiveSubTab('library');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Build Custom Split</span>
        </button>
      </div>

      {/* Primary Sub-Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-black/40 rounded-2xl border border-white/5 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('routines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'routines'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={14} />
          <span>4-Day Weekly Routines</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'library'
              ? 'bg-white text-slate-900 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          <span>All Splits & Library ({templates.length})</span>
        </button>
      </div>

      {/* 4-Day Weekly Routine View */}
      {activeSubTab === 'routines' && (
        <WeeklyRoutinePlanner
          templates={templates}
          onStartWorkoutByTemplate={onStartWorkout}
          activeRoutineId={activeRoutineId}
          onSelectRoutineId={onSelectRoutineId}
        />
      )}

      {/* Library View Filter Tabs */}
      {activeSubTab === 'library' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/5">
          <button
            onClick={() => setFilterSplit('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${filterSplit === 'all' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            All Splits ({templates.length})
          </button>
          {Object.entries(SPLIT_TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterSplit(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${filterSplit === key ? 'bg-white text-slate-900 font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {label.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* CREATE CUSTOM TEMPLATE MODAL / INLINE BUILDER */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-[#12141c] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-emerald-400" />
              Build Custom Workout Split
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Split Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Calisthenics & Wrist Recovery Day"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Split Category</label>
              <select
                value={newSplit}
                onChange={(e) => setNewSplit(e.target.value as SplitType)}
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="PPL_Push">Push (Chest & Triceps)</option>
                <option value="PPL_Pull">Pull (Back, Arms & Core)</option>
                <option value="PPL_Legs">Legs & Mobility</option>
                <option value="Hybrid_FullBody">Hybrid Full Body</option>
                <option value="Joint_Core_Focus">Joint Rehab & Core</option>
              </select>
            </div>
          </div>

          {/* Exercise Picker Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase text-slate-400">
                Select Exercises ({selectedExIds.length} chosen)
              </label>

              {/* Category sub-filters */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                {['all', 'calisthenics', 'core', 'dumbbell', 'barbell', 'joint_health', 'warmup'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setExerciseFilterCategory(cat)}
                    className={`px-2 py-0.5 rounded transition-colors capitalize ${exerciseFilterCategory === cat ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-black/30 rounded-xl border border-white/5">
              {EXERCISE_DATABASE.filter((e) => {
                if (exerciseFilterCategory === 'all') return true;
                if (exerciseFilterCategory === 'core') return e.target.includes('core');
                return e.category === exerciseFilterCategory;
              }).map((ex) => {
                const isSelected = selectedExIds.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => toggleSelectExercise(ex.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-start justify-between gap-2 ${isSelected ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white leading-tight">{ex.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                        {ex.category} · {ex.target.join(', ')}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-emerald-500 text-black' : 'border border-white/20'}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedExIds.length === 0}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-xl text-xs transition-colors"
            >
              Save Template
            </button>
          </div>
        </form>
      )}

      {/* Templates List */}
      {activeSubTab === 'library' && (
        <div className="space-y-3">
        {filteredTemplates.map((template) => {
          const isExpanded = expandedId === template.id;
          const isCustom = template.id.startsWith('custom_');

          return (
            <div
              key={template.id}
              className="bg-[#12141c] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-colors shadow-lg"
            >
              <div
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : template.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-emerald-400">
                      {SPLIT_TYPE_LABELS[template.splitType] || template.splitType}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{template.difficulty}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{template.name}</h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={13} className="text-slate-500" />
                      ~{template.estimatedMinutes} mins
                    </span>
                    <span>·</span>
                    <span>{template.exercises.length} Exercises</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
                      <ShieldCheck size={13} />
                      {template.jointFocus.join(', ')} safe
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWorkout(template);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10 shrink-0"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Start Session</span>
                  </button>

                  {isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTemplate(template.id);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                      title="Delete Template"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <div className="p-1.5 text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Expanded Exercise Sequence Breakdown */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-black/20 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400 mb-2">Exercise Sequence</div>
                  <div className="space-y-1.5">
                    {template.exercises.map((exId, idx) => {
                      const ex = EXERCISE_DATABASE.find((e) => e.id === exId);
                      if (!ex) return null;
                      return (
                        <div
                          key={`${exId}-${idx}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[11px] text-slate-300">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-semibold text-white">{ex.name}</div>
                              <div className="text-[11px] text-slate-400 capitalize">
                                {ex.category} · {ex.defaultDurationSec ? `${ex.defaultDurationSec}s timer` : `${ex.defaultSets} sets × ${ex.defaultReps} reps`}
                              </div>
                            </div>
                          </div>

                          <span className="text-[11px] text-emerald-400 font-mono">
                            {ex.target.join(' · ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
