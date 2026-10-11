import React, { useState } from 'react';
import { Cloud, RefreshCw, CheckCircle2, AlertCircle, Smartphone, Monitor, ShieldCheck, Mail } from 'lucide-react';
import { UserProfile } from '../types';

interface CloudSyncCardProps {
  userProfile: UserProfile;
  onSaveCloudSync: (email: string) => Promise<void>;
  onFetchCloudSync: (email: string) => Promise<void>;
  isSyncing: boolean;
  syncMessage: string;
}

export const CloudSyncCard: React.FC<CloudSyncCardProps> = ({
  userProfile,
  onSaveCloudSync,
  onFetchCloudSync,
  isSyncing,
  syncMessage
}) => {
  const [email, setEmail] = useState<string>(userProfile.cloudSyncEmail || userProfile.email || '');

  const isConnected = Boolean(userProfile.cloudSyncConnected && userProfile.cloudSyncEmail);

  return (
    <div className="bg-[#12141c] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Cloud size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Cross-Device Email Cloud Sync</h3>
              {isConnected ? (
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Synced
                </span>
              ) : (
                <span className="text-[10px] font-mono bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">
                  Local Device
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sync workouts, streak days, custom routines, and weights across your phone, tablet, and computer.
            </p>
          </div>
        </div>

        {userProfile.lastSyncTimestamp && (
          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5 shrink-0 self-start sm:self-auto">
            Last synced: {new Date(userProfile.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Sync Status Feedback Message */}
      {syncMessage && (
        <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
          syncMessage.includes('✓')
            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
        }`}>
          {syncMessage.includes('✓') ? (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-amber-400 shrink-0" />
          )}
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Email Input & Sync Actions */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Your Sync Email Address
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. athlete@gmail.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSaveCloudSync(email)}
              disabled={isSyncing || !email.includes('@')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync This Device'}</span>
            </button>

            <button
              onClick={() => onFetchCloudSync(email)}
              disabled={isSyncing || !email.includes('@')}
              className="px-3 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
              title="Restore profile from another device using this email"
            >
              Restore Cloud
            </button>
          </div>
        </div>
      </div>

      {/* Highlights & Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-slate-400 font-mono border-t border-white/5">
        <div className="flex items-center gap-1.5 bg-black/20 p-2 rounded-xl">
          <Smartphone size={13} className="text-cyan-400 shrink-0" />
          <span>Mobile Phone PWA</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 p-2 rounded-xl">
          <Monitor size={13} className="text-emerald-400 shrink-0" />
          <span>Tablet / Desktop</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 p-2 rounded-xl">
          <ShieldCheck size={13} className="text-amber-400 shrink-0" />
          <span>Auto-Synced Every Session</span>
        </div>
      </div>
    </div>
  );
};
