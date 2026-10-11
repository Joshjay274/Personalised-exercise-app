import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'card' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  // If already running in standalone mode or just installed
  if (isInstalled || justInstalled) {
    if (variant === 'settings' || variant === 'card') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <CheckCircle size={15} />
          <span>App Installed · Standalone Mode</span>
        </div>
      );
    }
    return null;
  }

  // Variant: Header button
  if (variant === 'header') {
    if (isInstallable) {
      return (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer ${className}`}
          title="Install Smart Hybrid Coach as a standalone app"
        >
          <Download size={13} strokeWidth={2.5} />
          <span>Install App</span>
        </button>
      );
    }

    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition-all cursor-pointer ${className}`}
            title="Install app on iOS Safari"
          >
            <Smartphone size={13} />
            <span>Install on iOS</span>
          </button>

          {showIOSGuide && (
            <IOSGuideModal onClose={() => setShowIOSGuide(false)} />
          )}
        </>
      );
    }

    return null;
  }

  // Variant: Card / Banner on Dashboard or Settings
  return (
    <>
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-[#12141c] via-[#151926] to-[#0f1117] border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Install Smart Hybrid Coach
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                PWA Native
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-md">
              Run fullscreen without browser navigation bars or AI Studio wrapper frames. Instant offline access with fast load times.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Download size={14} strokeWidth={2.5} />
              <span>Install to Device</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <Smartphone size={14} />
              <span>iOS Instructions</span>
            </button>
          )}

          {!isInstallable && !isIOS && (
            <span className="text-[11px] text-slate-400 font-mono">
              In browser menu: choose "Add to Home Screen" or "Install"
            </span>
          )}
        </div>
      </div>

      {showIOSGuide && (
        <IOSGuideModal onClose={() => setShowIOSGuide(false)} />
      )}
    </>
  );
};

function IOSGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#151926] border border-white/15 p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
          <Smartphone size={20} />
        </div>

        <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
        <p className="mt-1 text-xs text-slate-300">
          Run Smart Hybrid Coach as a standalone home-screen app without Safari toolbars:
        </p>

        <div className="mt-4 space-y-3 text-xs text-slate-200">
          <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Tap the</span>
              <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded">
                <Share2 size={12} /> Share
              </span>
              <span>button in Safari's toolbar.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Scroll down and tap</span>
              <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded">
                <PlusSquare size={12} /> Add to Home Screen
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
            <span>Tap <strong>Add</strong> in the top right corner. The icon will appear directly on your home screen.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
