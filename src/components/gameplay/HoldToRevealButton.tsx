import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import { audioManager } from '../../audio/audioManager';

export interface HoldToRevealButtonProps {
  onRevealed: () => void;
  holdDurationMs?: number; // Default 400ms (0.4s)
  playerName?: string;
  className?: string;
  disabled?: boolean;
}

export const HoldToRevealButton: React.FC<HoldToRevealButtonProps> = ({
  onRevealed,
  holdDurationMs = 400,
  playerName,
  className = '',
  disabled = false,
}) => {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isPressing, setIsPressing] = useState(false);
  const [tapAccessibleMode, setTapAccessibleMode] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const triggerReveal = useCallback(() => {
    setProgress(1);
    setIsPressing(false);
    audioManager.playSfx('reveal');
    onRevealed();
  }, [onRevealed]);

  const cancelHold = useCallback(() => {
    setIsPressing(false);
    startTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setProgress(0);
  }, []);

  const step = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const currentProgress = Math.min(elapsed / holdDurationMs, 1);
      setProgress(currentProgress);

      if (currentProgress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        triggerReveal();
      }
    },
    [holdDurationMs, triggerReveal]
  );

  const startHold = useCallback(() => {
    if (disabled) return;
    if (tapAccessibleMode) {
      triggerReveal();
      return;
    }
    setIsPressing(true);
    startTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame(step);
  }, [disabled, tapAccessibleMode, triggerReveal, step]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // SVG circular calculation: radius 22, circum = 2 * PI * 22 ~= 138.23
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button
        type="button"
        disabled={disabled}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!isPressing) startHold();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            cancelHold();
          }
        }}
        aria-label={
          tapAccessibleMode
            ? `Tocar para revelar rol de ${playerName || 'jugador'}`
            : `Mantener presionado 0.4 segundos para ver rol de ${playerName || 'jugador'}`
        }
        className={`relative group w-full min-h-[58px] px-6 py-4 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-3 select-none overflow-hidden transition-all duration-150 active:scale-[0.98] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
          isPressing
            ? 'bg-elevated border-accent-primary shadow-[0_0_25px_rgba(0,229,160,0.3)]'
            : 'bg-surface border-elevated hover:border-accent-primary/50 text-text-primary'
        } ${className}`.trim()}
      >
        {/* Background Fill Progress Bar */}
        <div
          className="absolute inset-0 bg-accent-primary/20 pointer-events-none transition-all duration-75 origin-left"
          style={{ transform: `scaleX(${progress})` }}
        />

        {/* Circular Progress Ring Indicator */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 52 52">
            {/* Background ring */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              className="text-elevated fill-none"
            />
            {/* Active progress ring */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              stroke="currentColor"
              strokeWidth="4.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-accent-primary fill-none transition-[stroke-dashoffset] duration-75"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-text-primary">
            {progress >= 1 ? (
              <ShieldCheck className="w-4 h-4 text-accent-primary" />
            ) : (
              <Eye className={`w-4 h-4 ${isPressing ? 'text-accent-primary' : 'text-text-secondary'}`} />
            )}
          </div>
        </div>

        <span className="relative z-10 text-sm sm:text-base font-headline font-bold tracking-wide">
          {tapAccessibleMode
            ? 'Tocar para ver rol'
            : isPressing
            ? 'Revelando...'
            : 'Mantener presionado para ver rol'}
        </span>
      </button>

      {/* Accessibility toggle for users who cannot hold down */}
      <button
        type="button"
        onClick={() => setTapAccessibleMode(!tapAccessibleMode)}
        className="text-[11px] font-semibold text-text-secondary/70 hover:text-text-primary transition-colors underline underline-offset-4"
      >
        {tapAccessibleMode
          ? 'Cambiar a: Mantener presionado (Mayor privacidad)'
          : 'Accesibilidad: Usar toque simple en lugar de mantener'}
      </button>
    </div>
  );
};

