import React from 'react';
import { 
  Play, Pause, Square, SkipForward, SkipBack, 
  Volume2, VolumeX, Shuffle, Repeat, Repeat1
} from 'lucide-react';
import { useLanguage } from '../services/i18n';
import type { RepeatMode } from './PlaylistManager';

interface MediaControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  
  // Handlers
  onPlayPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  onShuffleToggle: () => void;
  onRepeatOneToggle: () => void;
  onRepeatAllToggle: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  currentTime,
  duration,
  shuffle,
  repeatMode,
  onPlayPause,
  onStop,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onShuffleToggle,
  onRepeatOneToggle,
  onRepeatAllToggle
}) => {
  const { t } = useLanguage();

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Handle timeline slider change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Progress timeline scrubber */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-theme-muted w-10 text-right select-none">
          {formatTime(currentTime)}
        </span>
        
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleProgressChange}
          className="flex-1 h-1.5 rounded-full appearance-none bg-[var(--bg-panel)] accent-[var(--accent-primary)] cursor-pointer"
          id="player-timeline-scrubber"
          title="Timeline Scrubber"
        />

        <span className="text-xs font-mono text-theme-muted w-10 select-none">
          {formatTime(duration)}
        </span>
      </div>

      {/* Deck button controls */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 mt-1 w-full">
        {/* Playback Shuffle / Repeat toggles */}
        <div className="flex items-center gap-1.5 order-2 sm:order-1" id="play-mode-modifiers">
          <button
            onClick={onShuffleToggle}
            id="btn-shuffle"
            title={t.btnShuffle}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              shuffle ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          {/* Repeat Current Only */}
          <button
            onClick={onRepeatOneToggle}
            id="btn-loop-one"
            title={t.btnRepeatOne}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              repeatMode === 'one' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
          >
            <Repeat1 className="w-4 h-4" />
          </button>

          {/* Repeat Entire Playlist */}
          <button
            onClick={onRepeatAllToggle}
            id="btn-loop-all"
            title={t.btnRepeatAll}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              repeatMode === 'all' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Controls: Prev, Play/Pause, Stop, Next */}
        <div className="flex items-center gap-2.5 sm:gap-3 order-1 sm:order-2 mx-auto sm:mx-0" id="playback-controls-deck">
          <button
            onClick={onPrev}
            id="btn-prev"
            title={t.btnPrev}
            className="p-2.5 rounded-xl transition-all btn-inactive"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onPlayPause}
            id="btn-play-pause"
            title={isPlaying ? t.btnPause : t.btnPlay}
            className="p-4 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)] hover:scale-105 active:scale-95 text-white shadow-md glow-hover transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-white" />
            ) : (
              <Play className="w-5 h-5 fill-current text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onStop}
            id="btn-stop"
            title={t.btnStop}
            className="p-2.5 rounded-xl transition-all btn-inactive"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onNext}
            id="btn-next"
            title={t.btnNext}
            className="p-2.5 rounded-xl transition-all btn-inactive"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Volume HUD dial */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-3 ml-auto sm:ml-0" id="volume-control-hud">
          <button
            onClick={onMuteToggle}
            id="btn-mute-toggle"
            title={isMuted ? t.btnUnmute : t.btnMute}
            className={`p-2 transition-all rounded-lg cursor-pointer ${
              isMuted ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-1.5 rounded-full appearance-none bg-[var(--bg-panel)] accent-[var(--accent-primary)] cursor-pointer w-16 sm:w-20"
            id="volume-slider-hud"
            title={t.volumeLabel}
          />
        </div>
      </div>
    </div>
  );
};
