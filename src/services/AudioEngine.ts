import type { Song } from '../types/music';

export class AudioEngine {
  // HTML5 Audio Element for native direct playback
  private audioEl: HTMLAudioElement | null = null;
  
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
  private bufferingCallback: ((isBuffering: boolean) => void) | null = null;

  private isBuffering = false;
  private stallTimeout: any = null;
  private isRecovering = false;

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

  public registerBufferingCallback(cb: (isBuffering: boolean) => void) {
    this.bufferingCallback = cb;
  }

  private startStallWatchdog() {
    this.clearStallWatchdog();
    this.stallTimeout = setTimeout(() => {
      if (this.isPlaying && this.isBuffering && !this.isRecovering) {
        console.warn("[AETHERIA-AUDIO] Audio playback stalled waiting for network data, initiating seamless recovery...");
        this.recoverCurrentPlayback("stall_timeout");
      }
    }, 7000);
  }

  private clearStallWatchdog() {
    if (this.stallTimeout) {
      clearTimeout(this.stallTimeout);
      this.stallTimeout = null;
    }
  }

  private recoverCurrentPlayback(reason = "stall") {
    if (!this.audioEl || !this.currentSong || this.isRecovering) return;
    this.isRecovering = true;
    const resumeTime = this.audioEl.currentTime || 0;
    console.warn(`[AETHERIA-AUDIO] Stream recovery (${reason}) at ${resumeTime.toFixed(1)}s for:`, this.currentSong.title);

    if (this.bufferingCallback) {
      this.bufferingCallback(true);
    }

    setTimeout(() => {
      if (!this.audioEl || !this.currentSong) {
        this.isRecovering = false;
        return;
      }

      const targetTime = resumeTime;
      const onCanPlay = () => {
        if (!this.audioEl) return;
        this.audioEl.removeEventListener('canplay', onCanPlay);
        try {
          if (targetTime > 0) {
            this.audioEl.currentTime = targetTime;
          }
        } catch {
          // ignore
        }
        this.audioEl.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.warn("[AETHERIA-AUDIO] Recovery playback failed:", err);
          }
        });
      };

      this.audioEl.addEventListener('canplay', onCanPlay, { once: true });
      this.audioEl.load();
      this.audioEl.play().catch(() => {});

