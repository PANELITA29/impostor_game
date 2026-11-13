/**
 * Lightweight procedural Web Audio API & Media sound manager for IMPOSTOR.
 * 100% offline, zero-latency SFX, dynamic debate music playback and previewing.
 */

import { DEBATE_MUSIC_TRACKS } from './musicTracks';

export type SfxType =
  | 'tap'
  | 'reveal'
  | 'tick_warning'
  | 'time_up'
  | 'impostor_reveal'
  | 'fart'
  | 'bonk'
  | 'impostor_win';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  // Sound effects preloaded pools
  private buttonAudioPool: HTMLAudioElement[] = [];
  private buttonPoolIdx: number = 0;
  private lastTapTimestamp: number = 0;
  private fartAudio: HTMLAudioElement | null = null;
  private lastFartTimestamp: number = 0;
  private lastImpostorWinTimestamp: number = 0;
  private bonkAudio: HTMLAudioElement | null = null;
  private impostorWinAudio: HTMLAudioElement | null = null;

  // Web Audio pre-decoded audio buffers (0ms instantaneous latency)
  private buttonBuffer: AudioBuffer | null = null;
  private fartBuffer: AudioBuffer | null = null;
  private bonkBuffer: AudioBuffer | null = null;
  private impostorWinBuffer: AudioBuffer | null = null;
  private isBuffersLoading: boolean = false;

  // Ambient pad oscillator nodes (for procedural synthesis mode)
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isAmbientPlaying: boolean = false;

  // File-based debate music playback
  private audioElement: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;

  // Track preview playback in settings
  private previewAudio: HTMLAudioElement | null = null;
  private previewTrackId: string | null = null;
  private previewListeners: Set<(trackId: string | null) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Preload sound effect pools
      try {
        if (typeof Audio !== 'undefined') {
          for (let i = 0; i < 4; i++) {
            const btn = new Audio('/sounds/button.mp3');
            btn.preload = 'auto';
            this.buttonAudioPool.push(btn);
          }
          this.fartAudio = new Audio('/sounds/fart.mp3');
          this.fartAudio.preload = 'auto';
          this.bonkAudio = new Audio('/sounds/bonk.mp3');
          this.bonkAudio.preload = 'auto';
          this.impostorWinAudio = new Audio('/sounds/rdr2-low-honor.mp3');
          this.impostorWinAudio.preload = 'auto';
        }
      } catch {
        // Fallback for non-browser/test runtimes
      }

      // Autocall unlock listener on first user gesture
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
      this.preloadAudioBuffers();
    } catch {
      // Gracefully ignore audio subsystem failures
    }
  }

  /**
   * Pre-decodes sound effect MP3s into uncompressed Float32 PCM RAM buffers.
   * This gives 0.0ms instantaneous audio playback without HTML5 decoder lag.
   */
  public preloadAudioBuffers(): void {
    if (this.isBuffersLoading || typeof window === 'undefined') return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.isBuffersLoading = true;

    const loadBuffer = async (url: string) => {
      try {
        const res = await fetch(url);
        const arrayBuf = await res.arrayBuffer();
        return await ctx.decodeAudioData(arrayBuf);
      } catch {
        return null;
      }
    };

    loadBuffer('/sounds/button.mp3').then((buf) => {
      if (buf) this.buttonBuffer = buf;
    });

    loadBuffer('/sounds/fart.mp3').then((buf) => {
      if (buf) this.fartBuffer = buf;
    });

    loadBuffer('/sounds/bonk.mp3').then((buf) => {
      if (buf) this.bonkBuffer = buf;
    });

    loadBuffer('/sounds/rdr2-low-honor.mp3').then((buf) => {
      if (buf) this.impostorWinBuffer = buf;
    });
  }

  /**
   * Updates global mute state, stopping or restarting sounds as appropriate.
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;

    // Update SFX audio volumes
    this.buttonAudioPool.forEach((btn) => {
      btn.volume = muted ? 0 : this.sfxVolume;
    });
    if (this.fartAudio) {
      this.fartAudio.volume = muted ? 0 : this.sfxVolume;
    }
    if (this.bonkAudio) {
      this.bonkAudio.volume = muted ? 0 : this.sfxVolume;
    }
    if (this.impostorWinAudio) {
      this.impostorWinAudio.volume = muted ? 0 : this.sfxVolume;
    }

    // Update active debate file music
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.musicVolume;
    }

    // Update preview audio
    if (this.previewAudio) {
      this.previewAudio.volume = this.isMuted ? 0 : this.musicVolume;
    }

    // Update procedural synthesis
    if (this.isMuted) {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.ambientGain && this.ctx && this.isAmbientPlaying) {
        this.ambientGain.gain.setTargetAtTime(0.14 * this.musicVolume, this.ctx.currentTime, 0.5);
      }
    }
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));

    if (!this.isMuted) {
      this.buttonAudioPool.forEach((btn) => {
        btn.volume = this.sfxVolume;
      });
      if (this.fartAudio) {
        this.fartAudio.volume = this.sfxVolume;
      }
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));

    if (this.audioElement && !this.isMuted) {
      this.audioElement.volume = this.musicVolume;
    }

    if (this.previewAudio && !this.isMuted) {
      this.previewAudio.volume = this.musicVolume;
    }

    if (this.ambientGain && this.ctx && this.isAmbientPlaying && !this.isMuted) {
      const targetGain = 0.14 * this.musicVolume;
      this.ambientGain.gain.setTargetAtTime(Math.max(0.0001, targetGain), this.ctx.currentTime, 0.1);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Plays sound effects (file-based or procedural synthesis fallback).
   */
  public playSfx(type: SfxType): void {
    if (this.isMuted) return;

    const ctx = this.getContext();

    // 1. Button click sound (Minecraft Button / Pressure Plate)
    if (type === 'tap') {
      const nowMs = Date.now();
      if (nowMs - this.lastTapTimestamp < 90) {
        return; // Debounce rapid simultaneous calls and event cascades
      }
      this.lastTapTimestamp = nowMs;

      // Primary zero-latency path: Web Audio API AudioBufferSourceNode
      if (this.buttonBuffer && ctx) {
        try {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          const source = ctx.createBufferSource();
          source.buffer = this.buttonBuffer;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
          source.connect(gain);
          gain.connect(ctx.destination);
          source.start(0);
          return;
        } catch {}
      }

      // Secondary fallback: preloaded HTML5 Audio element pool
      if (this.buttonAudioPool.length > 0) {
        try {
          const audio = this.buttonAudioPool[this.buttonPoolIdx % this.buttonAudioPool.length];
          this.buttonPoolIdx++;
          audio.volume = this.isMuted ? 0 : this.sfxVolume;
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return;
        } catch {
          // Fall through to procedural fallback
        }
      }
    }

    // 2. Fart with reverb sound (for dramatic reveal)
    if (type === 'fart') {
      const nowMs = Date.now();
      if (nowMs - this.lastFartTimestamp < 600) {
        return;
      }
      this.lastFartTimestamp = nowMs;

      // Primary zero-latency path: Web Audio API AudioBufferSourceNode
      if (this.fartBuffer && ctx) {
        try {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          const source = ctx.createBufferSource();
          source.buffer = this.fartBuffer;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(Math.min(1, this.sfxVolume * 1.15), ctx.currentTime);
          source.connect(gain);
          gain.connect(ctx.destination);
          source.start(0);
          return;
        } catch {}
      }

      try {
        if (!this.fartAudio && typeof Audio !== 'undefined') {
          this.fartAudio = new Audio('/sounds/fart.mp3');
        }
        if (this.fartAudio) {
          this.fartAudio.volume = this.isMuted ? 0 : Math.min(1, this.sfxVolume * 1.15);
          this.fartAudio.currentTime = 0;
          this.fartAudio.play().catch(() => {});
          return;
        }
      } catch {
        // Fall through to procedural fallback
      }
    }

    // 3. Bonk sound effect (for confirming expulsion)
    if (type === 'bonk') {
      if (this.bonkBuffer && ctx) {
        try {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          const source = ctx.createBufferSource();
          source.buffer = this.bonkBuffer;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
          source.connect(gain);
          gain.connect(ctx.destination);
          source.start(0);
          return;
        } catch {}
      }

      try {
        if (!this.bonkAudio && typeof Audio !== 'undefined') {
          this.bonkAudio = new Audio('/sounds/bonk.mp3');
        }
        if (this.bonkAudio) {
          this.bonkAudio.volume = this.isMuted ? 0 : this.sfxVolume;
          this.bonkAudio.currentTime = 0;
          this.bonkAudio.play().catch(() => {});
          return;
        }
      } catch {}
    }

    // 4. Impostor Win sound effect (RDR2 Low Honor)
    if (type === 'impostor_win') {
      const nowMs = Date.now();
      if (nowMs - this.lastImpostorWinTimestamp < 1000) {
        return;
      }
      this.lastImpostorWinTimestamp = nowMs;

      if (this.impostorWinBuffer && ctx) {
        try {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          const source = ctx.createBufferSource();
          source.buffer = this.impostorWinBuffer;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(Math.min(1, this.sfxVolume * 1.1), ctx.currentTime);
          source.connect(gain);
          gain.connect(ctx.destination);
          source.start(0);
          return;
        } catch {}
      }

      try {
        if (!this.impostorWinAudio && typeof Audio !== 'undefined') {
          this.impostorWinAudio = new Audio('/sounds/rdr2-low-honor.mp3');
        }
        if (this.impostorWinAudio) {
          this.impostorWinAudio.volume = this.isMuted ? 0 : Math.min(1, this.sfxVolume * 1.1);
          this.impostorWinAudio.currentTime = 0;
          this.impostorWinAudio.play().catch(() => {});
          return;
        }
      } catch {}
    }

    // Procedural sound synthesis via Web Audio API fallback
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
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
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
          [0, 0.12].forEach((offset, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const freq = idx === 0 ? 587.33 : 880;
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

        case 'fart':
        case 'impostor_reveal': {
          const frequencies = [65.41, 98.0, 130.81];
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
      // Graceful fallback
    }
  }

  /**
   * Starts debate music based on selected track ID.
   */
  public playDebateMusic(trackId?: string): void {
    this.stopPreview();

    const selectedTrack =
      DEBATE_MUSIC_TRACKS.find((t) => t.id === trackId) ||
      DEBATE_MUSIC_TRACKS[0];

    // Silence mode
    if (selectedTrack.type === 'none') {
      this.stopDebateMusic();
      this.currentTrackId = 'none';
      return;
    }

    // Procedural synthesizer mode
    if (selectedTrack.type === 'procedural') {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
      this.currentTrackId = 'ambient';
      this.startAmbientProcedural();
      return;
    }

    // File-based MP3 mode
    if (selectedTrack.src) {
      this.stopAmbientProcedural();

      if (this.audioElement && this.currentTrackId === selectedTrack.id) {
        this.audioElement.volume = this.isMuted ? 0 : this.musicVolume;
        if (this.audioElement.paused) {
          this.audioElement.play().catch(() => {});
        }
        return;
      }

      if (this.audioElement) {
        this.audioElement.pause();
      }

      const audio = new Audio(selectedTrack.src);
      audio.loop = true;
      audio.volume = this.isMuted ? 0 : this.musicVolume;
      this.audioElement = audio;
      this.currentTrackId = selectedTrack.id;

      audio.play().catch(() => {});
    }
  }

  /**
   * Stops active debate music smoothly.
   */
  public stopDebateMusic(): void {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
      this.audioElement = null;
    }
    this.stopAmbientProcedural();
    this.currentTrackId = null;
  }

  public startAmbientMusic(trackId?: string): void {
    this.playDebateMusic(trackId);
  }

  public stopAmbientMusic(): void {
    this.stopDebateMusic();
  }

  private startAmbientProcedural(): void {
    if (this.isAmbientPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.stopAmbientProcedural();

      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      gain.gain.setValueAtTime(0.0001, now);
      if (!this.isMuted) {
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.14 * this.musicVolume), now + 1.5);
      }

      filter.connect(gain);
      gain.connect(ctx.destination);

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
    } catch {}
  }

  private stopAmbientProcedural(): void {
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

  // --------------------------------------------------------------------------
  // PREVIEW SYSTEM (for Settings screen)
  // --------------------------------------------------------------------------

  public togglePreviewTrack(trackId: string): boolean {
    if (this.previewTrackId === trackId) {
      this.stopPreview();
      return false;
    }

    this.stopPreview();

    const track = DEBATE_MUSIC_TRACKS.find((t) => t.id === trackId);
    if (!track || track.type === 'none') {
      return false;
    }

    if (track.type === 'procedural') {
      this.startAmbientProcedural();
      this.previewTrackId = trackId;
      this.notifyPreviewListeners();
      return true;
    }

    if (track.src) {
      const audio = new Audio(track.src);
      audio.loop = true;
      audio.volume = this.isMuted ? 0 : this.musicVolume;
      audio.play().catch(() => {});
      this.previewAudio = audio;
      this.previewTrackId = trackId;
      this.notifyPreviewListeners();
      return true;
    }

    return false;
  }

  public stopPreview(): void {
    if (this.previewAudio) {
      try {
        this.previewAudio.pause();
        this.previewAudio.currentTime = 0;
      } catch {}
      this.previewAudio = null;
    }

    if (this.previewTrackId === 'ambient') {
      this.stopAmbientProcedural();
    }

    this.previewTrackId = null;
    this.notifyPreviewListeners();
  }

  public getPreviewTrackId(): string | null {
    return this.previewTrackId;
  }

  public subscribePreview(listener: (trackId: string | null) => void): () => void {
    this.previewListeners.add(listener);
    listener(this.previewTrackId);
    return () => {
      this.previewListeners.delete(listener);
    };
  }

  private notifyPreviewListeners(): void {
    this.previewListeners.forEach((fn) => fn(this.previewTrackId));
  }
}

export const audioManager = new AudioManager();
