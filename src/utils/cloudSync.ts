import { UserProfile, StrengthHistoryEntry, WorkoutTemplate } from '../types';

export interface CloudSyncResponse {
  found: boolean;
  email?: string;
  userProfile?: UserProfile;
  strengthHistory?: StrengthHistoryEntry[];
  templates?: WorkoutTemplate[];
  lastUpdated?: string;
  message?: string;
  error?: string;
}

export async function fetchCloudData(email: string): Promise<CloudSyncResponse> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { found: false, error: 'Invalid email address' };
  }

  try {
    const res = await fetch(`/api/sync/get?email=${encodeURIComponent(cleanEmail)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { found: false, error: err.error || 'Server error fetching sync' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to fetch cloud sync data:', err);
    return { found: false, error: err?.message || 'Network error' };
  }
}

export async function saveCloudData(
  email: string,
  userProfile: UserProfile,
  strengthHistory: StrengthHistoryEntry[],
  templates: WorkoutTemplate[]
): Promise<{ success: boolean; lastUpdated?: string; error?: string }> {
  const cleanEmail = (email || userProfile.cloudSyncEmail || userProfile.email || '').toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  try {
    const res = await fetch('/api/sync/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        userProfile,
        strengthHistory,
        templates
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to save to cloud' };
    }

    const data = await res.json();
    return { success: true, lastUpdated: data.lastUpdated };
  } catch (err: any) {
    console.error('Failed to save cloud sync data:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
