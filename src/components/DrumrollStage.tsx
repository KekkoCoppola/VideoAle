import React from 'react';
import { computeDrumrollState } from '../utils/showLogic';

interface DrumrollStageProps {
  elapsedMs: number;
}

export const DrumrollStage: React.FC<DrumrollStageProps> = ({ elapsedMs }) => {
  const { progress, countdown, shakePx, scale } = computeDrumrollState(elapsedMs);
  const flashYellow = Math.floor(elapsedMs / 90) % 2 === 0;

  return (
    <div
      data-testid="drumroll-stage"
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none px-4"
      style={{
        background: flashYellow
          ? 'radial-gradient(circle, #2a0044 0%, #07000e 85%)'
          : 'radial-gradient(circle, #3d001e 0%, #05000a 85%)',
      }}
    >
      {/* Sweeping theatrical spotlights */}
      <div
        className="absolute inset-0 opacity-45"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 100%, transparent 140deg, rgba(255, 230, 0, 0.45) 168deg, transparent 195deg, rgba(0, 240, 255, 0.45) 215deg, transparent 240deg)',
          transform: `rotate(${Math.sin(elapsedMs * 0.012) * 18}deg)`,
        }}
      />

      {/* Top Breaking News Meme Banner */}
      <div
        className="z-10 mb-6 px-6 py-2 border-4 border-[#FFE600] bg-[#FF0055] shadow-[6px_6px_0px_#00F0FF]"
        style={{
          transform: `translate(${shakePx * 0.5}px, ${-shakePx * 0.3}px) rotate(-1deg)`,
        }}
      >
        <p className="font-['Chakra_Petch'] font-bold text-lg md:text-2xl tracking-widest text-[#FFE600] uppercase">
          ATTENZIONE · COMUNICAZIONE UFFICIALE A RETI UNIFICATE
        </p>
      </div>

      {/* Shaking Snare Drum SVG + Countdown */}
      <div
        className="z-10 flex flex-col items-center justify-center my-2"
        style={{
          transform: `translate(${shakePx}px, ${(shakePx % 5) - 2}px) scale(${scale})`,
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Giant Countdown Number */}
          <span
            className="font-['Bungee'] text-[7rem] md:text-[10rem] leading-none select-none"
            style={{
              color: countdown === 1 ? '#00FF33' : countdown === 2 ? '#00F0FF' : '#FFE600',
              textShadow: '8px 8px 0px #FF007F, -5px -5px 0px #000000',
            }}
          >
            {countdown}
          </span>
        </div>

        {/* Animated Drumsticks & Snare Drum SVG */}
        <svg
          width="240"
          height="130"
          viewBox="0 0 240 130"
          className="mt-2 overflow-visible"
          aria-label="Rullo di tamburi in corso"
        >
          {/* Left Drumstick */}
          <g
            style={{
              transform: `rotate(${shakePx > 0 ? 18 : -8}deg)`,
              transformOrigin: '40px 25px',
            }}
          >
            <line
              x1="20"
              y1="10"
              x2="112"
              y2="52"
              stroke="#FFE600"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="115" cy="54" r="9" fill="#FF007F" />
          </g>

          {/* Right Drumstick */}
          <g
            style={{
              transform: `rotate(${shakePx > 0 ? -18 : 8}deg)`,
              transformOrigin: '200px 25px',
            }}
          >
            <line
              x1="220"
              y1="10"
              x2="128"
              y2="52"
              stroke="#00F0FF"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="125" cy="54" r="9" fill="#00FF33" />
          </g>

          {/* Drum Top Ellipse */}
          <ellipse
            cx="120"
            cy="64"
            rx="78"
            ry="20"
            fill="#FFFDF0"
            stroke="#FF007F"
            strokeWidth="6"
          />
          {/* Drum Body */}
          <path
            d="M42 64 L42 106 A78 20 0 0 0 198 106 L198 64 A78 20 0 0 1 42 64 Z"
            fill="#FF0055"
            stroke="#FFE600"
            strokeWidth="5"
          />
          {/* Zigzag Snare Lugs */}
          <polyline
            points="48,74 68,104 92,76 120,108 148,76 172,104 192,74"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="5"
          />
        </svg>
      </div>

      {/* Rullo di Tamburi Text */}
      <h1
        className="z-10 mt-4 font-['Anton'] text-4xl md:text-6xl uppercase tracking-wider text-center"
        style={{
          color: '#FFFFFF',
          textShadow: '5px 5px 0px #FF007F, -3px -3px 0px #00F0FF',
        }}
      >
        🥁 RULLO DI TAMBURI PREGO... 🥁
      </h1>

      {/* Suspense Progress Bar */}
      <div className="z-10 mt-6 w-72 md:w-96 h-7 bg-black border-4 border-[#00FF33] p-1 shadow-[5px_5px_0px_#FF007F]">
        <div
          className="h-full transition-none"
          style={{
            width: `${Math.min(100, Math.round(progress * 100))}%`,
            background: 'repeating-linear-gradient(45deg, #00FF33, #00FF33 12px, #FFE600 12px, #FFE600 24px)',
          }}
        />
      </div>
    </div>
  );
};
