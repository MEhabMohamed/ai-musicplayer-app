import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ALL_RECITERS, type ReciterItem } from '../data/allReciters';
import { useLanguage } from '../services/i18n';
import { Search, ChevronDown, X, Check, User, Mic } from 'lucide-react';

// Priority IDs for world-renowned reciters to display first
const POPULAR_RECITER_IDS = [
  30,  // Saad Al-Ghamdi (Default)
  123, // Mishary Alafasy
  102, // Maher Al Meaqli
  51,  // Abdulbasit Abdulsamad
  106, // Mohamed Siddiq Al-Minshawi
  119, // Mahmoud Khalil Al-Husary
  31,  // Saud Al-Shuraim
  54,  // Abdur-Rahman As-Sudais
  129, // Yasser Al-Dosari
  2,   // Abu Bakr Al-Shatri
  7,   // Ahmad Al-Ajmy
  63,  // Ali Jaber
  80,  // Fares Abbad
  18,  // Idris Abkar
  24,  // Khalid Al-Jalil
  124, // Nasser Al-Qatami
  13,  // Bandar Baleela
  62,  // Ali Al-Hudhaify
  42,  // Salah Al-Budair
  126, // Hazza Al-Balushi
  127, // Islam Sobhi
  28,  // Raad Al-Kurdi
  125  // Noreen Mohammad Siddiq
];

function normalizeArabic(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase()
    .trim();
}

