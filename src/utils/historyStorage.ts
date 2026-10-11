import { StrengthHistoryEntry } from '../types';

const STORAGE_KEY = 'shc_strength_history_v5';
const PREVIOUS_STORAGE_KEYS = ['shc_strength_history_v4', 'shc_strength_history_v3', 'shc_strength_history_v2', 'shc_strength_history'];

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if a date string is from prior to the app's inception (e.g. September 18th or any September records)
export const isPreCreationDate = (dateStr?: string | null): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return true;
  const trimmed = dateStr.trim();
  // Any record mentioning September or '09-18' or September 2026/2024
  if (
    trimmed.includes('-09-') ||
    trimmed.startsWith('2026-09') ||
    trimmed.startsWith('2024-09') ||
    trimmed.startsWith('2025-09') ||
    /sep/i.test(trimmed)
  ) {
    return true;
  }
// Any date prior to October 1, 2026
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) && trimmed < '2026-10-01') {
    return true;
  }
  return false;
};

// Derive 1-based day number (1=Mon ... 7=Sun) from date string without UTC timezone drift
export const getDayNumberFromDateString = (dateStr?: string | null): number => {
  if (!dateStr || isPreCreationDate(dateStr)) {
    const todayIndex = new Date().getDay();
    return todayIndex === 0 ? 7 : todayIndex;
  }
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayIndex = dateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    return dayIndex === 0 ? 7 : dayIndex;
  } catch {
    const todayIndex = new Date().getDay();
    return todayIndex === 0 ? 7 : todayIndex;
  }
};

// Given a base date string, calculate the date string for another day of the same week (1=Mon ... 7=Sun)
export const getDateStringForDayNumber = (baseDateStr: string, targetDayNumber: number): string => {
  try {
    const validBase = (!baseDateStr || isPreCreationDate(baseDateStr)) ? getLocalDateString() : baseDateStr;
    const [year, month, day] = validBase.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);
    const baseDayIndex = baseDate.getDay();
    const baseDayNumber = baseDayIndex === 0 ? 7 : baseDayIndex; // 1 = Mon ... 7 = Sun
    const diffDays = targetDayNumber - baseDayNumber;
    const targetDate = new Date(year, month - 1, day + diffDays);
    return getLocalDateString(targetDate);
  } catch {
    return getLocalDateString();
  }
};

export const createBaselineEntry = (): StrengthHistoryEntry => {
  const now = new Date();
  const dateStr = getLocalDateString(now);
  const displayDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return {
    id: `hist_baseline_${dateStr}`,
    date: dateStr,
    displayDate,
    timestamp: now.getTime(),
    maxDumbbellWeightKg: 0,
    maxBarbellWeightKg: 0,
    workoutName: 'Starting Baseline Assessment',
    note: 'Initial safe load test (0kg DB unweighted bodyweight / 0kg Barbell baseline)',
    exercisesPerformed: [
      'Incline Wall Pushups (Wrist-Safe)',
      'Dumbbell Floor Press',
      'Forearm Core Plank (No Wrist Pressure)',
      'Wrist Circles & Dynamic Mobilization'
    ],
    thresholdCrossed: 'Baseline Established (0kg DB / 0kg Barbell)',
    isThresholdUpdate: true
  };
};

export const INITIAL_STRENGTH_HISTORY: StrengthHistoryEntry[] = [createBaselineEntry()];

// Sanitizer to completely strip out any old/mock records from before the app was created (e.g. September 18th)
function sanitizeHistory(entries: any[]): StrengthHistoryEntry[] {
  if (!Array.isArray(entries)) return [createBaselineEntry()];

  const cleaned = entries.filter((entry): entry is StrengthHistoryEntry => {
    if (!entry || typeof entry !== 'object') return false;

    // Strip out all legacy mock seed record IDs (hist_1 through hist_6)
    if (typeof entry.id === 'string' && /^hist_[1-6]$/.test(entry.id)) {
      return false;
    }

    // Strip out any dates from days before the app was created (especially September 18th)
    if (typeof entry.date === 'string' && isPreCreationDate(entry.date)) {
      return false;
    }

    if (typeof entry.displayDate === 'string' && /sep/i.test(entry.displayDate)) {
      return false;
    }

    return Boolean(entry.id && entry.date && typeof entry.maxDumbbellWeightKg === 'number');
  });

  return cleaned.length > 0 ? cleaned : [createBaselineEntry()];
}

