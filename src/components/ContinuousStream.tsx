import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Song } from '../types/music';
import { QURAN_SURAHS } from '../data/quranMetadata';
import { ALL_RECITERS, type ReciterItem } from '../data/allReciters';
import { ReciterCombobox } from './ReciterCombobox';
import { useLanguage } from '../services/i18n';
import { 
  Radio, 
  Play, 
  Shuffle, 
  User, 
  RotateCw, 
  ChevronDown,
  Search,
  X
} from 'lucide-react';

export type StreamReciter = ReciterItem;
export const STREAM_RECITERS = ALL_RECITERS;

export async function fetchSurahTrack(surahNum: number, reciter: StreamReciter): Promise<Song> {
  const surahMeta = QURAN_SURAHS.find(s => s.id === surahNum) || QURAN_SURAHS[0];
  const paddedSurah = String(surahNum).padStart(3, '0');

  // Direct MP3 server URL from MP3Quran servers
  let audioUrl = "";
  if (reciter.server) {
    audioUrl = `${reciter.server}${paddedSurah}.mp3`;
  } else {
    audioUrl = `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;
  }

  return {
    id: `stream-surah-${surahNum}-${Date.now()}`,
    title: `Surah ${surahMeta.id}. ${surahMeta.name} (${surahMeta.nameArabic})`,
    artist: reciter.nameArabic ? `${reciter.nameArabic} (${reciter.name})` : reciter.name,
    genre: 'cozy',
    tempo: 60,
    key: 'C',
    lyrics: [],
    chords: [],
    seed: Math.random(),
    duration: 300,
    audioUrl,
    isStreamTrack: true,
    chapterId: surahNum
  };
}

interface ContinuousStreamProps {
  isStreaming: boolean;
  currentStreamSurah?: number;
  currentStreamReciter?: StreamReciter | null;
  reciterMode?: 'single' | 'shuffle';
  isPlaying?: boolean;
  onStartStream: (startSurah: number, mode: 'single' | 'shuffle', reciter: StreamReciter) => void;
  onPauseResumeStream?: () => void;
  onStopStream?: () => void;
  onNextStreamSurah?: () => void;
  onPrevStreamSurah?: () => void;
}

export const ContinuousStream: React.FC<ContinuousStreamProps> = ({
  isStreaming,
  onStartStream
}) => {
  const { t, language } = useLanguage();

  const [startingSurahId, setStartingSurahId] = useState<number>(1);
  const [selectedReciterMode, setSelectedReciterMode] = useState<'single' | 'shuffle'>('single');
  const [selectedReciterId, setSelectedReciterId] = useState<number>(30); // Default: 30 - Saad Al-Ghamdi / سعد الغامدي

  // Dropdown states
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [surahSearchText, setSurahSearchText] = useState('');
  const [openSurahUpward, setOpenSurahUpward] = useState(false);
  const [surahDropdownMaxHeight, setSurahDropdownMaxHeight] = useState(240);

  const surahDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (surahDropdownRef.current && !surahDropdownRef.current.contains(e.target as Node)) {
        setIsSurahDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Smart dropdown flip: if not enough room below, open upward
  const checkPosition = useCallback(() => {
    if (surahDropdownRef.current) {
      const rect = surahDropdownRef.current.getBoundingClientRect();
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
      checkPosition();
      window.addEventListener('resize', checkPosition);
      window.addEventListener('scroll', checkPosition, true);
      return () => {
        window.removeEventListener('resize', checkPosition);
        window.removeEventListener('scroll', checkPosition, true);
      };
    }
  }, [isSurahDropdownOpen, checkPosition]);

  const selectedReciter = ALL_RECITERS.find(r => r.id === selectedReciterId) || ALL_RECITERS[0];
  const startingSurah = QURAN_SURAHS.find(s => s.id === startingSurahId) || QURAN_SURAHS[0];

  // Filtered surahs for starting picker
  const filteredSurahs = QURAN_SURAHS.filter(s => {
    if (!surahSearchText.trim()) return true;
    const query = surahSearchText.toLowerCase();
    return (
      String(s.id).includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.nameArabic.includes(query)
    );
  });

  const handleStart = () => {
    onStartStream(startingSurahId, selectedReciterMode, selectedReciter);
  };

  return (
    <div className="flex flex-col gap-4 w-full" id="continuous-stream-panel">
      {/* Description Header Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/15 via-[var(--accent-secondary)]/10 to-[var(--accent-tertiary)]/15 border border-[var(--border-color)] select-none">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold tracking-wide text-theme-primary flex items-center gap-2">
              <span>{t.streamTitle}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] font-mono uppercase tracking-wider">
                114 ➔ 1 Loop
              </span>
            </h3>
            <p className="text-xs text-theme-muted mt-1 leading-relaxed">
              {t.streamSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Deck: Positioned at Top so Comboboxes are fully visible */}
      <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col gap-4">
        
        {/* Starting Surah Selector Combobox */}
        <div ref={surahDropdownRef} className="flex flex-col gap-1.5 relative">
          <label className="text-[11px] font-mono text-theme-muted uppercase tracking-wider flex items-center justify-between select-none">
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              {t.streamStartingSurah}
            </span>
            <span className="text-[10px] text-[var(--accent-secondary)] font-mono">
              {startingSurah.id} / 114
            </span>
          </label>

          <div className="combobox-input-wrapper">
            <div className="combobox-search-icon">
              <Search className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              value={surahSearchText ? surahSearchText : `${startingSurah.id}. ${startingSurah.name} (${startingSurah.nameArabic})`}
              onChange={(e) => {
                setSurahSearchText(e.target.value);
                if (!isSurahDropdownOpen) setIsSurahDropdownOpen(true);
              }}
              onFocus={() => {
                setIsSurahDropdownOpen(true);
                setSurahSearchText('');
                setTimeout(() => {
                  surahDropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 50);
              }}
              placeholder={t.searchSurahs}
              className="combobox-input-field"
              id="stream-starting-surah-input"
            />

            <div className="combobox-actions-group">
              {surahSearchText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSurahSearchText('');
                  }}
                  className="combobox-icon-btn"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                className="combobox-icon-btn"
                title="Toggle Surah List"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSurahDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Surah Dropdown List with Smart Upward/Downward flip */}
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
              >
                <div className="flex flex-col gap-1 overflow-y-auto max-h-52 pr-1 quran-reader-scroll">
                  {filteredSurahs.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setStartingSurahId(s.id);
                        setIsSurahDropdownOpen(false);
                        setSurahSearchText('');
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs text-start transition-all cursor-pointer ${
                        startingSurahId === s.id
                          ? 'bg-[var(--accent-primary)] text-white font-bold'
                          : 'hover:bg-white/10 text-theme-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono w-5 opacity-70">{s.id}.</span>
                        <span>{s.name}</span>
                      </div>
                      <span className="font-serif opacity-85">{s.nameArabic}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reciter Mode: Single Reciter vs Reciter Shuffle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-theme-muted uppercase tracking-wider select-none">
            {t.streamReciterMode}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedReciterMode('single')}
              className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                selectedReciterMode === 'single'
                  ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-theme-primary shadow-sm'
                  : 'bg-black/20 border-[var(--border-color)] text-theme-muted hover:border-white/30'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.streamSingleReciter}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedReciterMode('shuffle')}
              className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                selectedReciterMode === 'shuffle'
                  ? 'bg-[var(--accent-secondary)]/20 border-[var(--accent-secondary)] text-theme-primary shadow-sm'
                  : 'bg-black/20 border-[var(--border-color)] text-theme-muted hover:border-white/30'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{t.streamShuffleReciter}</span>
            </button>
          </div>
        </div>

        {/* Reciter Selector Combobox */}
        {selectedReciterMode === 'single' && (
          <ReciterCombobox
            selectedReciterId={selectedReciterId}
            onSelectReciter={(reciter) => setSelectedReciterId(reciter.id)}
            reciters={ALL_RECITERS}
            label={t.selectReciter}
            placeholder={t.searchReciter}
            id="stream-reciter-combobox"
          />
        )}

        {/* Start / Switch Stream Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-tertiary)] to-[var(--accent-secondary)] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isStreaming ? (language === 'ar' ? 'تحديث وتشغيل البث' : 'Update & Play Stream') : t.streamStartBtn}</span>
        </button>
      </div>
    </div>
  );
};
