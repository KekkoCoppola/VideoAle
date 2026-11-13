export type ShowPhase = 'drumroll' | 'reveal' | 'disco';

export const DRUMROLL_DURATION_MS = 2600;
export const REVEAL_DURATION_MS = 3400;
export const DISCO_START_MS = DRUMROLL_DURATION_MS + REVEAL_DURATION_MS; // 6000ms
export const DISCO_BPM = 140;
export const BEAT_DURATION_MS = (60 / DISCO_BPM) * 1000; // ~428.571ms

export interface NeonTheme {
  id: string;
  primary: string;
  secondary: string;
  accent: string;
  bgTint: string;
  shadow: string;
}

export const NEON_THEMES: NeonTheme[] = [
  {
    id: 'magenta-lime',
    primary: '#FF007F',
    secondary: '#00FF33',
    accent: '#FFE600',
    bgTint: '#180028',
    shadow: '0 0 35px #FF007F, 0 0 70px #00FF33',
  },
  {
    id: 'cyan-yellow',
    primary: '#00F0FF',
    secondary: '#FFE600',
    accent: '#FF0055',
    bgTint: '#001B2E',
    shadow: '0 0 35px #00F0FF, 0 0 70px #FFE600',
  },
  {
    id: 'lime-violet',
    primary: '#39FF14',
    secondary: '#FF00FF',
    accent: '#00FFFF',
    bgTint: '#0B2400',
    shadow: '0 0 35px #39FF14, 0 0 70px #FF00FF',
  },
  {
    id: 'yellow-red',
    primary: '#FFE600',
    secondary: '#FF003C',
    accent: '#39FF14',
    bgTint: '#29000A',
    shadow: '0 0 35px #FFE600, 0 0 70px #FF003C',
  },
];

export const MEME_CAPTIONS: string[] = [
  'LAUREA SUPREMA CON BACIO ACCADEMICO E RAVE INCORPORATO',
  'LA NASA HA CONFERMATO: HABEMUS DOTTORESSA SUPREMA',
  'ANNI DI STUDIO MATTO E DISPERATISSIMO PER QUESTO MOMENTO',
  'TESI APPROVATA DAL MINISTERO DELL’IGNORANZA E DELLE FESTE',
  'SCIAO POVERY, ADESSO SI FATTURA A TEMPO DI CASSA DRITTA',
  'DOTTORESSA DOTTORESSA DOTTORESSA DEL BUCO DEL... CUORE!',
];

export interface ShowConfig {
  forcedPhase: ShowPhase | null;
  initialElapsedMs: number;
}

/**
 * Parses URL query parameters for deterministic testing and autostart support.
 * - `?phase=drumroll|reveal|disco` locks the show to that phase.
 * - `?autostart=1` jumps straight to the main `disco` phase.
 */
export function parseShowQueryParams(search: string): ShowConfig {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const phaseParam = params.get('phase');
  if (phaseParam === 'drumroll' || phaseParam === 'reveal' || phaseParam === 'disco') {
    const initialElapsedMs =
      phaseParam === 'drumroll'
        ? 800
        : phaseParam === 'reveal'
          ? DRUMROLL_DURATION_MS + 600
          : DISCO_START_MS + 1000;
    return {
      forcedPhase: phaseParam,
      initialElapsedMs,
    };
  }

  if (params.get('autostart') === '1') {
    return {
      forcedPhase: null,
      initialElapsedMs: DISCO_START_MS,
    };
  }

  return {
    forcedPhase: null,
    initialElapsedMs: 0,
  };
}

/**
 * Computes which phase the meme video show is in based on elapsed milliseconds.
 */
export function getPhaseAtTime(
  elapsedMs: number,
  forcedPhase: ShowPhase | null = null
): ShowPhase {
  if (forcedPhase) {
    return forcedPhase;
  }
  const clamped = Math.max(0, elapsedMs);
  if (clamped < DRUMROLL_DURATION_MS) {
    return 'drumroll';
  }
  if (clamped < DISCO_START_MS) {
    return 'reveal';
  }
  return 'disco';
}

/**
 * Computes drumroll progress (0 to 1) and countdown integer (3, 2, 1).
 */
export function computeDrumrollState(elapsedMs: number): {
  progress: number;
  countdown: number;
  shakePx: number;
  scale: number;
} {
  const clamped = Math.max(0, Math.min(DRUMROLL_DURATION_MS, elapsedMs));
  const progress = clamped / DRUMROLL_DURATION_MS;
  const countdown = progress < 0.34 ? 3 : progress < 0.68 ? 2 : 1;
  const shakePx = Math.round((2 + progress * 16) * (Math.floor(clamped / 35) % 2 === 0 ? 1 : -1));
  const scale = 0.92 + progress * 0.28;
  return {
    progress,
    countdown,
    shakePx,
    scale,
  };
}

export interface DiscoBounceState {
  beatIndex: number;
  beatProgress: number;
  xPercent: number; // -36% to +36% across screen width
  yPercent: number; // -26% to +16% jump arc across screen height
  rotationDeg: number;
  scaleX: number;
  scaleY: number;
  headlineScale: number;
  headlineSkewDeg: number;
  theme: NeonTheme;
  caption: string;
  isOnBeatImpact: boolean;
}

