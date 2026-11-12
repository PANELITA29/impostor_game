import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../audio/audioManager';
import { Button, Badge, Modal } from '../components/ui';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Eye,
  AlertTriangle,
  RotateCw,
  Clock,
  Skull,
} from 'lucide-react';

export const ActiveRoundScreen: React.FC = () => {
  const { roundState, settings, isMuted, toggleMute, setScreen } = useGameStore();

  const totalDuration = settings.roundDuration; // seconds or null for free
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    totalDuration !== null ? totalDuration : 0
  );
  const [isRunning, setIsRunning] = useState(true);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // Exact timestamp-based timer tracking
  const targetTimeRef = useRef<number>(
    totalDuration !== null ? Date.now() + totalDuration * 1000 : Date.now()
  );
  const pausedTimeRemainingRef = useRef<number>(
    totalDuration !== null ? totalDuration : 0
  );

  // Free timer elapsed tracking
  const [elapsedFreeSeconds, setElapsedFreeSeconds] = useState(0);

  // Manage ambient pad and last warning tick
  const lastTickSecondRef = useRef<number | null>(null);

  useEffect(() => {
    // Start ambient music when entering active round
    audioManager.startAmbientMusic();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Unlock audio context if browser suspended it in background
        audioManager.unlockAudio();

        if (isRunning) {
          audioManager.startAmbientMusic();

          // Immediately sync remaining seconds from wall clock target
          if (totalDuration !== null) {
            const now = Date.now();
            const diff = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
            setRemainingSeconds(diff);
            if (diff === 0) {
              if (lastTickSecondRef.current !== 0) {
                lastTickSecondRef.current = 0;
                audioManager.playSfx('time_up');
              }
              setIsRunning(false);
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audioManager.stopAmbientMusic();
    };
  }, [isRunning, totalDuration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (totalDuration !== null) {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
        setRemainingSeconds(diff);

        // Sound effect triggers for last 15 seconds
        if (diff <= 15 && diff > 0 && diff !== lastTickSecondRef.current) {
          lastTickSecondRef.current = diff;
          audioManager.playSfx('tick_warning');
        }

        if (diff === 0) {
          if (lastTickSecondRef.current !== 0) {
            lastTickSecondRef.current = 0;
            audioManager.playSfx('time_up');
          }
          setIsRunning(false);
        }
      } else {
        setElapsedFreeSeconds((prev) => prev + 1);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning, totalDuration]);

  const handlePauseResume = () => {
    if (isRunning) {
      // Pause: save remaining and pause ambient
      setIsRunning(false);
      pausedTimeRemainingRef.current = remainingSeconds;
      audioManager.stopAmbientMusic();
    } else {
      // Resume: set new target based on saved remaining and resume ambient
      if (totalDuration !== null) {
        targetTimeRef.current = Date.now() + pausedTimeRemainingRef.current * 1000;
      }
      setIsRunning(true);
      audioManager.startAmbientMusic();
    }
  };

  const handleResetTimer = () => {
    if (totalDuration !== null) {
      targetTimeRef.current = Date.now() + totalDuration * 1000;
      setRemainingSeconds(totalDuration);
      pausedTimeRemainingRef.current = totalDuration;
    } else {
      setElapsedFreeSeconds(0);
    }
    setIsRunning(true);
  };

  const handleConfirmReveal = () => {
    setIsRevealModalOpen(false);
    setScreen('RESOLUTION');
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = totalDuration !== null && remainingSeconds <= 15 && remainingSeconds > 0;
  const isTimeUp = totalDuration !== null && remainingSeconds === 0;

  // Circular timer calculations
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const progressRatio =
    totalDuration !== null ? remainingSeconds / totalDuration : 1;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-4 max-w-lg mx-auto w-full animate-in fade-in duration-300">
      {/* Top Bar Navigation & Sound Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-elevated/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFinishModalOpen(true)}
          className="text-text-secondary hover:text-accent-impostor text-xs"
        >
          Terminar Ronda
        </Button>

        <Badge variant={isTimeUp ? 'impostor' : 'warning'}>
          {isTimeUp ? '¡TIEMPO AGOTADO!' : 'Ronda en Debate'}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-accent-impostor" />
          ) : (
            <Volume2 className="w-5 h-5 text-accent-primary" />
          )}
        </Button>
      </div>

      {/* Turn Banner (Who Starts & Rotation Direction) */}
      <div className="pt-4">
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border-l-4 border-l-accent-warning border-y border-r border-elevated shadow-lg">
          <div className="space-y-0.5">
            <span className="text-[11px] font-code uppercase tracking-wider text-text-secondary block">
              Empieza diciendo una palabra
            </span>
            <div className="text-base sm:text-lg font-headline font-bold text-accent-warning">
              {roundState?.starterPlayerName || 'Jugador 1'}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-elevated/70 border border-surface text-xs font-headline font-bold text-text-primary shrink-0">
            {roundState?.rotationDirection === 'CLOCKWISE' ? (
              <>
                <span>Derecha</span>
                <RotateCw className="w-4 h-4 text-accent-primary" />
              </>
            ) : (
              <>
                <span>Izquierda</span>
                <RotateCcw className="w-4 h-4 text-accent-primary" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chaos Mode Notice (If Triggered) */}
      {roundState?.chaosEventTriggered && (
        <div className="p-3 rounded-xl bg-accent-chaos/10 border border-accent-chaos/40 text-accent-chaos text-xs font-semibold text-center mt-2 animate-pulse">
          ⚡ {roundState.chaosEventTriggered}
        </div>
      )}

      {/* Main Circular Timer Section */}
      <div className="my-auto py-6 flex flex-col items-center justify-center space-y-5">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* SVG Progress Circle */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
            {/* Background Track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              className="text-elevated fill-none"
            />
            {/* Dynamic Progress Indicator */}
            {totalDuration !== null && (
              <circle
                cx="110"
                cy="110"
                r={radius}
                stroke="currentColor"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`fill-none transition-[stroke-dashoffset] duration-300 ${
                  isLowTime || isTimeUp ? 'text-accent-impostor' : 'text-accent-primary'
                }`}
              />
            )}
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            {totalDuration !== null ? (
              <>
                <span
                  className={`font-code font-bold text-5xl sm:text-6xl tracking-tighter tabular-nums transition-colors ${
                    isLowTime || isTimeUp
                      ? 'text-accent-impostor animate-pulse'
                      : 'text-text-primary'
                  }`}
                >
                  {formatTime(remainingSeconds)}
                </span>
                <span className="text-xs font-headline font-bold text-text-secondary mt-1 uppercase tracking-wider">
                  {isTimeUp ? '¡Debatan!' : isRunning ? 'Tiempo Restante' : 'Pausado'}
                </span>
              </>
            ) : (
              <>
                <span className="font-code font-bold text-5xl sm:text-6xl tracking-tighter tabular-nums text-accent-primary">
                  {formatTime(elapsedFreeSeconds)}
                </span>
                <span className="text-xs font-headline font-bold text-text-secondary mt-1 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Tiempo Libre
                </span>
              </>
            )}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePauseResume}
            leftIcon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            className="min-w-[130px]"
          >
            {isRunning ? 'Pausar' : 'Reanudar'}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleResetTimer}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            aria-label="Reiniciar temporizador"
          >
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Sticky Bottom: Reveal Impostor with Safeguard */}
      <div className="pt-4 border-t border-elevated/40">
        <Button
          variant="danger"
          size="lg"
          fullWidth
          leftIcon={<Skull className="w-5 h-5" />}
          onClick={() => setIsRevealModalOpen(true)}
          className="text-base tracking-wider shadow-[0_0_25px_rgba(255,59,92,0.3)]"
        >
          Revelar Impostor
        </Button>
      </div>

      {/* Guardian Modal: Reveal Impostor Confirmation */}
      <Modal
        isOpen={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
        title="¿Votaron y están listos?"
        description="Esta acción terminará el debate y mostrará quién era el impostor y cuál era la palabra secreta."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              onClick={() => setIsRevealModalOpen(false)}
            >
              Seguir Jugando
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReveal}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              Revelar Ahora
            </Button>
          </div>
        }
      >
        <div className="p-4 rounded-xl bg-accent-impostor/10 border border-accent-impostor/30 space-y-2 text-text-primary">
          <div className="flex items-center gap-2 text-accent-impostor font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Alerta de Spoiler</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Asegúrense de haber realizado la votación del grupo antes de confirmar. Si el impostor fue atrapado, tendrá una última oportunidad de adivinar la palabra secreta.
          </p>
        </div>
      </Modal>

      {/* Finish Round Modal */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        title="¿Terminar la partida?"
        description="Podrás ir directo a los resultados o cancelar."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              onClick={() => setIsFinishModalOpen(false)}
            >
              Continuar Partida
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsFinishModalOpen(false);
                setScreen('RESOLUTION');
              }}
            >
              Ir a Resultados
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">
          Si terminas la ronda ahora se mostrarán los resultados y los roles de todos los jugadores.
        </p>
      </Modal>
    </div>
  );
};
