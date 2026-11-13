import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../audio/audioManager';
import { Button, Card, Badge, Modal } from '../components/ui';
import {
  Vote,
  Skull,
  User,
  AlertTriangle,
  ArrowLeft,
  Crosshair,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import type { PlayerAssignment } from '../types/game';

export const VotingScreen: React.FC = () => {
  const { roundState, submitVote, resumeDebateAfterElimination, setScreen } = useGameStore();
  const [selectedCandidate, setSelectedCandidate] = useState<PlayerAssignment | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    // Play alert SFX when an interim elimination happens
    if (roundState?.interimElimination) {
      audioManager.playSfx('time_up');
    }
  }, [roundState?.interimElimination]);

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

  // Interim Elimination Announcement (When an impostor or innocent is expelled but game is NOT over yet)
  if (roundState.interimElimination) {
    const interim = roundState.interimElimination;
    return (
      <div className="flex-1 flex flex-col justify-between py-4 max-w-lg mx-auto w-full animate-in zoom-in-95 duration-200 space-y-6">
        {/* Top Header */}
        <div className="text-center pt-2">
          <Badge variant={interim.wasImpostor ? 'impostor' : 'warning'}>
            Ronda de Votación
          </Badge>
        </div>

        {/* Elimination Alert Banner */}
        <div className="space-y-4 text-center my-auto">
          {interim.wasImpostor ? (
            <div className="p-6 rounded-3xl bg-accent-impostor/15 border-2 border-accent-impostor shadow-[0_0_35px_rgba(var(--color-accent-impostor),0.35)] space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-impostor text-text-primary font-headline font-bold text-xs uppercase tracking-wider">
                <Skull className="w-4 h-4" />
                ¡Impostor Eliminado!
              </div>
              <h1 className="text-3xl sm:text-4xl font-headline font-bold text-text-primary tracking-wide">
                {interim.votedPlayerName}
              </h1>
              <p className="text-xs sm:text-sm text-accent-impostor font-semibold">
                ¡Era un impostor encubierto! Buen trabajo del grupo.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-surface border-2 border-accent-warning shadow-[0_0_30px_rgba(255,184,0,0.2)] space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-warning/20 text-accent-warning font-headline font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                ¡Inocente Expulsado!
              </div>
              <h1 className="text-3xl sm:text-4xl font-headline font-bold text-text-primary tracking-wide">
                {interim.votedPlayerName}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary">
                No era el impostor. El grupo expulsó a un inocente por error.
              </p>
            </div>
          )}

          {/* Game Continues Card */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-elevated space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-xs uppercase tracking-wider text-accent-warning flex items-center gap-1.5">
                <Crosshair className="w-4 h-4" />
                La Partida Continúa
              </span>
              <span className="font-code text-xs font-bold text-text-secondary">
                {interim.remainingImpostorCount} impostor(es) vivos
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {interim.wasImpostor
                ? `¡Cuidado! Todavía queda(n) ${interim.remainingImpostorCount} impostor(es) infiltrado(s) entre los ${interim.remainingInnocentCount} inocentes. La palabra secreta sigue oculta.`
                : `Aún queda(n) ${interim.remainingImpostorCount} impostor(es) libre(s) entre los ${interim.remainingInnocentCount} inocentes restantes.`}
            </p>
          </div>
        </div>

        {/* CTA Button to resume debate and restart timer */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isCta
            leftIcon={<RotateCcw className="w-5 h-5" />}
            onClick={resumeDebateAfterElimination}
            className="text-base tracking-wider shadow-[0_0_25px_rgba(0,229,160,0.3)]"
          >
            Continuar la Ronda (Reiniciar Tiempo)
          </Button>
          <p className="text-[11px] text-text-secondary text-center">
            Se reiniciará el temporizador del debate para seguir discutiendo.
          </p>
        </div>
      </div>
    );
  }

  const eliminatedIds = roundState.eliminatedPlayerIds || [];
  const activeSuspects = roundState.assignments.filter((a) => !eliminatedIds.includes(a.playerId));
  const eliminatedSuspects = roundState.assignments.filter((a) => eliminatedIds.includes(a.playerId));

  const handleSelectSuspect = (candidate: PlayerAssignment) => {
    audioManager.playSfx('tap');
    setSelectedCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmVote = () => {
    if (!selectedCandidate) return;
    audioManager.playSfx('bonk');
    setIsConfirmModalOpen(false);
    submitVote(selectedCandidate.playerId);
  };

  const handleBackToDebate = () => {
    audioManager.playSfx('tap');
    setScreen('ACTIVE_ROUND');
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-4 max-w-lg mx-auto w-full animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-elevated/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDebate}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-text-secondary text-xs"
          >
            Volver al Debate
          </Button>

          <Badge variant="warning" icon={<Vote className="w-3.5 h-3.5" />}>
            Votación
          </Badge>
        </div>

        <div className="text-center space-y-1.5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-text-primary tracking-wide">
            ¿A quién van a expulsar?
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
            Pónganse de acuerdo en grupo y seleccionen al jugador que crean que es el impostor.
          </p>
        </div>
      </div>

      {/* Suspects Grid */}
      <div className="space-y-2.5 my-auto">
        <div className="text-[11px] font-code uppercase tracking-wider text-text-secondary flex items-center justify-between px-1">
          <span>Sospechosos en la mesa ({activeSuspects.length})</span>
          <span className="text-accent-warning flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            Voto Definitivo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeSuspects.map((candidate, idx) => (
            <button
              key={candidate.playerId}
              type="button"
              onClick={() => handleSelectSuspect(candidate)}
              className="group p-4 rounded-2xl bg-surface border border-elevated/80 hover:border-accent-impostor/60 hover:bg-elevated/50 active:scale-[0.98] transition-all text-left flex items-center justify-between gap-3 shadow-md hover:shadow-[0_0_20px_rgba(var(--color-accent-impostor),0.15)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-canvas border border-elevated group-hover:border-accent-impostor/50 flex items-center justify-center text-text-secondary group-hover:text-accent-impostor transition-colors shrink-0">
                  <User className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-code font-bold text-text-secondary">
                      #{idx + 1}
                    </span>
                    <h3 className="font-headline font-bold text-base text-text-primary group-hover:text-accent-impostor transition-colors truncate">
                      {candidate.playerName}
                    </h3>
                  </div>
                  <span className="text-[11px] text-text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-warning animate-pulse" />
                    Sospechoso
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-canvas/70 border border-elevated group-hover:border-accent-impostor/40 flex items-center justify-center text-text-secondary group-hover:text-accent-impostor transition-colors shrink-0">
                <Skull className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {/* Previously Expelled Players */}
        {eliminatedSuspects.length > 0 && (
          <div className="pt-3 border-t border-elevated/40 space-y-2">
            <span className="text-[11px] font-code uppercase tracking-wider text-text-secondary">
              Jugadores ya expulsados ({eliminatedSuspects.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {eliminatedSuspects.map((e) => (
                <span
                  key={e.playerId}
                  className="text-xs px-2.5 py-1 rounded-lg bg-elevated/40 border border-elevated text-text-secondary line-through flex items-center gap-1.5"
                >
                  <Skull className="w-3.5 h-3.5 text-accent-impostor" />
                  {e.playerName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rules Reminder Card */}
      <Card variant="default" className="p-3.5 bg-canvas/60 border-elevated/70 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-accent-warning text-xs font-headline font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>Regla de Eliminación</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Si votan a un impostor, queda eliminado. Si aún quedan impostores, <strong>la ronda continuará</strong> hasta atraparlos a todos o que los impostores ganen la mayoría.
        </p>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={selectedCandidate ? `¿Expulsar a ${selectedCandidate.playerName}?` : 'Confirmar Votación'}
        description="Esta votación es definitiva para el jugador seleccionado."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmVote}
              leftIcon={<Skull className="w-4 h-4" />}
            >
              Confirmar Expulsión
            </Button>
          </div>
        }
      >
        <div className="p-4 rounded-xl bg-accent-impostor/10 border border-accent-impostor/30 space-y-2 text-text-primary">
          <div className="flex items-center gap-2 text-accent-impostor font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Última Palabra</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            ¿Todo el grupo está de acuerdo en expulsar a <strong>{selectedCandidate?.playerName}</strong>? Al confirmar se revelará si era un impostor o un inocente.
          </p>
        </div>
      </Modal>
    </div>
  );
};

