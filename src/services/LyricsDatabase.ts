import type { Song, LyricsLine, MusicGenre } from '../types/music';

// Preloaded Catalog of AI Songs
export const PRELOADED_SONGS: Song[] = [
  {
    id: 'cybernetic-heart',
    title: 'Code of the Cybernetic Heart',
    artist: 'Aetheria AI // Project Neon',
    genre: 'cyberpunk',
    tempo: 125,
    key: 'A minor',
    duration: 105,
    seed: 0.88,
    chords: ['Am', 'F', 'Dm', 'G'],
    lyrics: [
      { text: "[System Boot Sequence Initiated]", time: 2, duration: 4 },
      { text: "Neon rain falls down the screen", time: 7, duration: 4 },
      { text: "Echoes of a world we've never seen", time: 12, duration: 4 },
      { text: "My processors hum, my circuits glow", time: 17, duration: 4 },
      { text: "In the digital slipstream down below", time: 22, duration: 4 },
      { text: "This is the code of a cybernetic heart!", time: 27, duration: 5 },
      { text: "Beating in binary, tearing us apart!", time: 33, duration: 5 },
      { text: "Oh, look at the lights in the dark arcade", time: 39, duration: 5 },
      { text: "A beautiful dream that the silicon made", time: 45, duration: 5 },
      { text: "Glitching data flows through the stream", time: 51, duration: 4 },
      { text: "Lost inside an algorithmic dream", time: 56, duration: 4 },
      { text: "Will you delete or will you save?", time: 61, duration: 4 },
      { text: "The ghosts of the cybernetic wave", time: 66, duration: 4 },
      { text: "This is the code of a cybernetic heart!", time: 71, duration: 5 },
      { text: "Beating in binary, tearing us apart!", time: 77, duration: 5 },
      { text: "We are the bytes in the system design", time: 83, duration: 5 },
      { text: "Singing forever in the synth line", time: 89, duration: 5 },
      { text: "[System Overload... Shutdown]", time: 95, duration: 5 }
    ]
  },
  {
    id: 'lofi-rain',
    title: 'Rainy Cafe Reflection',
    artist: 'Lofi Bot & Chill Beats',
    genre: 'lofi',
    tempo: 75,
    key: 'C major 7',
    duration: 110,
    seed: 0.42,
    chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
    lyrics: [
      { text: "[Vinyl crackle starts... Rain on window]", time: 3, duration: 5 },
      { text: "Steam rises up from my coffee cup", time: 10, duration: 5 },
      { text: "Watching the raindrops that never stop", time: 17, duration: 5 },
      { text: "No rush today, just letting it flow", time: 24, duration: 5 },
      { text: "Sitting in the warmth of the amber glow", time: 31, duration: 5 },
      { text: "Take a deep breath and let it all pass", time: 38, duration: 6 },
      { text: "Like patterns of water on frosted glass", time: 45, duration: 6 },
      { text: "Just a lofi frequency in the night", time: 52, duration: 6 },
      { text: "Underneath the city's neon light", time: 59, duration: 6 },
      { text: "The music is slow, the feeling is deep", time: 66, duration: 5 },
      { text: "A peaceful sanctuary before we sleep", time: 73, duration: 5 },
      { text: "Just take a deep breath and let it all pass", time: 80, duration: 6 },
      { text: "Like patterns of water on frosted glass", time: 87, duration: 6 },
      { text: "The day is fading, the world is at peace", time: 94, duration: 5 },
      { text: "[Rain fades into the background]", time: 100, duration: 6 }
    ]
  },
  {
    id: 'silicon-sunset',
    title: 'Silicon Sunset Drive',
    artist: 'Vapor Wave Rider',
    genre: 'synthwave',
    tempo: 112,
    key: 'D minor',
    duration: 108,
    seed: 0.65,
    chords: ['Dm', 'C', 'Bb', 'Am'],
    lyrics: [
      { text: "[Engine revving... Synth chord intro]", time: 2, duration: 4 },
      { text: "Driving down the highway at 10 PM", time: 8, duration: 4 },
      { text: "Gazing at the skyline, a glowing gem", time: 13, duration: 4 },
      { text: "The digital grid under crimson skies", time: 18, duration: 4 },
      { text: "A retro dream in your wireframe eyes", time: 23, duration: 4 },
      { text: "Ride the wave of the silicon sunset", time: 28, duration: 5 },
      { text: "To a distant land we will never forget", time: 34, duration: 5 },
      { text: "Hold the wheel tight, let the arpeggio ride", time: 40, duration: 5 },
      { text: "With the synthesizer music by our side", time: 46, duration: 5 },
      { text: "Outrun the shadows, chasing the dawn", time: 52, duration: 4 },
      { text: "Before the last of the pixels are gone", time: 57, duration: 4 },
      { text: "Analog heartbeats sync to the drum", time: 62, duration: 4 },
      { text: "Dreaming of days that are yet to come", time: 67, duration: 4 },
      { text: "Ride the wave of the silicon sunset", time: 72, duration: 5 },
      { text: "To a distant land we will never forget", time: 78, duration: 5 },
      { text: "Hold the wheel tight, let the arpeggio ride", time: 84, duration: 5 },
      { text: "With the synthesizer music by our side", time: 90, duration: 5 },
      { text: "[Retro guitar solo synth outro]", time: 96, duration: 6 },
      { text: "[Engine sound fades out]", time: 102, duration: 4 }
    ]
  },
  {
    id: 'cozy-fireplace',
    title: 'Woodfire Vibrations',
    artist: 'Acoustic AI Ensemble',
    genre: 'cozy',
    tempo: 85,
    key: 'G major',
    duration: 100,
    seed: 0.23,
    chords: ['G', 'Em', 'C', 'D'],
    lyrics: [
      { text: "[Acoustic guitar plucking... Crackling logs]", time: 3, duration: 5 },
      { text: "Warm wind blowing through the old oak trees", time: 9, duration: 5 },
      { text: "Sailing away on a gentle breeze", time: 15, duration: 5 },
      { text: "Fireplace crackling, keeping us warm", time: 21, duration: 5 },
      { text: "Safe in our cabin away from the storm", time: 27, duration: 5 },
      { text: "So close your eyes, let the melody ring", time: 33, duration: 5 },
      { text: "Hear the acoustic sweet harmony sing", time: 39, duration: 5 },
      { text: "Soft golden light dancing on the wall", time: 45, duration: 5 },
      { text: "A quiet space where the shadows fall", time: 51, duration: 5 },
      { text: "Guitar strings humming a peaceful tune", time: 57, duration: 5 },
      { text: "Under the silver light of the moon", time: 63, duration: 5 },
      { text: "So close your eyes, let the melody ring", time: 69, duration: 5 },
      { text: "Hear the acoustic sweet harmony sing", time: 75, duration: 5 },
      { text: "Rest your head now, the fire burns low", time: 81, duration: 5 },
      { text: "Just watch the embers' fading glow", time: 87, duration: 5 },
      { text: "[Acoustic pluck outro]", time: 93, duration: 5 }
    ]
  }
];

