export interface LyricsLine {
  text: string;
  time: number; // in seconds
  duration: number; // in seconds
}

export type MusicGenre = 'synthwave' | 'lofi' | 'cyberpunk' | 'cozy' | 'minimalist';

export interface ChordProgression {
  chords: string[]; // e.g. ["Am", "F", "C", "G"]
  frequencies: number[][]; // frequencies for the chords (triad or tetrad)
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: MusicGenre;
  tempo: number; // BPM
  key: string;
  lyrics: LyricsLine[];
  chords: string[]; // standard Roman numerals or chord symbols
  seed: number; // to generate reproducible music
  duration: number; // total duration in seconds
  isCustom?: boolean;
  audioUrl?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'robot';
}

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  currentTime: number;
  duration: number;
  currentSongId: string | null;
  selectedVoiceId: string | null;
  voiceGender: 'male' | 'female' | 'robot';
  shuffle: boolean;
  loop: boolean;
}

export type ThemeId = 'cyberpunk' | 'retro' | 'futuristic' | 'cozy' | 'minimalist';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
}
