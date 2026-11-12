import type { GameSettings } from '../../types/game';

export interface ModeResolution {
  resolvedImpostorCount: number;
  chaosEventTriggered: string | null;
}

/**
 * Strategy contract for determining how game modes modify role distribution
 * and trigger surprise events during round generation.
 */
export interface GameModeStrategy {
  resolveMode(settings: GameSettings): ModeResolution;
}

