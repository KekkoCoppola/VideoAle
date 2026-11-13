import React from 'react';
import { DRUMROLL_DURATION_MS } from '../utils/showLogic';

interface RevealStageProps {
  elapsedMs: number;
  photoSrc: string;
}

export const RevealStage: React.FC<RevealStageProps> = ({ elapsedMs, photoSrc }) => {
  const revealElapsed = Math.max(0, elapsedMs - DRUMROLL_DURATION_MS);
  const popScale = Math.min(1.06, 0.4 + Math.min(1, revealElapsed / 280) * 0.66);
  const wobbleDeg = Math.round(Math.sin(revealElapsed * 0.018) * 5);
  const rayAngle = Math.round((revealElapsed * 0.08) % 360);

  return (
    <div
      data-testid="reveal-stage"
      className="relative w-full h-full flex flex-col items-center justify-between py-6 px-4 overflow-hidden select-none pointer-events-none"
      style={{
        background: '#120024',
      }}
    >
      {/* Meme Sunburst Rays Background ("uno sfondo che è meme fai qualcosa di divertente") */}
      <div
        className="absolute inset-[-50%] opacity-85"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, #FF007F 0deg 15deg, #FFE600 15deg 30deg, #00F0FF 30deg 45deg, #39FF14 45deg 60deg)',
          transform: `rotate(${rayAngle}deg)`,
        }}
      />

      {/* Comic Halftone / Pixel Checkerboard Contrast Scrim */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(10, 0, 25, 0.25) 0%, rgba(10, 0, 25, 0.82) 78%)',
        }}
      />

      {/* Funny Floating Meme Background Cards (Windows 98 / Stonks / Ministero dell'Ignoranza) */}
      <div className="hidden md:flex absolute left-8 top-32 z-10 flex-col gap-5 max-w-xs">
        <div
          className="bg-[#C0C0C0] border-4 border-t-white border-l-white border-r-black border-b-black p-3 shadow-[8px_8px_0px_#000]"
          style={{ transform: 'rotate(-4deg)' }}
        >
          <div className="bg-[#000080] text-white font-mono text-xs font-bold px-2 py-1 mb-2 flex justify-between">
            <span>LAUREA_ULTIMATE.EXE</span>
            <span>[X]</span>
          </div>
          <p className="font-mono text-xs font-bold text-black leading-snug">
            ✅ CERVELLO FUSO: 100%
            <br />
            ✅ CAFFÈ ASSUNTI: 9.420 LITRI
            <br />
            ✅ LIVELLO DOTTORESSA: OVER 9000!
          </p>
        </div>

        <div
          className="bg-[#00FF33] border-4 border-black p-3 shadow-[8px_8px_0px_#FF007F]"
          style={{ transform: 'rotate(3deg)' }}
        >
          <p className="font-['Bungee'] text-lg text-black leading-tight">
            📈 STONKS ACCADEMICI +999%
          </p>
          <p className="font-['Chakra_Petch'] font-bold text-xs text-black uppercase mt-1">
            Approcciata dal Rettore con inchino carpiato
          </p>
        </div>
      </div>

      <div className="hidden md:flex absolute right-8 top-32 z-10 flex-col gap-5 max-w-xs">
        <div
          className="bg-[#FFE600] border-4 border-black p-3 shadow-[8px_8px_0px_#00F0FF]"
          style={{ transform: 'rotate(4deg)' }}
        >
          <p className="font-['Bungee'] text-base text-[#FF0055] leading-tight">
            🏆 CERTIFICATO VIP
          </p>
          <p className="font-['Chakra_Petch'] font-bold text-xs text-black uppercase mt-1">
            ABILITATA UFFICIALMENTE A FARSI CHIAMARE &quot;DOTTORESSA&quot; ANCHE AL SUPERMERCATO
          </p>
        </div>

        <div
          className="bg-[#FF007F] border-4 border-[#FFE600] p-3 shadow-[8px_8px_0px_#000]"
          style={{ transform: 'rotate(-3deg)' }}
        >
          <p className="font-['Bungee'] text-base text-white leading-tight">
            🍾 PREPARATE I BICCHIERI
          </p>
          <p className="font-['Chakra_Petch'] font-bold text-xs text-[#FFE600] uppercase mt-1">
            TRA 3 SECONDI PARTE LA DISCOTECA IGNORANTE...
          </p>
        </div>
      </div>

      {/* Top Banner */}
      <div className="relative z-10 bg-black border-4 border-[#00FF33] px-6 py-2 shadow-[8px_8px_0px_#FF007F]">
        <h1
          className="font-['Bungee'] text-2xl sm:text-4xl md:text-5xl text-[#FFE600] tracking-wide text-center"
          style={{
            textShadow: '4px 4px 0px #FF007F, -2px -2px 0px #00F0FF',
          }}
        >
          🎉 HABEMUS DOTTORESSA! 🎉
        </h1>
      </div>

      {/* Center Revealed Photo with Graduation Cap & Laurel Crown Meme Frame */}
      <div
        className="relative z-10 flex flex-col items-center justify-center my-auto"
        style={{
          transform: `scale(${popScale}) rotate(${wobbleDeg}deg)`,
        }}
      >
        {/* Pixelated Graduation Cap (Tocco di Laurea) on top of the photo */}
        <svg
          width="220"
          height="100"
          viewBox="0 0 220 100"
          className="relative -mb-8 z-20 drop-shadow-[5px_5px_0px_#000]"
          aria-hidden="true"
        >
          {/* Mortarboard Diamond */}
          <polygon
            points="110,8 210,42 110,74 10,42"
            fill="#111111"
            stroke="#FFE600"
            strokeWidth="5"
          />
          {/* Skull Cap */}
          <path
            d="M60,56 L60,84 C60,96 160,96 160,84 L160,56 Z"
            fill="#1D1D1D"
            stroke="#00FF33"
            strokeWidth="4"
          />
          {/* Red Italian Graduation Tassel (Nappina Rossa) */}
          <circle cx="110" cy="41" r="7" fill="#FFE600" />
          <path
            d="M110,41 Q165,48 182,88"
            fill="none"
            stroke="#FF003C"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="182" cy="90" r="9" fill="#FF003C" />
        </svg>

        {/* Main Photo Frame */}
        <div className="relative p-3 bg-[#FFE600] border-8 border-black shadow-[14px_14px_0px_#FF007F,-10px_-10px_0px_#00F0FF]">
          <img
            src={photoSrc}
            alt="La Dottoressa Festeggiata"
            referrerPolicy="no-referrer"
            className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-80 object-cover border-4 border-black"
            style={{
              filter: 'contrast(1.22) saturate(1.35)',
              imageRendering: 'pixelated',
            }}
          />

          {/* Stamp overlay */}
          <div
            className="absolute -bottom-5 -right-6 bg-[#00FF33] border-4 border-black px-4 py-1.5 shadow-[5px_5px_0px_#000]"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <span className="font-['Bungee'] text-sm sm:text-lg text-black">
              110 E LODE + MEME 🎓
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Caption */}
      <div className="relative z-10 bg-[#FF007F] border-4 border-white px-6 py-2 shadow-[6px_6px_0px_#000]">
        <p className="font-['Anton'] text-xl sm:text-3xl text-white tracking-wider uppercase text-center">
          CORIANDOLI SPARATI! PREPARARSI AL DROP TRA POCHI ISTANTI...
        </p>
      </div>
    </div>
  );
};
