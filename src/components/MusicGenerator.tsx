import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Song, LyricsLine } from '../types/music';
import { Sparkles, Terminal, AudioLines, BookOpen, ChevronDown, WifiOff, Clock, Book, Radio, Search, X } from 'lucide-react';
import { QuranPageViewer } from './QuranPageViewer';
import { ContinuousStream, type StreamReciter } from './ContinuousStream';
import { ReciterCombobox } from './ReciterCombobox';
import { ALL_RECITERS, getQdcReciterId } from '../data/allReciters';
import { QURAN_SURAHS } from '../data/quranMetadata';
import { useLanguage } from '../services/i18n';

interface MusicGeneratorProps {
  onSongGenerated: (song: Song) => void;
  onSourceChange?: (source: SearchSource) => void;
  isStreaming?: boolean;
  currentStreamSurah?: number;
  currentStreamReciter?: StreamReciter | null;
  streamReciterMode?: 'single' | 'shuffle';
  isPlaying?: boolean;
  onStartStream?: (startSurah: number, mode: 'single' | 'shuffle', reciter: StreamReciter) => void;
  onPauseResumeStream?: () => void;
  onStopStream?: () => void;
  onNextStreamSurah?: () => void;
  onPrevStreamSurah?: () => void;
}

export type SearchSource = 'quran' | 'recitation' | 'pages' | 'stream';

