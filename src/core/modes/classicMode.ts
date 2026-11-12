import type { GameSettings } from '../../types/game';
import type { GameModeStrategy, ModeResolution } from './modeStrategy';

/**
 * Classic mode assigns strictly the number of impostors configured by the user,
 * clamped between 1 and players.length - 1. Never triggers chaos events.
 */
export class ClassicModeStrategy implements GameModeStrategy {
  resolveMode(settings: GameSettings): ModeResolution {
    const playerCount = settings.players.length;
    const maxAllowed = Math.max(1, playerCount - 1);
    const resolvedImpostorCount = Math.min(
      Math.max(1, settings.impostorCount),
      maxAllowed
    );

    return {
      resolvedImpostorCount,
      chaosEventTriggered: null,
    };
  }
}

