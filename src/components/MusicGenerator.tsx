import React, { useState, useEffect, useRef } from 'react';
import type { Song, LyricsLine } from '../types/music';
import { compileSearchedSong } from '../services/LyricsDatabase';
import { Sparkles, Terminal, AudioLines, Search, Upload, Plus, BookOpen, Music, Library, ChevronDown, WifiOff, Clock } from 'lucide-react';

interface MusicGeneratorProps {
  onSongGenerated: (song: Song) => void;
}

type SearchSource = 'music' | 'quran' | 'archive';

const FALLBACK_CHAPTERS = [
  { id: 1, name_simple: "Al-Fatihah", name_arabic: "الفاتحة", verses_count: 7, translated_name: { name: "The Opening" } },
  { id: 18, name_simple: "Al-Kahf", name_arabic: "الكهف", verses_count: 110, translated_name: { name: "The Cave" } },
  { id: 36, name_simple: "Ya-Sin", name_arabic: "يس", verses_count: 83, translated_name: { name: "Ya-Sin" } },
  { id: 55, name_simple: "Ar-Rahman", name_arabic: "الرحمن", verses_count: 78, translated_name: { name: "The Beneficent" } },
  { id: 67, name_simple: "Al-Mulk", name_arabic: "الملك", verses_count: 30, translated_name: { name: "The Sovereignty" } },
  { id: 112, name_simple: "Al-Ikhlas", name_arabic: "الإخلاص", verses_count: 4, translated_name: { name: "The Sincerity" } },
  { id: 113, name_simple: "Al-Falaq", name_arabic: "الفلق", verses_count: 5, translated_name: { name: "The Daybreak" } },
  { id: 114, name_simple: "An-Nas", name_arabic: "الناس", verses_count: 6, translated_name: { name: "Mankind" } }
];

const VERIFIED_RECITERS = [
  { id: 1, name: "AbdulBaset AbdulSamad (Mujawwad)", style: "Mujawwad" },
  { id: 2, name: "AbdulBaset AbdulSamad (Murattal)", style: "Murattal" },
  { id: 3, name: "Abdur-Rahman as-Sudais", style: "Murattal" },
  { id: 4, name: "Abu Bakr al-Shatri", style: "Murattal" },
  { id: 5, name: "Hani ar-Rifai", style: "Murattal" },
  { id: 170, name: "Khalid Al-Jalil", style: "Murattal" },
  { id: 161, name: "Khalifah Al Tunaiji", style: "Murattal" },
  { id: 122, name: "Mahmoud Khalil Al-Husary (Ijazah)", style: "Ijazah" },
  { id: 12, name: "Mahmoud Khalil Al-Husary (Muallim)", style: "Muallim" },
  { id: 6, name: "Mahmoud Khalil Al-Husary (Murattal)", style: "Murattal" },
  { id: 7, name: "Mishari Rashid al-`Afasy", style: "Murattal" },
  { id: 173, name: "Mishari Rashid al-`Afasy (Alternate)", style: "Murattal" },
  { id: 168, name: "Mohamed Siddiq al-Minshawi (Kids Repeat)", style: "Kids Repeat" },
  { id: 8, name: "Mohamed Siddiq al-Minshawi (Mujawwad)", style: "Mujawwad" },
  { id: 9, name: "Mohamed Siddiq al-Minshawi (Murattal)", style: "Murattal" },
  { id: 13, name: "Sa'ad al-Ghamdi", style: "Murattal" },
  { id: 10, name: "Sa'ud ash-Shuraim", style: "Murattal" },
  { id: 97, name: "Yasser Ad Dussary", style: "Murattal" },
  { id: 174, name: "Yasser Ad Dussary (Alternate)", style: "Murattal" }
];

