import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../audio/audioManager';
import { Button, Card, Badge } from '../components/ui';
import { CategoryIconBadge } from '../components/gameplay/CategoryVisual';
import {
  Skull,
  ShieldCheck,
  RefreshCw,
  Settings,
  Sparkles,
  Zap,
  Trophy,
  AlertOctagon,
} from 'lucide-react';

export const ResolutionScreen: React.FC = () => {
  const { roundState, startRound, setScreen } = useGameStore();

  React.useEffect(() => {
    // If impostors won, play the RDR2 Low Honor sound effect immediately! Otherwise fart on innocent reveal
    if (roundState?.voteResult && !roundState.voteResult.innocentsWon) {
      audioManager.playSfx('impostor_win');
    } else {
      audioManager.playSfx('fart');
    }
  }, []);

  if (!roundState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-text-secondary">No hay información de la última ronda.</p>
        <Button variant="primary" onClick={() => setScreen('LOBBY')}>
          Ir al Lobby
        </Button>
      </div>
    );
  }

  const impostors = roundState.assignments.filter((a) => a.isImpostor);
  const innocents = roundState.assignments.filter((a) => !a.isImpostor);
  const hasZeroImpostors = impostors.length === 0;
  const voteResult = roundState.voteResult;

  return (
    <div className="flex-1 flex flex-col justify-between py-4 max-w-lg mx-auto w-full animate-in fade-in duration-300 space-y-6">
      {/* Dynamic Victory / Defeat Outcome Banner */}
      {voteResult ? (
        voteResult.impostorStoleVictory ? (
          <div className="p-5 rounded-2xl bg-accent-chaos/20 border-2 border-accent-chaos shadow-[0_0_35px_rgba(168,85,247,0.35)] text-center space-y-2 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-chaos text-text-primary font-headline font-bold text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              ¡EL IMPOSTOR ROBÓ LA VICTORIA!
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-accent-chaos tracking-wide">
              ¡Deducción Maestra de {voteResult.votedPlayerName}!
            </h1>
            <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
              Aunque fue descubierto, en <strong>El Juicio Final</strong> acertó la palabra secreta escribiendo:{' '}
              <span className="font-code font-bold text-accent-chaos bg-accent-chaos/20 px-2 py-0.5 rounded">
                "{voteResult.impostorGuess}"
              </span>
              . ¡Se roba la partida entera!
            </p>
          </div>
        ) : voteResult.innocentsWon ? (
          <div className="p-5 rounded-2xl bg-accent-primary/15 border-2 border-accent-primary shadow-[0_0_35px_rgba(0,229,160,0.35)] text-center space-y-2 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary text-canvas font-headline font-bold text-xs">
              <Trophy className="w-3.5 h-3.5" />
              ¡VICTORIA DE LOS INOCENTES!
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-accent-primary tracking-wide">
              {impostors.length > 1 ? '¡Atraparon a Todos los Impostores!' : '¡Atraparon al Impostor!'}
            </h1>
            <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
              {voteResult.impostorGuess ? (
                <>
                  El grupo atrapó a <strong className="text-accent-primary font-bold">{voteResult.votedPlayerName}</strong> y falló en El Juicio Final (escribió{' '}
                  <span className="font-code line-through opacity-80">"{voteResult.impostorGuess}"</span>). ¡Victoria definitiva de la tripulación!
                </>
              ) : (
                <>
                  El grupo votó correctamente y expulsó a <strong className="text-accent-primary font-bold">{voteResult.votedPlayerName}</strong>. {impostors.length > 1 ? '¡Todos los impostores han sido desenmascarados!' : 'quien era el impostor encubierto.'}
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-accent-impostor/15 border-2 border-accent-impostor shadow-[0_0_35px_rgba(var(--color-accent-impostor),0.35)] text-center space-y-2 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-impostor text-text-primary font-headline font-bold text-xs">
              <AlertOctagon className="w-3.5 h-3.5" />
              ¡VICTORIA DEL IMPOSTOR!
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-accent-impostor tracking-wide">
              {impostors.length > 1 ? '¡Los Impostores se Salvan!' : '¡El Impostor se Salva!'}
            </h1>
            <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
              El grupo cayó en la trampa y expulsó al inocente <strong className="text-accent-warning font-bold">{voteResult.votedPlayerName}</strong>. {impostors.length > 1 ? 'Los impostores lograron engañar a todos.' : 'El impostor logró engañar a todos.'}
            </p>
          </div>
        )
      ) : (
        <div className="text-center space-y-2">
          <Badge variant="primary" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Ronda Finalizada
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-text-primary tracking-wide">
            Resultados de la Partida
          </h1>
        </div>
      )}

      {/* Chaos Event Banner (If any) */}
      {roundState.chaosEventTriggered && (
        <div className="p-4 rounded-2xl bg-accent-chaos/15 border border-accent-chaos/40 shadow-[0_0_20px_rgba(168,85,247,0.2)] space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 text-accent-chaos font-headline font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>¡Evento Modo Caos Ocurrido!</span>
          </div>
          <p className="text-xs text-text-primary font-medium">
            {roundState.chaosEventTriggered}
          </p>
        </div>
      )}

      {/* Main Revelation Cards */}
      <div className="space-y-4">
        {/* Tarjeta de Palabra Secreta (#00E5A0) */}
        <Card
          variant="innocent"
          className="text-center p-6 space-y-2 border-accent-primary shadow-[0_0_25px_rgba(0,229,160,0.2)]"
        >
          <span className="text-xs font-code uppercase tracking-widest text-text-secondary block">
            Palabra Secreta
          </span>
          <div className="text-3xl sm:text-4xl font-headline font-bold text-accent-primary tracking-wider">
            {roundState.secretWord}
          </div>
          <div className="text-xs text-text-secondary pt-1 font-semibold flex items-center justify-center gap-1.5">
            <span>Categoría:</span>
            <span className="text-text-primary inline-flex items-center gap-1.5 font-bold">
              <CategoryIconBadge category={roundState.categoryName} size="sm" />
              {roundState.categoryName}
            </span>
          </div>
        </Card>

        {/* Tarjeta de Impostores (#FF3B5C) */}
        <Card
          variant="impostor"
          className="p-5 sm:p-6 space-y-4 border-accent-impostor shadow-[0_0_25px_rgba(var(--color-accent-impostor),0.2)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-headline font-bold text-accent-impostor flex items-center gap-2">
              <Skull className="w-4 h-4" />
              {hasZeroImpostors
                ? 'Resultado Especial'
                : impostors.length === 1
                ? 'El Impostor era'
                : 'Los Impostores eran'}
            </span>
            <Badge variant="impostor" size="sm">
              {impostors.length} Detectado(s)
            </Badge>
          </div>

          {hasZeroImpostors ? (
            <div className="p-4 rounded-xl bg-canvas text-center space-y-1">
              <span className="font-headline font-bold text-accent-warning text-base">
                ¡Nadie era impostor!
              </span>
              <p className="text-xs text-text-secondary">
                El Modo Caos engañó a todos: todos tenían la palabra secreta.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {impostors.map((imp) => {
                const wasVoted =
                  voteResult?.votedPlayerId === imp.playerId ||
                  roundState.eliminatedPlayerIds?.includes(imp.playerId);
                return (
                  <div
                    key={imp.playerId}
                    className={`flex items-center justify-between p-3 rounded-xl bg-canvas border ${
                      wasVoted ? 'border-accent-impostor ring-2 ring-accent-impostor/50' : 'border-accent-impostor/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-headline font-bold text-base text-text-primary truncate">
                        {imp.playerName}
                      </span>
                      {wasVoted && (
                        <span className="text-[10px] font-code px-1.5 py-0.5 rounded bg-accent-impostor/20 text-accent-impostor font-bold shrink-0">
                          Expulsado
                        </span>
                      )}
                    </div>
                    <Badge variant="impostor" size="sm">
                      IMPOSTOR
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Innocents List Preview */}
        <div className="p-4 rounded-2xl bg-surface border border-elevated/70 space-y-2.5">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-primary" />
            Jugadores Inocentes ({innocents.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {innocents.map((inn) => {
              const wasVoted = voteResult?.votedPlayerId === inn.playerId;
              return (
                <span
                  key={inn.playerId}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                    wasVoted
                      ? 'bg-accent-warning/20 border-accent-warning text-accent-warning font-bold'
                      : 'bg-elevated text-text-primary border-surface'
                  }`}
                >
                  {inn.playerName} {wasVoted && '(Expulsado por error)'}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Continuity Buttons */}
      <div className="pt-4 space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<RefreshCw className="w-5 h-5" />}
          onClick={startRound}
          className="text-base tracking-wider"
        >
          Jugar Otra Ronda
        </Button>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          leftIcon={<Settings className="w-4 h-4" />}
          onClick={() => setScreen('LOBBY')}
        >
          Cambiar Configuración
        </Button>
      </div>
    </div>
  );
};