interface ReciterComboboxProps {
  selectedReciterId: number;
  onSelectReciter: (reciter: ReciterItem) => void;
  reciters?: ReciterItem[];
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const ReciterCombobox: React.FC<ReciterComboboxProps> = ({
  selectedReciterId,
  onSelectReciter,
  reciters = ALL_RECITERS,
  label,
  placeholder,
  className = '',
  id = 'reciter-combobox'
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [openUpward, setOpenUpward] = useState(false);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number>(280);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Smart positioning: flip dropdown upwards if opened near the bottom of viewport
  const checkPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If space below is limited and space above is greater or ample, open above
      const shouldOpenUp = (spaceBelow < 320 && spaceAbove > spaceBelow) || (spaceBelow < 240 && spaceAbove > 140);
      setOpenUpward(shouldOpenUp);

      const availableHeight = shouldOpenUp
        ? Math.min(300, Math.max(140, spaceAbove - 20))
        : Math.min(300, Math.max(140, spaceBelow - 20));
      setDropdownMaxHeight(availableHeight);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkPosition();
      window.addEventListener('resize', checkPosition);
      window.addEventListener('scroll', checkPosition, true);
      return () => {
        window.removeEventListener('resize', checkPosition);
        window.removeEventListener('scroll', checkPosition, true);
      };
    }
  }, [isOpen, checkPosition]);

  // Sort reciters: Popular ones first, then alphabetical
  const sortedReciters = useMemo(() => {
    return [...reciters].sort((a, b) => {
      const idxA = POPULAR_RECITER_IDS.indexOf(a.id);
      const idxB = POPULAR_RECITER_IDS.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (language === 'ar' ? a.nameArabic : a.name).localeCompare(language === 'ar' ? b.nameArabic : b.name);
    });
  }, [reciters, language]);

  // Find currently selected reciter
  const selectedReciter = useMemo(() => {
    return reciters.find(r => r.id === selectedReciterId) || sortedReciters[0];
  }, [reciters, selectedReciterId, sortedReciters]);

  // Filter reciters based on user search query
  const filteredReciters = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return sortedReciters;

    const normQ = normalizeArabic(q);
    const latinQ = q.toLowerCase();

    return sortedReciters.filter(r => {
      const normArabic = normalizeArabic(r.nameArabic);
      const normLatin = r.name.toLowerCase();
      return normArabic.includes(normQ) || normLatin.includes(latinQ);
    });
  }, [sortedReciters, searchQuery]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  // Scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        setSearchQuery('');
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (reciter: ReciterItem) => {
    onSelectReciter(reciter);
    setSearchQuery('');
    setIsOpen(false);
    setIsFocused(false);
    setActiveIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    setActiveIndex(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(1, filteredReciters.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredReciters.length) % Math.max(1, filteredReciters.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredReciters.length) {
        handleSelect(filteredReciters[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setIsFocused(false);
      setSearchQuery('');
    }
  };

  const displayInputValue = isFocused
    ? searchQuery
    : selectedReciter
      ? (language === 'ar' ? `${selectedReciter.nameArabic} (${selectedReciter.name})` : `${selectedReciter.name} (${selectedReciter.nameArabic})`)
      : '';

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 relative ${className}`} id={`${id}-wrapper`}>
      {label && (
        <label className="text-[11px] font-mono text-theme-muted uppercase tracking-wider flex items-center justify-between select-none">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
            {label}
          </span>
          <span className="text-[10px] text-theme-muted font-mono">
            {reciters.length} {language === 'ar' ? 'قارئ' : 'reciters'}
          </span>
        </label>
      )}

      {/* Combobox Input Field */}
      <div className="combobox-input-wrapper">
        <div className="combobox-search-icon">
          <Search className="w-3.5 h-3.5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          id={id}
          value={displayInputValue}
          placeholder={placeholder || (language === 'ar' ? 'اكتب اسم القارئ للبحث...' : 'Type reciter name to filter...')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
            setSearchQuery('');
            setActiveIndex(0);
            setTimeout(() => {
              containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
          }}
          onKeyDown={handleKeyDown}
          className="combobox-input-field"
          autoComplete="off"
        />

        {/* Action Buttons (Clear + Toggle Arrow) */}
        <div className="combobox-actions-group">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="combobox-icon-btn"
              title={language === 'ar' ? 'مسح البحث' : 'Clear search'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              if (next && inputRef.current) {
                inputRef.current.focus();
                setActiveIndex(0);
              }
            }}
            className="combobox-icon-btn"
            title={isOpen ? 'Close list' : 'Open list'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div
          className={`reciter-combobox-dropdown absolute left-0 right-0 overflow-y-auto rounded-2xl border border-[var(--border-color)] shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-2xl quran-reader-scroll ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          style={{ 
            zIndex: 9999, 
            backgroundColor: 'var(--bg-primary)',
            maxHeight: `${dropdownMaxHeight}px`
          }}
          id={`${id}-dropdown`}
        >
          {/* Top Status Header */}
          <div className="px-2.5 py-1.5 text-[10px] font-mono text-theme-muted flex items-center justify-between border-b border-[var(--border-color)]/30 mb-1 select-none">
            <span>
              {language === 'ar' 
                ? `النتائج (${filteredReciters.length} من ${reciters.length})` 
                : `Results (${filteredReciters.length} of ${reciters.length})`}
            </span>
            <span className="text-[9px] text-[var(--accent-secondary)] uppercase">
              {language === 'ar' ? 'اختر بالماوس أو Enter' : 'Use ↑↓ & Enter to pick'}
            </span>
          </div>

          {/* List items */}
          {filteredReciters.length === 0 ? (
            <div className="p-4 text-center text-xs text-theme-muted flex flex-col items-center gap-1">
              <span>{language === 'ar' ? 'لم يتم العثور على قارئ بهذا الاسم' : 'No reciters found matching your search'}</span>
              <span className="text-[10px] opacity-75 font-mono">"{searchQuery}"</span>
            </div>
          ) : (
            filteredReciters.map((reciter, index) => {
              const isSelected = selectedReciter?.id === reciter.id;
              const isHighlighted = activeIndex === index;
              const primaryName = language === 'ar' ? reciter.nameArabic : reciter.name;
              const secondaryName = language === 'ar' ? reciter.name : reciter.nameArabic;

              return (
                <button
                  key={reciter.id}
                  ref={isHighlighted ? activeItemRef : null}
                  type="button"
                  onClick={() => handleSelect(reciter)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full p-2 rounded-xl text-start transition-all flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-[var(--accent-primary)] text-white font-bold border-transparent shadow-sm'
                      : isHighlighted
                        ? 'bg-white/10 text-theme-primary border-[var(--accent-primary)]/40 shadow-sm'
                        : 'hover:bg-white/5 text-theme-primary border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs flex-shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/30 text-[var(--accent-secondary)]'
                    }`}>
                      <Mic className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs truncate font-semibold">
                        {primaryName}
                      </span>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-theme-muted'}`}>
                        {secondaryName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ps-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/30 text-theme-muted'
                    }`}>
                      {reciter.surahTotal || 114} {language === 'ar' ? 'سورة' : 'surahs'}
                    </span>

                    {isSelected && (
                      <Check className="w-4 h-4 text-white flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
