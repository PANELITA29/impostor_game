/**
 * Lightweight procedural Web Audio API sound manager for IMPOSTOR.
 * 100% offline, zero-asset synthesis, zero latency, and safe on mobile (iOS/Android).
 */

export type SfxType =
  | 'tap'
  | 'reveal'
  | 'tick_warning'
  | 'time_up'
  | 'impostor_reveal';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  // Ambient pad oscillator nodes
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isAmbientPlaying: boolean = false;

  constructor() {
    // Autocall unlock listener on first user gesture
    if (typeof window !== 'undefined') {
      const handleFirstInteraction = () => {
        this.unlockAudio();
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };

      window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
      window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
      window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    }
  }

  /**
   * Initializes or returns the existing AudioContext safely.
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    return this.ctx;
  }

  /**
   * Resumes the AudioContext to comply with browser autoplay policies on mobile.
   */
  public async unlockAudio(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch (err) {
      // Gracefully ignore audio subsystem failures
    }
  }

  /**
   * Updates global mute state, stopping or restarting sounds as appropriate.
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;

    if (this.isMuted) {
      if (this.ambientGain && this.ctx) {
        // Quick ramp to zero
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.ambientGain && this.ctx && this.isAmbientPlaying) {
        // Ramp back to ambient subtle volume based on musicVolume
        this.ambientGain.gain.setTargetAtTime(0.14 * this.musicVolume, this.ctx.currentTime, 0.5);
      }
    }
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.ambientGain && this.ctx && this.isAmbientPlaying && !this.isMuted) {
      const targetGain = 0.14 * this.musicVolume;
      this.ambientGain.gain.setTargetAtTime(Math.max(0.0001, targetGain), this.ctx.currentTime, 0.1);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Plays procedural synthesized sound effects with zero latency.
   */
  public playSfx(type: SfxType): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const sfxMaster = ctx.createGain();
      sfxMaster.gain.setValueAtTime(this.sfxVolume, now);
      sfxMaster.connect(ctx.destination);

      switch (type) {
        case 'tap': {
          // Soft tactile confirmation click (triangle wave, ~40ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          osc.connect(gain);
          gain.connect(sfxMaster);

          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }

        case 'reveal': {
          // Ascending mysterious chime (~250ms)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';

          osc1.frequency.setValueAtTime(350, now);
          osc1.frequency.exponentialRampToValueAtTime(700, now + 0.25);

          osc2.frequency.setValueAtTime(525, now);
          osc2.frequency.exponentialRampToValueAtTime(1050, now + 0.25);

          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(sfxMaster);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.29);
          osc2.stop(now + 0.29);
          break;
        }

        case 'tick_warning': {
          // Subtle tension pulse during the last 15 seconds
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now); // High pitch A5
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(sfxMaster);

          osc.start(now);
          osc.stop(now + 0.065);
          break;
        }

        case 'time_up': {
          // Double pleasant alarm chime when timer hits 00:00
          [0, 0.12].forEach((offset, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const freq = idx === 0 ? 587.33 : 880; // D5 then A5
            osc.frequency.setValueAtTime(freq, now + offset);

            gain.gain.setValueAtTime(0.18, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);

            osc.connect(gain);
            gain.connect(sfxMaster);

            osc.start(now + offset);
            osc.stop(now + offset + 0.38);
          });
          break;
        }

        case 'impostor_reveal': {
          // Dramatic low-frequency chord for the final reveal
          const frequencies = [65.41, 98.0, 130.81]; // C2, G2, C3
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, now);
          filter.frequency.exponentialRampToValueAtTime(150, now + 0.8);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

          frequencies.forEach((freq) => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.connect(filter);
            osc.start(now);
            osc.stop(now + 0.95);
          });

          filter.connect(gain);
          gain.connect(sfxMaster);
          break;
        }
      }
    } catch {
      // Graceful fallback without crashing
    }
  }

  /**
   * Starts a subtle procedural ambient drone / pad (minor chord with lowpass filter).
   * Volume is intentionally kept low (~0.08) so in-person players can talk without shouting.
   */
  public startAmbientMusic(): void {
    if (this.isAmbientPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.stopAmbientMusic(); // Clean any previous nodes

      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Atmospheric dark low-pass filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      gain.gain.setValueAtTime(0.0001, now);
      if (!this.isMuted) {
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.14 * this.musicVolume), now + 1.5);
      }

      filter.connect(gain);
      gain.connect(ctx.destination);

      // Procedural minor triad: D2 (73.42Hz), A2 (110.0Hz), F3 (174.61Hz)
      const frequencies = [73.42, 110.0, 174.61];
      const oscillators: OscillatorNode[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(filter);
        osc.start(now);
        oscillators.push(osc);
      });

      this.ambientGain = gain;
      this.ambientOscillators = oscillators;
      this.isAmbientPlaying = true;
    } catch {
      // Graceful degradation
    }
  }

  /**
   * Stops the ambient music smoothly.
   */
  public stopAmbientMusic(): void {
    if (!this.isAmbientPlaying && this.ambientOscillators.length === 0) return;

    try {
      const ctx = this.getContext();
      if (this.ambientGain && ctx) {
        const now = ctx.currentTime;
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      }

      setTimeout(() => {
        this.ambientOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        this.ambientOscillators = [];
        this.ambientGain = null;
        this.isAmbientPlaying = false;
      }, 450);
    } catch {
      this.ambientOscillators = [];
      this.ambientGain = null;
      this.isAmbientPlaying = false;
    }
  }
}

export const audioManager = new AudioManager();