/**
 * Computes deterministic, quantized-looking ("sgranato") bouncing coordinates
 * for the photo in Disco mode so it jumps rhythmically left and right across the entire screen.
 */
export function computeDiscoBounceState(discoElapsedMs: number): DiscoBounceState {
  const safeMs = Math.max(0, discoElapsedMs);
  const exactBeat = safeMs / BEAT_DURATION_MS;
  const beatIndex = Math.floor(exactBeat);
  // Quantize progress within each beat to 10 steps for grainy ("sgranato") meme motion while keeping beat transitions exact
  const rawBeatProgress = exactBeat - beatIndex;
  const beatProgress = Math.floor(rawBeatProgress * 10) / 10;

  // Waypoints across the screen (left, right, far-left, far-right, mid-left, mid-right)
  // Guaranteed to jump vigorously between left and right sides on every single beat!
  const horizontalWaypoints = [-32, 32, -25, 28, -34, 26, -22, 34];
  const verticalBaseWaypoints = [12, 10, 6, 14, 10, 6, 14, 10];

  const fromIdx = beatIndex % horizontalWaypoints.length;
  const toIdx = (beatIndex + 1) % horizontalWaypoints.length;

  const startX = horizontalWaypoints[fromIdx];
  const endX = horizontalWaypoints[toIdx];
  const xPercent = startX + (endX - startX) * beatProgress;

  const baseStartY = verticalBaseWaypoints[fromIdx];
  const baseEndY = verticalBaseWaypoints[toIdx];
  const baseY = baseStartY + (baseEndY - baseStartY) * beatProgress;

  // Parabolic jump arc on every beat: peaks at beatProgress = 0.5 without hitting top headline
  const jumpArc = Math.sin(beatProgress * Math.PI) * 16;
  const yPercent = baseY - jumpArc;

  // Squash and stretch on beat landing (near 0 or 1)
  const isOnBeatImpact = beatProgress < 0.16 || beatProgress > 0.86;
  const squashFactor = isOnBeatImpact ? 0.22 : -0.1 * Math.sin(beatProgress * Math.PI);
  const scaleX = Number((1 + squashFactor).toFixed(3));
  const scaleY = Number((1 - squashFactor * 0.85).toFixed(3));

  // Tilt left and right vigorously as it jumps
  const direction = endX > startX ? 1 : -1;
  const rotationDeg = Math.round(direction * (10 + Math.sin(beatProgress * Math.PI) * 14));

  // Headline pulse on beat
  const headlineScale = Number((1 + Math.pow(1 - beatProgress, 2) * 0.16).toFixed(3));
  const headlineSkewDeg = (beatIndex % 2 === 0 ? 1 : -1) * (isOnBeatImpact ? 5 : 2);

  const theme = NEON_THEMES[beatIndex % NEON_THEMES.length];
  const captionIndex = Math.floor(beatIndex / 4) % MEME_CAPTIONS.length;
  const caption = MEME_CAPTIONS[captionIndex];

  return {
    beatIndex,
    beatProgress,
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
  };
}

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star';
}

const CONFETTI_COLORS = [
  '#FF007F',
  '#00FF33',
  '#00F0FF',
  '#FFE600',
  '#FF3300',
  '#B000FF',
  '#FFFFFF',
];

/**
 * Creates a full-screen celebratory burst of confetti particles.
 */
export function createConfettiBurst(
  width: number,
  height: number,
  count: number = 110
): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'circle', 'star'];

  for (let i = 0; i < count; i++) {
    const seed1 = ((i * 73 + 19) % 100) / 100;
    const seed2 = ((i * 31 + 47) % 100) / 100;
    const seed3 = ((i * 97 + 11) % 100) / 100;

    // Spread across the entire viewport width and upper/mid height so confetti fills the whole screen immediately
    const x = width * (0.04 + seed1 * 0.92);
    const y = height * (0.04 + seed2 * 0.85);
    const vx = (seed3 - 0.5) * 10;
    const vy = 2.5 + seed1 * 5.5;

    particles.push({
      x,
      y,
      vx,
      vy,
      size: 10 + Math.round(seed3 * 12),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotation: seed1 * Math.PI * 2,
      vRot: (seed2 - 0.5) * 0.35,
      shape: shapes[i % shapes.length],
    });
  }

  return particles;
}

/**
 * Advances confetti particles by one frame.
 */
export function stepConfettiParticles(
  particles: ConfettiParticle[],
  width: number,
  height: number,
  recycleInDisco: boolean
): ConfettiParticle[] {
  return particles.map((p, idx) => {
    let x = p.x + p.vx;
    let y = p.y + p.vy;
    const vx = p.vx * 0.985 + Math.sin(y * 0.03 + idx) * 0.25;
    const vy = Math.min(p.vy + 0.48, 9.5);
    const rotation = p.rotation + p.vRot;

    if (recycleInDisco && y > height + 30) {
      y = -20;
      x = ((idx * 137) % Math.max(100, width));
    }

    return {
      ...p,
      x,
      y,
      vx,
      vy,
      rotation,
    };
  });
}
