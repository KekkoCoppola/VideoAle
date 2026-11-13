import React, { useEffect, useRef } from 'react';
import {
  ConfettiParticle,
  ShowPhase,
  createConfettiBurst,
  stepConfettiParticles,
} from '../utils/showLogic';

interface MemeCanvasProps {
  phase: ShowPhase;
  beatIndex: number;
  beatProgress: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  phase,
  beatIndex,
  beatProgress,
  primaryColor,
  secondaryColor,
  accentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const stateRef = useRef({
    phase,
    beatIndex,
    beatProgress,
    primaryColor,
    secondaryColor,
    accentColor,
  });

  useEffect(() => {
    const prevPhase = stateRef.current.phase;
    stateRef.current = {
      phase,
      beatIndex,
      beatProgress,
      primaryColor,
      secondaryColor,
      accentColor,
    };

    if (
      (phase === 'reveal' && prevPhase !== 'reveal') ||
      (phase === 'disco' && particlesRef.current.length === 0)
    ) {
      const w = window.innerWidth || 1440;
      const h = window.innerHeight || 900;
      particlesRef.current = createConfettiBurst(w, h, 140);
    }
  }, [phase, beatIndex, beatProgress, primaryColor, secondaryColor, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth || 1440;
      canvas.height = window.innerHeight || 900;
      if (
        stateRef.current.phase !== 'drumroll' &&
        particlesRef.current.length === 0
      ) {
        particlesRef.current = createConfettiBurst(canvas.width, canvas.height, 140);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let animId = 0;
    let timerId: number | null = null;
    let cancelled = false;
    let tick = 0;

    const render = () => {
      if (cancelled) return;
      tick++;
      const {
        phase: curPhase,
        beatIndex: curBeat,
        beatProgress: curBeatProg,
        primaryColor: c1,
        secondaryColor: c2,
        accentColor: c3,
      } = stateRef.current;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. In DISCO phase: draw neon laser beams, perspective dancefloor grid, and audio equalizer bars
      if (curPhase === 'disco') {
        const horizonY = h * 0.68;
        ctx.save();
        ctx.strokeStyle = curBeat % 2 === 0 ? c1 : c2;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;

        const numH = 6;
        for (let i = 0; i < numH; i++) {
          const prog = ((i + curBeatProg) / numH) ** 1.6;
          const y = Math.round(horizonY + prog * (h - horizonY));
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        const numV = 10;
        for (let i = -numV; i <= numV; i++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.5 + i * 36, horizonY);
          ctx.lineTo(w * 0.5 + i * 220, h);
          ctx.stroke();
        }
        ctx.restore();

        // Sweeping Laser Beams from top disco ball
        const laserColors = [c1, c2, c3, '#00FFFF', '#FF00FF', '#39FF14'];
        ctx.save();
        for (let i = 0; i < 8; i++) {
          const angle =
            Math.sin(tick * 0.14 + i * 0.9 + curBeat * 0.7) * 1.15 + Math.PI * 0.5;
          const len = Math.max(w, h) * 1.25;
          const endX = w * 0.5 + Math.cos(angle) * len;
          const endY = 60 + Math.sin(angle) * len;

          ctx.beginPath();
          ctx.moveTo(w * 0.5, 60);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = laserColors[(i + curBeat) % laserColors.length];
          ctx.lineWidth = curBeatProg < 0.25 ? 8 : 4;
          ctx.globalAlpha = 0.65;
          ctx.stroke();
        }
        ctx.restore();

        // Ignorant Pixelated Equalizer Bars along bottom edge
        const barCount = 24;
        const barWidth = Math.ceil(w / barCount);
        ctx.save();
        for (let i = 0; i < barCount; i++) {
          const wave =
            Math.abs(Math.sin(i * 0.65 + curBeat * 1.9 + tick * 0.3)) *
            (1 - curBeatProg * 0.45);
          const barH = Math.round((24 + wave * (h * 0.2)) / 12) * 12;
          ctx.fillStyle = laserColors[(i + curBeat) % laserColors.length];
          ctx.globalAlpha = 0.78;
          ctx.fillRect(i * barWidth + 2, h - barH, barWidth - 4, barH);
        }
        ctx.restore();
      }

      // 2. In REVEAL or DISCO phase: step and render confetti particles
      if (curPhase === 'reveal' || curPhase === 'disco') {
        if (particlesRef.current.length === 0) {
          particlesRef.current = createConfettiBurst(w, h, 110);
        }
        particlesRef.current = stepConfettiParticles(
          particlesRef.current,
          w,
          h,
          curPhase === 'disco'
        );

        ctx.save();
        for (const p of particlesRef.current) {
          ctx.save();
          const qx = Math.round(p.x / 4) * 4;
          const qy = Math.round(p.y / 4) * 4;
          ctx.translate(qx, qy);
          ctx.rotate(Math.round(p.rotation * 4) / 4);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, (p.size * 2) / 3);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 6, p.size, p.size / 3);
            ctx.fillRect(-p.size / 6, -p.size / 2, p.size / 3, p.size);
          }
          ctx.restore();
        }
        ctx.restore();
      }

      timerId = window.setTimeout(() => {
        if (!cancelled) {
          animId = window.requestAnimationFrame(render);
        }
      }, 65);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      if (timerId !== null) window.clearTimeout(timerId);
      window.cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="meme-canvas"
      className="fixed inset-0 pointer-events-none z-20"
    />
  );
};