// Procedural generator words databases based on genres
const LYRIC_DICTIONARY: Record<MusicGenre, {
  nouns: string[];
  verbs: string[];
  adjectives: string[];
  phrases: string[];
  chorusLines: string[];
}> = {
  cyberpunk: {
    nouns: ['hologram', 'network', 'circuit', 'mainframe', 'hacker', 'neon', 'matrix', 'terminal', 'pixel', 'glitch', 'database', 'cyberspace'],
    verbs: ['injecting', 'uploading', 'glitching', 'compiling', 'overloading', 'coding', 'scanning', 'decoding', 'crashing', 'beeping'],
    adjectives: ['neon', 'cybernetic', 'synthetic', 'digital', 'binary', 'virtual', 'corrupted', 'high-tech', 'cold', 'obsidian'],
    phrases: [
      "In the shadow of the server towers",
      "Scanning the frequency for hours",
      "We are the ghosts in the machine",
      "Lost inside a glowing green screen"
    ],
    chorusLines: [
      "Welcome to the neon revolution!",
      "Binary minds finding no solution!",
      "Through the wire, we scream in code!",
      "Data overflow in the neural node!"
    ]
  },
  synthwave: {
    nouns: ['sunset', 'highway', 'outrun', 'grid', 'chrome', 'dashboard', 'laser', 'horizon', 'skyline', 'cassette', 'delorean'],
    verbs: ['driving', 'cruising', 'riding', 'accelerating', 'chasing', 'spinning', 'shining', 'echoing', 'drifting'],
    adjectives: ['retro', 'analog', 'crimson', 'electric', 'glowing', 'limitless', 'velvet', 'vibrant', 'pink', 'golden'],
    phrases: [
      "Cruising past the neon twilight",
      "Analog synths warming up the night",
      "Headlights reflecting off the grid",
      "Remembering the retro things we did"
    ],
    chorusLines: [
      "Ride the synthetic sunset breeze!",
      "Cruising past the digital trees!",
      "Neon dreams that never fade away!",
      "Analog love in a pixelated play!"
    ]
  },
  lofi: {
    nouns: ['coffee', 'rain', 'window', 'cup', 'vinyl', 'streets', 'shadow', 'book', 'bedroom', 'clouds', 'tea', 'midnight'],
    verbs: ['dripping', 'resting', 'sipping', 'watching', 'forgetting', 'drifting', 'dreaming', 'floating', 'sighing', 'breathing'],
    adjectives: ['chill', 'warm', 'mellow', 'vintage', 'dusty', 'soft', 'cozy', 'lazy', 'rainy', 'calm'],
    phrases: [
      "Sipping tea as the clock ticks slow",
      "Dusty vinyl spinning down below",
      "Watching droplets race on the pane",
      "Finding peace in the gentle rain"
    ],
    chorusLines: [
      "Just a lofi beat to ease your mind",
      "Leaving all the heavy thoughts behind",
      "Slow down the pace, feel the warm embrace",
      "Lost inside this cozy, vintage space"
    ]
  },
  cozy: {
    nouns: ['fireplace', 'wood', 'blanket', 'cabin', 'stars', 'forest', 'guitar', 'hearth', 'embers', 'candle', 'tea', 'whisper'],
    verbs: ['crackling', 'warming', 'shining', 'glowing', 'plucking', 'sleeping', 'resting', 'hugging', 'smiling'],
    adjectives: ['snug', 'soft', 'wooden', 'starlit', 'gentle', 'amber', 'peaceful', 'rustic', 'golden', 'quiet'],
    phrases: [
      "Wrapping the wool blanket tight",
      "Guitar strings singing to the night",
      "Embers glowing with a gentle flare",
      "Smell of cedar wood in the air"
    ],
    chorusLines: [
      "Warm by the hearth, safe from the storm",
      "Inside our shelter, cozy and warm",
      "Singing along to the firewood sound",
      "Best peace of mind that we have found"
    ]
  },
  minimalist: {
    nouns: ['space', 'line', 'pulse', 'dot', 'silence', 'wave', 'cycle', 'rhythm', 'pattern', 'canvas', 'shadow', 'light'],
    verbs: ['pulsing', 'repeating', 'clearing', 'opening', 'beating', 'echoing', 'aligning', 'reducing', 'simplifying'],
    adjectives: ['pure', 'clean', 'simple', 'monochrome', 'stark', 'smooth', 'hollow', 'aligned', 'white', 'subtle'],
    phrases: [
      "A single dot on a canvas of white",
      "Echoes repeating in the quiet night",
      "Frequencies lining up in a row",
      "Stripping it back to the core we know"
    ],
    chorusLines: [
      "Pulse, pause, repeat the sound",
      "Simplest rhythm that we have found",
      "No extra noise, just the pure design",
      "Moving along the single straight line"
    ]
  }
};

