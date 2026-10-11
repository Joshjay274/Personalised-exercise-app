import React, { useState } from 'react';
import { Music, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface SpotifyPlayerProps {
  playlistUrl: string;
  onUpdatePlaylistUrl: (url: string) => void;
}

const PLAYLIST_PRESETS = [
  { name: 'Gym Beats', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN2aqioXM' },
  { name: 'Heavy Lifting Metal', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76t638V64Cr' },
  { name: 'BPM Electronic Flow', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4eRPd9frC0m' },
  { name: 'Calisthenics Vibes', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u' }
];

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  playlistUrl,
  onUpdatePlaylistUrl
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>(playlistUrl);

  const handleApplyPreset = (url: string) => {
    setCustomInput(url);
    onUpdatePlaylistUrl(url);
  };

  return (
    <div className="bg-[#12141c] border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all">
      <div
        className="p-3.5 bg-[#151926] flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760]">
            <Music size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              Spotify Workout Sound
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-pulse" />
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Sync background audio</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hover:text-white">
            {isOpen ? 'Minimize' : 'Expand Player'}
          </span>
          {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3 bg-black/40 border-t border-white/5 animate-in fade-in duration-150">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {PLAYLIST_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p.url)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${playlistUrl === p.url ? 'bg-[#1ed760] text-black font-semibold' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Embedded Spotify iFrame */}
          <div className="rounded-xl overflow-hidden bg-black/60 border border-white/5">
            <iframe
              src={playlistUrl}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Workout Player"
              className="rounded-xl"
            />
          </div>

          {/* Custom URL Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste Spotify embed URL..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1ed760]"
            />
            <button
              onClick={() => onUpdatePlaylistUrl(customInput)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
