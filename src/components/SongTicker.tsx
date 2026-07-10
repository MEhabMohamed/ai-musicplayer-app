import React, { useRef, useEffect, useState } from 'react';
import type { Song } from '../types/music';

interface SongTickerProps {
  song: Song | null;
  isPlaying: boolean;
}

export const SongTicker: React.FC<SongTickerProps> = ({ song, isPlaying }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const textWidth = textRef.current.scrollWidth;

    // Only scroll if text overflows the container
    setShouldScroll(textWidth > containerWidth);
  }, [song]);

  if (!song) {
    return (
      <div className="w-full flex items-center justify-center h-16 border border-[var(--border-color)] rounded-xl bg-black/20 px-4">
        <span className="text-sm font-medium text-theme-muted tracking-wider uppercase animate-pulse">
          No Audio Selected. Awaiting Input...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Ticker Container */}
      <div
        ref={containerRef}
        className="w-full relative overflow-hidden h-16 border border-[var(--border-color)] rounded-xl bg-black/20 flex items-center px-4"
        id="dynamic-song-ticker"
      >
        {/* Neon Glow Side Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none z-10" />

        <div
          ref={textRef}
          className={`flex items-center gap-10 whitespace-nowrap text-lg font-bold tracking-wide select-none ${shouldScroll && isPlaying ? 'animate-marquee' : ''
            }`}
          style={{
            animationDuration: '15s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          {/* Duplicate text if scrolling to create seamless loop */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent-primary)] font-extrabold uppercase">► NOW PLAYING //</span>
            <span className="text-theme-primary">{song.title}</span>
            <span className="text-theme-muted font-normal text-sm">by {song.artist}</span>
          </div>

          {shouldScroll && isPlaying && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-primary)] font-extrabold uppercase">► NOW PLAYING //</span>
              <span className="text-theme-primary">{song.title}</span>
              <span className="text-theme-muted font-normal text-sm">by {song.artist}</span>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles for Ticker */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translate(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
};
