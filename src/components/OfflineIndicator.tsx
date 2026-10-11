import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/90 text-black px-3.5 py-2 text-xs font-bold shadow-xl backdrop-blur-md border border-amber-300">
      <span className="h-2 w-2 rounded-full bg-black animate-ping" />
      <WifiOff size={14} />
      <span>Offline Mode — All workouts & plate data are cached locally</span>
    </div>
  );
};
