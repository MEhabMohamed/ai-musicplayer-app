import { useState, useEffect, useRef } from 'react';
import type { Song, ThemeId } from './types/music';
import { AudioEngine } from './services/AudioEngine';
import { SongTicker } from './components/SongTicker';
import { MusicGenerator, type SearchSource } from './components/MusicGenerator';
import { PlaylistManager } from './components/PlaylistManager';
import { MediaControls } from './components/MediaControls';
import { Radio, Languages, RotateCw, User, SkipForward, Sparkles } from 'lucide-react';
import { LanguageProvider, useLanguage } from './services/i18n';
import { QURAN_SURAHS } from './data/quranMetadata';
import { 
  fetchSurahTrack, 
  STREAM_RECITERS, 
  type StreamReciter 
} from './components/ContinuousStream';

const DEFAULT_RECITER: StreamReciter = STREAM_RECITERS.find(r => r.id === 30) || STREAM_RECITERS[0];

function AppContent() {
  const { t, language, toggleLanguage } = useLanguage();

  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeId>('mushaf');
  const [activeSource, setActiveSource] = useState<SearchSource>('quran');

  // Continuous Stream State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamSurah, setStreamSurah] = useState<number>(1);
  const [streamReciterMode, setStreamReciterMode] = useState<'single' | 'shuffle'>('single');
  const [streamReciter, setStreamReciter] = useState<StreamReciter | null>(DEFAULT_RECITER);
  const [streamTrack, setStreamTrack] = useState<Song | null>(null);

  // Synchronous references to guard against race conditions, rapid skipping and duplicate triggers
  const isAdvancingRef = useRef(false);
  const streamSurahRef = useRef(1);
  const isStreamingRef = useRef(false);
  const activeSourceRef = useRef<SearchSource>('quran');
  const streamReciterRef = useRef<StreamReciter | null>(DEFAULT_RECITER);
  const streamReciterModeRef = useRef<'single' | 'shuffle'>('single');

  // Keep refs in sync with state
  useEffect(() => {
    streamSurahRef.current = streamSurah;
  }, [streamSurah]);
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);
  useEffect(() => {
    activeSourceRef.current = activeSource;
  }, [activeSource]);
  useEffect(() => {
    streamReciterRef.current = streamReciter;
  }, [streamReciter]);
  useEffect(() => {
    streamReciterModeRef.current = streamReciterMode;
  }, [streamReciterMode]);

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

  const currentSong = isStreaming 
    ? (streamTrack || songs.find(s => s.id === currentSongId) || null)
    : (songs.find(s => s.id === currentSongId) || streamTrack || null);

  // Apply active theme class to document body
  useEffect(() => {
    document.body.className = `theme-${activeTheme}`;
  }, [activeTheme]);

  // Register dynamic duration listener on mount to resolve true durations of tracks
  useEffect(() => {
    audioEngine.current.registerDurationCallback((loadedDuration) => {
      if (loadedDuration && loadedDuration > 0 && loadedDuration !== Infinity) {
        setDuration(loadedDuration);
        if (isStreamingRef.current) {
          setStreamTrack(prev => prev ? { ...prev, duration: loadedDuration } : null);
        } else {
          setSongs(prevSongs => prevSongs.map(song => 
            song.id === currentSongId ? { ...song, duration: loadedDuration } : song
          ));
        }
      }
    });

    // Native ended event from HTML5 audio: advance to next track reliably
    audioEngine.current.registerEndedCallback(() => {
      if (isStreamingRef.current || activeSourceRef.current === 'stream') {
        advanceStream(1);
      } else {
        handleNext();
      }
    });
  }, [currentSongId]);

  // Handle media player time ticker update
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        const time = audioEngine.current.getCurrentTime();
        setCurrentTime(time);

        // Sync lyrics for non-stream sections that have lyrics
        if (activeSourceRef.current !== 'stream' && currentSong && currentSong.lyrics && currentSong.lyrics.length > 0) {
          syncLyrics(time);

          // For playlist tracks: auto-advance when reaching the end
          if (time >= currentSong.duration - 0.2) {
            handleNext();
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSongId, songs, shuffle, loop, duration, isStreaming, streamSurah, streamReciterMode, streamReciter, streamTrack]);

  // Sync lyrics with play timestamps
  const syncLyrics = (time: number) => {
    if (!currentSong || !currentSong.lyrics || currentSong.lyrics.length === 0) return;

    const lyrics = currentSong.lyrics;

    // If before the first line, display the first line
    if (time < lyrics[0].time) {
      setCurrentLyricText(lyrics[0].text);
      lastSpokenLineIndex.current = 0;
      return;
    }

    // Find active verse: seamlessly hold current verse during breath pauses until next verse starts
    let activeIdx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      const nextLineStart = i + 1 < lyrics.length ? lyrics[i + 1].time : (line.time + line.duration + 2);
      if (time >= line.time && time < nextLineStart) {
        activeIdx = i;
        break;
      }
    }

    // If past last line but still in playback
    if (activeIdx === -1 && time >= lyrics[lyrics.length - 1].time) {
      activeIdx = lyrics.length - 1;
    }

    if (activeIdx !== -1) {
      setCurrentLyricText(lyrics[activeIdx].text);
      lastSpokenLineIndex.current = activeIdx;
    }
  };

  // --- Controls Handlers ---

  const handlePlayPause = () => {
    if (!currentSong) {
      if (activeSource === 'stream' && !isStreaming) {
        handleStartStream(streamSurah, streamReciterMode, streamReciter || STREAM_RECITERS[0]);
      }
      return;
    }

    if (isPlaying) {
      audioEngine.current.pause();
      setIsPlaying(false);
    } else {
      audioEngine.current.start(currentSong, currentTime);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (isStreaming) {
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
    audioEngine.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    lastSpokenLineIndex.current = -1;
    setCurrentLyricText(currentSong ? t.readyStatus : t.noSongsLoaded);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    lastSpokenLineIndex.current = -1;
    if (isPlaying && currentSong) {
      audioEngine.current.start(currentSong, time);
    } else {
      audioEngine.current.seek(time);
    }
    if (currentSong && currentSong.lyrics && currentSong.lyrics.length > 0) {
      syncLyrics(time);
    }
  };

  // Continuous Stream Advance (Closed-loop: Wraps 114 -> 1 in Mushaf order with transition lock)
  const advanceStream = async (direction: 1 | -1 = 1) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    try {
      let nextSurah = streamSurahRef.current + direction;
      // Closed-loop: when Mushaf ends at Surah 114, restart from Surah 1!
      if (nextSurah > 114) nextSurah = 1;
      if (nextSurah < 1) nextSurah = 114;

      streamSurahRef.current = nextSurah;
      setStreamSurah(nextSurah);
      setIsStreaming(true);
      isStreamingRef.current = true;

      let nextReciter = streamReciterRef.current;
      if (streamReciterModeRef.current === 'shuffle') {
        const available = STREAM_RECITERS.filter(r => r.id !== streamReciterRef.current?.id);
        nextReciter = available[Math.floor(Math.random() * available.length)] || STREAM_RECITERS[0];
        streamReciterRef.current = nextReciter;
        setStreamReciter(nextReciter);
      }
      if (!nextReciter) {
        nextReciter = STREAM_RECITERS[0];
        streamReciterRef.current = nextReciter;
      }

      setCurrentLyricText(t.loadingTrack);
      const nextTrack = await fetchSurahTrack(nextSurah, nextReciter);
      setStreamTrack(nextTrack);
      selectTrack(nextTrack);
    } catch (err) {
      console.error("Stream advance error:", err);
    } finally {
      // Release lock after audio starts to ensure only 1 advance occurs
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 600);
    }
  };

  const handleStartStream = async (startSurah: number, mode: 'single' | 'shuffle', reciter: StreamReciter) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    try {
      setIsStreaming(true);
      isStreamingRef.current = true;
      streamSurahRef.current = startSurah;
      setStreamSurah(startSurah);
      streamReciterModeRef.current = mode;
      setStreamReciterMode(mode);
      streamReciterRef.current = reciter;
      setStreamReciter(reciter);

      setCurrentLyricText(t.loadingTrack);
      const streamSong = await fetchSurahTrack(startSurah, reciter);
      setStreamTrack(streamSong);
      selectTrack(streamSong);
    } catch (err) {
      console.error("Failed to start continuous stream:", err);
    } finally {
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 600);
    }
  };

  const handleNext = () => {
    if (isStreaming || activeSource === 'stream') {
      advanceStream(1);
      return;
    }

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
    if (isStreaming || activeSource === 'stream') {
      advanceStream(-1);
      return;
    }

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
    setCurrentLyricText(t.loadingTrack);

    setCurrentSongId(song.id);
    setDuration(song.duration);

    // Autoplay next song if player was running or if streaming
    setTimeout(() => {
      audioEngine.current.start(song, 0);
      setIsPlaying(true);
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
            setCurrentLyricText(t.noSongsLoaded);
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

  const activeStreamSurahMeta = QURAN_SURAHS.find(s => s.id === streamSurah) || QURAN_SURAHS[0];
  const nextStreamSurahNum = streamSurah >= 114 ? 1 : streamSurah + 1;
  const nextStreamSurahMeta = QURAN_SURAHS.find(s => s.id === nextStreamSurahNum) || QURAN_SURAHS[0];

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
              {t.appTitle}
            </h1>
            <p className="text-[10px] font-serif text-theme-muted tracking-widest uppercase">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Header Controls: Language Switcher & Theme Select */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end" id="header-controls-group">
          {/* Language Switch Button */}
          <button
            id="lang-toggle-btn"
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)] text-xs font-bold text-theme-primary hover:border-[var(--accent-primary)] hover:bg-white/5 transition-all shadow-sm cursor-pointer"
            title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            <Languages className="w-4 h-4 text-[var(--accent-secondary)]" />
            <span>{t.switchToLang}</span>
          </button>

          {/* Theme selector controls */}
          <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-panel)]">
            {(['mushaf', 'kiswa', 'parchment', 'noor', 'fajr'] as ThemeId[]).map(themeId => {
              const themeName = themeId === 'mushaf' ? t.themeMushaf :
                                themeId === 'kiswa' ? t.themeKiswa :
                                themeId === 'parchment' ? t.themeParchment :
                                themeId === 'noor' ? t.themeNoor : t.themeFajr;
              return (
                <button
                  key={themeId}
                  id={`theme-btn-${themeId}`}
                  onClick={() => setActiveTheme(themeId)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase transition-all ${
                    activeTheme === themeId ? 'btn-active' : 'btn-inactive'
                  }`}
                >
                  {themeName}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden min-h-0">

        {/* Left Hand: Creation & Inventory controls (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1 relative z-20">
          {activeSource !== 'stream' && (
            <div className="glass-panel p-4 flex-1 flex flex-col min-h-[250px]">
              <PlaylistManager
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onSelectSong={selectTrack}
                onRemoveSong={handleRemoveSong}
              />
            </div>
          )}

          <div className={`glass-panel p-4 flex flex-col gap-3 ${activeSource === 'stream' ? 'flex-1' : ''}`}>
            <MusicGenerator 
              onSongGenerated={handleAddSong} 
              onSourceChange={(source) => {
                setActiveSource(source);
                setShowLyricsSection(source === 'quran' || source === 'stream');
              }}
              isStreaming={isStreaming}
              currentStreamSurah={streamSurah}
              currentStreamReciter={streamReciter}
              streamReciterMode={streamReciterMode}
              isPlaying={isPlaying}
              onStartStream={handleStartStream}
              onPauseResumeStream={handlePlayPause}
              onStopStream={handleStop}
              onNextStreamSurah={() => advanceStream(1)}
              onPrevStreamSurah={() => advanceStream(-1)}
            />
          </div>
        </section>

        {/* Right Hand: Deck Player & Visuals console (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4 justify-between overflow-y-auto pr-1 relative z-10">

          {/* Ticker HUD */}
          <div className="glass-panel p-4">
            <SongTicker song={currentSong} isPlaying={isPlaying} />
          </div>

          {/* Dedicated Recitation Station for Continuous Stream vs Lyrics/Ayahs Timeline for other sections */}
          {activeSource === 'stream' ? (
            <div className="glass-panel p-6 flex-1 flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[300px]">
              {/* Scanline grid overlay */}
              <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5" />
              {/* Subtle ambient background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Stream Status & Loop Progress */}
              <div className="w-full flex items-center justify-between text-xs font-mono select-none z-10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    {isPlaying ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-secondary)] opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-secondary)]" />
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                    )}
                  </span>
                  <span className="font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
                    {isPlaying ? t.streamStatusLive : t.streamStatusPaused}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-theme-primary text-[11px]">
                  <RotateCw className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-spin-slow" />
                  <span>{streamSurah} / 114</span>
                </div>
              </div>

              {/* Grand Arabic Surah Calligraphy & Recitation Details */}
              <div className="my-auto flex flex-col items-center gap-2.5 z-10 py-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--accent-secondary)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.streamNowPlaying}</span>
                </span>

                {/* Grand Arabic Surah Name */}
                <h2 className="text-3xl sm:text-5xl font-bold font-arabic-title text-theme-primary drop-shadow-[0_0_15px_var(--accent-primary)]">
                  سورة {activeStreamSurahMeta.nameArabic}
                </h2>

                <div className="text-sm sm:text-base font-semibold text-theme-muted flex items-center gap-2">
                  <span>Surah {activeStreamSurahMeta.id}. {activeStreamSurahMeta.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 font-mono">
                    {activeStreamSurahMeta.verses} {t.versesCount}
                  </span>
                </div>

                {/* Active Reciter Badge */}
                <div className="mt-1 px-4 py-1 rounded-full bg-black/30 border border-[var(--border-color)] text-xs text-[var(--accent-secondary)] flex items-center gap-2 font-medium">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    {streamReciter 
                      ? (language === 'ar' ? (streamReciter.nameArabic || streamReciter.name) : (streamReciter.name || streamReciter.nameArabic))
                      : STREAM_RECITERS[0].name}
                  </span>
                  <span className="opacity-60 text-[10px]">
                    ({streamReciterMode === 'shuffle' ? t.streamShuffleReciter : t.streamSingleReciter})
                  </span>
                </div>

                {/* Sound wave bars */}
                <div className="flex items-center gap-1.5 h-7 mt-2 select-none">
                  {[35, 70, 50, 85, 60, 95, 40, 80, 55, 75, 45, 90, 65, 50, 70].map((h, idx) => (
                    <div
                      key={idx}
                      className="w-1 rounded-full bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-150"
                      style={{
                        height: isPlaying ? `${Math.max(20, h)}%` : '20%',
                        opacity: isPlaying ? 0.9 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom: Next in Queue Mushaf Notice */}
              <div className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-[var(--border-color)] text-theme-muted z-10 select-none">
                <div className="flex items-center gap-2">
                  <SkipForward className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span className="font-semibold text-theme-primary">{t.streamNextInQueue}:</span>
                  <span className="text-theme-muted font-serif">
                    {nextStreamSurahMeta.id}. {nextStreamSurahMeta.name} ({nextStreamSurahMeta.nameArabic})
                  </span>
                </div>

                {streamSurah === 114 && (
                  <span className="text-[10px] font-bold text-[var(--accent-secondary)] px-2 py-0.5 rounded bg-[var(--accent-secondary)]/20 animate-pulse">
                    {t.streamLoopNotice}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Karaoke Lyrics / Ayahs Timeline (for all other sections) */
            <div className="glass-panel p-4 flex-1 flex flex-col justify-between gap-4 min-h-[300px]">
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
                    <Languages className="w-3.5 h-3.5" /> {t.lyricsTimelineTitle}
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
          )}

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

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
