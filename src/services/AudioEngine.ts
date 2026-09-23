import type { Song } from '../types/music';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  
  // HTML5 Audio Element for playback
  private audioEl: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  
  public currentSong: Song | null = null;
  public isPlaying = false;
  private isMuted = false;
  private volume = 0.8;
  private currentFallbackIndex = 0;
  
  public voiceAmplitude = 0.0; // Keep field for visualizer compatibility
  private durationCallback: ((duration: number) => void) | null = null;
  private endedCallback: (() => void) | null = null;
  private errorCallback: ((error: any) => void) | null = null;
  private canPlayThroughCallback: (() => void) | null = null;

  constructor() {
    // Context is initialized on user interaction
  }

  public registerDurationCallback(cb: (duration: number) => void) {
    this.durationCallback = cb;
  }

  public registerEndedCallback(cb: () => void) {
    this.endedCallback = cb;
  }

  public registerErrorCallback(cb: (error: any) => void) {
    this.errorCallback = cb;
  }

  public registerCanPlayThroughCallback(cb: () => void) {
    this.canPlayThroughCallback = cb;
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

    // Create and configure HTML5 Audio Element
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = "anonymous";
    this.audioEl.preload = "auto";

    this.audioEl.addEventListener('durationchange', () => {
      if (this.audioEl && this.durationCallback) {
        this.durationCallback(this.audioEl.duration);
      }
    });

    this.audioEl.addEventListener('loadedmetadata', () => {
      if (this.audioEl && this.durationCallback) {
        this.durationCallback(this.audioEl.duration);
      }
    });

    this.audioEl.addEventListener('canplaythrough', () => {
      if (this.canPlayThroughCallback) {
        this.canPlayThroughCallback();
      }
    });

    this.audioEl.addEventListener('ended', () => {
      if (this.endedCallback) {
        this.endedCallback();
      }
    });

    this.audioEl.addEventListener('error', (e) => {
      console.warn("[AETHERIA-AUDIO] Audio error event fired on:", this.audioEl?.src, e, this.audioEl?.error);
      if (this.tryFallback()) {
        return;
      }
      if (this.errorCallback) {
        this.errorCallback(this.audioEl?.error || e);
      }
    });
    
    // Route Audio Element -> SourceNode -> Analyser -> MasterGain -> Destination
    this.sourceNode = this.ctx.createMediaElementSource(this.audioEl);
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  private tryFallback(): boolean {
    if (!this.audioEl || !this.currentSong?.fallbackUrls) return false;
    if (this.currentFallbackIndex >= this.currentSong.fallbackUrls.length) return false;

    const nextUrl = this.currentSong.fallbackUrls[this.currentFallbackIndex++];
    console.warn(`[AETHERIA-AUDIO] Attempting audio fallback (${this.currentFallbackIndex}/${this.currentSong.fallbackUrls.length}): ${nextUrl}`);
    this.audioEl.src = nextUrl;
    this.audioEl.load();
    this.audioEl.play().catch(err => {
      console.warn("[AETHERIA-AUDIO] Fallback play error:", err);
      this.tryFallback();
    });
    return true;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public start(song: Song, resumeFromTime = 0) {
    this.init();
    if (!this.ctx || !this.audioEl) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.currentSong = song;
    this.currentFallbackIndex = 0;

    // Only load source if it has changed or is empty
    if (song.audioUrl && this.audioEl.src !== song.audioUrl && this.audioEl.currentSrc !== song.audioUrl) {
      this.audioEl.src = song.audioUrl;
      this.audioEl.load();
    }

    try {
      this.audioEl.currentTime = resumeFromTime;
    } catch {
      // ignore
    }
    this.audioEl.volume = this.isMuted ? 0 : this.volume;
    
    // Play with catch block in case user hasn't interacted yet or source changed
    const playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("[AETHERIA-AUDIO] Audio playback failed to start or was aborted:", err);
        if (this.currentSong?.fallbackUrls && this.currentFallbackIndex < this.currentSong.fallbackUrls.length) {
          this.tryFallback();
        }
      });
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
      try {
        this.audioEl.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }

  public seek(time: number) {
    if (this.audioEl) {
      this.audioEl.currentTime = time;
    }
  }

  public getCurrentTime(): number {
    if (this.audioEl) {
      return this.audioEl.currentTime;
    }
    return 0;
  }

  public setVolume(val: number) {
    this.volume = val;
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setMute(val: boolean) {
    this.isMuted = val;
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  // Keep compatibility method with zero-op to avoid breaking interface
  public singLyricLine(_text: string, _duration: number, _gender: 'male' | 'female' | 'robot') {
    // Vocal synthesis models are completely disabled
  }
}
