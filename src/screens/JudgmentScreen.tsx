import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../audio/audioManager';
import { Button, Card, Badge } from '../components/ui';
import { CategoryIconBadge } from '../components/gameplay/CategoryVisual';
import {
  Skull,
  Zap,
  Clock,
  Flag,
  Sparkles,
  Send,
} from 'lucide-react';

export const JudgmentScreen: React.FC = () => {
  const { roundState, submitImpostorGuess, surrenderImpostor, setScreen } = useGameStore();
  const [guess, setGuess] = useState('');
  const [countdown, setCountdown] = useState(25);
  const inputRef = useRef<HTMLInputElement>(null);

  const impostorName = roundState?.voteResult?.votedPlayerName || 'Impostor';
  const categoryName = roundState?.categoryName || 'General';

  useEffect(() => {
    // Play dramatic countdown tick / time_up intro sound
    audioManager.playSfx('time_up');

    // Focus input on mount
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timeout);
  }, []);

  // 25-second dramatic countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      surrenderImpostor();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, surrenderImpostor]);

  if (!roundState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-text-secondary">No hay partida activa.</p>
        <Button variant="primary" onClick={() => setScreen('LOBBY')}>
          Ir al Lobby
        </Button>
      </div>
    );
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = guess.trim();
    if (!trimmed) return;
    submitImpostorGuess(trimmed);
  };

  const isLowTime = countdown <= 8;

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-4 max-w-lg mx-auto w-full animate-in zoom-in-95 duration-200 space-y-5">
      {/* Top Header & Countdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-elevated/40">
          <Badge variant="chaos" icon={<Zap className="w-3.5 h-3.5" />}>
            El Juicio Final
          </Badge>

          {/* Countdown Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-code font-bold transition-colors ${
              isLowTime
                ? 'bg-accent-impostor/20 border-accent-impostor text-accent-impostor animate-pulse'
                : 'bg-elevated/60 border-elevated text-accent-warning'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>00:{countdown.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Dramatic Heading */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accent-impostor/15 border border-accent-impostor/40 text-accent-impostor font-headline font-bold text-xs uppercase tracking-wider">
            <Skull className="w-3.5 h-3.5" />
            ¡Descubrieron a {impostorName}!
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-text-primary tracking-wide">
            ¿Puedes adivinar la palabra?
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
            Si deduces la clave por las pistas que escuchaste, <strong className="text-accent-chaos font-bold">¡robas la victoria</strong> en el último segundo!
          </p>
        </div>
      </div>

      {/* Main Guessing Arena Card */}
      <Card
        variant="default"
        className="p-5 sm:p-6 bg-surface border-2 border-accent-chaos/40 shadow-[0_0_30px_rgba(168,85,247,0.25)] space-y-4 my-auto"
      >
        {/* Category Context */}
        <div className="p-3 rounded-xl bg-canvas/70 border border-elevated flex items-center justify-between">
          <span className="text-xs font-code uppercase tracking-wider text-text-secondary">
            Categoría del Juego
          </span>
          <div className="flex items-center gap-2">
            <CategoryIconBadge category={categoryName} size="sm" />
            <span className="text-sm font-headline font-bold text-accent-primary">
              {categoryName}
            </span>
          </div>
        </div>

        {/* Guess Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="impostor-guess-input" className="block text-xs font-semibold text-text-secondary">
            Escribe tu deducción de la palabra secreta:
          </label>

          <div className="relative">
            <input
              id="impostor-guess-input"
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Ej. Jude Bellingham..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="w-full h-14 bg-canvas border-2 border-accent-chaos/60 focus:border-accent-chaos focus:ring-2 focus:ring-accent-chaos/30 rounded-xl px-4 text-base sm:text-lg font-headline font-bold text-text-primary placeholder:text-text-secondary/50 outline-none transition-all shadow-inner"
            />
          </div>

          <p className="text-[11px] text-text-secondary/80 flex items-center gap-1.5 leading-snug">
            <Sparkles className="w-3.5 h-3.5 text-accent-chaos shrink-0" />
            <span>Tolera faltas de ortografía, tildes, mayúsculas y nombres compuestos.</span>
          </p>

          <Button
            type="submit"
            variant="chaos"
            size="lg"
            fullWidth
            isCta
            disabled={!guess.trim()}
            leftIcon={<Send className="w-5 h-5" />}
            className="text-base tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.35)] mt-2"
          >
            Adivinar y Robar Victoria
          </Button>
        </form>
      </Card>

      {/* Surrender Option */}
      <div className="text-center pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={surrenderImpostor}
          leftIcon={<Flag className="w-4 h-4 text-text-secondary" />}
          className="text-xs text-text-secondary hover:text-accent-primary"
        >
          No tengo idea (Rendirse y Victoria de Inocentes)
        </Button>
      </div>
    </div>
  );
};
