import React from 'react';
import type { Song } from '../types/music';
import { Play, Trash2, ListMusic } from 'lucide-react';

interface PlaylistManagerProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  songs,
  currentSong,
  isPlaying,
  onSelectSong,
  onRemoveSong
}) => {
  
  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 min-h-[220px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-[var(--accent-secondary)]" />
          <h2 className="text-md font-bold uppercase tracking-wider">Your Playlist</h2>
        </div>
      </div>

      {/* Songs List */}
      <div 
        className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1"
        id="playlist-tracks-container"
      >
        {songs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-theme-muted text-sm border border-[var(--border-color)]/30 rounded-xl bg-black/10">
            <span className="mb-2">Your playlist is empty.</span>
            <span className="text-xs">Search or prompt a theme above to synthesize a new track!</span>
          </div>
        ) : (
          songs.map((song) => {
            const isActive = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                id={`playlist-item-${song.id}`}
                className={`flex items-center justify-between p-3.5 transition-all duration-300 select-none group rounded-xl border ${
                  isActive 
                    ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-secondary)]/50 shadow-[0_0_12px_rgba(var(--accent-secondary),0.12)]' 
                    : 'bg-black/20 hover:bg-white/5 border-[var(--border-color)]/30 hover:border-[var(--border-color)]/60'
                }`}
              >
                {/* Track Details Button */}
                <button
                  onClick={() => onSelectSong(song)}
                  className="flex-1 flex items-center gap-3.5 text-left overflow-hidden mr-2 bg-transparent border-0 p-0 cursor-pointer"
                >
                  {/* Indicator Icon / Equalizer */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative">
                    {isActive ? (
                      isPlaying ? (
                        /* Minimalist CSS Equalizer Animation */
                        <div className="flex gap-0.5 items-end h-3" id="mini-equalizer">
                          <span className="w-0.5 bg-theme-primary rounded-full animate-eq-bar-1" />
                          <span className="w-0.5 bg-theme-primary/80 rounded-full animate-eq-bar-2" />
                          <span className="w-0.5 bg-theme-primary/60 rounded-full animate-eq-bar-3" />
                        </div>
                      ) : (
                        /* Minimalist CSS Equalizer Animation (Paused/Static) */
                        <div className="flex gap-0.5 items-end h-3" id="mini-equalizer">
                          <span className="w-0.5 bg-theme-primary rounded-full h-1" />
                          <span className="w-0.5 bg-theme-primary/80 rounded-full h-2.5" />
                          <span className="w-0.5 bg-theme-primary/60 rounded-full h-1.5" />
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 rounded-full border bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/25 flex items-center justify-center relative overflow-hidden transition-all">
                        <Play className="w-3.5 h-3.5 transition-colors fill-current text-theme-primary" />
                      </div>
                    )}
                  </div>

                  {/* Title and artist */}
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate text-theme-primary">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-theme-muted truncate">
                      {song.artist}
                    </p>
                  </div>

                  {/* Genre Badge */}
                  <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${
                    isActive 
                      ? 'border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary)]/10 text-theme-primary' 
                      : 'border-[var(--border-color)] bg-[var(--bg-panel)] text-theme-muted'
                  }`}>
                    {song.genre}
                  </span>
                </button>

                {/* Duration and remove actions */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono transition-all text-theme-muted">
                    {formatTime(song.duration)}
                  </span>
                  
                  <button
                    onClick={() => onRemoveSong(song.id)}
                    id={`btn-delete-${song.id}`}
                    title="Remove Song"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded border transition-all duration-300 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inject Equalizer animations style */}
      <style>{`
        @keyframes eq1 {
          0%, 100% { height: 3px; }
          50% { height: 12px; }
        }
        @keyframes eq2 {
          0%, 100% { height: 10px; }
          50% { height: 4px; }
        }
        @keyframes eq3 {
          0%, 100% { height: 4px; }
          50% { height: 11px; }
        }
        .animate-eq-bar-1 { animation: eq1 0.8s ease-in-out infinite; }
        .animate-eq-bar-2 { animation: eq2 0.6s ease-in-out infinite; }
        .animate-eq-bar-3 { animation: eq3 0.7s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
