import { useState, useEffect, useRef } from 'react';
import type { Song, ThemeId, VisualizerMode } from './types/music';
import { AudioEngine } from './services/AudioEngine';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SongTicker } from './components/SongTicker';
import { MusicGenerator } from './components/MusicGenerator';
import { PlaylistManager } from './components/PlaylistManager';
import { MediaControls } from './components/MediaControls';
import { Radio, Languages } from 'lucide-react';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeId>('cyberpunk');
  const activeVisualizer: VisualizerMode = 'sonic-waves';

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLyricsSection, setShowLyricsSection] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState(false);

  // Lyric Scrolling State
  const [currentLyricText, setCurrentLyricText] = useState('No Audio Loaded');

  // Singleton instance of AudioEngine
  const audioEngine = useRef<AudioEngine>(new AudioEngine());
  const lastSpokenLineIndex = useRef<number>(-1);

  const currentSong = songs.find(s => s.id === currentSongId) || null;

  // Apply active theme class to document body
  useEffect(() => {
    document.body.className = `theme-${activeTheme}`;
  }, [activeTheme]);

  // Register dynamic duration listener on mount to resolve true durations of tracks
  useEffect(() => {
    audioEngine.current.registerDurationCallback((loadedDuration) => {
      if (loadedDuration && loadedDuration > 0 && loadedDuration !== Infinity) {
        setDuration(loadedDuration);
        setSongs(prevSongs => prevSongs.map(song => 
          song.id === currentSongId ? { ...song, duration: loadedDuration } : song
        ));
      }
    });
  }, [currentSongId]);

  // Handle media player time ticker update & auto-play-next check
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        const time = audioEngine.current.getCurrentTime();
        setCurrentTime(time);

        // Sync lyrics
        if (currentSong) {
          syncLyrics(time);

          // Check if song has finished (within 0.3s of end)
          if (time >= currentSong.duration - 0.3) {
            handleNext();
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSongId, songs, shuffle, loop, duration]);

  // Sync lyrics with play timestamps
  const syncLyrics = (time: number) => {
    if (!currentSong) return;

    // Find the lyric line that matches current time
    const lineIndex = currentSong.lyrics.findIndex(
      line => time >= line.time && time < (line.time + line.duration)
    );

    if (lineIndex !== -1) {
      const activeLine = currentSong.lyrics[lineIndex];
      setCurrentLyricText(activeLine.text);
      lastSpokenLineIndex.current = lineIndex;
    } else {
      // Look for sound effect tags or show resting
      const nextLine = currentSong.lyrics.find(l => l.time > time);
      if (nextLine && nextLine.time - time > 4) {
        setCurrentLyricText('// Instrumental Break //');
      }
    }
  };

  // --- Controls Handlers ---

  const handlePlayPause = () => {
    if (!currentSong) return;

    if (isPlaying) {
      audioEngine.current.pause();
      setIsPlaying(false);
    } else {
      audioEngine.current.start(currentSong, currentTime);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    audioEngine.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    lastSpokenLineIndex.current = -1;
    setCurrentLyricText(currentSong ? 'Ready' : 'No Songs Loaded');
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    lastSpokenLineIndex.current = -1;
    if (isPlaying && currentSong) {
      audioEngine.current.start(currentSong, time);
    } else {
      audioEngine.current.seek(time);
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;

    if (loop && !shuffle) {
      // If loop mode is on and not shuffling, replay same track
      handleSeek(0);
      return;
    }

    let nextIdx = 0;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * songs.length);
    } else if (currentSongId) {
      const currentIdx = songs.findIndex(s => s.id === currentSongId);
      nextIdx = (currentIdx + 1) % songs.length;
    }

    selectTrack(songs[nextIdx]);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    let prevIdx = 0;

    if (currentSongId) {
      const currentIdx = songs.findIndex(s => s.id === currentSongId);
      prevIdx = currentIdx - 1 < 0 ? songs.length - 1 : currentIdx - 1;
    }

    selectTrack(songs[prevIdx]);
  };

  const selectTrack = (song: Song) => {
    if (song.id === currentSongId) {
      handlePlayPause();
      return;
    }

    audioEngine.current.stop();
    setCurrentTime(0);
    lastSpokenLineIndex.current = -1;
    setCurrentLyricText('Loading Track...');

    setCurrentSongId(song.id);
    setDuration(song.duration);

    // Autoplay next song if player was running
    setTimeout(() => {
      audioEngine.current.start(song, 0);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }, 100);
  };

  const handleRemoveSong = (songId: string) => {
    setSongs(prevSongs => {
      const remaining = prevSongs.filter(s => s.id !== songId);

      // Handle player state updates asynchronously
      if (currentSongId === songId) {
        if (remaining.length > 0) {
          setTimeout(() => selectTrack(remaining[0]), 0);
        } else {
          setTimeout(() => {
            handleStop();
            setCurrentSongId(null);
            setDuration(0);
            setCurrentLyricText('No Songs Loaded');
          }, 0);
        }
      }
      return remaining;
    });
  };

  const handleAddSong = (newSong: Song) => {
    setSongs(prev => {
      const updated = [...prev, newSong];
      if (prev.length === 0) {
        setTimeout(() => selectTrack(newSong), 0);
      }
      return updated;
    });

    // Scroll to the playlist container when a track is added
    setTimeout(() => {
      const playlistElement = document.getElementById('playlist-tracks-container');
      if (playlistElement) {
        playlistElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col justify-between overflow-hidden">
      {/* Header Deck */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)] mb-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-md">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-1.5 text-theme-primary">
              My Audio Player
            </h1>
            <p className="text-[10px] font-serif text-theme-muted tracking-widest uppercase">
              Stream & Media Player Console
            </p>
          </div>
        </div>

        {/* Theme select controls */}
        <div className="flex items-center gap-2" id="theme-selector-group">
          <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-panel)]">
            {(['cyberpunk', 'retro', 'futuristic', 'cozy', 'minimalist'] as ThemeId[]).map(t => (
              <button
                key={t}
                id={`theme-btn-${t}`}
                onClick={() => setActiveTheme(t)}
                className={`px-2.5 py-1.5 text-[10px] font-bold uppercase transition-all ${activeTheme === t ? 'btn-active' : 'btn-inactive'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden min-h-0">

        {/* Left Hand: Creation & Inventory controls (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="glass-panel p-4 flex-1 flex flex-col min-h-[250px]">
            <PlaylistManager
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onSelectSong={selectTrack}
              onRemoveSong={handleRemoveSong}
            />
          </div>

          <div className="glass-panel p-4 flex flex-col gap-3">
            <MusicGenerator 
              onSongGenerated={handleAddSong} 
              onSourceChange={(source) => setShowLyricsSection(source === 'quran')}
            />
          </div>
        </section>

        {/* Right Hand: Deck Player & Visuals console (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4 justify-between overflow-y-auto pr-1">

          {/* Ticker HUD */}
          <div className="glass-panel p-4">
            <SongTicker song={currentSong} isPlaying={isPlaying} />
          </div>

          {/* Visualizer Display Screen & Karaoke Lyrics */}
          <div className="glass-panel p-4 flex-1 flex flex-col justify-between gap-4 min-h-[300px]">
            {/* Visualizer */}
            <AudioVisualizer
              analyser={audioEngine.current.getAnalyser()}
              isPlaying={isPlaying}
              mode={activeVisualizer}
              voiceAmplitude={0}
            />

            {/* Glowing Lyrics Screen */}
            {(currentSong 
              ? (currentSong.lyrics && currentSong.lyrics.length > 0) 
              : showLyricsSection
            ) && (
              <div
                className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-[var(--bg-screen)] rounded-xl border border-[var(--border-color)] shadow-inner min-h-[100px] relative overflow-hidden"
                id="lyrics-screen-display"
              >
                {/* Scanline grid overlay */}
                <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5" />

                <span className="text-[10px] font-serif text-[var(--accent-secondary)] uppercase tracking-widest mb-3 flex items-center gap-1 select-none">
                  <Languages className="w-3.5 h-3.5" /> Lyrics Timeline
                </span>

                <p
                  className={`text-base sm:text-lg font-bold tracking-wide transition-all duration-300 ${isPlaying
                    ? 'text-theme-primary scale-[1.01] filter drop-shadow-[0_0_8px_var(--accent-primary)]'
                    : 'text-[var(--text-screen-muted)]'
                    }`}
                >
                  {currentLyricText.split('\n').map((line, idx) => (
                    <span key={idx} style={{ display: 'block', marginTop: idx > 0 ? '0.35rem' : 0 }}>
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>

          {/* Player controls */}
          <div className="glass-panel p-4">
            <MediaControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              currentTime={currentTime}
              duration={duration}
              shuffle={shuffle}
              loop={loop}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
              onNext={handleNext}
              onPrev={handlePrev}
              onSeek={handleSeek}
              onVolumeChange={(v) => { setVolume(v); audioEngine.current.setVolume(v); }}
              onMuteToggle={() => { setIsMuted(!isMuted); audioEngine.current.setMute(!isMuted); }}
              onShuffleToggle={() => setShuffle(!shuffle)}
              onLoopToggle={() => setLoop(!loop)}
            />
          </div>

        </section>
      </main>

      {/* Auxiliary Global CSS rules */}
      <style>{`
        .bg-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          ), linear-gradient(
            90deg, 
            rgba(255, 0, 0, 0.06), 
            rgba(0, 255, 0, 0.02), 
            rgba(0, 0, 255, 0.06)
          );
          background-size: 100% 4px, 6px 100%;
        }
      `}</style>
    </div>
  );
}
