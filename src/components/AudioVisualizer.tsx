import React, { useEffect, useRef, useState } from 'react';
import type { VisualizerMode } from '../types/music';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  mode: VisualizerMode;
  voiceAmplitude: number; // voice reactivity input
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isPlaying,
  mode,
  voiceAmplitude
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Custom states for interactive controls
  const [activeMode, setActiveMode] = useState<VisualizerMode>(mode);

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Buffer for analyser data
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    // Matrix rain state variables
    const columns: number[] = [];
    const maxColumns = 40;
    for (let i = 0; i < maxColumns; i++) {
      columns[i] = Math.random() * -100; // start off-screen
    }

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Extract colors dynamically from CSS variables
      const bodyStyle = getComputedStyle(document.body);
      const colorAccent = bodyStyle.getPropertyValue('--accent-primary').trim() || '#ff007f';
      const colorAccentSec = bodyStyle.getPropertyValue('--accent-secondary').trim() || '#00f0ff';

      // Read audio data
      if (analyser && isPlaying) {
        if (activeMode === 'sonic-waves') {
          analyser.getByteTimeDomainData(dataArray);
        } else {
          analyser.getByteFrequencyData(dataArray);
        }
      } else {
        // Mock data when not playing (gentle ambient wave)
        const time = Date.now() * 0.003;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 128 + Math.sin(i * 0.15 + time) * 10;
        }
      }

      // Add voice amplitude impact to data array if speaking
      if (voiceAmplitude > 0) {
        for (let i = 0; i < bufferLength; i++) {
          // Inject vocal bump primarily in the middle frequency bands
          if (i > 15 && i < 50) {
            dataArray[i] = Math.min(255, dataArray[i] + voiceAmplitude * 150 * (1 - Math.abs(i - 32) / 16));
          }
        }
      }

      // Clear background with slight alpha for trail effects
      ctx.clearRect(0, 0, width, height);

      // --- VISUALIZATION MODES ---

      if (activeMode === 'sonic-waves') {
        // Peaks and Valleys Waveform
        ctx.lineWidth = 3;
        ctx.strokeStyle = colorAccent;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colorAccent;
        
        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // normalised 0.0 to 2.0
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Fill below/above middle line
        ctx.shadowBlur = 0;
        ctx.fillStyle = `${colorAccent}10`; // very transparent
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

      } else if (activeMode === 'retro-bars') {
        // Classic bouncing frequency bars
        const barWidth = (width / bufferLength) * 1.6;
        let barHeight;
        let x = 0;

        ctx.shadowBlur = 4;
        ctx.shadowColor = colorAccent;

        for (let i = 0; i < bufferLength; i++) {
          // Compress amplitude to visually balance bars
          barHeight = (dataArray[i] / 255.0) * height * 0.8;

          ctx.fillStyle = i % 2 === 0 ? colorAccent : colorAccentSec;

          // Draw rounded bars
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight - 4, barWidth - 2, barHeight + 4, [4, 4, 0, 0]);
          ctx.fill();

          x += barWidth;
        }
        ctx.shadowBlur = 0;

      } else if (activeMode === 'heartbeat-pulse') {
        // Center radial audio hub reacting to bass
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Bass average (first 8 frequency bins)
        let bassSum = 0;
        const numBassBins = Math.min(8, bufferLength);
        for (let i = 0; i < numBassBins; i++) {
          bassSum += dataArray[i];
        }
        const bassAvg = bassSum / numBassBins;
        const scaleFactor = 1 + (bassAvg / 255.0) * 0.45;
        const baseRadius = Math.min(width, height) * 0.18 * scaleFactor;

        // Draw outer pulsing rings
        ctx.strokeStyle = `${colorAccentSec}30`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.4, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = `${colorAccent}45`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.8, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw central solid glowing circle
        ctx.shadowBlur = 15;
        ctx.shadowColor = colorAccent;
        ctx.fillStyle = colorAccent;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw spinning radar lines or particle dots
        const numLines = 64;
        ctx.strokeStyle = colorAccentSec;
        ctx.lineWidth = 1.5;
        
        for (let i = 0; i < numLines; i++) {
          const angle = (i * 2 * Math.PI) / numLines + (Date.now() * 0.0005);
          const dataIndex = Math.floor((i / numLines) * (bufferLength / 2));
          const amplitude = (dataArray[dataIndex] / 255.0) * 45;
          
          const startX = centerX + Math.cos(angle) * baseRadius;
          const startY = centerY + Math.sin(angle) * baseRadius;
          const endX = centerX + Math.cos(angle) * (baseRadius + amplitude);
          const endY = centerY + Math.sin(angle) * (baseRadius + amplitude);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

      } else if (activeMode === 'matrix-rain') {
        // Digital data streams
        ctx.font = '10px monospace';
        ctx.fillStyle = colorAccentSec;

        // Average high frequency for speed/brightness booster
        let highSum = 0;
        for (let i = Math.floor(bufferLength * 0.6); i < bufferLength; i++) {
          highSum += dataArray[i];
        }
        const highAvg = highSum / (bufferLength * 0.4 || 1);
        const intensity = highAvg / 255.0; // 0 to 1

        const colWidth = width / maxColumns;

        for (let i = 0; i < maxColumns; i++) {
          // Generate binary characters
          const char = Math.random() > 0.5 ? '1' : '0';
          
          // Draw text stream
          ctx.fillText(char, i * colWidth, columns[i]);

          // Move stream downward. Velocity is boosted by high-frequency notes
          columns[i] += 2 + intensity * 6;

          // If stream passes screen bottom, reset back to top randomly
          if (columns[i] > height && Math.random() > 0.96) {
            columns[i] = 0;
          }
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, activeMode, voiceAmplitude]);

  // Mode button configuration
  const modes: { id: VisualizerMode; label: string }[] = [
    { id: 'sonic-waves', label: 'Waveform' },
    { id: 'retro-bars', label: 'Equalizer' },
    { id: 'heartbeat-pulse', label: 'Pulse Circle' },
    { id: 'matrix-rain', label: 'Data Rain' }
  ];

  return (
    <div className="w-full flex flex-col items-center gap-3 h-[240px] sm:h-[280px]">
      {/* Canvas */}
      <div className="relative w-full h-[180px] sm:h-[220px] rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-panel)]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
        {/* Glow ambient background bulb */}
        <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-20" />
      </div>

      {/* Mode Switches */}
      <div className="flex flex-wrap gap-2 justify-center" id="visualizer-mode-selector">
        {modes.map(m => (
          <button
            key={m.id}
            id={`vis-btn-${m.id}`}
            onClick={() => setActiveMode(m.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-300 ${
              activeMode === m.id ? 'btn-active' : 'btn-inactive'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};
