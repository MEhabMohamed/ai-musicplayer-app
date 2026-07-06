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
  
  public voiceAmplitude = 0.0; // Keep field for visualizer compatibility
  private durationCallback: ((duration: number) => void) | null = null;

  constructor() {
    // Context is initialized on user interaction
  }

  public registerDurationCallback(cb: (duration: number) => void) {
    this.durationCallback = cb;
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
    
    // Route Audio Element -> SourceNode -> Analyser -> MasterGain -> Destination
    this.sourceNode = this.ctx.createMediaElementSource(this.audioEl);
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
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

    // Only load source if it has changed or is empty
    if (song.audioUrl && this.audioEl.src !== song.audioUrl) {
      this.audioEl.src = song.audioUrl;
      this.audioEl.load();
    }

    this.audioEl.currentTime = resumeFromTime;
    this.audioEl.volume = this.isMuted ? 0 : this.volume;
    
    // Play with catch block in case user hasn't interacted yet
    this.audioEl.play().catch(err => {
      console.warn("[AETHERIA-AUDIO] Audio playback failed to start:", err);
    });
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
      this.audioEl.currentTime = 0;
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
