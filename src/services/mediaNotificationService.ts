import { registerPlugin } from '@capacitor/core';
import type { Song } from '../types/music';

interface MediaNotificationPluginType {
  start(options: { title: string; artist: string; isPlaying: boolean }): Promise<void>;
  update(options: { title: string; artist: string; isPlaying: boolean }): Promise<void>;
  stop(): Promise<void>;
  addListener(
    eventName: 'onNotificationAction',
    listenerFunc: (data: { action: 'play' | 'pause' | 'next' | 'prev' }) => void
  ): Promise<any>;
}

// Register native Android notification plugin safely
const MediaNotification = registerPlugin<MediaNotificationPluginType>('MediaNotification');

export class MediaNotificationService {
  private static isNativeActive = false;
  private static actionCallback: ((action: 'play' | 'pause' | 'next' | 'prev') => void) | null = null;
  private static isListenerSetup = false;

  public static init(onAction: (action: 'play' | 'pause' | 'next' | 'prev') => void) {
    this.actionCallback = onAction;

    // 1. Setup standard Web Media Session API for browsers & WebView
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          this.actionCallback?.('play');
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.actionCallback?.('pause');
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.actionCallback?.('prev');
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.actionCallback?.('next');
        });
      } catch (err) {
        console.warn('[MediaSession] Web MediaSession setup error:', err);
      }
    }

    // 2. Setup native Android notification bar controls listener
    if (!this.isListenerSetup) {
      try {
        MediaNotification.addListener('onNotificationAction', (data) => {
          if (data && data.action) {
            this.actionCallback?.(data.action);
          }
        }).catch(() => {
          // Plugin not available in regular browser environment
        });
        this.isListenerSetup = true;
      } catch (err) {
        console.warn('[MediaNotification] Native listener setup error:', err);
      }
    }
  }

  public static update(song: Song | null, isPlaying: boolean) {
    if (!song) {
      this.stop();
      return;
    }

    const title = song.title || 'Quran Recitation';
    const artist = song.artist || 'Continuous Stream';

    // 1. Update Web Media Session
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist,
          album: 'Quran With Verses',
          artwork: [
            { src: '/app-icon.png', sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch {
        // ignore
      }
    }

    // 2. Update Native Android Foreground Service & Notification Bar
    try {
      if (!this.isNativeActive) {
        MediaNotification.start({ title, artist, isPlaying })
          .then(() => {
            this.isNativeActive = true;
          })
          .catch(() => {});
      } else {
        MediaNotification.update({ title, artist, isPlaying }).catch(() => {});
      }
    } catch {
      // ignore in browser
    }
  }

  public static stop() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {
        // ignore
      }
    }

    if (this.isNativeActive) {
      try {
        MediaNotification.stop().catch(() => {});
      } catch {
        // ignore
      }
      this.isNativeActive = false;
    }
  }
}
