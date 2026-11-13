import { describe, it, expect } from 'vitest';
import { generateRound, validateSettings } from '../gameEngine';
import { DEFAULT_CATEGORIES } from '../../data/defaultCategories';
import type { GameSettings } from '../../types/game';

describe('gameEngine & Game Modes', () => {
  const baseSettings: GameSettings = {
    players: [
      { id: 'p1', name: 'Jugador 1' },
      { id: 'p2', name: 'Jugador 2' },
      { id: 'p3', name: 'Jugador 3' },
    ],
    impostorCount: 1,
    chaosMode: false,
    finalJudgmentMode: true,
    roundDuration: 180,
    selectedCategoryIds: ['cat-movies-series'],
  };

  it('rechaza de forma controlada si hay menos de 3 jugadores', () => {
    const invalidSettings: GameSettings = {
      ...baseSettings,
      players: [
        { id: 'p1', name: 'Jugador 1' },
        { id: 'p2', name: 'Jugador 2' },
      ],
    };

    expect(() => {
      validateSettings(invalidSettings, DEFAULT_CATEGORIES);
    }).toThrow(/al menos 3 jugadores/i);
  });

  it('rechaza de forma controlada si hay más de 15 jugadores', () => {
    const players16 = Array.from({ length: 16 }, (_, i) => ({
      id: `p-${i + 1}`,
      name: `Jugador ${i + 1}`,
    }));

    const invalidSettings: GameSettings = {
      ...baseSettings,
      players: players16,
    };

    expect(() => {
      validateSettings(invalidSettings, DEFAULT_CATEGORIES);
    }).toThrow(/máximo de jugadores permitido es 15/i);
  });

  it('rechaza de forma controlada si no hay categorías seleccionadas', () => {
    const invalidSettings: GameSettings = {
      ...baseSettings,
      selectedCategoryIds: [],
    };

    expect(() => {
      validateSettings(invalidSettings, DEFAULT_CATEGORIES);
    }).toThrow(/al menos una categoría/i);
  });

  it('en Modo Clásico asigna exactamente el número de impostores configurado sin eventos de caos', () => {
    const settings5Players: GameSettings = {
      ...baseSettings,
      players: Array.from({ length: 5 }, (_, i) => ({
        id: `p-${i + 1}`,
        name: `Jugador ${i + 1}`,
      })),
      impostorCount: 2,
      chaosMode: false,
    };

    for (let i = 0; i < 100; i++) {
      const result = generateRound(settings5Players, DEFAULT_CATEGORIES, []);
      const impostors = result.roundState.assignments.filter((a) => a.isImpostor);
      const innocents = result.roundState.assignments.filter((a) => !a.isImpostor);

      expect(impostors.length).toBe(2);
      expect(innocents.length).toBe(3);
      expect(result.roundState.chaosEventTriggered).toBeNull();
      expect(result.roundState.assignments.length).toBe(5);

      // Starter player must be one of the registered players
      const playerNames = settings5Players.players.map((p) => p.name);
      expect(playerNames).toContain(result.roundState.starterPlayerName);
    }
  });

  it('en Modo Caos manifiesta los 4 escenarios probabilísticos a lo largo de 500 simulaciones', () => {
    const chaosSettings: GameSettings = {
      ...baseSettings,
      players: Array.from({ length: 4 }, (_, i) => ({
        id: `p-${i + 1}`,
        name: `Jugador ${i + 1}`,
      })),
      impostorCount: 1,
      chaosMode: true,
    };

    const scenarios = {
      standard: 0,
      extra: 0,
      zero: 0,
      all: 0,
    };

    for (let i = 0; i < 500; i++) {
      const result = generateRound(chaosSettings, DEFAULT_CATEGORIES, []);
      const event = result.roundState.chaosEventTriggered;
      const impostors = result.roundState.assignments.filter((a) => a.isImpostor);

      // Never exceed total player count
      expect(impostors.length).toBeLessThanOrEqual(4);
      expect(impostors.length).toBeGreaterThanOrEqual(0);

      if (event === null) {
        scenarios.standard++;
        expect(impostors.length).toBe(1);
      } else if (event.includes('extra')) {
        scenarios.extra++;
        expect(impostors.length).toBe(2);
      } else if (event.includes('Nadie')) {
        scenarios.zero++;
        expect(impostors.length).toBe(0);
      } else if (event.includes('TODOS')) {
        scenarios.all++;
        expect(impostors.length).toBe(4);
      }
    }

    // All 4 scenarios must have occurred across 500 rounds
    expect(scenarios.standard).toBeGreaterThan(0);
    expect(scenarios.extra).toBeGreaterThan(0);
    expect(scenarios.zero).toBeGreaterThan(0);
    expect(scenarios.all).toBeGreaterThan(0);
  });

  it('en partidas de 3 jugadores con Modo Caos, un impostor extra nunca supera players.length - 1 (máx 2)', () => {
    const chaos3Players: GameSettings = {
      ...baseSettings,
      impostorCount: 1,
      chaosMode: true,
    };

    for (let i = 0; i < 200; i++) {
      const result = generateRound(chaos3Players, DEFAULT_CATEGORIES, []);
      const impostorCount = result.roundState.assignments.filter((a) => a.isImpostor).length;

      // In 3 players: either 0, 1, 2, or 3 (if all impostors event)
      if (result.roundState.chaosEventTriggered?.includes('extra')) {
        expect(impostorCount).toBe(2); // Exactly 3 - 1
      }
    }
  });
});

