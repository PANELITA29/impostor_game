import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button, Card, Badge } from '../components/ui';
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react';

export const PassAndPlayPlaceholder: React.FC = () => {
  const { setScreen, roundState, endRound } = useGameStore();

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScreen('LOBBY')}
            aria-label="Volver a Lobby"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Lobby
          </Button>
          <h2 className="text-xl font-headline font-bold text-text-primary">
            Pasa el Teléfono
          </h2>
        </div>

        <Card variant="impostor" className="text-center p-6 space-y-4">
          <Badge variant="warning">Ronda en Curso (Test)</Badge>
          <div className="space-y-1">
            <h3 className="text-xl font-headline font-bold">
              Comienza: {roundState?.starterPlayerName}
            </h3>
            <p className="text-sm text-text-secondary">
              Sentido:{' '}
              {roundState?.rotationDirection === 'CLOCKWISE'
                ? 'Sentido Horario'
                : 'Sentido Anti-horario'}
            </p>
          </div>
          <p className="text-xs text-text-secondary">
            Categoría: <strong>{roundState?.categoryName}</strong>
          </p>
        </Card>
      </div>

      <div className="space-y-3">
        <Button
          variant="danger"
          size="lg"
          fullWidth
          leftIcon={<Eye className="w-5 h-5" />}
          onClick={endRound}
        >
          Finalizar y Votar (Test)
        </Button>
      </div>
    </div>
  );
};

export const ResolutionPlaceholder: React.FC = () => {
  const { resetGame, roundState } = useGameStore();

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-headline font-bold text-text-primary text-center">
          Resolución de Partida
        </h2>

        <Card variant="default" className="space-y-4">
          <div className="text-center space-y-2">
            <span className="text-xs font-code uppercase text-text-secondary">Palabra Secreta</span>
            <div className="text-2xl font-headline font-bold text-accent-primary">
              {roundState?.secretWord}
            </div>
            <p className="text-xs text-text-secondary">Categoría: {roundState?.categoryName}</p>
          </div>

          <div className="space-y-2 border-t border-elevated pt-3">
            <span className="text-xs font-semibold text-text-secondary uppercase">
              Asignación de Roles
            </span>
            {roundState?.assignments.map((a) => (
              <div
                key={a.playerId}
                className="flex items-center justify-between p-3 rounded-xl bg-elevated/60"
              >
                <span className="font-medium text-sm">{a.playerName}</span>
                <Badge variant={a.isImpostor ? 'impostor' : 'primary'}>
                  {a.isImpostor ? 'IMPOSTOR' : 'Inocente'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<RefreshCw className="w-5 h-5" />}
          onClick={resetGame}
        >
          Nueva Partida
        </Button>
      </div>
    </div>
  );
};

