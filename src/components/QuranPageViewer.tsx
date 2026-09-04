import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Book, 
  ChevronLeft, 
  ChevronRight, 
  Languages, 
  Search, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  X, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { QURAN_SURAHS, QURAN_JUZS, type SurahMeta } from '../data/quranMetadata';
import { useLanguage } from '../services/i18n';

export type QuranVersion = 'arabic' | 'english' | 'dual';

interface AyahData {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
}

// In-memory cache across pages & editions for instant flipping
const pageCache: Record<string, AyahData[]> = {};

// Convert latin digits to Eastern Arabic numerals for Quranic ayah badges
function toArabicNumerals(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

interface QuranPageViewerProps {
  onPlaySurah?: (surahNumber: number) => void;
}

export const QuranPageViewer: React.FC<QuranPageViewerProps> = ({ onPlaySurah }) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem('quran_last_page');
    const parsed = saved ? parseInt(saved, 10) : 1;
    return (!isNaN(parsed) && parsed >= 1 && parsed <= 604) ? parsed : 1;
  });

  const [version, setVersion] = useState<QuranVersion>('arabic');
  const [ayahsArabic, setAyahsArabic] = useState<AyahData[]>([]);
  const [ayahsEnglish, setAyahsEnglish] = useState<AyahData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Jump / Index Modal states
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [indexTab, setIndexTab] = useState<'surah' | 'juz' | 'page'>('surah');
  const [surahFilterQuery, setSurahFilterQuery] = useState<string>('');
  const [inputPageNumber, setInputPageNumber] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Quick Surah select dropdown state
  const [isQuickSurahOpen, setIsQuickSurahOpen] = useState<boolean>(false);
  const [openQuickSurahUpward, setOpenQuickSurahUpward] = useState<boolean>(false);
  const [quickSurahMaxHeight, setQuickSurahMaxHeight] = useState<number>(240);
  const quickSurahRef = useRef<HTMLDivElement | null>(null);

  // Smart positioning: flip Quick Surah dropdown upwards if opened near the bottom of viewport
  const checkQuickSurahPosition = useCallback(() => {
    if (quickSurahRef.current) {
      const rect = quickSurahRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const shouldOpenUp = (spaceBelow < 280 && spaceAbove > spaceBelow) || (spaceBelow < 220 && spaceAbove > 140);
      setOpenQuickSurahUpward(shouldOpenUp);

      const availableHeight = shouldOpenUp
        ? Math.min(260, Math.max(140, spaceAbove - 20))
        : Math.min(260, Math.max(140, spaceBelow - 20));
      setQuickSurahMaxHeight(availableHeight);
    }
  }, []);

  useEffect(() => {
    if (isQuickSurahOpen) {
      checkQuickSurahPosition();
      window.addEventListener('resize', checkQuickSurahPosition);
      window.addEventListener('scroll', checkQuickSurahPosition, true);
      return () => {
        window.removeEventListener('resize', checkQuickSurahPosition);
        window.removeEventListener('scroll', checkQuickSurahPosition, true);
      };
    }
  }, [isQuickSurahOpen, checkQuickSurahPosition]);

  // Save current page to local storage
  useEffect(() => {
    try {
      localStorage.setItem('quran_last_page', String(currentPage));
    } catch {
      // ignore
    }
  }, [currentPage]);

  // Click outside listener for quick surah dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickSurahRef.current && !quickSurahRef.current.contains(e.target as Node)) {
        setIsQuickSurahOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch page data for both Arabic and English versions
  useEffect(() => {
    let isCancelled = false;

    const fetchPage = async () => {
      setIsLoading(true);
      setLoadError(null);

      const arabicKey = `arabic_${currentPage}`;
      const englishKey = `english_${currentPage}`;

      let arabicData = pageCache[arabicKey];
      let englishData = pageCache[englishKey];

      try {
        const promises: Promise<any>[] = [];

        if (!arabicData) {
          promises.push(
            fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`)
              .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
              })
              .then(json => {
                if (json.code === 200 && json.data?.ayahs) {
                  pageCache[arabicKey] = json.data.ayahs;
                  return { type: 'arabic', data: json.data.ayahs };
                }
                throw new Error(json.status || 'Failed to fetch Arabic page');
              })
          );
        }

        if (!englishData) {
          promises.push(
            fetch(`https://api.alquran.cloud/v1/page/${currentPage}/en.sahih`)
              .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
              })
              .then(json => {
                if (json.code === 200 && json.data?.ayahs) {
                  pageCache[englishKey] = json.data.ayahs;
                  return { type: 'english', data: json.data.ayahs };
                }
                throw new Error(json.status || 'Failed to fetch English page');
              })
          );
        }

        if (promises.length > 0) {
          const results = await Promise.allSettled(promises);
          if (isCancelled) return;

          for (const res of results) {
            if (res.status === 'fulfilled') {
              if (res.value.type === 'arabic') arabicData = res.value.data;
              if (res.value.type === 'english') englishData = res.value.data;
            }
          }
        }

        if (!isCancelled) {
          if (arabicData) setAyahsArabic(arabicData);
          if (englishData) setAyahsEnglish(englishData);

          if (!arabicData && !englishData) {
            setLoadError('Unable to load verses from API. Please check your internet connection.');
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setLoadError(err.message || 'Error fetching page verses.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isCancelled = true;
    };
  }, [currentPage]);

  // Handle jump to specific page
  const jumpToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= 604) {
      setCurrentPage(pageNum);
      setIsIndexOpen(false);
      setIsQuickSurahOpen(false);
      setInputPageNumber('');
    }
  };

  // Handle jump to specific Surah
  const jumpToSurah = (surah: SurahMeta) => {
    jumpToPage(surah.page);
  };

  // Surahs present on current page
  const currentSurahs = useMemo(() => {
    const list = ayahsArabic.length > 0 ? ayahsArabic : ayahsEnglish;
    const map = new Map<number, { id: number; name: string; englishName: string }>();
    for (const a of list) {
      if (!map.has(a.surah.number)) {
        map.set(a.surah.number, {
          id: a.surah.number,
          name: a.surah.name,
          englishName: a.surah.englishName
        });
      }
    }
    return Array.from(map.values());
  }, [ayahsArabic, ayahsEnglish]);

  // Current Juz & Hizb info
  const pageMeta = useMemo(() => {
    const source = ayahsArabic[0] || ayahsEnglish[0];
    if (!source) return { juz: 1, hizb: 1 };
    return {
      juz: source.juz,
      hizb: source.hizbQuarter
    };
  }, [ayahsArabic, ayahsEnglish]);

  // Filtered Surahs in Index modal
  const filteredSurahs = useMemo(() => {
    const q = surahFilterQuery.trim().toLowerCase();
    if (!q) return QURAN_SURAHS;
    const num = parseInt(q, 10);
    return QURAN_SURAHS.filter(s => {
      if (!isNaN(num)) return s.id === num || s.page === num;
      return (
        s.name.toLowerCase().includes(q) ||
        s.nameArabic.includes(q)
      );
    });
  }, [surahFilterQuery]);

  // Helper to clean Arabic bismillah when rendered inside verse 1
  const cleanArabicText = (ayah: AyahData) => {
    let text = ayah.text.trim();
    // Bismillah prefix in Uthmanic script
    const bismillahPrefix = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    if (ayah.numberInSurah === 1 && ayah.surah.number !== 1 && ayah.surah.number !== 9) {
      if (text.startsWith(bismillahPrefix)) {
        text = text.substring(bismillahPrefix.length).trim();
      }
    }
    return text;
  };

  return (
    <div className={`flex flex-col gap-3 w-full transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-50 p-4 md:p-8 bg-black/90 backdrop-blur-xl overflow-y-auto' : ''}`} id="quran-page-viewer-root">
      {/* Top Controls Header */}
      <div className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)] shadow-sm relative z-30">
        
        {/* Row 1: Version Selector & Navigation Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Version Switcher: Arabic / English / Dual */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]" id="quran-version-toggle-group">
            <button
              type="button"
              onClick={() => setVersion('arabic')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                version === 'arabic' ? 'btn-active shadow-sm' : 'bg-transparent text-theme-muted hover:text-theme-primary'
              }`}
              title="View Arabic Uthmanic Text"
              id="quran-version-arabic"
            >
              {t.versionArabic}
            </button>
            <button
              type="button"
              onClick={() => setVersion('english')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                version === 'english' ? 'btn-active shadow-sm' : 'bg-transparent text-theme-muted hover:text-theme-primary'
              }`}
              title="View English Translation"
              id="quran-version-english"
            >
              {t.versionEnglish}
            </button>
            <button
              type="button"
              onClick={() => setVersion('dual')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                version === 'dual' ? 'btn-active shadow-sm' : 'bg-transparent text-theme-muted hover:text-theme-primary'
              }`}
              title="View Arabic & English Parallel"
              id="quran-version-dual"
            >
              <Languages className="w-3 h-3" /> {t.versionDual}
            </button>
          </div>

          {/* Action buttons: Open Index modal + Fullscreen Expand */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => setIsIndexOpen(true)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[var(--accent-primary)] text-theme-primary transition-all flex items-center gap-1.5 shadow-sm"
              title={t.indexTitle}
              id="quran-index-open-btn"
            >
              <Book className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              <span>{t.indexBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[var(--accent-secondary)] text-theme-muted hover:text-theme-primary transition-all"
              title={isExpanded ? t.exitFullscreenBtn : t.fullscreenBtn}
              id="quran-expand-toggle-btn"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Page Jump Controls (Previous, Next, Input, Quick Surah Select) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]/60">
          
          {/* Prev / Next Buttons & Page Number Indicator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => jumpToPage(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-theme-primary transition-all flex items-center gap-1 text-xs"
              title={t.prevPageBtn}
              id="quran-prev-page-btn"
            >
              <ChevronLeft className="w-4 h-4 rotate-rtl" />
              <span className="hidden sm:inline">{t.prevPageBtn}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-theme-muted">{t.pageLabel}</span>
              <span className="font-bold text-[var(--accent-secondary)] text-sm px-1.5 py-0.5 rounded bg-black/30 border border-[var(--border-color)]/50">
                {currentPage}
              </span>
              <span className="text-theme-muted">/ 604</span>
            </div>

            <button
              type="button"
              onClick={() => jumpToPage(currentPage + 1)}
              disabled={currentPage >= 604 || isLoading}
              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-theme-primary transition-all flex items-center gap-1 text-xs"
              title={t.nextPageBtn}
              id="quran-next-page-btn"
            >
              <span className="hidden sm:inline">{t.nextPageBtn}</span>
              <ChevronRight className="w-4 h-4 rotate-rtl" />
            </button>
          </div>

          {/* Quick Jump Input & Quick Surah Dropdown */}
          <div className="flex items-center gap-1.5 relative z-40">
            {/* Quick Surah Dropdown Picker */}
            <div ref={quickSurahRef} className="relative z-50">
              <button
                type="button"
                onClick={() => {
                  const next = !isQuickSurahOpen;
                  setIsQuickSurahOpen(next);
                  if (next) setTimeout(checkQuickSurahPosition, 0);
                }}
                className="px-2 py-1 text-[11px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-theme-primary hover:border-[var(--accent-primary)] transition-all flex items-center gap-1"
                id="quran-quick-surah-btn"
                title="Choose Surah"
              >
                <Layers className="w-3 h-3 text-[var(--accent-primary)]" />
                <span className="max-w-[100px] truncate">
                  {currentSurahs[0]?.englishName || 'Jump Surah'}
                </span>
              </button>

              {isQuickSurahOpen && (
                <div 
                  className={`reciter-combobox-dropdown absolute right-0 overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-2xl p-1 z-[1000] quran-reader-scroll ${
                    openQuickSurahUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                  }`}
                  id="quran-quick-surahs-list"
                  style={{ 
                    zIndex: 1000,
                    maxHeight: `${quickSurahMaxHeight}px`
                  }}
                >
                  <div className="p-1.5 text-[10px] font-mono text-theme-muted uppercase tracking-wider border-b border-[var(--border-color)]/40 flex justify-between">
                    <span>Select Surah</span>
                    <span>Page</span>
                  </div>
                  {QURAN_SURAHS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => jumpToSurah(s)}
                      className="w-full px-2 py-1.5 rounded text-left text-xs hover:bg-white/5 flex items-center justify-between text-theme-primary hover:text-[var(--accent-secondary)] transition-all"
                    >
                      <span className="truncate">
                        <span className="text-theme-muted font-mono mr-1.5">{s.id}.</span>
                        {s.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-arabic-title text-xs text-theme-muted">{s.nameArabic}</span>
                        <span className="text-[10px] font-mono px-1 rounded bg-black/40 text-[var(--accent-secondary)]">{s.page}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Page Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const p = parseInt(inputPageNumber, 10);
                if (!isNaN(p)) jumpToPage(p);
              }}
              className="flex items-center gap-1"
            >
              <input
                type="number"
                min={1}
                max={604}
                placeholder="Jump"
                value={inputPageNumber}
                onChange={(e) => setInputPageNumber(e.target.value)}
                className="w-14 px-1.5 py-1 text-xs text-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-theme-primary placeholder-theme-muted focus:outline-none focus:border-[var(--accent-primary)]"
                title="Enter page number (1-604)"
                id="quran-page-input-direct"
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/40 text-theme-primary border border-[var(--accent-primary)]/40 transition-all cursor-pointer"
                id="quran-page-go-btn"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Info Strip: Current Surah(s) & Juz / Hizb info */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-theme-muted px-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent-primary)] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {currentSurahs.map(s => `${s.englishName} (${s.name})`).join(', ') || 'Loading...'}
            </span>
            {onPlaySurah && currentSurahs[0] && (
              <button
                type="button"
                onClick={() => onPlaySurah(currentSurahs[0].id)}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-[var(--accent-secondary)] border border-[var(--border-color)] transition-all cursor-pointer"
                title="Play recitation of this Surah"
              >
                Listen
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>Juz {pageMeta.juz}</span>
            <span>•</span>
            <span>Hizb {pageMeta.hizb}</span>
          </div>
        </div>

      </div>

      {/* Main Quran Page Content Reader */}
      <div 
        className="quran-mushaf-paper rounded-xl p-4 md:p-6 min-h-[360px] flex flex-col justify-between relative z-10 overflow-hidden quran-reader-scroll" 
        id="quran-mushaf-display-container"
        style={{ minHeight: isExpanded ? 'calc(100vh - 180px)' : '380px' }}
      >
        {/* Loading Spinner State */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-10">
            <div className="w-7 h-7 border-2 border-t-transparent border-[var(--accent-primary)] rounded-full animate-spin" />
            <span className="text-xs font-mono text-theme-muted animate-pulse">Fetching Page {currentPage}...</span>
          </div>
        )}

        {/* Error / Offline Alert State */}
        {loadError && !isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-6 gap-3 my-auto">
            <p className="text-sm text-red-400 max-w-sm">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                const current = currentPage;
                setCurrentPage(0);
                setTimeout(() => setCurrentPage(current), 50);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 border border-[var(--border-color)] flex items-center gap-1 text-theme-primary transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" /> Retry Page
            </button>
          </div>
        )}

        {/* Page Verses Content Display */}
        {!loadError && (ayahsArabic.length > 0 || ayahsEnglish.length > 0) && (
          <div className="flex flex-col gap-5">
            
            {/* Version 1: Arabic Mushaf View */}
            {version === 'arabic' && (
              <div className="flex flex-col gap-4 text-right" dir="rtl">
                {ayahsArabic.map((ayah, idx) => {
                  const isNewSurah = ayah.numberInSurah === 1;
                  const showBismillah = isNewSurah && ayah.surah.number !== 1 && ayah.surah.number !== 9;
                  const cleanedText = cleanArabicText(ayah);

                  return (
                    <React.Fragment key={ayah.number || idx}>
                      {/* Surah Beginning Frame */}
                      {isNewSurah && (
                        <div className="quran-surah-frame my-3 p-3 text-center border border-[var(--border-color)] rounded-xl shadow-inner select-none">
                          <div className="font-arabic-title text-lg md:text-xl font-bold text-theme-primary">
                            {ayah.surah.name}
                          </div>
                          <div className="text-[10px] font-mono text-theme-muted mt-0.5">
                            {ayah.surah.englishName} • {ayah.surah.revelationType} • {ayah.surah.numberOfAyahs} آيات
                          </div>
                          {showBismillah && (
                            <div className="font-quran-arabic text-base md:text-lg text-[var(--accent-secondary)] mt-2 font-normal">
                              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                            </div>
                          )}
                        </div>
                      )}

                      {/* Continuous Arabic Verse Flow */}
                      <span className="font-quran-arabic text-lg md:text-xl text-theme-primary leading-[2.4] hover:text-[var(--accent-secondary)] transition-colors inline">
                        {cleanedText}
                        <span className="quran-ayah-symbol" title={`Ayah ${ayah.numberInSurah}`}>
                          <span className="mx-1 text-xs opacity-90">۝</span>
                          <span className="text-[11px] font-mono font-bold text-[var(--accent-secondary)]">
                            {toArabicNumerals(ayah.numberInSurah)}
                          </span>
                        </span>
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Version 2: English Translation View */}
            {version === 'english' && (
              <div className="flex flex-col gap-3 text-left" dir="ltr">
                {ayahsEnglish.map((ayah, idx) => {
                  const isNewSurah = ayah.numberInSurah === 1;
                  const showBismillah = isNewSurah && ayah.surah.number !== 1 && ayah.surah.number !== 9;

                  return (
                    <div key={ayah.number || idx} className="flex flex-col gap-1.5">
                      {/* Surah Header */}
                      {isNewSurah && (
                        <div className="quran-surah-frame my-3 p-3 text-center border border-[var(--border-color)] rounded-xl shadow-inner select-none">
                          <div className="text-base md:text-lg font-bold text-theme-primary">
                            Surah {ayah.surah.englishName} ({ayah.surah.name})
                          </div>
                          <div className="text-[11px] font-mono text-theme-muted mt-0.5">
                            {ayah.surah.englishNameTranslation} • {ayah.surah.revelationType} • {ayah.surah.numberOfAyahs} Verses
                          </div>
                          {showBismillah && (
                            <div className="text-xs font-serif italic text-[var(--accent-secondary)] mt-2">
                              In the name of Allah, the Entirely Merciful, the Especially Merciful.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Verse Text Card */}
                      <div className="p-2.5 rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-panel)] hover:border-[var(--accent-secondary)]/50 transition-all flex gap-3 items-start">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-secondary)] border border-[var(--border-color)] flex-shrink-0 mt-0.5">
                          {ayah.surah.number}:{ayah.numberInSurah}
                        </span>
                        <p className="text-xs md:text-sm text-theme-primary leading-relaxed">
                          {ayah.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Version 3: Dual Arabic & English Parallel View */}
            {version === 'dual' && (
              <div className="flex flex-col gap-4">
                {ayahsArabic.map((arabicAyah, idx) => {
                  const englishAyah = ayahsEnglish[idx];
                  const isNewSurah = arabicAyah.numberInSurah === 1;
                  const showBismillah = isNewSurah && arabicAyah.surah.number !== 1 && arabicAyah.surah.number !== 9;
                  const cleanedText = cleanArabicText(arabicAyah);

                  return (
                    <div key={arabicAyah.number || idx} className="flex flex-col gap-2">
                      {/* Surah Header */}
                      {isNewSurah && (
                        <div className="quran-surah-frame my-3 p-3 text-center border border-[var(--border-color)] rounded-xl shadow-inner select-none">
                          <div className="flex items-center justify-center gap-3">
                            <span className="font-arabic-title text-lg font-bold text-theme-primary">{arabicAyah.surah.name}</span>
                            <span className="text-sm font-bold text-theme-muted">—</span>
                            <span className="text-sm font-bold text-theme-primary">Surah {arabicAyah.surah.englishName}</span>
                          </div>
                          <div className="text-[10px] font-mono text-theme-muted mt-0.5">
                            {arabicAyah.surah.revelationType} • {arabicAyah.surah.numberOfAyahs} Verses
                          </div>
                          {showBismillah && (
                            <div className="mt-2 flex flex-col gap-1">
                              <span className="font-quran-arabic text-base text-[var(--accent-secondary)]">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                              </span>
                              <span className="text-[11px] font-serif italic text-theme-muted">
                                In the name of Allah, the Entirely Merciful, the Especially Merciful.
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Verse Parallel Card */}
                      <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)] hover:border-[var(--accent-secondary)]/60 transition-all flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-1">
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-secondary)]">
                            Ayah {arabicAyah.surah.number}:{arabicAyah.numberInSurah}
                          </span>
                          <span className="text-[10px] font-mono text-theme-muted">
                            Juz {arabicAyah.juz}
                          </span>
                        </div>
                        {/* Arabic text */}
                        <p className="font-quran-arabic text-base md:text-lg text-theme-primary text-right leading-loose" dir="rtl">
                          {cleanedText}
                        </p>
                        {/* English translation */}
                        {englishAyah && (
                          <p className="text-xs md:text-sm text-theme-muted text-left leading-relaxed pt-1 border-t border-[var(--border-color)]/20" dir="ltr">
                            {englishAyah.text}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* Bottom Page Navigation Bar */}
        <div className="flex items-center justify-between pt-4 mt-6 border-t border-[var(--border-color)]/60 text-xs">
          <button
            type="button"
            onClick={() => jumpToPage(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-theme-primary transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <span className="font-mono text-theme-muted text-[11px]">
            — Page {currentPage} of 604 —
          </span>

          <button
            type="button"
            onClick={() => jumpToPage(currentPage + 1)}
            disabled={currentPage >= 604 || isLoading}
            className="px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-theme-primary transition-all flex items-center gap-1"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Index Modal: Jump to Surah / Juz / Page */}
      {isIndexOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6" id="quran-index-modal-overlay">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-panel)]">
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-[var(--accent-secondary)]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-theme-primary">
                  {t.indexTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsIndexOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-theme-muted hover:text-theme-primary transition-all"
                title={t.closeModal}
                id="quran-index-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs (Surahs / Juz / Direct Page) */}
            <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-input)] p-1 gap-1">
              <button
                type="button"
                onClick={() => setIndexTab('surah')}
                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                  indexTab === 'surah' ? 'btn-active shadow-sm' : 'text-theme-muted hover:text-theme-primary'
                }`}
                id="quran-index-tab-surah"
              >
                {t.tabBySurah}
              </button>
              <button
                type="button"
                onClick={() => setIndexTab('juz')}
                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                  indexTab === 'juz' ? 'btn-active shadow-sm' : 'text-theme-muted hover:text-theme-primary'
                }`}
                id="quran-index-tab-juz"
              >
                {t.tabByJuz}
              </button>
              <button
                type="button"
                onClick={() => setIndexTab('page')}
                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                  indexTab === 'page' ? 'btn-active shadow-sm' : 'text-theme-muted hover:text-theme-primary'
                }`}
                id="quran-index-tab-page"
              >
                {t.tabByPage}
              </button>
            </div>

            {/* Tab 1: Surahs Index List */}
            {indexTab === 'surah' && (
              <div className="flex flex-col flex-1 overflow-hidden p-3 gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                  <input
                    type="text"
                    placeholder={t.searchSurahPlaceholder}
                    value={surahFilterQuery}
                    onChange={(e) => setSurahFilterQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-theme-primary placeholder-theme-muted focus:outline-none focus:border-[var(--accent-primary)]"
                    id="quran-surah-index-search"
                  />
                </div>

                {/* Surah List */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 quran-reader-scroll" id="quran-surahs-index-list">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.id}
                      type="button"
                      onClick={() => jumpToSurah(surah)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)]/40 hover:border-[var(--accent-secondary)] bg-[var(--bg-panel)] hover:bg-white/5 flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-black/40 border border-[var(--border-color)] flex items-center justify-center text-[10px] font-mono text-[var(--accent-primary)] font-bold">
                          {surah.id}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-theme-primary group-hover:text-[var(--accent-secondary)] transition-colors">
                            {surah.name}
                          </span>
                          <span className="text-[10px] text-theme-muted">
                            {surah.verses} Verses
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-arabic-title text-sm text-theme-primary">
                          {surah.nameArabic}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] border border-[var(--border-color)]">
                          Page {surah.page}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Juz Index List */}
            {indexTab === 'juz' && (
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 quran-reader-scroll" id="quran-juz-index-list">
                {QURAN_JUZS.map((j) => (
                  <button
                    key={j.juz}
                    type="button"
                    onClick={() => jumpToPage(j.page)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)]/40 hover:border-[var(--accent-primary)] bg-[var(--bg-panel)] hover:bg-white/5 flex items-center justify-between text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-black/40 border border-[var(--border-color)] flex items-center justify-center text-[10px] font-mono text-[var(--accent-secondary)] font-bold">
                        {j.juz}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-theme-primary group-hover:text-[var(--accent-primary)] transition-colors">
                          Juz {j.juz}
                        </span>
                        <span className="text-[10px] text-theme-muted font-serif">
                          {j.nameEnglish}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-arabic-title text-sm text-theme-primary">
                        {j.nameArabic}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--border-color)]">
                        Page {j.page}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Tab 3: Pages Direct Grid & Input */}
            {indexTab === 'page' && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 quran-reader-scroll" id="quran-pages-index-grid">
                <div className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)]">
                  <span className="text-xs font-semibold text-theme-primary">Jump to Exact Page Number</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={604}
                      placeholder="Page (1 - 604)"
                      value={inputPageNumber}
                      onChange={(e) => setInputPageNumber(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-theme-primary focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const p = parseInt(inputPageNumber, 10);
                        if (!isNaN(p)) jumpToPage(p);
                      }}
                      className="px-4 py-2 text-xs font-bold uppercase rounded-xl btn-active transition-all cursor-pointer flex items-center gap-1"
                    >
                      Jump <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-theme-muted uppercase tracking-wider">
                    Quick Milestones
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {[1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 293, 342, 440, 502, 562, 582, 600, 604].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => jumpToPage(p)}
                        className={`p-2 rounded-lg text-xs font-mono font-bold border transition-all text-center ${
                          currentPage === p 
                            ? 'btn-active shadow-sm' 
                            : 'border-[var(--border-color)]/50 bg-[var(--bg-input)] hover:border-[var(--accent-secondary)] text-theme-primary'
                        }`}
                      >
                        p. {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-between text-[10px] font-mono text-theme-muted">
              <span>Standard Madani Mushaf (604 pages)</span>
              <button
                type="button"
                onClick={() => setIsIndexOpen(false)}
                className="px-3 py-1 rounded-lg border border-[var(--border-color)] bg-transparent hover:bg-white/5 text-theme-primary"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