const DEFAULT_CHAPTERS = QURAN_SURAHS.map(s => ({
  id: s.id,
  name_simple: s.name,
  name_arabic: s.nameArabic,
  verses_count: s.verses,
  translated_name: { name: s.name }
}));

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({ 
  onSongGenerated, 
  onSourceChange,
  isStreaming = false,
  currentStreamSurah = 1,
  currentStreamReciter = null,
  streamReciterMode = 'single',
  isPlaying = false,
  onStartStream = () => {},
  onPauseResumeStream = () => {},
  onStopStream = () => {},
  onNextStreamSurah = () => {},
  onPrevStreamSurah = () => {}
}) => {
  const { t, language } = useLanguage();
  const [searchSource, setSearchSource] = useState<SearchSource>('quran');
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [chapters, setChapters] = useState<any[]>(DEFAULT_CHAPTERS);
  
  // Unified reciter selection from all 241 reciters (Default: 30 - Saad Al-Ghamdi / سعد الغامدي)
  const [selectedReciterId, setSelectedReciterId] = useState<number>(30);
  const selectedReciter = ALL_RECITERS.find(r => r.id === selectedReciterId) || ALL_RECITERS[0];

  // Surah selection combobox states
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [openSurahUpward, setOpenSurahUpward] = useState(false);
  const [surahDropdownMaxHeight, setSurahDropdownMaxHeight] = useState(240);
  const surahComboboxRef = useRef<HTMLDivElement | null>(null);

  // Smart positioning: flip Surah dropdown upwards if opened near the bottom of viewport
  const checkSurahPosition = useCallback(() => {
    if (surahComboboxRef.current) {
      const rect = surahComboboxRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const shouldOpenUp = (spaceBelow < 300 && spaceAbove > spaceBelow) || (spaceBelow < 240 && spaceAbove > 140);
      setOpenSurahUpward(shouldOpenUp);

      const availableHeight = shouldOpenUp
        ? Math.min(280, Math.max(140, spaceAbove - 20))
        : Math.min(280, Math.max(140, spaceBelow - 20));
      setSurahDropdownMaxHeight(availableHeight);
    }
  }, []);

  useEffect(() => {
    if (isSurahDropdownOpen) {
      checkSurahPosition();
      window.addEventListener('resize', checkSurahPosition);
      window.addEventListener('scroll', checkSurahPosition, true);
      return () => {
        window.removeEventListener('resize', checkSurahPosition);
        window.removeEventListener('scroll', checkSurahPosition, true);
      };
    }
  }, [isSurahDropdownOpen, checkSurahPosition]);

  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'warning' | 'error'>('idle');
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Memoized lists for Surah selection based on reciter's recorded surahs
  const availableSurahs = React.useMemo(() => {
    if (selectedReciter && selectedReciter.surahList) {
      return selectedReciter.surahList.split(',');
    }
    return [];
  }, [selectedReciter]);

  const filteredChaptersQuran = React.useMemo(() => {
    const query = surahSearchQuery.trim().toLowerCase();
    if (!query) return chapters;
    const numQuery = parseInt(query);
    return chapters.filter(ch => {
      if (!isNaN(numQuery)) {
        return ch.id === numQuery;
      }
      return (
        ch.name_simple.toLowerCase().includes(query) ||
        ch.translated_name.name.toLowerCase().includes(query) ||
        ch.name_arabic.includes(query)
      );
    });
  }, [chapters, surahSearchQuery]);

  const filteredChaptersRecitation = React.useMemo(() => {
    const query = surahSearchQuery.trim().toLowerCase();
    const numQuery = parseInt(query);
    return chapters.filter(ch => {
      // Check if the surah is supported by the selected MP3 reciter
      if (availableSurahs.length > 0 && !availableSurahs.includes(String(ch.id))) {
        return false;
      }
      if (!query) return true;
      if (!isNaN(numQuery)) {
        return ch.id === numQuery;
      }
      return (
        ch.name_simple.toLowerCase().includes(query) ||
        ch.translated_name.name.toLowerCase().includes(query) ||
        ch.name_arabic.includes(query)
      );
    });
  }, [chapters, surahSearchQuery, availableSurahs]);

  // Click outside handler to close the Surah dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (surahComboboxRef.current && !surahComboboxRef.current.contains(e.target as Node)) {
        setIsSurahDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const consoleContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll terminal logs to bottom internally
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Optionally fetch rich metadata for chapters from Quran.com API
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.chapters) && data.chapters.length > 0) {
            setChapters(data.chapters);
          }
        }
      } catch (err) {
        console.warn("Quran chapters API call failed. Using precompiled surah list.", err);
      }
    };

    fetchChapters();
  }, []);

  // Source selection helper
  const selectSource = (source: SearchSource) => {
    setSearchSource(source);
    setSurahSearchQuery('');
    setIsSurahDropdownOpen(false);
    if (onSourceChange) {
      onSourceChange(source);
    }
  };
  const handleAddTrack = async (track: any) => {
    if (addingTrackId) return;
    setAddingTrackId(track.id);
    setLoadingStatus('idle');
    setLoadingMessage('');
    setLoadingProgress(null);

    const reciterDisplayName = language === 'ar' 
      ? (selectedReciter.nameArabic || selectedReciter.name) 
      : (selectedReciter.name || selectedReciter.nameArabic);

    try {
      if (track.isQuran) {
        const surahNum = track.chapterId;
        const paddedSurah = String(surahNum).padStart(3, '0');

        setLogs(prev => [
          ...prev,
          `[QURAN-LOAD] Loading Surah ${track.name_simple} by ${reciterDisplayName}...`,
          `[PROCESS] Fetching audio metadata & bilingual verses...`
        ]);

        setLoadingStatus('loading');
        setLoadingProgress(null);
        setLoadingMessage('Fetching audio metadata & bilingual verses...');

        // Direct high-quality MP3 audio from MP3Quran server
        let audioUrl = selectedReciter.server
          ? `${selectedReciter.server}${paddedSurah}.mp3`
          : `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;

        let verseTimings: any[] = [];
        let apiDuration = 0;
        let arabicAyahs: any[] = [];
        let translationAyahs: any[] = [];

        try {
          if (!navigator.onLine) {
            throw new Error("internet connection failed, please try again");
          }

          // 1. Fetch Arabic text & English translation from alquran.cloud in parallel
          const [resArabic, resTrans] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`).catch(() => null),
            fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.sahih`).catch(() => null)
          ]);

          if (resArabic && resArabic.ok) {
            const jsonArabic = await resArabic.json();
            if (jsonArabic && jsonArabic.code === 200 && jsonArabic.data && jsonArabic.data.ayahs) {
              arabicAyahs = jsonArabic.data.ayahs;
            }
          }
          if (resTrans && resTrans.ok) {
            const jsonTrans = await resTrans.json();
            if (jsonTrans && jsonTrans.code === 200 && jsonTrans.data && jsonTrans.data.ayahs) {
              translationAyahs = jsonTrans.data.ayahs;
            }
          }

          // 2. Fetch Audio URL & exact timings from api.qurancdn.com
          const qdcId = selectedReciter.qdcId || getQdcReciterId(selectedReciter);
          if (qdcId) {
            try {
              const resAudio = await fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${qdcId}/audio_files?chapter=${surahNum}&segments=true`);
              if (resAudio.ok) {
                const json = await resAudio.json();
                const audioFile = json.audio_files?.[0];
                if (audioFile && audioFile.verse_timings && audioFile.verse_timings.length > 0) {
                  verseTimings = audioFile.verse_timings;
                  // Use matching audio file URL to ensure 100% microsecond sync between audio and verse segments
                  if (audioFile.audio_url) {
                    audioUrl = audioFile.audio_url;
                  }
                  apiDuration = audioFile.duration ? (audioFile.duration / 1000) : 0;
                }
              }
            } catch {
              // ignore
            }
          }

        } catch (err: any) {
          console.warn("Quran details fetch failed:", err);
          if (!navigator.onLine || err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('network')) {
            throw err;
          }
        }

        // Determine duration
        let duration = apiDuration;
        if (!duration && verseTimings.length > 0) {
          const lastTiming = verseTimings[verseTimings.length - 1];
          duration = (lastTiming.timestamp_to || lastTiming.timestamp_from || 0) / 1000;
        }

        if (!duration) {
          // Calculate duration dynamically via a temporary Audio node
          const tempAudio = new Audio(audioUrl);
          tempAudio.preload = "metadata";
          tempAudio.load();
          await new Promise<void>((resolve) => {
            tempAudio.onloadedmetadata = () => resolve();
            tempAudio.onerror = () => resolve();
            setTimeout(resolve, 3000); // 3s max wait for metadata
          });
          duration = tempAudio.duration || 120;
        }

        let lyricsLines: LyricsLine[] = [];
        if (arabicAyahs.length > 0) {
          setLogs(prev => [
            ...prev,
            `[OK] Loaded ${arabicAyahs.length} bilingual verses (Arabic & English).`,
            `[PROCESS] Syncing verses to timeline...`
          ]);

          if (verseTimings.length > 0) {
            // High-precision sync from verified verse segment timestamps
            lyricsLines = arabicAyahs.map((ayah, index) => {
              const arabicText = ayah.text || "";
              const translationText = translationAyahs[index]?.text || "";

              const verseKey = `${surahNum}:${index + 1}`;
              const timing = verseTimings.find((t: any) => t.verse_key === verseKey);
              const startTime = timing ? (timing.timestamp_from / 1000) : (index * (duration / arabicAyahs.length));
              const verseDuration = timing ? ((timing.timestamp_to - timing.timestamp_from) / 1000) : (duration / arabicAyahs.length);

              return {
                text: `[${index + 1}] ${arabicText} \n (${translationText})`,
                time: startTime,
                duration: verseDuration
              };
            });
          } else {
            // Proportional distribution weighted by ayah text length (much closer to real recitation pace than linear)
            const totalChars = arabicAyahs.reduce((sum, a) => sum + (a.text?.trim().length || 1), 0);
            let currentTimestamp = 0;
            lyricsLines = arabicAyahs.map((ayah, index) => {
              const arabicText = ayah.text || "";
              const translationText = translationAyahs[index]?.text || "";
              const weight = (arabicText.trim().length || 1) / Math.max(1, totalChars);
              const verseDuration = Math.max(2, weight * duration);
              const startTime = currentTimestamp;
              currentTimestamp += verseDuration;

              return {
                text: `[${index + 1}] ${arabicText} \n (${translationText})`,
                time: startTime,
                duration: verseDuration
              };
            });
          }
        } else {
          setLogs(prev => [
            ...prev,
            `[WARNING] alquran.cloud API offline. Aligning recitation guides...`
          ]);
          lyricsLines = [
            { text: `Surah ${track.name_simple}`, time: 2, duration: 4 },
            { text: `Recited by ${reciterDisplayName}`, time: 7, duration: 5 },
            { text: `📖 Read and listen 📖`, time: 15, duration: duration - 16 }
          ];
        }

        const newSong: Song = {
          id: `${track.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: track.name,
          artist: reciterDisplayName,
          genre: 'cozy',
          tempo: 60,
          key: 'C',
          lyrics: lyricsLines,
          chords: [],
          seed: Math.random(),
          duration: duration,
          audioUrl: audioUrl
        };

        setLoadingStatus('idle');
        setLoadingMessage('');
        setLoadingProgress(null);
        setLogs(prev => [...prev, `[SUCCESS] Surah successfully added to playlist.`]);
        onSongGenerated(newSong);

      } else if (track.isRecitationOnly) {
        const surahNum = track.chapterId;
        const paddedSurah = String(surahNum).padStart(3, '0');

        setLogs(prev => [
          ...prev,
          `[REC-LOAD] Loading Surah ${track.name_simple} recitation by ${reciterDisplayName}...`,
          `[PROCESS] Resolving MP3 URL from MP3Quran servers...`
        ]);

        setLoadingStatus('loading');
        setLoadingProgress(null);
        setLoadingMessage('Resolving MP3 URL...');

        const audioUrl = selectedReciter.server
          ? `${selectedReciter.server}${paddedSurah}.mp3`
          : `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;

        setLogs(prev => [
          ...prev,
          `[OK] Stream URL resolved: ${audioUrl}`,
          `[PROCESS] Extracting track duration...`
        ]);

        // Calculate duration dynamically via a temporary Audio node
        const tempAudio = new Audio(audioUrl);
        tempAudio.preload = "metadata";
        tempAudio.load();
        await new Promise<void>((resolve) => {
          tempAudio.onloadedmetadata = () => resolve();
          tempAudio.onerror = () => resolve();
          setTimeout(resolve, 4000); // 4s max wait for metadata
        });

        const duration = tempAudio.duration || 120;

        setLogs(prev => [
          ...prev,
          `[OK] Duration locked: ${Math.round(duration)}s.`,
          `[PROCESS] Compiling recitation container...`
        ]);

        const newSong: Song = {
          id: `${track.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: track.name,
          artist: reciterDisplayName,
          genre: 'minimalist',
          tempo: 60,
          key: 'C',
          lyrics: [], // No lyrics timeline in recitation-only mode
          chords: [],
          seed: Math.random(),
          duration: duration,
          audioUrl: audioUrl
        };

        setLoadingStatus('idle');
        setLoadingMessage('');
        setLoadingProgress(null);
        setLogs(prev => [...prev, `[SUCCESS] Recitation successfully added to playlist.`]);
        onSongGenerated(newSong);
      }
    } catch (err: any) {
      console.error("Failed to add track:", err);
      const isNetworkError = !navigator.onLine ||
        err.name === 'TypeError' ||
        err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.message?.toLowerCase().includes('failed to fetch') ||
        err.message?.toLowerCase().includes('internet connection failed');

      const errMsg = isNetworkError
        ? "internet connection failed, please try again"
        : (err.message || err.toString());

      setLoadingStatus('error');
      setLoadingMessage(errMsg);
      setLoadingProgress(null);
      setLogs(prev => [...prev, `[ERROR] Failed to add track: ${errMsg}`]);
    } finally {
      setAddingTrackId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--accent-primary)] glow-accent" />
          <h2 className="text-md font-bold uppercase tracking-wider">{t.streamImportTitle}</h2>
        </div>
      </div>

      {/* Source choosing selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-1" id="search-source-selector">
        <button
          type="button"
          onClick={() => selectSource('quran')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${searchSource === 'quran' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1" />
          {t.tabQuran}
        </button>
        <button
          type="button"
          onClick={() => selectSource('recitation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${searchSource === 'recitation' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
          id="source-btn-recitation"
        >
          <AudioLines className="w-3.5 h-3.5 mr-1" />
          {t.tabRecitation}
        </button>
        <button
          type="button"
          onClick={() => selectSource('pages')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${searchSource === 'pages' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
          id="source-btn-pages"
        >
          <Book className="w-3.5 h-3.5 mr-1" />
          {t.tabPages}
        </button>
        <button
          type="button"
          onClick={() => selectSource('stream')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${searchSource === 'stream' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
          id="source-btn-stream"
        >
          <Radio className="w-3.5 h-3.5 mr-1 animate-pulse" />
          {t.tabStream}
        </button>
      </div>

      {/* Main Mode Rendering: Pages Reader vs Continuous Stream vs Audio Stream Form */}
      {searchSource === 'pages' ? (
        <div className="flex flex-col gap-3" id="quran-pages-section-wrapper">
          <QuranPageViewer />
        </div>
      ) : searchSource === 'stream' ? (
        <div className="flex flex-col gap-3" id="continuous-stream-section-wrapper">
          <ContinuousStream
            isStreaming={isStreaming}
            currentStreamSurah={currentStreamSurah}
            currentStreamReciter={currentStreamReciter}
            reciterMode={streamReciterMode}
            isPlaying={isPlaying}
            onStartStream={onStartStream}
            onPauseResumeStream={onPauseResumeStream}
            onStopStream={onStopStream}
            onNextStreamSurah={onNextStreamSurah}
            onPrevStreamSurah={onPrevStreamSurah}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {searchSource === 'quran' && (
            <ReciterCombobox
              selectedReciterId={selectedReciterId}
              onSelectReciter={(reciter) => setSelectedReciterId(reciter.id)}
              reciters={ALL_RECITERS}
              label={t.selectReciter}
              placeholder={t.searchReciter}
              id="quran-reciter-combobox"
            />
          )}

          {searchSource === 'recitation' && (
            <ReciterCombobox
              selectedReciterId={selectedReciterId}
              onSelectReciter={(reciter) => setSelectedReciterId(reciter.id)}
              reciters={ALL_RECITERS}
              label={t.selectMp3Reciter}
              placeholder={t.searchMp3Reciter}
              id="mp3-reciter-combobox"
            />
          )}

        {/* Select Surah Combobox */}
        <div ref={surahComboboxRef} className="flex flex-col gap-1.5 relative z-30" id="surah-selector-wrapper">
          <label className="text-[10px] font-mono text-theme-muted uppercase tracking-wider select-none">
            {t.selectSurah}
          </label>
          <div className="combobox-input-wrapper">
            <div className="combobox-search-icon">
              <Search className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              placeholder={t.searchSurahs}
              value={surahSearchQuery}
              onChange={(e) => {
                setSurahSearchQuery(e.target.value);
                if (e.target.value !== "") {
                  setIsSurahDropdownOpen(true);
                  setTimeout(checkSurahPosition, 0);
                } else {
                  setIsSurahDropdownOpen(false);
                }
              }}
              onFocus={() => {
                setIsSurahDropdownOpen(true);
                setTimeout(checkSurahPosition, 0);
              }}
              className="combobox-input-field"
              id="quran-surah-search"
            />

            <div className="combobox-actions-group">
              {surahSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSurahSearchQuery('')}
                  className="combobox-icon-btn"
                  title={language === 'ar' ? 'مسح البحث' : 'Clear search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const next = !isSurahDropdownOpen;
                  setIsSurahDropdownOpen(next);
                  if (next) setTimeout(checkSurahPosition, 0);
                }}
                className="combobox-icon-btn"
                title="Toggle Surah List"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSurahDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Scrollable Surah Options List with Smart Upward Flip */}
            {isSurahDropdownOpen && (
              <div
                className={`reciter-combobox-dropdown flex flex-col gap-1 overflow-y-auto border border-[var(--border-color)] rounded-xl p-1.5 shadow-2xl absolute left-0 right-0 quran-reader-scroll ${
                  openSurahUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                }`}
                style={{ 
                  zIndex: 9999, 
                  backgroundColor: 'var(--bg-primary)',
                  maxHeight: `${surahDropdownMaxHeight}px`
                }}
                id="quran-surahs-list"
              >
                {/* List items selection */}
                {((searchSource === 'quran') ? filteredChaptersQuran : filteredChaptersRecitation).length === 0 ? (
                  <span className="text-[10px] text-theme-muted p-1 text-center select-none">No Surahs found</span>
                ) : (
                  ((searchSource === 'quran') ? filteredChaptersQuran : filteredChaptersRecitation).map((ch) => {
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          // Construct the track object dynamically
                          const track = searchSource === 'quran' ? {
                            id: `quran-ch-${ch.id}`,
                            isQuran: true,
                            chapterId: ch.id,
                            name: `Surah ${ch.name_simple} (${ch.name_arabic})`,
                            artist_name: `Verses: ${ch.verses_count} | ${ch.translated_name.name}`,
                            verses_count: ch.verses_count,
                            name_simple: ch.name_simple
                          } : {
                            id: `recitation-ch-${ch.id}`,
                            isRecitationOnly: true,
                            chapterId: ch.id,
                            name: `Surah ${ch.name_simple} (${ch.name_arabic})`,
                            artist_name: `Reciter: ${language === 'ar' ? (selectedReciter.nameArabic || selectedReciter.name) : (selectedReciter.name || selectedReciter.nameArabic)}`,
                            verses_count: ch.verses_count,
                            name_simple: ch.name_simple
                          };
                          handleAddTrack(track);
                          setSurahSearchQuery('');
                          setIsSurahDropdownOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded text-start text-xs bg-transparent text-theme-muted hover:bg-white/5 hover:text-theme-primary border-0 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-theme-primary truncate">{ch.id}. {ch.name_simple} ({ch.name_arabic})</span>
                          <span className="text-[9px] text-theme-muted truncate">{ch.translated_name.name} ({ch.verses_count} verses)</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Track Loading / Progress Panel */}
        {loadingStatus !== 'idle' && (
          <div className="flex flex-col gap-2.5 border border-[var(--border-color)] bg-[var(--bg-panel)] rounded-xl p-3 shadow-md animate-none" id="track-loading-panel">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-theme-muted uppercase tracking-wider flex items-center gap-1.5 select-none">
                {loadingStatus === 'loading' && <div className="w-2.5 h-2.5 border-2 border-t-transparent border-[var(--accent-primary)] rounded-full animate-spin" />}
                {loadingStatus === 'warning' && <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse mr-0.5" style={{ color: '#fbbf24' }} />}
                {loadingStatus === 'error' && <WifiOff className="w-3.5 h-3.5 text-red-400 mr-0.5" />}
                Track Loader Status
              </span>
              {(loadingStatus === 'error' || loadingStatus === 'warning') && (
                <button
                  type="button"
                  onClick={() => {
                    setLoadingStatus('idle');
                    setLoadingMessage('');
                    setLoadingProgress(null);
                  }}
                  className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-color)] bg-transparent hover:bg-white/5 text-theme-muted hover:text-theme-primary transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-theme-primary truncate">
                  {loadingStatus === 'loading' ? 'Downloading Recitation Audio...' : loadingStatus === 'warning' ? 'Slow Connection Warning' : 'Fetch Error'}
                </span>
                {loadingProgress !== null && (
                  <span className="font-mono font-bold text-[var(--accent-secondary)]">{loadingProgress}%</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {loadingMessage && (
                  <p className="text-[10px]" style={{ color: loadingStatus === 'error' ? '#f87171' : loadingStatus === 'warning' ? '#fbbf24' : 'var(--text-muted)' }}>
                    {loadingMessage}
                  </p>
                )}
              </div>

              {loadingProgress !== null && (
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-[var(--border-color)]/20">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Terminal Log Console */}
      {addingTrackId !== null || logs.length > 0 ? (
        <div className="w-full border border-[var(--border-color)] rounded-xl bg-black/80 p-3 h-32 flex flex-col font-mono text-[10px] text-green-400 overflow-hidden relative shadow-inner">
          <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-1 mb-1 text-[9px] text-zinc-500 select-none">
            <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-zinc-400" /> MUSIC HUD CONSOLE</span>
            {addingTrackId !== null && <span className="animate-pulse text-green-500">PROCESSING...</span>}
          </div>
          <div ref={consoleContainerRef} className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