export function getStrengthHistory(): StrengthHistoryEntry[] {
  if (typeof window === 'undefined') return INITIAL_STRENGTH_HISTORY;
  try {
    // Clean up all legacy storage keys containing stale mock dates
    PREVIOUS_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });

    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [createBaselineEntry()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeHistory(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch {
    const initial = [createBaselineEntry()];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {}
    return initial;
  }
}

export function saveStrengthCheckpoint(
  dbWeight: number,
  bbWeight: number,
  workoutName: string = 'Session Overload Update',
  note?: string,
  exercisesPerformed?: string[],
  thresholdCrossed?: string
): StrengthHistoryEntry[] {
  const current = getStrengthHistory();
  const previous = current[current.length - 1];
  const now = new Date();
  const dateStr = getLocalDateString(now);
  const displayDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Calculate threshold message if not provided
  let computedThreshold = thresholdCrossed;
  let isThresholdUpdate = Boolean(thresholdCrossed);

  if (!computedThreshold && previous) {
    if (dbWeight > previous.maxDumbbellWeightKg && bbWeight > previous.maxBarbellWeightKg) {
      computedThreshold = `Dumbbell (${dbWeight}kg) & Barbell (${bbWeight}kg) New Thresholds!`;
      isThresholdUpdate = true;
    } else if (dbWeight > previous.maxDumbbellWeightKg) {
      computedThreshold = `Dumbbell Threshold +${dbWeight - previous.maxDumbbellWeightKg}kg (${dbWeight}kg Peak)`;
      isThresholdUpdate = true;
    } else if (bbWeight > previous.maxBarbellWeightKg) {
      computedThreshold = `Barbell Threshold +${bbWeight - previous.maxBarbellWeightKg}kg (${bbWeight}kg Peak)`;
      isThresholdUpdate = true;
    } else if (dbWeight < previous.maxDumbbellWeightKg || bbWeight < previous.maxBarbellWeightKg) {
      computedThreshold = 'Joint Recovery Deload Adjustment';
      isThresholdUpdate = true;
    } else {
      computedThreshold = 'Weight Threshold Maintained';
    }
  }

  const defaultExercises = [
    'Incline Wall Pushups (Wrist-Safe)',
    'Dumbbell Floor Press',
    'Forearm Core Plank (No Wrist Pressure)'
  ];

  const newEntry: StrengthHistoryEntry = {
    id: `hist_${Date.now()}`,
    date: dateStr,
    displayDate,
    timestamp: now.getTime(),
    maxDumbbellWeightKg: dbWeight,
    maxBarbellWeightKg: bbWeight,
    workoutName,
    note,
    exercisesPerformed: exercisesPerformed && exercisesPerformed.length > 0 ? exercisesPerformed : defaultExercises,
    thresholdCrossed: computedThreshold || 'Threshold Recorded',
    isThresholdUpdate: isThresholdUpdate || true
  };

  const updated = [...current, newEntry];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
  }
  return updated;
}

export function deleteStrengthHistoryEntry(id: string): StrengthHistoryEntry[] {
  const current = getStrengthHistory();
  const filtered = current.filter((entry) => entry.id !== id);
  const result = filtered.length > 0 ? filtered : [createBaselineEntry()];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {}
  }
  return result;
}

export function resetStrengthHistory(): StrengthHistoryEntry[] {
  const resetList = [createBaselineEntry()];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetList));
      PREVIOUS_STORAGE_KEYS.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch {}
      });
    } catch {}
  }
  return resetList;
}

export function exportStrengthHistoryToCsv(historyData?: StrengthHistoryEntry[]): boolean {
  if (typeof window === 'undefined') return false;
  const data = historyData && historyData.length > 0 ? historyData : getStrengthHistory();
  if (!data || data.length === 0) return false;

  const headers = [
    'Date',
    'Workout Routine',
    'Max Dumbbell Weight (kg)',
    'Max Barbell Weight (kg)',
    'Threshold Milestone',
    'Exercises Performed',
    'Session Notes'
  ];

  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = data.map((entry) => [
    escapeCsv(entry.date),
    escapeCsv(entry.workoutName || 'Training Session'),
    escapeCsv(entry.maxDumbbellWeightKg),
    escapeCsv(entry.maxBarbellWeightKg),
    escapeCsv(entry.thresholdCrossed || 'Threshold Logged'),
    escapeCsv((entry.exercisesPerformed || []).join('; ')),
    escapeCsv(entry.note || '')
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const nowStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `smart_hybrid_coach_strength_history_${nowStr}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to export CSV:', err);
    return false;
  }
}