      setTimeout(() => {
        this.isRecovering = false;
      }, 2500);
    }, 500);
  }

  public init() {
    if (this.audioEl) return;

    // Create and configure HTML5 Audio Element for direct native hardware audio routing
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
      this.clearStallWatchdog();
      this.isBuffering = false;
      if (this.bufferingCallback) {
        this.bufferingCallback(false);
      }
      if (this.canPlayThroughCallback) {
        this.canPlayThroughCallback();
      }
    });

    this.audioEl.addEventListener('canplay', () => {
      this.clearStallWatchdog();
      this.isBuffering = false;
      if (this.bufferingCallback) {
        this.bufferingCallback(false);
      }
    });

    this.audioEl.addEventListener('playing', () => {
      this.clearStallWatchdog();
      this.isBuffering = false;
      this.isRecovering = false;
      if (this.bufferingCallback) {
        this.bufferingCallback(false);
      }
    });

    this.audioEl.addEventListener('waiting', () => {
      this.isBuffering = true;
      if (this.bufferingCallback) {
        this.bufferingCallback(true);
      }
      this.startStallWatchdog();
    });

    this.audioEl.addEventListener('stalled', () => {
      this.isBuffering = true;
      if (this.bufferingCallback) {
        this.bufferingCallback(true);
      }
      this.startStallWatchdog();
    });

    this.audioEl.addEventListener('ended', () => {
      if (!this.audioEl) return;
      const cur = this.audioEl.currentTime || 0;
      const dur = this.audioEl.duration;
      const expectedDuration = (dur && isFinite(dur) && dur > 0) ? dur : (this.currentSong?.duration || 0);

      // Premature EOF check:
      // If the audio stopped before reaching within 3.5 seconds of the end of the surah track,
      // it means the network stream was prematurely terminated or stalled.
      // We must WAIT and recover the stream instead of prematurely advancing to next track/reciter!
      if (expectedDuration > 6 && cur < expectedDuration - 3.5) {
        console.warn(`[AETHERIA-AUDIO] Premature 'ended' event fired at ${cur.toFixed(1)}s of ${expectedDuration.toFixed(1)}s. Stream connection interrupted, waiting for recovery...`);
        this.recoverCurrentPlayback("premature_ended");
        return;
      }

      // The recitation has truly completed to the end of the track!
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
  }

  private isRetryingFallback = false;

  private tryFallback(): boolean {
    if (!this.audioEl || !this.currentSong?.fallbackUrls) return false;
    if (this.currentFallbackIndex >= this.currentSong.fallbackUrls.length) return false;
    if (this.isRetryingFallback) return true;

    this.isRetryingFallback = true;
    const nextUrl = this.currentSong.fallbackUrls[this.currentFallbackIndex++];
    const resumeTime = this.audioEl.currentTime || 0;
    console.warn(`[AETHERIA-AUDIO] Attempting audio fallback (${this.currentFallbackIndex}/${this.currentSong.fallbackUrls.length}): ${nextUrl} at ${resumeTime.toFixed(1)}s`);
    
    if (this.bufferingCallback) {
      this.bufferingCallback(true);
    }

    setTimeout(() => {
      if (this.audioEl) {
        const targetTime = resumeTime;
        const onCanPlay = () => {
          if (!this.audioEl) return;
          this.audioEl.removeEventListener('canplay', onCanPlay);
          try {
            if (targetTime > 0) {
              this.audioEl.currentTime = targetTime;
            }
          } catch {
            // ignore
          }
        };
        this.audioEl.addEventListener('canplay', onCanPlay, { once: true });
        this.audioEl.src = nextUrl;
        this.audioEl.load();
        this.audioEl.play().catch(err => {
          if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
            console.warn("[AETHERIA-AUDIO] Fallback play error:", err);
          }
        });
      }
      this.isRetryingFallback = false;
    }, 400);

    return true;
  }

  public getAnalyser(): AnalyserNode | null {
    return null;
  }

  public start(song: Song, resumeFromTime = 0) {
    this.init();
    if (!this.audioEl) return;

    this.isPlaying = true;
    this.currentSong = song;
    this.currentFallbackIndex = 0;

    // Only load source if it has changed or is empty
    const isNewSource = Boolean(song.audioUrl && (this.audioEl.src !== song.audioUrl && this.audioEl.currentSrc !== song.audioUrl));
    if (isNewSource && song.audioUrl) {
      this.audioEl.src = song.audioUrl;
      this.audioEl.load();
    }

    if (resumeFromTime > 0) {
      const applyResumeTime = () => {
        if (!this.audioEl) return;
        try {
          this.audioEl.currentTime = resumeFromTime;
        } catch {
          // ignore
        }
      };

      if (this.audioEl.readyState >= 2) {
        applyResumeTime();
      } else {
        this.audioEl.addEventListener('canplay', applyResumeTime, { once: true });
      }
    } else {
      try {
        this.audioEl.currentTime = 0;
      } catch {
        // ignore
      }
    }
    this.audioEl.volume = this.isMuted ? 0 : this.volume;
    
    // Play with catch block in case user hasn't interacted yet or source changed
    const playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          console.warn("[AETHERIA-AUDIO] Audio playback failed to start:", err);
          if (this.currentSong?.fallbackUrls && this.currentFallbackIndex < this.currentSong.fallbackUrls.length) {
            this.tryFallback();
          }
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
  }

  public setMute(val: boolean) {
    this.isMuted = val;
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
  }

  // Keep compatibility method with zero-op to avoid breaking interface
  public singLyricLine(_text: string, _duration: number, _gender: 'male' | 'female' | 'robot') {
    // Vocal synthesis models are completely disabled
  }
}
