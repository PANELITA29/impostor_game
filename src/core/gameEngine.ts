import type { GameSettings, Category, RoundState, PlayerAssignment } from '../types/game';
import { selectNextWord, type WordSelectionResult } from './wordSelector';
import { getRandomInt, shuffleArray } from './random';
import { ClassicModeStrategy } from './modes/classicMode';
import { ChaosModeStrategy } from './modes/chaosMode';
import type { GameModeStrategy, ModeResolution } from './modes/modeStrategy';

export interface GeneratedRoundResult {
  roundState: RoundState;
  updatedWordsHistory: string[];
  cycleReset: boolean;
}

/**
 * Validates the gameplay settings before launching a round.
 */
export function validateSettings(settings: GameSettings, categories: readonly Category[]): void {
  const playerCount = settings.players?.length ?? 0;
  if (playerCount < 3) {
    throw new Error(`Se requieren al menos 3 jugadores para iniciar la partida (actual: ${playerCount}).`);
  }
  if (playerCount > 15) {
    throw new Error(`El número máximo de jugadores permitido es 15 (actual: ${playerCount}).`);
  }

  const selectedCategoryIds = settings.selectedCategoryIds ?? [];
  if (selectedCategoryIds.length === 0) {
    throw new Error('Debes seleccionar al menos una categoría para jugar.');
  }

  const activeCategories = categories.filter(
    (c) => selectedCategoryIds.includes(c.id) && Array.isArray(c.words) && c.words.length > 0
  );
  if (activeCategories.length === 0) {
    throw new Error('Ninguna de las categorías seleccionadas contiene palabras válidas.');
  }
}

/**
 * Assigns innocent and impostor roles impartially among active players.
 * Produces an array of booleans matching the resolved count and shuffles them.
 */
export function assignRoles(
  players: readonly { id: string; name: string }[],
  resolvedImpostorCount: number
): PlayerAssignment[] {
  const playerCount = players.length;
  const impostorCount = Math.min(Math.max(0, resolvedImpostorCount), playerCount);
  const innocentCount = playerCount - impostorCount;

  // Create role booleans: true = impostor, false = innocent
  const rolePool: boolean[] = [
    ...new Array(impostorCount).fill(true),
    ...new Array(innocentCount).fill(false),
  ];

  // Impartial Fisher-Yates shuffle
  const shuffledRoles = shuffleArray(rolePool);

  return players.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    isImpostor: shuffledRoles[index],
  }));
}

/**
 * Generates an end-to-end round state using Strategy Pattern for game modes,
 * pure random selection for starter player / rotation direction,
 * and the anti-repetition word selection engine.
 *
 * Pure function: Does not cause side effects, manipulate DOM, or use browser storage.
 */
export function generateRound(
  settings: GameSettings,
  categories: readonly Category[],
  usedWordsHistory: readonly string[],
  customStrategy?: GameModeStrategy
): GeneratedRoundResult {
  // 1. Validate safety boundaries
  validateSettings(settings, categories);

  // 2. Resolve game mode strategy
  const modeStrategy: GameModeStrategy =
    customStrategy || (settings.chaosMode ? new ChaosModeStrategy() : new ClassicModeStrategy());
  const modeResolution: ModeResolution = modeStrategy.resolveMode(settings);

  // 3. Select category and secret word with anti-repetition guarantees
  const wordResult: WordSelectionResult = selectNextWord(
    categories,
    settings.selectedCategoryIds,
    usedWordsHistory
  );

  // 4. Impartially assign roles
  const assignments = assignRoles(settings.players, modeResolution.resolvedImpostorCount);

  // 5. Pick random starter player and rotation direction
  const starterIndex = getRandomInt(settings.players.length);
  const starterPlayerName = settings.players[starterIndex].name;
  const rotationDirection: 'CLOCKWISE' | 'COUNTER_CLOCKWISE' =
    getRandomInt(2) === 0 ? 'CLOCKWISE' : 'COUNTER_CLOCKWISE';

  const roundState: RoundState = {
    categoryName: wordResult.categoryName,
    secretWord: wordResult.secretWord,
    assignments,
    starterPlayerName,
    rotationDirection,
    chaosEventTriggered: modeResolution.chaosEventTriggered,
  };

  return {
    roundState,
    updatedWordsHistory: wordResult.updatedHistory,
    cycleReset: wordResult.cycleReset,
  };
}
