import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button, Card, Badge } from '../components/ui';
import { PlayerChip } from '../components/gameplay/PlayerChip';
import { CategoryIconBadge } from '../components/gameplay/CategoryVisual';
import type { RoundDuration } from '../types/game';
import {
  ArrowLeft,
  Users,
  Plus,
  Minus,
  Skull,
  Zap,
  Clock,
  Layers,
  Check,
  Play,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export const LobbyScreen: React.FC = () => {
  const {
    setScreen,
    settings,
    categories,
    errorMessage,
    clearError,
    addPlayer,
    removePlayer,
    updatePlayerName,
    setImpostorCount,
    toggleChaosMode,
    toggleFinalJudgmentMode,
    setRoundDuration,
    toggleCategorySelection,
    selectAllCategories,
    deselectAllCategories,
    startRound,
  } = useGameStore();

  const playerCount = settings.players.length;
  const maxImpostors = Math.max(1, Math.floor((playerCount - 1) / 2));
  const hasSelectedCategories = settings.selectedCategoryIds.length > 0;
  const allCategoriesSelected =
    categories.length > 0 &&
    settings.selectedCategoryIds.length === categories.length;

  const handleAddPlayer = () => {
    if (playerCount < 15) {
      addPlayer(`Jugador ${playerCount + 1}`);
    }
  };

  const handleRemoveLastPlayer = () => {
    if (playerCount > 3) {
      const lastPlayer = settings.players[playerCount - 1];
      removePlayer(lastPlayer.id);
    }
  };

  const durations: { label: string; value: RoundDuration }[] = [
    { label: '1m', value: 60 },
    { label: '2m', value: 120 },
    { label: '3m', value: 180 },
    { label: '5m', value: 300 },
    { label: 'Libre', value: null },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between pb-24 sm:pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-elevated/40">
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
          <h1 className="text-xl sm:text-2xl font-headline font-bold text-text-primary tracking-wide">
            Configurar Partida
          </h1>
        </div>

        <Badge variant="neutral" size="sm">
          Pass &amp; Play
        </Badge>
      </div>

      {/* Main Grid Content: 1 col on mobile, 2 cols on >=768px */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
        {/* Left Column: Jugadores + Reglas & Modos */}
        <div className="space-y-6">
          {/* Bloque Jugadores */}
          <Card variant="default" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-primary" />
                <h2 className="font-headline font-bold text-base text-text-primary">
                  Jugadores ({playerCount})
                </h2>
              </div>

              {/* Stepper - / + (3 - 15) */}
              <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-xl border border-elevated">
                <button
                  type="button"
                  onClick={handleRemoveLastPlayer}
                  disabled={playerCount <= 3}
                  aria-label="Disminuir jugadores"
                  className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="font-code font-bold text-sm text-text-primary px-2 min-w-[28px] text-center">
                  {playerCount}
                </span>

                <button
                  type="button"
                  onClick={handleAddPlayer}
                  disabled={playerCount >= 15}
                  aria-label="Aumentar jugadores"
                  className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-text-secondary">
              Toca cualquier nombre para personalizarlo rápidamente:
            </p>

            {/* List of Player Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {settings.players.map((p, index) => (
                <PlayerChip
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  index={index}
                  onUpdateName={updatePlayerName}
                  canRemove={playerCount > 3}
                  onRemove={removePlayer}
                />
              ))}
            </div>
          </Card>

          {/* Bloque Reglas y Modos */}
          <Card variant="default" className="space-y-5">
            {/* Selector de Impostores */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-headline font-bold text-sm text-text-primary flex items-center gap-2">
                  <Skull className="w-4 h-4 text-accent-impostor" />
                  Cantidad de Impostores
                </span>
                <span className="text-xs text-text-secondary">
                  Máximo {maxImpostors} para {playerCount} jugadores
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-xl border border-elevated">
                <button
                  type="button"
                  onClick={() => setImpostorCount(settings.impostorCount - 1)}
                  disabled={settings.impostorCount <= 1}
                  aria-label="Reducir impostores"
                  className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="font-code font-bold text-sm text-accent-impostor px-2 min-w-[28px] text-center">
                  {settings.impostorCount}
                </span>

                <button
                  type="button"
                  onClick={() => setImpostorCount(settings.impostorCount + 1)}
                  disabled={settings.impostorCount >= maxImpostors}
                  aria-label="Aumentar impostores"
                  className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modo Caos Highlight Card */}
            <div
              onClick={toggleChaosMode}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleChaosMode();
                }
              }}
              aria-label={`Modo Caos: ${settings.chaosMode ? 'Activado' : 'Desactivado'}`}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                settings.chaosMode
                  ? 'bg-accent-chaos/10 border-accent-chaos shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                  : 'bg-elevated/40 border-elevated hover:border-accent-chaos/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${settings.chaosMode ? 'text-accent-chaos' : 'text-text-secondary'}`} />
                    <span className="font-headline font-bold text-sm text-text-primary">
                      Modo Caos
                    </span>
                    <Badge variant={settings.chaosMode ? 'chaos' : 'neutral'} size="sm">
                      {settings.chaosMode ? 'ACTIVO' : 'OFF'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Rondas sorpresa con 0, múltiples o todos impostores.
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                    settings.chaosMode
                      ? 'bg-accent-chaos border-accent-chaos text-text-primary'
                      : 'border-elevated bg-canvas'
                  }`}
                >
                  {settings.chaosMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* El Juicio Final Toggle Card */}
            <div
              onClick={toggleFinalJudgmentMode}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFinalJudgmentMode();
                }
              }}
              aria-label={`El Juicio Final: ${settings.finalJudgmentMode ? 'Activado' : 'Desactivado'}`}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                settings.finalJudgmentMode
                  ? 'bg-accent-impostor/10 border-accent-impostor shadow-[0_0_20px_rgba(var(--color-accent-impostor),0.25)]'
                  : 'bg-elevated/40 border-elevated hover:border-accent-impostor/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${settings.finalJudgmentMode ? 'text-accent-impostor' : 'text-text-secondary'}`} />
                    <span className="font-headline font-bold text-sm text-text-primary">
                      El Juicio Final
                    </span>
                    <Badge variant={settings.finalJudgmentMode ? 'impostor' : 'neutral'} size="sm">
                      {settings.finalJudgmentMode ? 'ACTIVO' : 'OFF'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Si descubren al impostor, puede intentar adivinar la palabra para robar la victoria.
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                    settings.finalJudgmentMode
                      ? 'bg-accent-impostor border-accent-impostor text-canvas'
                      : 'border-elevated bg-canvas'
                  }`}
                >
                  {settings.finalJudgmentMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Duración de Ronda */}
            <div className="space-y-2">
              <span className="font-headline font-bold text-sm text-text-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-warning" />
                Duración de Ronda
              </span>

              <div className="grid grid-cols-5 gap-1.5 p-1 bg-canvas rounded-xl border border-elevated">
                {durations.map((d) => {
                  const isSelected = settings.roundDuration === d.value;
                  return (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => setRoundDuration(d.value)}
                      aria-pressed={isSelected}
                      className={`min-h-[44px] rounded-lg text-xs font-headline font-bold transition-all ${
                        isSelected
                          ? 'bg-accent-warning text-canvas shadow-md'
                          : 'text-text-secondary hover:text-text-primary hover:bg-elevated/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Categorías */}
        <div className="space-y-4">
          <Card variant="default" className="space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent-primary" />
                  <h2 className="font-headline font-bold text-base text-text-primary">
                    Categorías ({settings.selectedCategoryIds.length}/{categories.length})
                  </h2>
                </div>

                {/* Seleccionar todas / Ninguna */}
                <button
                  type="button"
                  onClick={() => {
                    if (allCategoriesSelected) {
                      deselectAllCategories();
                    } else {
                      selectAllCategories();
                    }
                  }}
                  className="text-xs font-semibold text-accent-primary hover:underline min-h-[36px] px-2 rounded-lg"
                >
                  {allCategoriesSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>

              {/* Grid 2 Columnas de Categorías */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = settings.selectedCategoryIds.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategorySelection(cat.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleCategorySelection(cat.id);
                        }
                      }}
                      aria-label={`${cat.name}, ${cat.words.length} palabras. ${
                        isSelected ? 'Seleccionada' : 'No seleccionada'
                      }`}
                      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between min-h-[84px] ${
                        isSelected
                          ? 'bg-surface border-accent-primary shadow-[0_0_14px_rgba(0,229,160,0.15)]'
                          : 'bg-elevated/40 border-elevated/70 hover:border-elevated text-text-secondary opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CategoryIconBadge category={cat} size="sm" />
                          <div className="min-w-0">
                            <span className="font-headline font-bold text-sm text-text-primary leading-tight line-clamp-1 block">
                              {cat.name}
                            </span>
                            <span className="text-xs text-text-secondary block">
                              {cat.words.length} palabras
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {cat.isCustom && (
                            <Badge variant="chaos" size="sm">
                              Propia
                            </Badge>
                          )}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-accent-primary border-accent-primary text-canvas'
                                : 'border-elevated bg-canvas'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick link to manage categories */}
            <div className="pt-2 border-t border-elevated/40 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScreen('CATEGORIES')}
                leftIcon={<Plus className="w-4 h-4" />}
                className="text-xs text-text-secondary hover:text-accent-primary"
              >
                Crear / Editar Categorías
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Footer with Safe Area Support */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-elevated/80 bg-canvas/95 backdrop-blur-md pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-4">
        {errorMessage && (
          <div className="mx-auto max-w-[960px] mb-2 p-3 rounded-xl bg-accent-impostor/15 border border-accent-impostor/40 flex items-center justify-between text-xs text-accent-impostor font-semibold animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-text-secondary hover:text-text-primary px-2"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="mx-auto max-w-[960px] flex flex-col sm:flex-row items-center justify-between gap-2">
          {!hasSelectedCategories ? (
            <div className="flex items-center gap-2 text-accent-warning text-xs sm:text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Selecciona al menos una categoría para jugar</span>
            </div>
          ) : (
            <div className="text-xs text-text-secondary hidden sm:block">
              {playerCount} jugadores · {settings.impostorCount} impostor(es) ·{' '}
              {settings.selectedCategoryIds.length} categoría(s)
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            disabled={!hasSelectedCategories}
            fullWidth={false}
            className="w-full sm:w-auto min-w-[220px]"
            leftIcon={<Play className="w-5 h-5 fill-current" />}
            onClick={startRound}
          >
            Repartir Roles
          </Button>
        </div>
      </div>
    </div>
  );
};

