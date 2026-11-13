// Procedural Web Audio API Synthesizer for Drumroll, Confetti Pops, and 140 BPM Italo-Disco Rave

class MemeSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private unlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.ensureContext();
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Ignore autoplay restriction until first user interaction if any
        });
      }
      if (!this.noiseBuffer && this.ctx) {
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
      }
      this.unlocked = this.ctx.state === 'running';
      return this.ctx;
    } catch {
      return null;
    }
  }

  public playDrumrollTick(progress: number): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;

    const now = ctx.currentTime;
    const gainValue = 0.08 + progress * 0.25;

    // Snare wire noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + progress * 900, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.06);

    // Drum shell body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150 + progress * 90, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.045);

    oscGain.gain.setValueAtTime(gainValue * 0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playConfettiExplosion(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;

    const now = ctx.currentTime;

    // 1. Multiple Confetti Cannon "POP!" sounds
    const popOffsets = [0, 0.14, 0.28, 0.48, 0.75];
    popOffsets.forEach((offset, idx) => {
      const t = now + offset;

      // Pop thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340 + idx * 45, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.11);

      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);

      // Paper confetti flutter burst
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2200, t);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.28, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.24);
      }
    });

    // 2. Celebratory Party Horn / Trombetta da Laurea fanfare!
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    fanfareNotes.forEach((freq, i) => {
      const t = now + 0.08 + i * 0.14;
      const dur = i === fanfareNotes.length - 1 ? 0.65 : 0.12;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.006, t);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    });
  }

  /**
   * Plays a 16th-note step of our 140 BPM Ignorant Italo-Disco / Eurodance Banger!
   */
  public playDiscoStep(step: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const stepInBar = step % 16;

    // 1. 4-on-the-floor Cassa Dritta Kick (steps 0, 4, 8, 12)
    if (stepInBar % 4 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(165, now);
      kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.13);

      kickGain.gain.setValueAtTime(0.55, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);
    }

    // 2. Off-beat Italo-Disco "Donk" Bass (steps 2, 6, 10, 14)
    if (stepInBar % 4 === 2) {
      const bassProgression = [110, 110, 130.81, 146.83]; // A2, A2, C3, D3
      const barIndex = Math.floor(step / 16) % bassProgression.length;
      const bassFreq = bassProgression[barIndex];

      const bassOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const bassGain = ctx.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(240, now + 0.14);
      filter.Q.setValueAtTime(5.5, now);

      bassGain.gain.setValueAtTime(0.32, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + 0.16);
    }

    // 3. Clap / Snare on beats 2 and 4 (steps 4, 12) + Hi-hat on offbeats (steps 2, 6, 10, 14)
    if (this.noiseBuffer && (stepInBar === 4 || stepInBar === 12)) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.12);
    } else if (this.noiseBuffer && stepInBar % 2 === 1) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.05);
    }

    // 4. Tamarrissima Eurodance Synth Lead Hook!
    // Catchy 16-step A-minor rave melody (A4, C5, E5, G5, F5, E5, D5, C5)
    const leadMelody: Array<number | null> = [
      440.0, // A4
      null,
      523.25, // C5
      659.25, // E5
      587.33, // D5
      null,
      523.25, // C5
      493.88, // B4
      440.0, // A4
      523.25, // C5
      659.25, // E5
      783.99, // G5
      698.46, // F5
      659.25, // E5
      587.33, // D5
      523.25, // C5
    ];

    const noteFreq = leadMelody[stepInBar];
    if (noteFreq) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const leadGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Detuned supersaw feel
      osc1.frequency.setValueAtTime(noteFreq, now);
      osc2.frequency.setValueAtTime(noteFreq * 1.007, now);

      leadGain.gain.setValueAtTime(0.14, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(leadGain);
      osc2.connect(leadGain);
      leadGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    }
  }
}

export const soundEngine = new MemeSoundEngine();
