import React from 'react';
import { DISCO_START_MS, computeDiscoBounceState } from '../utils/showLogic';

interface DiscoStageProps {
  elapsedMs: number;
  photoSrc: string;
}

export const DiscoStage: React.FC<DiscoStageProps> = ({ elapsedMs, photoSrc }) => {
  const discoElapsedMs = Math.max(0, elapsedMs - DISCO_START_MS);
  const bounce = computeDiscoBounceState(discoElapsedMs);
  const {
    beatIndex,
    xPercent,
    yPercent,
    rotationDeg,
    scaleX,
    scaleY,
    headlineScale,
    headlineSkewDeg,
    theme,
    caption,
    isOnBeatImpact,
  } = bounce;

  // Previous trail positions for the "scia sgranata" effect across the screen
  const trail1 = computeDiscoBounceState(Math.max(0, discoElapsedMs - 90));
  const trail2 = computeDiscoBounceState(Math.max(0, discoElapsedMs - 180));

  return (
    <div
      data-testid="disco-stage"
      data-beat={beatIndex}
      className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none pointer-events-none py-4 px-4"
      style={{
        backgroundColor: theme.bgTint,
        backgroundImage: `repeating-linear-gradient(${beatIndex % 2 === 0 ? '45deg' : '-45deg'}, transparent 0px, transparent 36px, ${theme.secondary}22 36px, ${theme.secondary}22 72px)`,
      }}
    >
      {/* Top Mirror Disco Ball + Neon Strobe Header */}
      <div className="relative z-40 flex flex-col items-center">
        <div className="w-1.5 h-4 bg-[#FFE600]" />
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white flex items-center justify-center"
          style={{
            background: `repeating-conic-gradient(from ${beatIndex * 35}deg, #FFFFFF 0deg 20deg, ${theme.primary} 20deg 40deg, ${theme.secondary} 40deg 60deg, #00F0FF 60deg 80deg)`,
            boxShadow: `6px 6px 0px ${theme.primary}, -6px -6px 0px ${theme.secondary}`,
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-black opacity-40" />
        </div>

        {/* GIANT "AUGURI DOTTORESSA" HEADLINE */}
        <div
          className="mt-2 px-4 sm:px-8 py-2 bg-black border-4"
          style={{
            borderColor: theme.secondary,
            boxShadow: `8px 8px 0px ${theme.primary}, -6px -6px 0px ${theme.accent}`,
            transform: `scale(${headlineScale}) skewX(${headlineSkewDeg}deg)`,
          }}
        >
          <h1
            data-testid="disco-headline"
            className="font-['Bungee'] text-2xl sm:text-5xl md:text-6xl tracking-wider text-center uppercase leading-none"
            style={{
              color: '#FFFFFF',
              textShadow: `5px 5px 0px ${theme.primary}, -4px -4px 0px ${theme.secondary}`,
            }}
          >
            AUGURI DOTTORESSA
          </h1>
        </div>
      </div>

      {/* Corner Ignorant Meme Badges */}
      <div
        className="hidden xl:flex absolute left-6 top-56 z-20 flex-col gap-3"
        style={{
          transform: `translateY(${isOnBeatImpact ? -10 : 6}px) rotate(${beatIndex % 2 === 0 ? -6 : 5}deg)`,
        }}
      >
        <div
          className="px-4 py-2 border-4 border-black font-['Bungee'] text-sm text-black shadow-[6px_6px_0px_#000]"
          style={{ backgroundColor: theme.secondary }}
        >
          🔊 CASSA DRITTA: 140 BPM
        </div>
        <div
          className="px-4 py-2 border-4 border-white font-['Anton'] text-lg text-white tracking-wider shadow-[6px_6px_0px_#000]"
          style={{ backgroundColor: theme.primary }}
        >
          🎓 LAUREATA DEL SECOLO
        </div>
      </div>

      <div
        className="hidden xl:flex absolute right-6 top-56 z-20 flex-col gap-3 items-end"
        style={{
          transform: `translateY(${isOnBeatImpact ? 8 : -8}px) rotate(${beatIndex % 2 === 0 ? 6 : -5}deg)`,
        }}
      >
        <div
          className="px-4 py-2 border-4 border-black font-['Bungee'] text-sm text-black shadow-[6px_6px_0px_#000]"
          style={{ backgroundColor: theme.accent }}
        >
          🍾 FESTA DEVASTANTE + RAVE
        </div>
        <div
          className="px-4 py-2 border-4 border-white font-['Anton'] text-lg text-black tracking-wider shadow-[6px_6px_0px_#000]"
          style={{ backgroundColor: '#00F0FF' }}
        >
          💸 CIAO POVERY EDITION
        </div>
      </div>

      {/* CENTER ARENA: THE PHOTO JUMPING LEFT AND RIGHT ACROSS THE ENTIRE SCREEN TO THE BEAT */}
      <div className="relative flex-1 w-full flex items-center justify-center z-30">
        {/* Ghost Trail 2 (oldest) */}
        <div
          className="absolute pointer-events-none opacity-30 p-1 bg-[#00F0FF] border-4 border-black"
          style={{
            transform: `translate3d(${trail2.xPercent}vw, ${trail2.yPercent}vh, 0) rotate(${trail2.rotationDeg}deg) scale(0.84)`,
          }}
          aria-hidden="true"
        >
          <img
            src={photoSrc}
            alt=""
            referrerPolicy="no-referrer"
            className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover"
          />
        </div>

        {/* Ghost Trail 1 (middle) */}
        <div
          className="absolute pointer-events-none opacity-55 p-1 bg-[#FF007F] border-4 border-white"
          style={{
            transform: `translate3d(${trail1.xPercent}vw, ${trail1.yPercent}vh, 0) rotate(${trail1.rotationDeg}deg) scale(0.92)`,
          }}
          aria-hidden="true"
        >
          <img
            src={photoSrc}
            alt=""
            referrerPolicy="no-referrer"
            className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover"
          />
        </div>

        {/* MAIN BOUNCING PHOTO ("la foto che comincia a saltare a tempo a destra e sinistra per tutto lo schermo") */}
        <div
          data-testid="bouncing-photo-container"
          data-x-percent={Math.round(xPercent)}
          className="relative flex flex-col items-center"
          style={{
            transform: `translate3d(${xPercent}vw, ${yPercent}vh, 0) rotate(${rotationDeg}deg) scale(${scaleX}, ${scaleY})`,
          }}
        >
          {/* Bouncing Graduation Cap on top of the photo */}
          <svg
            width="165"
            height="76"
            viewBox="0 0 220 100"
            className="relative -mb-6 z-20"
            aria-hidden="true"
          >
            <polygon
              points="110,6 212,42 110,74 8,42"
              fill="#090909"
              stroke={theme.secondary}
              strokeWidth="6"
            />
            <path
              d="M60,56 L60,84 C60,96 160,96 160,84 L160,56 Z"
              fill="#1E1E1E"
              stroke={theme.primary}
              strokeWidth="5"
            />
            <circle cx="110" cy="41" r="8" fill="#FFE600" />
            <path
              d="M110,41 Q170,46 190,90"
              fill="none"
              stroke="#FF003C"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="190" cy="92" r="10" fill="#FF003C" />
          </svg>

          {/* Neon Ignorant Frame around the Photo */}
          <div
            className="relative p-2 border-8 border-black"
            style={{
              backgroundColor: theme.secondary,
              boxShadow: `10px 10px 0px ${theme.primary}, -10px -10px 0px ${theme.accent}`,
            }}
          >
            <img
              src={photoSrc}
              alt="La Dottoressa che balla in discoteca"
              referrerPolicy="no-referrer"
              className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 object-cover border-4 border-black"
              style={{
                imageRendering: 'pixelated',
              }}
            />

            {/* Floating "DOTTORESSA!" sticker attached to photo corner */}
            <div
              className="absolute -bottom-4 -left-4 px-3 py-1 bg-black border-4 font-['Bungee'] text-xs sm:text-sm uppercase"
              style={{
                borderColor: theme.accent,
                color: theme.secondary,
                transform: 'rotate(-6deg)',
              }}
            >
              👑 DOTT.SSA VIP
            </div>

            <div
              className="absolute -top-4 -right-4 px-3 py-1 bg-[#FF0055] border-4 border-white font-['Bungee'] text-xs sm:text-sm text-[#FFE600] uppercase"
              style={{
                transform: 'rotate(9deg)',
              }}
            >
              LAUREATA 🔥
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Meme Caption Bar */}
      <div
        className="relative z-40 w-full max-w-4xl px-4 py-2 bg-black border-4 text-center"
        style={{
          borderColor: theme.primary,
          boxShadow: `6px 6px 0px ${theme.secondary}`,
        }}
      >
        <p
          className="font-['Chakra_Petch'] font-bold text-xs sm:text-lg md:text-2xl tracking-wider uppercase"
          style={{ color: theme.accent }}
        >
          🚨 {caption} 🚨
        </p>
      </div>
    </div>
  );
};
