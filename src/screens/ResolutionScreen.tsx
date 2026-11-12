import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../audio/audioManager';
import { Button, Card, Badge } from '../components/ui';
import {
  Skull,
  ShieldCheck,
  RefreshCw,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

export const ResolutionScreen: React.FC = () => {
  const { roundState, startRound, setScreen } = useGameStore();

  React.useEffect(() => {
    // Play dramatic chord when reveal resolution mounts
    audioManager.playSfx('impostor_reveal');
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

  return (
    <div className="flex-1 flex flex-col justify-between py-4 max-w-lg mx-auto w-full animate-in fade-in duration-300 space-y-6">
      {/* Top Title */}
      <div className="text-center space-y-2">
        <Badge variant="primary" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Ronda Finalizada
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-text-primary tracking-wide">
          Resultados de la Partida
        </h1>
      </div>

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
          <div className="text-xs text-text-secondary pt-1 font-semibold">
            Categoría: <span className="text-text-primary">{roundState.categoryName}</span>
          </div>
        </Card>

        {/* Tarjeta de Impostores (#FF3B5C) */}
        <Card
          variant="impostor"
          className="p-5 sm:p-6 space-y-4 border-accent-impostor shadow-[0_0_25px_rgba(255,59,92,0.2)]"
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
              {impostors.map((imp) => (
                <div
                  key={imp.playerId}
                  className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-accent-impostor/40"
                >
                  <span className="font-headline font-bold text-base text-text-primary">
                    {imp.playerName}
                  </span>
                  <Badge variant="impostor" size="sm">
                    IMPOSTOR
                  </Badge>
                </div>
              ))}
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
            {innocents.map((inn) => (
              <span
                key={inn.playerId}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-elevated text-text-primary border border-surface"
              >
                {inn.playerName}
              </span>
            ))}
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