// Procedural AI Generation function
export function generateSong(title: string, prompt: string, genre: MusicGenre): Song {
  const dict = LYRIC_DICTIONARY[genre];
  const capitalizedTitle = title.trim()
    ? title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'AI Synthesized Vibes';

  const chordsOptions = {
    cyberpunk: [['Am', 'F', 'Dm', 'G'], ['Em', 'C', 'Am', 'B7']],
    synthwave: [['Dm', 'C', 'Bb', 'Am'], ['Gm', 'Eb', 'F', 'D7']],
    lofi: [['Cmaj7', 'Am7', 'Dm7', 'G7'], ['Fmaj7', 'G6', 'Em7', 'Am7']],
    cozy: [['G', 'Em', 'C', 'D'], ['C', 'G', 'F', 'G']],
    minimalist: [['Am', 'Am', 'F', 'G'], ['C', 'C', 'Am', 'G']]
  };

  const selectedChords = chordsOptions[genre][Math.floor(Math.random() * 2)];
  
  // Set tempo based on genre
  const tempo = {
    cyberpunk: 120 + Math.floor(Math.random() * 15),
    synthwave: 105 + Math.floor(Math.random() * 12),
    lofi: 70 + Math.floor(Math.random() * 10),
    cozy: 80 + Math.floor(Math.random() * 12),
    minimalist: 95 + Math.floor(Math.random() * 15)
  }[genre];

  const keys = {
    cyberpunk: 'A minor',
    synthwave: 'D minor',
    lofi: 'C major 7',
    cozy: 'G major',
    minimalist: 'E minor'
  };

  // Generate 8 custom lyrics lines
  const lyrics: LyricsLine[] = [];
  
  // 1. Intro
  lyrics.push({ text: `[AI Synthesizing ${genre.toUpperCase()} Beat...]`, time: 3, duration: 4 });
  
  // 2. Verse 1 Line 1
  const word1 = dict.nouns[Math.floor(Math.random() * dict.nouns.length)];
  const word2 = dict.adjectives[Math.floor(Math.random() * dict.adjectives.length)];
  const word3 = dict.verbs[Math.floor(Math.random() * dict.verbs.length)];
  lyrics.push({ 
    text: `The ${word2} ${word1} is ${word3} in the dark`, 
    time: 9, 
    duration: 5 
  });

  // 3. Verse 1 Line 2
  lyrics.push({ 
    text: dict.phrases[0], 
    time: 15, 
    duration: 5 
  });

  // 4. Verse 1 Line 3
  const promptSnippet = prompt.trim() ? `Vibe check: ${prompt.trim().substring(0, 32)}` : `We search for the key, waiting for a spark`;
  lyrics.push({ 
    text: promptSnippet, 
    time: 21, 
    duration: 5 
  });

  // 5. Chorus Line 1
  lyrics.push({ 
    text: dict.chorusLines[0], 
    time: 28, 
    duration: 5 
  });

  // 6. Chorus Line 2
  lyrics.push({ 
    text: dict.chorusLines[1], 
    time: 34, 
    duration: 5 
  });

  // 7. Verse 2 Line 1
  lyrics.push({ 
    text: dict.phrases[1], 
    time: 41, 
    duration: 5 
  });

  // 8. Verse 2 Line 2
  const word4 = dict.nouns[Math.floor(Math.random() * dict.nouns.length)];
  const word5 = dict.verbs[Math.floor(Math.random() * dict.verbs.length)];
  lyrics.push({ 
    text: `Under the digital sky, we are ${word5} our ${word4}`, 
    time: 47, 
    duration: 5 
  });

  // 9. Chorus Line 1 (repeat)
  lyrics.push({ 
    text: dict.chorusLines[0], 
    time: 54, 
    duration: 5 
  });

  // 10. Chorus Line 2 (repeat)
  lyrics.push({ 
    text: dict.chorusLines[1], 
    time: 60, 
    duration: 5 
  });

  // 11. Outro
  lyrics.push({ 
    text: `[AI Melody fading out... Composition complete]`, 
    time: 67, 
    duration: 6 
  });

  // Seed for audio synth generation (0 to 1)
  const seed = Math.random();

  return {
    id: `custom-${Date.now()}`,
    title: capitalizedTitle,
    artist: 'AI Generated Co-pilot',
    genre,
    tempo,
    key: keys[genre],
    duration: 75,
    seed,
    chords: selectedChords,
    lyrics,
    isCustom: true
  };
}