const RECITER_URL_TEMPLATES: Record<number, { template: string, padDigits: number }> = {
  1: { template: "https://download.quranicaudio.com/qdc/abdul_baset/mujawwad/{num}.mp3", padDigits: 1 },
  2: { template: "https://download.quranicaudio.com/qdc/abdul_baset/murattal/{num}.mp3", padDigits: 1 },
  3: { template: "https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudais/murattal/{num}.mp3", padDigits: 1 },
  4: { template: "https://download.quranicaudio.com/qdc/abu_bakr_shatri/murattal/{num}.mp3", padDigits: 1 },
  5: { template: "https://download.quranicaudio.com/qdc/hani_ar_rifai/murattal/{num}.mp3", padDigits: 1 },
  6: { template: "https://download.quranicaudio.com/qdc/khalil_al_husary/murattal/{num}.mp3", padDigits: 1 },
  7: { template: "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/{num}.mp3", padDigits: 1 },
  8: { template: "https://download.quranicaudio.com/quran/minshawi_mujawwad/{num}.mp3", padDigits: 3 },
  9: { template: "https://download.quranicaudio.com/qdc/siddiq_minshawi/murattal/{num}.mp3", padDigits: 1 },
  10: { template: "https://download.quranicaudio.com/qdc/saud_ash-shuraym/murattal/{num}.mp3", padDigits: 3 },
  12: { template: "https://download.quranicaudio.com/qdc/khalil_al_husary/muallim/{num}.mp3", padDigits: 1 },
  13: { template: "https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/complete/{num}.mp3", padDigits: 3 },
  97: { template: "https://download.quranicaudio.com/quran/yasser_ad-dussary/{num}.mp3", padDigits: 3 },
  122: { template: "https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree_iza3a/{num}.mp3", padDigits: 3 },
  161: { template: "https://download.quranicaudio.com/qdc/khalifah_taniji/murattal/{num}.mp3", padDigits: 1 },
  168: { template: "https://download.quranicaudio.com/qdc/siddiq_minshawi/kids_repeat/{num}.mp3", padDigits: 1 },
  170: { template: "https://download.quranicaudio.com/qdc/khalid_jalil/murattal/mp3/{num}.mp3", padDigits: 1 },
  173: { template: "https://download.quranicaudio.com/qdc/mishari_al_afasy/streaming/mp3/{num}.mp3", padDigits: 1 },
  174: { template: "https://download.quranicaudio.com/qdc/yasser_ad-dussary/mp3/{num}.mp3", padDigits: 1 }
};

