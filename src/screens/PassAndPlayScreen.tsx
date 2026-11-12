import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../audio/audioManager';
import { Button, Badge } from '../components/ui';
import { ReflectiveCard } from '../components/ui/ReflectiveCard';
import { HoldToRevealButton } from '../components/gameplay/HoldToRevealButton';
import {
  Smartphone,
  ShieldAlert,
  ArrowRight,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const PassAndPlayScreen: React.FC = () => {
  const { roundState, setScreen } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  if (!roundState || roundState.assignments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-text-secondary">No hay una ronda activa en curso.</p>
        <Button variant="primary" onClick={() => setScreen('LOBBY')}>
          Volver al Lobby
        </Button>
      </div>
    );
  }

  const assignments = roundState.assignments;
  const totalPlayers = assignments.length;
  const currentAssignment = assignments[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === totalPlayers - 1;

  const handleReveal = () => {
    audioManager.playSfx('reveal');
    setIsRevealed(true);
  };

  const handleNextPlayer = () => {
    audioManager.playSfx('tap');
    // Sub-estado 4C: First hide the card to ensure zero leak, then advance or start round
    setIsRevealed(false);

    if (isLastPlayer) {
      setScreen('ACTIVE_ROUND');
    } else {
      setCurrentPlayerIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-4 max-w-md mx-auto w-full animate-in fade-in duration-200">
      {/* Top Header Progress */}
      <div className="flex items-center justify-between pb-3 border-b border-elevated/40">
        <Badge variant="warning">
          Jugador {currentPlayerIndex + 1} de {totalPlayers}
        </Badge>
        <span className="text-xs font-code text-text-secondary">
          Paso {currentPlayerIndex + 1}/{totalPlayers}
        </span>
      </div>

      {/* Main Body */}
      <div className="my-auto py-4 flex flex-col items-center justify-center space-y-5">
        {!isRevealed ? (
          /* =========================================================================
             SUB-ESTADO 4A: PANTALLA DE PASO (Reflective Card Táctica)
             Zero words or role details are rendered in DOM here.
             ========================================================================= */
          <div className="flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200 w-full">
            <ReflectiveCard
              width="100%"
              height={320}
              radius={24}
              tint="#FFB800"
              metalness={0.9}
              roughness={0.25}
              glare={0.65}
              shine={1.2}
              enableTilt={true}
              tiltStrength={12}
              className="max-w-[340px] mx-auto rounded-3xl shadow-[0_0_35px_rgba(255,184,0,0.2)]"
            >
              <div className="flex flex-col items-center justify-center text-center h-full p-4 space-y-3">
                {/* Handover Icon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-canvas/80 border border-accent-warning/40 flex items-center justify-center shadow-lg">
                    <Smartphone className="w-8 h-8 text-accent-warning animate-pulse" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent-warning text-canvas font-headline font-bold text-xs flex items-center justify-center">
                    #{currentPlayerIndex + 1}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-widest text-text-secondary font-code block">
                    Pasa el dispositivo a
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-headline font-bold text-accent-warning tracking-wide">
                    {currentAssignment.playerName}
                  </h2>
                </div>

                <p className="text-[11px] text-text-secondary max-w-[240px] leading-relaxed">
                  Asegúrate de que nadie más mire la pantalla antes de pulsar.
                </p>
              </div>
            </ReflectiveCard>

            {/* Hold to Reveal Trigger */}
            <div className="w-full pt-2">
              <HoldToRevealButton
                playerName={currentAssignment.playerName}
                onRevealed={handleReveal}
              />
            </div>
          </div>
        ) : (
          /* =========================================================================
             SUB-ESTADO 4B: TARJETA REVELADA CON EFECTO REFLECTIVE METÁLICO
             - Si es Inocente: Reflejo esmeralda / verde neón (#00E5A0)
             - Si es Impostor: Reflejo carmesí / alerta (#FF3B5C)
             ========================================================================= */
          <div className="space-y-5 animate-in zoom-in-95 duration-200 w-full flex flex-col items-center">
            {currentAssignment.isImpostor ? (
              /* Tarjeta Impostor Reflectiva */
              <ReflectiveCard
                width="100%"
                height={370}
                radius={24}
                tint="#FF3B5C"
                metalness={1.0}
                roughness={0.2}
                glare={0.8}
                shine={1.5}
                enableTilt={true}
                tiltStrength={14}
                className="max-w-[340px] mx-auto rounded-3xl shadow-[0_0_40px_rgba(255,59,92,0.35)]"
              >
                <div className="flex flex-col items-center justify-between text-center h-full p-4 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-canvas/80 border border-accent-impostor/50 flex items-center justify-center text-accent-impostor shadow-lg">
                    <ShieldAlert className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <Badge variant="impostor" size="md">
                      Rol Asignado
                    </Badge>
                    <h3 className="text-2xl sm:text-3xl font-headline font-bold text-accent-impostor tracking-wider pt-1 drop-shadow-[0_0_12px_rgba(255,59,92,0.5)]">
                      ERES EL IMPOSTOR
                    </h3>
                    <div className="text-xs font-code text-text-secondary pt-1">
                      CATEGORÍA:{' '}
                      <span className="text-text-primary font-bold">
                        {roundState.categoryName}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-canvas/90 border border-accent-impostor/30 text-xs text-text-secondary leading-relaxed">
                    No conoces la palabra secreta. Escucha las pistas con atención y disimula para sobrevivir a la votación.
                  </div>
                </div>
              </ReflectiveCard>
            ) : (
              /* Tarjeta Inocente Reflectiva */
              <ReflectiveCard
                width="100%"
                height={370}
                radius={24}
                tint="#00E5A0"
                metalness={1.0}
                roughness={0.2}
                glare={0.8}
                shine={1.5}
                enableTilt={true}
                tiltStrength={14}
                className="max-w-[340px] mx-auto rounded-3xl shadow-[0_0_40px_rgba(0,229,160,0.35)]"
              >
                <div className="flex flex-col items-center justify-between text-center h-full p-4 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-canvas/80 border border-accent-primary/50 flex items-center justify-center text-accent-primary shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-1 w-full">
                    <Badge variant="primary" size="md">
                      INOCENTE
                    </Badge>
                    <div className="text-xs font-code text-text-secondary pt-1">
                      CATEGORÍA:{' '}
                      <span className="text-text-primary font-bold">
                        {roundState.categoryName}
                      </span>
                    </div>

                    {/* Secret Word */}
                    <div className="py-2">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest font-code block mb-0.5">
                        Palabra Secreta
                      </span>
                      <div className="text-2xl sm:text-3xl font-headline font-bold text-accent-primary tracking-wide break-words drop-shadow-[0_0_15px_rgba(0,229,160,0.5)]">
                        {roundState.secretWord}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-canvas/90 border border-accent-primary/30 text-xs text-text-secondary leading-relaxed">
                    Recuerda tu palabra secreta. Cuando sea tu turno di solo una palabra relacionada sin ser tan obvio.
                  </div>
                </div>
              </ReflectiveCard>
            )}

            {/* =========================================================================
               SUB-ESTADO 4C: BOTÓN OCULTAR Y AVANZAR
               ========================================================================= */}
            <div className="pt-2 w-full">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNextPlayer}
                leftIcon={
                  isLastPlayer ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )
                }
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {isLastPlayer ? 'Comenzar Ronda' : 'Ocultar y pasar al siguiente'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center">
        <span className="text-[11px] font-code text-text-secondary/60">
          Modo Pass &amp; Play · No muestres la pantalla a nadie
        </span>
      </div>
    </div>
  );
};