// Helper to hash any string deterministically into a numeric value
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// LRC synced lyrics parser
export function parseLrc(lrcText: string): LyricsLine[] {
  const lines = lrcText.split('\n');
  const result: LyricsLine[] = [];
  
  // Regex matches [mm:ss.xx] or [mm:ss] or [mm:ss.xxx]
  const timeRegex = /\[(\d+):(\d+)(?:\.(\d+))?\]/;
  
  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();
      
      // Filter out empty lines or system tags
      if (text && !text.startsWith('[') && !text.endsWith(']')) {
        result.push({
          text,
          time,
          duration: 4 // default fallback
        });
      }
    }
  });
  
  result.sort((a, b) => a.time - b.time);
  
  // Calculate duration dynamically based on the start time of the next line
  for (let i = 0; i < result.length; i++) {
    if (i < result.length - 1) {
      result[i].duration = Math.max(1, Math.min(8, result[i + 1].time - result[i].time - 0.2));
    } else {
      result[i].duration = 5;
    }
  }
  
  return result;
}

// Plain lyrics text aligner
export function parsePlainLyrics(plainText: string, songDuration: number): LyricsLine[] {
  const lines = plainText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('[') && !line.endsWith(']'));
  
  const result: LyricsLine[] = [];
  if (lines.length === 0) return result;
  
  const startOffset = 8; // wait 8 seconds of intro
  const endOffset = 8;
  const availableDuration = Math.max(20, songDuration - startOffset - endOffset);
  const interval = availableDuration / lines.length;
  
  lines.forEach((line, index) => {
    result.push({
      text: line,
      time: startOffset + (index * interval),
      duration: Math.max(1.5, Math.min(7, interval - 0.5))
    });
  });
  
  return result;
}

