import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  languageName: string;
  switchToLang: string;
  themeMushaf: string;
  themeKiswa: string;
  themeParchment: string;
  themeNoor: string;
  themeFajr: string;

  // Tabs
  tabQuran: string;
  tabRecitation: string;
  tabPages: string;
  tabStream: string;

  // Playlist
  playlistTitle: string;
  playlistEmpty: string;
  playlistEmptySub: string;
  removeTrack: string;
  tracksCount: string;

  // Stream & Import common
  streamImportTitle: string;
  selectReciter: string;
  searchReciter: string;
  selectSurah: string;
  searchSurahs: string;
  addToPlaylist: string;
  addingToPlaylist: string;
  addedToPlaylist: string;
  versesCount: string;
  meccan: string;
  medinan: string;

  // Recitation only
  selectMp3Reciter: string;
  searchMp3Reciter: string;
  addRecitation: string;
  noReciterStreams: string;

  // Continuous Stream (Section 4)
  streamTitle: string;
  streamSubtitle: string;
  streamStartingSurah: string;
  streamReciterMode: string;
  streamSingleReciter: string;
  streamShuffleReciter: string;
  streamStartBtn: string;
  streamStopBtn: string;
  streamPauseBtn: string;
  streamResumeBtn: string;
  streamNextBtn: string;
  streamPrevBtn: string;
  streamStatusLive: string;
  streamStatusPaused: string;
  streamStatusIdle: string;
  streamNowPlaying: string;
  streamNextInQueue: string;
  streamLoopBanner: string;
  streamLoopNotice: string;
  streamActiveReciter: string;
  streamSurahProgress: string;

  // Quran Page Viewer
  pageLabel: string;
  juzLabel: string;
  surahLabel: string;
  indexBtn: string;
  prevPageBtn: string;
  nextPageBtn: string;
  jumpPageBtn: string;
  versionArabic: string;
  versionEnglish: string;
  versionDual: string;
  playSurahBtn: string;
  fullscreenBtn: string;
  exitFullscreenBtn: string;
  indexTitle: string;
  tabBySurah: string;
  tabByJuz: string;
  tabByPage: string;
  searchSurahPlaceholder: string;
  enterPagePlaceholder: string;
  pageOutOfRange: string;
  closeModal: string;

  // Ticker HUD & Lyrics
  noAudioSelected: string;
  nowPlayingPrefix: string;
  byArtistPrefix: string;
  lyricsTimelineTitle: string;
  readyStatus: string;
  noAudioLoaded: string;
  loadingTrack: string;
  noSongsLoaded: string;
  instrumentalBreak: string;

  // Media Controls
  btnPlay: string;
  btnPause: string;
  btnStop: string;
  btnPrev: string;
  btnNext: string;
  btnShuffle: string;
  btnLoop: string;
  btnMute: string;
  btnUnmute: string;
  volumeLabel: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: "My Audio Player",
    appSubtitle: "Stream & Media Player Console",
    languageName: "English",
    switchToLang: "العربية",
    themeMushaf: "Emerald Mushaf",
    themeKiswa: "Kaaba Black",
    themeParchment: "Parchment",
    themeNoor: "Noor (Light)",
    themeFajr: "Night Prayer",

    tabQuran: "Quran with ayat",
    tabRecitation: "Recitation only",
    tabPages: "Quran pages",
    tabStream: "Continuous stream",

    playlistTitle: "Your Playlist",
    playlistEmpty: "Your playlist is empty.",
    playlistEmptySub: "Select a surah or start continuous stream to begin listening!",
    removeTrack: "Remove Track",
    tracksCount: "tracks",

    streamImportTitle: "Stream & Import Audio",
    selectReciter: "Select Reciter",
    searchReciter: "Search reciter...",
    selectSurah: "Select Surah",
    searchSurahs: "Search surahs...",
    addToPlaylist: "Add to Playlist",
    addingToPlaylist: "Adding to Playlist...",
    addedToPlaylist: "Added",
    versesCount: "verses",
    meccan: "Meccan",
    medinan: "Medinan",

    selectMp3Reciter: "Select MP3 Reciter",
    searchMp3Reciter: "Search MP3 reciter...",
    addRecitation: "Add Recitation",
    noReciterStreams: "Selected reciter has no audio streams available.",

    streamTitle: "Continuous Recitation Stream",
    streamSubtitle: "Closed-loop non-stop recitation across the entire Holy Quran. When reaching Surah An-Nas, it seamlessly restarts from Surah Al-Fatihah.",
    streamStartingSurah: "Starting Surah",
    streamReciterMode: "Reciter Mode",
    streamSingleReciter: "Single Reciter",
    streamShuffleReciter: "Reciter Shuffle",
    streamStartBtn: "Start Continuous Stream",
    streamStopBtn: "Stop Stream",
    streamPauseBtn: "Pause",
    streamResumeBtn: "Resume",
    streamNextBtn: "Next Surah",
    streamPrevBtn: "Previous Surah",
    streamStatusLive: "LIVE STREAMING",
    streamStatusPaused: "STREAM PAUSED",
    streamStatusIdle: "READY TO STREAM",
    streamNowPlaying: "Now Streaming",
    streamNextInQueue: "Next in Queue",
    streamLoopBanner: "Infinite Mushaf Cycle Active (Surah 114 ➔ Surah 1)",
    streamLoopNotice: "Looping back to Surah 1 (Al-Fatihah)",
    streamActiveReciter: "Reciter",
    streamSurahProgress: "Surah Progress",

    pageLabel: "Page",
    juzLabel: "Juz",
    surahLabel: "Surah",
    indexBtn: "Index",
    prevPageBtn: "Prev Page",
    nextPageBtn: "Next Page",
    jumpPageBtn: "Jump",
    versionArabic: "Arabic Only",
    versionEnglish: "English Only",
    versionDual: "Dual View",
    playSurahBtn: "Listen Surah",
    fullscreenBtn: "Full Screen",
    exitFullscreenBtn: "Exit Full Screen",
    indexTitle: "Quran Navigator",
    tabBySurah: "Surahs (114)",
    tabByJuz: "Juzs (30)",
    tabByPage: "Jump to Page",
    searchSurahPlaceholder: "Search surah by name or number...",
    enterPagePlaceholder: "Enter page number (1-604)...",
    pageOutOfRange: "Page must be between 1 and 604",
    closeModal: "Close",

    noAudioSelected: "No Audio Selected. Awaiting Input...",
    nowPlayingPrefix: "► NOW PLAYING //",
    byArtistPrefix: "by",
    lyricsTimelineTitle: "Verses & Lyrics Timeline",
    readyStatus: "Ready",
    noAudioLoaded: "No Audio Loaded",
    loadingTrack: "Loading Track...",
    noSongsLoaded: "No Songs Loaded",
    instrumentalBreak: "// Instrumental Break //",

    btnPlay: "Play",
    btnPause: "Pause",
    btnStop: "Stop Playback",
    btnPrev: "Previous Track",
    btnNext: "Next Track",
    btnShuffle: "Toggle Shuffle",
    btnLoop: "Toggle Repeat",
    btnMute: "Mute",
    btnUnmute: "Unmute",
    volumeLabel: "Volume"
  },
  ar: {
    appTitle: "مشغل الصوتيات",
    appSubtitle: "منصة الاستماع وبث التلاوات القرآنية",
    languageName: "العربية",
    switchToLang: "English",
    themeMushaf: "المصحف الشريف",
    themeKiswa: "كسوة الكعبة",
    themeParchment: "مخطوطة عتيقة",
    themeNoor: "نور الهدى",
    themeFajr: "قيام وفجر",

    tabQuran: "القرآن مع الآيات",
    tabRecitation: "تلاوة فقط",
    tabPages: "صفحات المصحف",
    tabStream: "بث متواصل",

    playlistTitle: "قائمة التشغيل",
    playlistEmpty: "قائمة التشغيل فارغة.",
    playlistEmptySub: "اختر سورة أو ابدأ البث المتواصل للاستماع الآن!",
    removeTrack: "حذف المقطع",
    tracksCount: "مقاطع",

    streamImportTitle: "بث واستيراد الصوتيات",
    selectReciter: "اختر القارئ",
    searchReciter: "بحث عن قارئ...",
    selectSurah: "اختر السورة",
    searchSurahs: "بحث عن سورة...",
    addToPlaylist: "إضافة إلى القائمة",
    addingToPlaylist: "جاري الإضافة...",
    addedToPlaylist: "تمت الإضافة",
    versesCount: "آية",
    meccan: "مكية",
    medinan: "مدنية",

    selectMp3Reciter: "اختر القارئ (MP3)",
    searchMp3Reciter: "بحث عن قارئ MP3...",
    addRecitation: "إضافة التلاوة",
    noReciterStreams: "القارئ المختار ليس له تسجيلات متاحة حالياً.",

    streamTitle: "بث التلاوة المتواصل",
    streamSubtitle: "تلاوة مستمرة مغلقة تدور عبر سور القرآن الكريم كاملة دون توقف، وعند الوصول لسورة الناس تعود تلقائياً لسورة الفاتحة.",
    streamStartingSurah: "سورة البداية",
    streamReciterMode: "نمط القارئ",
    streamSingleReciter: "قارئ ثابت",
    streamShuffleReciter: "تبديل القراء عشوائياً",
    streamStartBtn: "بدء البث المتواصل",
    streamStopBtn: "إيقاف البث",
    streamPauseBtn: "إيقاف مؤقت",
    streamResumeBtn: "استئناف",
    streamNextBtn: "السورة التالية",
    streamPrevBtn: "السورة السابقة",
    streamStatusLive: "بث مباشر مستمر",
    streamStatusPaused: "البث متوقف مؤقتاً",
    streamStatusIdle: "جاهز لبدء البث",
    streamNowPlaying: "يُتلى الآن في البث",
    streamNextInQueue: "السورة التالية في البث",
    streamLoopBanner: "حلقة ختم المصحف المستمرة نشطة (سورة 114 ➔ سورة 1)",
    streamLoopNotice: "العودة لسورة الفاتحة لبدء الختمة مجدداً",
    streamActiveReciter: "القارئ الحالي",
    streamSurahProgress: "ترتيب السورة بالمصحف",

    pageLabel: "صفحة",
    juzLabel: "الجزء",
    surahLabel: "سورة",
    indexBtn: "الفهرس",
    prevPageBtn: "الصفحة السابقة",
    nextPageBtn: "الصفحة التالية",
    jumpPageBtn: "انتقال",
    versionArabic: "عربي فقط",
    versionEnglish: "إنجليزي فقط",
    versionDual: "عرض مزدوج",
    playSurahBtn: "استمع للسورة",
    fullscreenBtn: "ملء الشاشة",
    exitFullscreenBtn: "إنهاء ملء الشاشة",
    indexTitle: "فهرس القرآن الكريم",
    tabBySurah: "السور (114)",
    tabByJuz: "الأجزاء (30)",
    tabByPage: "انتقال لصفحة",
    searchSurahPlaceholder: "بحث عن سورة بالاسم أو الرقم...",
    enterPagePlaceholder: "أدخل رقم الصفحة (1-604)...",
    pageOutOfRange: "رقم الصفحة يجب أن يكون بين 1 و 604",
    closeModal: "إغلاق",

    noAudioSelected: "لم يتم اختيار مقطع. في انتظار التحديد...",
    nowPlayingPrefix: "◄ يُستمع الآن //",
    byArtistPrefix: "بصوت",
    lyricsTimelineTitle: "شريط عرض الآيات والكلمات",
    readyStatus: "جاهز",
    noAudioLoaded: "لا يوجد ملف صوتي",
    loadingTrack: "جاري تحميل التلاوة...",
    noSongsLoaded: "لم يتم تحميل تلاوات",
    instrumentalBreak: "// فاصل صوتي //",

    btnPlay: "تشغيل",
    btnPause: "إيقاف مؤقت",
    btnStop: "إيقاف التشغيل",
    btnPrev: "المقطع السابق",
    btnNext: "المقطع التالي",
    btnShuffle: "تبديل الترتيب العشوائي",
    btnLoop: "تبديل التكرار",
    btnMute: "كتم الصوت",
    btnUnmute: "إلغاء الكتم",
    volumeLabel: "مستوى الصوت"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    if (isRTL) {
      document.body.classList.add('lang-ar');
    } else {
      document.body.classList.remove('lang-ar');
    }
  }, [language, dir, isRTL]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
    isRTL,
    dir
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
