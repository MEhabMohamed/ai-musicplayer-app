import { QURAN_SURAHS } from '../data/quranMetadata';
import { getQdcReciterId, type ReciterItem } from '../data/allReciters';
import type { Song, LyricsLine } from '../types/music';

/**
 * Creates a track for Recitation Only mode instantly.
 * Real audio duration will be resolved seamlessly on loadedmetadata event.
 */
export function createRecitationTrack(
  surahNum: number,
  reciter: ReciterItem,
  language: 'en' | 'ar' = 'en'
): Song {
  const surahMeta = QURAN_SURAHS.find(s => s.id === surahNum) || QURAN_SURAHS[0];
  const paddedSurah = String(surahNum).padStart(3, '0');
  const server = reciter.server
    ? (reciter.server.endsWith('/') ? reciter.server : `${reciter.server}/`)
    : 'https://server8.mp3quran.net/afs/';
  const audioUrl = `${server}${paddedSurah}.mp3`;

  const reciterDisplayName = language === 'ar'
    ? (reciter.nameArabic || reciter.name)
    : (reciter.name || reciter.nameArabic);

  // Initial estimate proportional to verse count; true audio duration is resolved on loadedmetadata
  const estimatedDuration = Math.max(15, Math.round(surahMeta.verses * 4.5));

  return {
    id: `recitation-ch-${surahNum}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: `Surah ${surahMeta.name} (${surahMeta.nameArabic})`,
    artist: language === 'ar' ? `القارئ: ${reciterDisplayName}` : `Reciter: ${reciterDisplayName}`,
    genre: 'minimalist',
    tempo: 60,
    key: 'C',
    lyrics: [],
    chords: [],
    seed: Math.random(),
    duration: estimatedDuration,
    audioUrl,
    chapterId: surahNum,
    reciterId: reciter.id,
    isRecitationOnly: true
  };
}

/**
 * Fetches bilingual verses and audio for Quran With Ayat mode.
 */
export async function fetchQuranWithAyatTrack(
  surahNum: number,
  reciter: ReciterItem,
  language: 'en' | 'ar' = 'en'
): Promise<Song> {
  const surahMeta = QURAN_SURAHS.find(s => s.id === surahNum) || QURAN_SURAHS[0];
  const paddedSurah = String(surahNum).padStart(3, '0');
  const reciterDisplayName = language === 'ar'
    ? (reciter.nameArabic || reciter.name)
    : (reciter.name || reciter.nameArabic);

  let audioUrl = reciter.server
    ? `${reciter.server}${paddedSurah}.mp3`
    : `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;

  let verseTimings: any[] = [];
  let apiDuration = 0;
  let arabicAyahs: any[] = [];
  let translationAyahs: any[] = [];

  try {
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

    const qdcId = reciter.qdcId || getQdcReciterId(reciter);
    if (qdcId) {
      try {
        const resAudio = await fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${qdcId}/audio_files?chapter=${surahNum}&segments=true`);
        if (resAudio.ok) {
          const json = await resAudio.json();
          const audioFile = json.audio_files?.[0];
          if (audioFile && audioFile.verse_timings && audioFile.verse_timings.length > 0) {
            verseTimings = audioFile.verse_timings;
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
  } catch (err) {
    console.warn("Failed to fetch Quran metadata:", err);
  }

  let duration = apiDuration;
  if (!duration && verseTimings.length > 0) {
    const lastTiming = verseTimings[verseTimings.length - 1];
    duration = (lastTiming.timestamp_to || lastTiming.timestamp_from || 0) / 1000;
  }
  if (!duration) {
    duration = Math.max(15, Math.round(surahMeta.verses * 4.5));
  }

  let lyricsLines: LyricsLine[] = [];
  if (arabicAyahs.length > 0) {
    if (verseTimings.length > 0) {
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
  }

  return {
    id: `quran-ch-${surahNum}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: `Surah ${surahMeta.name} (${surahMeta.nameArabic})`,
    artist: reciterDisplayName,
    genre: 'cozy',
    tempo: 60,
    key: 'C',
    lyrics: lyricsLines,
    chords: [],
    seed: Math.random(),
    duration,
    audioUrl,
    chapterId: surahNum,
    reciterId: reciter.id,
    isQuran: true
  };
}