function constructFallbackAudioUrl(reciterId: number, surahNum: number): string {
  const conf = RECITER_URL_TEMPLATES[reciterId];
  if (!conf) {
    return `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahNum}.mp3`;
  }
  const formattedNum = conf.padDigits === 3
    ? String(surahNum).padStart(3, '0')
    : String(surahNum);
  return conf.template.replace("{num}", formattedNum);
}

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({ onSongGenerated }) => {
  const [searchSource, setSearchSource] = useState<SearchSource>('music');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const reciters = VERIFIED_RECITERS;
  const [selectedReciterId, setSelectedReciterId] = useState<number>(7);
  const [reciterSearchQuery, setReciterSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'warning' | 'error'>('idle');
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const filteredReciters = reciters.filter(r =>
    r.name.toLowerCase().includes(reciterSearchQuery.toLowerCase())
  );

  const selectedReciter = reciters.find(r => r.id === selectedReciterId) || reciters[0];
  const reciterComboboxRef = useRef<HTMLDivElement | null>(null);

  // Click outside handler to close the reciter combobox dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (reciterComboboxRef.current && !reciterComboboxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const consoleContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll terminal logs to bottom internally
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch Quran Chapters List on mount
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.chapters) && data.chapters.length > 0) {
            setChapters(data.chapters);
            return;
          }
        }
      } catch (err) {
        console.warn("Quran chapters API call failed. Using local fallback list.", err);
      }
      setChapters(FALLBACK_CHAPTERS);
    };

    fetchChapters();
  }, []);

  // Source selection helper
  const selectSource = (source: SearchSource) => {
    setSearchSource(source);
    setSearchResults([]);
    setTitle('');
  };

  // Main search handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || !title.trim()) return;

    setIsGenerating(true);
    setSearchResults([]);

    if (searchSource === 'music') {
      setLogs([`[JAMENDO-INIT] Querying Jamendo library for "${title}"...`]);
      try {
        const client_id = '3dce8b55';
        const searchUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${client_id}&format=json&limit=5&search=${encodeURIComponent(title)}`;
        const response = await fetch(searchUrl);
        if (!response.ok) {
          throw new Error(`Jamendo server error: ${response.status}`);
        }
        const data = await response.json();
        const results = data.results;

        if (Array.isArray(results) && results.length > 0) {
          setSearchResults(results);
          setLogs(prev => [
            ...prev,
            `[SUCCESS] Found ${results.length} tracks matching search query.`,
            `[INFO] Click the '+' button in front of any track to add it to your playlist.`
          ]);
        } else {
          setLogs(prev => [
            ...prev,
            `[WARNING] No search matches found on Jamendo for "${title}".`
          ]);
        }
      } catch (err: any) {
        setLogs(prev => [...prev, `[ERROR] Jamendo search failed: ${err.message || err}`]);
      } finally {
        setIsGenerating(false);
      }
    } else if (searchSource === 'quran') {
      setLogs([`[QURAN-INIT] Searching Quran chapters index for "${title}"...`]);
      await new Promise(resolve => setTimeout(resolve, 300));

      const query = title.trim().toLowerCase();
      const numQuery = parseInt(query);

      // Search by chapter number or simple name match
      const matched = chapters.filter(ch => {
        if (!isNaN(numQuery)) {
          return ch.id === numQuery;
        }
        return ch.name_simple.toLowerCase().includes(query) ||
          ch.translated_name.name.toLowerCase().includes(query);
      });

      if (matched.length > 0) {
        setSearchResults(matched.map(ch => ({
          id: `quran-ch-${ch.id}`,
          isQuran: true,
          chapterId: ch.id,
          name: `Surah ${ch.name_simple} (${ch.name_arabic})`,
          artist_name: `Verses: ${ch.verses_count} | ${ch.translated_name.name}`,
          verses_count: ch.verses_count,
          name_simple: ch.name_simple
        })));
        setLogs(prev => [
          ...prev,
          `[SUCCESS] Found ${matched.length} Surahs matching "${title}".`,
          `[INFO] Click the '+' button in front of a Surah to stream it.`
        ]);
      } else {
        setLogs(prev => [
          ...prev,
          `[WARNING] No Surahs matching "${title}" found.`,
          `[INFO] Try searching a Surah name (e.g. 'Fatihah', 'Yaseen') or number (1 to 114).`
        ]);
      }
      setIsGenerating(false);
    } else {
      // Archive.org public domain audio search
      setLogs([`[ARCHIVE-INIT] Searching Archive.org public domain audio library for "${title}"...`]);
      try {
        const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(title)}+AND+mediatype:audio&fl[]=identifier,title,creator,downloads&sort[]=downloads+desc&output=json&rows=5`;
        const response = await fetch(searchUrl);
        if (!response.ok) {
          throw new Error(`Archive.org server error: ${response.status}`);
        }
        const data = await response.json();
        const docs = data.response?.docs;

        if (Array.isArray(docs) && docs.length > 0) {
          setSearchResults(docs.map(doc => ({
            id: `archive-${doc.identifier}`,
            isArchive: true,
            identifier: doc.identifier,
            name: doc.title || "Unknown Title",
            artist_name: doc.creator || "Archive.org Public Domain"
          })));
          setLogs(prev => [
            ...prev,
            `[SUCCESS] Found ${docs.length} public domain files on Archive.org.`,
            `[INFO] Click the '+' button to resolve and stream the audio.`
          ]);
        } else {
          setLogs(prev => [
            ...prev,
            `[WARNING] No public domain audio files found matching "${title}".`
          ]);
        }
      } catch (err: any) {
        setLogs(prev => [...prev, `[ERROR] Archive.org search failed: ${err.message || err}`]);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleAddTrack = async (track: any) => {
    if (addingTrackId) return;
    setAddingTrackId(track.id);
    setLoadingStatus('idle');
    setLoadingMessage('');
    setLoadingProgress(null);

    try {
      if (track.isQuran) {
        const selectedReciter = reciters.find(r => r.id === selectedReciterId) || reciters[0];
        const surahNum = track.chapterId;

        setLogs(prev => [
          ...prev,
          `[QURAN-LOAD] Loading Surah ${track.name_simple} by ${selectedReciter.name}...`,
          `[PROCESS] Fetching audio metadata & bilingual verses...`
        ]);

        setLoadingStatus('loading');
        setLoadingProgress(null);
        setLoadingMessage('Fetching audio metadata & bilingual verses...');

        // Fetch audio metadata, timings, and verses in parallel (individually handled so failures don't block each other)
        let audioUrl = "";
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

          // 2. Fetch Audio URL & timings from primary source (api.qurancdn.com)
          let audioFetched = false;
          try {
            const resAudio = await fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${selectedReciter.id}/audio_files?chapter=${surahNum}&segments=true`);
            if (resAudio.ok) {
              const json = await resAudio.json();
              const audioFile = json.audio_files?.[0];
              if (audioFile) {
                audioUrl = audioFile.audio_url || "";
                verseTimings = audioFile.verse_timings || [];
                apiDuration = audioFile.duration ? (audioFile.duration / 1000) : 0;
                audioFetched = true;
              }
            }
          } catch (e) {
            console.warn("Primary audio API failed, trying fallback...", e);
          }

          // 3. Fallback to alternative source (api.quran.com) if primary failed or returned no timings
          if (!audioFetched || verseTimings.length === 0) {
            try {
              const resAltAudio = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${selectedReciter.id}/${surahNum}?segments=true`);
              if (resAltAudio.ok) {
                const json = await resAltAudio.json();
                const audioFile = json.audio_file;
                if (audioFile) {
                  audioUrl = audioFile.audio_url || audioUrl || "";
                  verseTimings = audioFile.timestamps || verseTimings || [];
                  apiDuration = audioFile.duration ? (audioFile.duration / 1000) : apiDuration || 0;
                }
              }
            } catch (e) {
              console.warn("Alternative audio API failed...", e);
            }
          }

        } catch (err: any) {
          console.warn("Quran details fetch failed:", err);
          if (!navigator.onLine || err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('network')) {
            throw err;
          }
        }

        // 4. Force correct URL for Minshawi Mujawwad to avoid the 404, or use helper fallback
        if (selectedReciter.id === 8) {
          const paddedSurah = String(surahNum).padStart(3, '0');
          audioUrl = `https://download.quranicaudio.com/quran/minshawi_mujawwad/${paddedSurah}.mp3`;
        } else if (!audioUrl) {
          audioUrl = constructFallbackAudioUrl(selectedReciter.id, surahNum);
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
          await new Promise<void>((resolve) => {
            tempAudio.onloadedmetadata = () => resolve();
            tempAudio.onerror = () => resolve();
            setTimeout(resolve, 1500); // 1.5s max wait for metadata
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

          const secondsPerVerse = duration / arabicAyahs.length;
          lyricsLines = arabicAyahs.map((ayah, index) => {
            const arabicText = ayah.text || "";
            const translationText = translationAyahs[index]?.text || "";

            const verseKey = `${surahNum}:${index + 1}`;
            const timing = verseTimings.find((t: any) => t.verse_key === verseKey);
            const startTime = timing ? (timing.timestamp_from / 1000) : (index * secondsPerVerse);
            const verseDuration = timing ? ((timing.timestamp_to - timing.timestamp_from) / 1000) : secondsPerVerse;

            return {
              text: `[${index + 1}] ${arabicText} \n (${translationText})`,
              time: startTime,
              duration: verseDuration
            };
          });
        } else {
          setLogs(prev => [
            ...prev,
            `[WARNING] alquran.cloud API offline. Aligning recitation guides...`
          ]);
          lyricsLines = [
            { text: `Surah ${track.name_simple}`, time: 2, duration: 4 },
            { text: `Recited by ${selectedReciter.name}`, time: 7, duration: 5 },
            { text: `📖 Read and listen 📖`, time: 15, duration: duration - 16 }
          ];
        }

        const newSong: Song = {
          id: `${track.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: track.name,
          artist: selectedReciter?.name || "Mishary Rashid Alafasy",
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

      } else if (track.isArchive) {
        setLogs(prev => [
          ...prev,
          `[ARCHIVE-LOAD] Resolving metadata files for identifier "${track.identifier}"...`
        ]);

        // Query metadata endpoint of archive.org
        const metadataUrl = `https://archive.org/metadata/${track.identifier}`;
        const metaRes = await fetch(metadataUrl);
        if (!metaRes.ok) {
          throw new Error(`Failed to fetch metadata from Archive.org`);
        }

        const metaData = await metaRes.json();
        const files = metaData.files || [];
        const mp3File = files.find((f: any) => f.name.endsWith('.mp3'));

        if (!mp3File) {
          throw new Error("No streamable MP3 file found in the Archive.org entry.");
        }

        const audioUrl = `https://archive.org/download/${track.identifier}/${encodeURIComponent(mp3File.name)}`;

        setLogs(prev => [
          ...prev,
          `[OK] Stream resolved: ${mp3File.name}`,
          `[PROCESS] Extracting track duration...`
        ]);

        const tempAudio = new Audio(audioUrl);
        await new Promise<void>((resolve) => {
          tempAudio.onloadedmetadata = () => resolve();
          tempAudio.onerror = () => resolve();
          setTimeout(resolve, 2500);
        });

        const duration = tempAudio.duration || parseFloat(mp3File.length) || 180;

        setLogs(prev => [
          ...prev,
          `[OK] Duration locked: ${Math.round(duration)}s.`,
          `[PROCESS] Compiling song container...`
        ]);

        const newSong: Song = {
          id: `${track.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: track.name,
          artist: track.artist_name,
          genre: 'minimalist',
          tempo: 100,
          key: 'C',
          lyrics: [
            { text: `Archive Source: ${track.name}`, time: 2, duration: 4 },
            { text: `Creator: ${track.artist_name}`, time: 7, duration: 4 },
            { text: "🎵 enjoy the free source audio 🎵", time: 15, duration: duration - 16 }
          ],
          chords: [],
          seed: Math.random(),
          duration: duration,
          audioUrl: audioUrl
        };

        setLogs(prev => [...prev, `[SUCCESS] Archive track successfully added to playlist.`]);
        onSongGenerated(newSong);

      } else {
        // Standard Jamendo Music Add
        setLogs(prev => [
          ...prev,
          `[JAMENDO-ADD] Preparing track "${track.name}"...`,
          `[PROCESS] Fetching lyrics from lrclib.net...`
        ]);

        let lyricsContent = '';
        let isSynced = false;
        try {
          const lyricsSearchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(track.name + ' ' + track.artist_name)}`;
          const lyrSearchRes = await fetch(lyricsSearchUrl, {
            headers: { 'User-Agent': 'AetheriaVocalPlayer/2.5' }
          });
          if (lyrSearchRes.ok) {
            const lyrResults = await lyrSearchRes.json();
            if (Array.isArray(lyrResults) && lyrResults.length > 0) {
              const bestLyr = lyrResults[0];
              const detailsRes = await fetch(`https://lrclib.net/api/get/${bestLyr.id}`);
              if (detailsRes.ok) {
                const detail = await detailsRes.json();
                lyricsContent = detail.syncedLyrics || detail.plainLyrics || '';
                isSynced = !!detail.syncedLyrics;
              }
            }
          }
        } catch (err) {
          console.error("Lyrics fetch failed:", err);
        }

        let parsedLyrics: LyricsLine[] = [];
        if (lyricsContent) {
          setLogs(prev => [
            ...prev,
            `[OK] Lyrics downloaded successfully. (${isSynced ? 'Synced LRC format' : 'Plain text format'})`,
            `[PROCESS] Compiling song container...`
          ]);
          const compiled = compileSearchedSong(track.name, track.artist_name, lyricsContent, isSynced, track.duration, 'synthwave');
          parsedLyrics = compiled.lyrics;
        } else {
          setLogs(prev => [
            ...prev,
            `[WARNING] Lyrics not found on internet. Creating standard timeline...`,
            `[PROCESS] Compiling song container...`
          ]);
          parsedLyrics = [
            { text: `Track: ${track.name}`, time: 2, duration: 4 },
            { text: `Artist: ${track.artist_name}`, time: 7, duration: 4 },
            { text: "🎵 enjoy the music 🎵", time: 15, duration: track.duration - 16 }
          ];
        }

        const newSong: Song = {
          id: `jamendo-${track.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: track.name,
          artist: track.artist_name,
          genre: 'synthwave',
          tempo: 120,
          key: 'C',
          lyrics: parsedLyrics,
          chords: [],
          seed: Math.random(),
          duration: track.duration,
          audioUrl: track.audio
        };

        setLogs(prev => [...prev, `[SUCCESS] Track successfully added to playlist.`]);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    setSearchResults([]);
    setLogs([`[UPLOAD-INIT] Loading local file: "${file.name}"...`]);

    try {
      const audioUrl = URL.createObjectURL(file);

      setLogs(prev => [...prev, `[PROCESS] Parsing audio metadata...`]);
      const tempAudio = new Audio(audioUrl);

      await new Promise<void>((resolve) => {
        tempAudio.onloadedmetadata = () => resolve();
        tempAudio.onerror = () => resolve();
        setTimeout(resolve, 2000);
      });

      const duration = tempAudio.duration || 180;
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

      setLogs(prev => [
        ...prev,
        `[OK] Audio metadata parsed successfully. (Duration: ${Math.round(duration)}s)`,
        `[PROCESS] Searching lyrics for "${cleanName}"...`
      ]);

      let lyricsContent = '';
      let isSynced = false;
      try {
        const lyricsSearchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanName)}`;
        const response = await fetch(lyricsSearchUrl, {
          headers: { 'User-Agent': 'AetheriaVocalPlayer/2.5' }
        });
        if (response.ok) {
          const lyrResults = await response.json();
          if (Array.isArray(lyrResults) && lyrResults.length > 0) {
            const bestLyr = lyrResults[0];
            const detailsRes = await fetch(`https://lrclib.net/api/get/${bestLyr.id}`);
            if (detailsRes.ok) {
              const detail = await detailsRes.json();
              lyricsContent = detail.syncedLyrics || detail.plainLyrics || '';
              isSynced = !!detail.syncedLyrics;
            }
          }
        }
      } catch (err) {
        console.error("Lyrics fetch failed during upload:", err);
      }

      let parsedLyrics: LyricsLine[] = [];
      if (lyricsContent) {
        setLogs(prev => [
          ...prev,
          `[OK] Matched lyrics downloaded from database.`,
          `[PROCESS] Compiling lyrics scrolling intervals...`
        ]);
        const compiled = compileSearchedSong(cleanName, "Local Upload", lyricsContent, isSynced, duration, 'synthwave');
        parsedLyrics = compiled.lyrics;
      } else {
        setLogs(prev => [
          ...prev,
          `[WARNING] No online lyrics found. Registering placeholder scroll...`
        ]);
        parsedLyrics = [
          { text: `Local File: ${cleanName}`, time: 2, duration: 4 },
          { text: "No lyrics file detected on the internet.", time: 7, duration: 5 },
          { text: "🎵 playing local file 🎵", time: 15, duration: duration - 16 }
        ];
      }

      const uploadedSong: Song = {
        id: `upload-${Date.now()}`,
        title: cleanName,
        artist: 'Local File',
        genre: 'synthwave',
        tempo: 120,
        key: 'C',
        lyrics: parsedLyrics,
        chords: [],
        seed: Math.random(),
        duration: duration,
        audioUrl: audioUrl
      };

      setLogs(prev => [
        ...prev,
        `[SUCCESS] File parsed: "${uploadedSong.title}"`,
        `[SUCCESS] Track successfully added to playlist.`
      ]);

      setTimeout(() => {
        setIsGenerating(false);
        onSongGenerated(uploadedSong);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 800);

    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] Local upload parsing failed: ${err.message}`]);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--accent-primary)] glow-accent" />
          <h2 className="text-md font-bold uppercase tracking-wider">Stream & Import Audio</h2>
        </div>
      </div>

      {/* Source choosing selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-1" id="search-source-selector">
        <button
          type="button"
          onClick={() => selectSource('music')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${searchSource === 'music' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
        >
          <Music className="w-3.5 h-3.5 mr-1" />
          Jamendo Music
        </button>
        <button
          type="button"
          onClick={() => selectSource('quran')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${searchSource === 'quran' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1" />
          Quran
        </button>
        <button
          type="button"
          onClick={() => selectSource('archive')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${searchSource === 'archive' ? 'btn-active shadow-sm' : 'btn-inactive'
            }`}
        >
          <Library className="w-3.5 h-3.5 mr-1" />
          Archive.org
        </button>
      </div>

      {/* Input query form */}
      <div className="flex flex-col gap-3">
        {searchSource === 'quran' && (
          <div ref={reciterComboboxRef} className="flex flex-col gap-1.5 relative" id="reciter-selector-wrapper">
            <label className="text-[10px] font-mono text-theme-muted uppercase tracking-wider select-none">
              Select Reciter
            </label>

            {/* Search Input with integrated toggle arrow */}
            <div className="relative">
              <input
                type="text"
                placeholder={selectedReciter?.name || "Select Reciter..."}
                value={reciterSearchQuery}
                onChange={(e) => {
                  setReciterSearchQuery(e.target.value);
                  if (e.target.value !== "") {
                    setIsDropdownOpen(true);
                  }
                  else {
                    setIsDropdownOpen(false);
                  }
                }}
                className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-theme-primary placeholder-theme-primary focus:placeholder-theme-muted focus:outline-none focus:border-[var(--accent-primary)] hover:border-[var(--accent-secondary)] transition-all"
                id="quran-reciter-search"
              />
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute p-1 bg-transparent border-0 text-theme-muted hover:text-theme-primary cursor-pointer focus:outline-none flex items-center justify-center"
                style={{ top: '50%', transform: 'translateY(-50%)', right: '10px' }}
                title="Toggle Reciter List"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Scrollable Reciter Options List */}
            {isDropdownOpen && (
              <div
                className="flex flex-col gap-1 max-h-36 overflow-y-auto border border-[var(--border-color)] rounded-xl p-1.5 bg-[var(--bg-primary)] shadow-lg absolute z-20 left-0 right-0 top-full mt-1"
                id="quran-reciters-list"
              >
                {/* List items selection */}
                {((reciterSearchQuery.trim() !== '') ? filteredReciters : reciters).length === 0 ? (
                  <span className="text-[10px] text-theme-muted p-1 text-center select-none">No reciters found</span>
                ) : (
                  ((reciterSearchQuery.trim() !== '') ? filteredReciters : reciters).map((reciter) => {
                    const isSelected = selectedReciterId === reciter.id;
                    return (
                      <button
                        key={reciter.id}
                        type="button"
                        onClick={() => {
                          setSelectedReciterId(reciter.id);
                          setReciterSearchQuery('');
                          setIsDropdownOpen(false);
                        }}
                        className={`px-2.5 py-1.5 rounded text-left text-xs transition-all flex items-center justify-between border-0 cursor-pointer ${isSelected
                          ? 'btn-active font-semibold shadow-sm'
                          : 'bg-transparent text-theme-muted hover:bg-white/5 hover:text-theme-primary'
                          }`}
                      >
                        <span>{reciter.name}</span>
                        {isSelected && <span className="text-[9px] uppercase tracking-widest font-mono opacity-80">Selected</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleGenerate} className="flex gap-2">
          <div className="search-input-wrapper">
            <input
              type="text"
              required
              id="song-search-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                searchSource === 'music'
                  ? "Search Jamendo (e.g. lofi, acoustic, rock)..."
                  : searchSource === 'quran'
                    ? "Enter Surah name or number (e.g. Yaseen, Mulk, 1)..."
                    : "Search Archive.org public domain audio..."
              }
              className="search-input"
            />
            <Search className="search-icon" />
          </div>

          <button
            type="submit"
            disabled={isGenerating || !title.trim()}
            id="btn-synthesize-song"
            className="search-btn"
          >
            <AudioLines className="w-4 h-4" />
            Search
          </button>
        </form>

        {/* Search Results List */}
        {searchResults.length > 0 && (
          <div className="flex flex-col gap-2 border border-[var(--border-color)] bg-[var(--bg-panel)] rounded-xl p-3 max-h-56 overflow-y-auto animate-none" id="search-results-panel">
            <span className="text-[10px] font-mono text-theme-muted uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
              <Search className="w-3 h-3 text-[var(--accent-secondary)]" /> Search Results ({searchResults.length})
            </span>
            <div className="flex flex-col divide-y divide-[var(--border-color)]/20">
              {searchResults.map(track => {
                const isAdding = addingTrackId === track.id;
                return (
                  <div key={track.id} className="flex items-center justify-between py-2 gap-2 text-xs">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleAddTrack(track)}
                        disabled={!!addingTrackId}
                        title="Add to Playlist"
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 disabled:opacity-50 ${isAdding ? 'btn-active shadow-sm' : 'btn-inactive'
                          }`}
                      >
                        {isAdding ? (
                          <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-theme-primary truncate">{track.name}</span>
                        <span className="text-[10px] text-theme-muted truncate">{track.artist_name}</span>
                      </div>
                    </div>
                    {track.duration && (
                      <span className="text-[10px] font-mono text-theme-muted flex-shrink-0">
                        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

              {loadingMessage && (
                <p className="text-[10px]" style={{ color: loadingStatus === 'error' ? '#f87171' : loadingStatus === 'warning' ? '#fbbf24' : 'var(--text-muted)' }}>
                  {loadingMessage}
                </p>
              )}

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

        {/* Local File Upload Card */}
        <div className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-3 mt-1">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="upload-card"
          >
            <Upload className="w-5 h-5 text-[var(--accent-secondary)]" />
            <span className="upload-title">Click to Upload File</span>
            <span className="upload-subtitle">Supports MP3, WAV, M4A, OGG</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/mp3, audio/wav, audio/mpeg, audio/ogg, audio/x-m4a"
            className="hidden"
            id="local-file-uploader"
          />
        </div>
      </div>

      {/* Terminal Log Console */}
      {isGenerating || logs.length > 0 ? (
        <div className="w-full border border-[var(--border-color)] rounded-xl bg-black/80 p-3 h-32 flex flex-col font-mono text-[10px] text-green-400 overflow-hidden relative shadow-inner">
          <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-1 mb-1 text-[9px] text-zinc-500 select-none">
            <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-zinc-400" /> MUSIC HUD CONSOLE</span>
            {isGenerating && <span className="animate-pulse text-green-500">PROCESSING...</span>}
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
