import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button, Card, Badge } from '../components/ui';
import { ArrowLeft, Users, Play } from 'lucide-react';

export const LobbyScreenPlaceholder: React.FC = () => {
  const { setScreen, settings, startRound } = useGameStore();

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScreen('HOME')}
            aria-label="Volver a Inicio"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Atrás
          </Button>
          <h2 className="text-xl font-headline font-bold text-text-primary">
            Lobby de Partida
          </h2>
        </div>

        <Card variant="default" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-primary" />
              Jugadores ({settings.players.length})
            </span>
            <Badge variant="primary">{settings.impostorCount} Impostor</Badge>
          </div>

          <div className="space-y-2">
            {settings.players.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-elevated/70 border border-surface text-sm font-medium"
              >
                <span>{p.name}</span>
                <span className="text-xs font-code text-text-secondary">#{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Play className="w-5 h-5 fill-current" />}
          onClick={startRound}
        >
          Iniciar Ronda (Test)
        </Button>
      </div>
    </div>
  );
};

