import { useEffect, useRef, useState } from 'react';
import { DiscoStage } from './components/DiscoStage';
import { DrumrollStage } from './components/DrumrollStage';
import { MemeCanvas } from './components/MemeCanvas';
import { RevealStage } from './components/RevealStage';
import {
  BEAT_DURATION_MS,
  DISCO_START_MS,
  DRUMROLL_DURATION_MS,
  computeDiscoBounceState,
  getPhaseAtTime,
  parseShowQueryParams,
} from './utils/showLogic';
import { soundEngine } from './utils/soundEngine';

const PHOTO_SRC = '/assets/aistudio/IMG-20261113-WA0132_49c77bd9.jpg';

export default function App() {
  const [config] = useState(() =>
    parseShowQueryParams(typeof window !== 'undefined' ? window.location.search : '')
  );
  const [elapsedMs, setElapsedMs] = useState<number>(config.initialElapsedMs);

  const lastDrumTickRef = useRef<number>(-1);
  const revealSoundPlayedRef = useRef<boolean>(false);
  const lastDiscoStepRef = useRef<number>(-1);

  const phase = getPhaseAtTime(elapsedMs, config.forcedPhase);

  useEffect(() => {
    document.body.setAttribute('data-phase', phase);
  }, [phase]);

  useEffect(() => {
    const startWallTime = performance.now() - config.initialElapsedMs;

    const timerId = window.setInterval(() => {
      const currentElapsed = performance.now() - startWallTime;
      const activePhase = getPhaseAtTime(currentElapsed, config.forcedPhase);

      // 1. Trigger Drumroll audio hits
      if (activePhase === 'drumroll') {
        const tickInterval = 70;
        const tickIndex = Math.floor(currentElapsed / tickInterval);
        if (tickIndex !== lastDrumTickRef.current) {
          lastDrumTickRef.current = tickIndex;
          const progress = Math.min(1, currentElapsed / DRUMROLL_DURATION_MS);
          soundEngine.playDrumrollTick(progress);
        }
      }

      // 2. Trigger Confetti Explosion sound when entering reveal phase
      if (activePhase === 'reveal' && !revealSoundPlayedRef.current) {
        revealSoundPlayedRef.current = true;
        soundEngine.playConfettiExplosion();
      }

      // 3. Trigger 140 BPM 16th-note Disco Synthesizer steps in disco phase
      if (activePhase === 'disco') {
        const discoElapsed = Math.max(0, currentElapsed - DISCO_START_MS);
        const sixteenthNoteMs = BEAT_DURATION_MS / 4; // ~107.14ms
        const stepIndex = Math.floor(discoElapsed / sixteenthNoteMs);
        if (stepIndex !== lastDiscoStepRef.current) {
          lastDiscoStepRef.current = stepIndex;
          soundEngine.playDiscoStep(stepIndex);
        }
      }

      setElapsedMs(currentElapsed);
    }, 55);

    return () => {
      window.clearInterval(timerId);
    };
  }, [config]);

  const discoState = computeDiscoBounceState(Math.max(0, elapsedMs - DISCO_START_MS));

  return (
    <main
      data-testid="meme-show-root"
      data-phase={phase}
      className="relative w-screen h-screen overflow-hidden pointer-events-none select-none"
    >
      {/* Active Stage */}
      {phase === 'drumroll' && <DrumrollStage elapsedMs={elapsedMs} />}
      {phase === 'reveal' && <RevealStage elapsedMs={elapsedMs} photoSrc={PHOTO_SRC} />}
      {phase === 'disco' && <DiscoStage elapsedMs={elapsedMs} photoSrc={PHOTO_SRC} />}

      {/* Confetti Cannons & Disco Lasers Canvas */}
      <MemeCanvas
        phase={phase}
        beatIndex={discoState.beatIndex}
        beatProgress={discoState.beatProgress}
        primaryColor={discoState.theme.primary}
        secondaryColor={discoState.theme.secondary}
        accentColor={discoState.theme.accent}
      />

      {/* Intentional Sgranato / CRT Scanline & Neon Vignette Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-40 meme-scanlines opacity-55"
        aria-hidden="true"
      />
    </main>
  );
}