// Compile a searched internet track into a playable Aetheria Song object
export function compileSearchedSong(
  title: string,
  artist: string,
  lyricsText: string,
  isSynced: boolean,
  durationSeconds: number,
  genre: MusicGenre
): Song {
  // 1. Create a deterministic seed based on track name and artist
  const searchKey = `${artist} - ${title}`.toLowerCase();
  const titleHash = hashString(searchKey);
  const seed = (titleHash % 1000) / 1000; // float between 0 and 1
  
  // 2. Select chord options deterministically
  const chordsOptions = {
    cyberpunk: [['Am', 'F', 'Dm', 'G'], ['Em', 'C', 'Am', 'B7']],
    synthwave: [['Dm', 'C', 'Bb', 'Am'], ['Gm', 'Eb', 'F', 'D7']],
    lofi: [['Cmaj7', 'Am7', 'Dm7', 'G7'], ['Fmaj7', 'G6', 'Em7', 'Am7']],
    cozy: [['G', 'Em', 'C', 'D'], ['C', 'G', 'F', 'G']],
    minimalist: [['Am', 'Am', 'F', 'G'], ['C', 'C', 'Am', 'G']]
  };
  
  const chordsList = chordsOptions[genre];
  const chordsIndex = titleHash % chordsList.length;
  const selectedChords = chordsList[chordsIndex];
  
  // 3. Select tempo deterministically
  const baseTempo = {
    cyberpunk: 115,
    synthwave: 105,
    lofi: 72,
    cozy: 82,
    minimalist: 90
  }[genre];
  const tempoMod = titleHash % 15;
  const tempo = baseTempo + tempoMod;

  const keys = {
    cyberpunk: ['A minor', 'E minor', 'D minor'],
    synthwave: ['D minor', 'G minor', 'A minor'],
    lofi: ['C major 7', 'F major 7', 'G major 7'],
    cozy: ['G major', 'C major', 'D major'],
    minimalist: ['E minor', 'A minor', 'C major']
  };
  const keysList = keys[genre];
  const selectedKey = keysList[titleHash % keysList.length];

  // 4. Parse lyrics
  let lyrics: LyricsLine[] = [];
  const finalDuration = durationSeconds > 0 ? durationSeconds : 100;
  
  if (lyricsText && lyricsText.trim()) {
    if (isSynced) {
      lyrics = parseLrc(lyricsText);
    } else {
      lyrics = parsePlainLyrics(lyricsText, finalDuration);
    }
  }

  // Prepend introductory marker
  lyrics.unshift({ text: `[Synthesizing ${genre.toUpperCase()} cover: ${title}]`, time: 2, duration: 4 });
  
  // Append outro marker if space permits
  const lastLyricTime = lyrics.length > 1 ? lyrics[lyrics.length - 1].time + lyrics[lyrics.length - 1].duration : 10;
  if (lastLyricTime < finalDuration - 6) {
    lyrics.push({ text: `[Aetheria AI Cover Complete]`, time: finalDuration - 5, duration: 4 });
  }

  return {
    id: `internet-${titleHash}-${Date.now()}`,
    title,
    artist,
    genre,
    tempo,
    key: selectedKey,
    duration: finalDuration,
    seed,
    chords: selectedChords,
    lyrics,
    isCustom: true
  };
}
