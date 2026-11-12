import type { GameSettings } from '../../types/game';
import type { GameModeStrategy, ModeResolution } from './modeStrategy';
import { getRandomInt } from '../random';

/**
 * Chaos mode distribution of events:
 * - 65% Standard Round (keeps user configured impostorCount)
 * - 15% Extra Impostor (+1 impostor, capped at players.length - 1)
 * - 10% Zero Impostors (everyone is innocent)
 * - 10% All Impostors (everyone is an impostor)
 */
export class ChaosModeStrategy implements GameModeStrategy {
  resolveMode(settings: GameSettings): ModeResolution {
    const playerCount = settings.players.length;
    const baseCount = Math.max(1, Math.min(settings.impostorCount, playerCount - 1));

    // Roll random percentage [0, 99]
    const roll = getRandomInt(100);

    // 10% All Impostors (rolls 0 - 9)
    if (roll < 10) {
      return {
        resolvedImpostorCount: playerCount,
        chaosEventTriggered: '¡Modo Caos: TODOS eran impostores!',
      };
    }

    // 10% Zero Impostors (rolls 10 - 19)
    if (roll < 20) {
      return {
        resolvedImpostorCount: 0,
        chaosEventTriggered: '¡Modo Caos: Nadie era impostor! Todos tenían la palabra.',
      };
    }

    // 15% Extra Impostor (rolls 20 - 34)
    if (roll < 35) {
      const extraCount = Math.min(baseCount + 1, playerCount - 1);
      return {
        resolvedImpostorCount: extraCount,
        chaosEventTriggered: '¡Modo Caos: Hay un impostor extra infiltrado!',
      };
    }

    // 65% Standard Round (rolls 35 - 99)
    return {
      resolvedImpostorCount: baseCount,
      chaosEventTriggered: null,
    };
  }
}

