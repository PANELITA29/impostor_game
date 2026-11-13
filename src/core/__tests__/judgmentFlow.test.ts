import { describe, it, expect } from 'vitest';
import { normalizeText, levenshteinDistance, isWordMatch } from '../../utils/textMatching';
import { useGameStore } from '../../store/useGameStore';
import type { GameSettings } from '../../types/game';

describe('textMatching Utility', () => {
  it('normaliza texto quitando acentos, mayúsculas y espacios duplicados', () => {
    expect(normalizeText('  Jûdé   Béllïnghám! ')).toBe('jude bellingham');
    expect(normalizeText('Café con Leche')).toBe('cafe con leche');
    expect(normalizeText('Ñandú')).toBe('nandu');
  });

  it('calcula correctamente la distancia Levenshtein', () => {
    expect(levenshteinDistance('pizza', 'pizza')).toBe(0);
    expect(levenshteinDistance('piza', 'pizza')).toBe(1);
    expect(levenshteinDistance('belinghan', 'bellingham')).toBe(2);
  });

  it('isWordMatch valida coincidencias directas y tolerantes', () => {
    // Exact & accent-agnostic
    expect(isWordMatch('jude bellingham', 'Jude Bellingham')).toBe(true);
    expect(isWordMatch('jude bellingham', 'JÚDÉ BÉLLÍNGHÁM')).toBe(true);
    expect(isWordMatch('judebellingham', 'Jude Bellingham')).toBe(true);

    // Minor typo tolerance
    expect(isWordMatch('bellinghan', 'Bellingham')).toBe(true);
    expect(isWordMatch('belingham', 'Bellingham')).toBe(true);
    expect(isWordMatch('piza', 'Pizza')).toBe(true);

    // Multi-word target keyword match (e.g. guessing the surname or primary noun)
    expect(isWordMatch('Bellingham', 'Jude Bellingham')).toBe(true);
    expect(isWordMatch('Potter', 'Harry Potter')).toBe(true);
    expect(isWordMatch('Messi', 'Lionel Messi')).toBe(true);

    // Incorrect guesses
    expect(isWordMatch('Mbappé', 'Jude Bellingham')).toBe(false);
    expect(isWordMatch('Hamburguesa', 'Pizza')).toBe(false);
    expect(isWordMatch('', 'Pizza')).toBe(false);
  });
});

describe('El Juicio Final (Judgment Screen Flow)', () => {
  const baseSettings: GameSettings = {
    players: [
      { id: 'p1', name: 'Laura' },
      { id: 'p2', name: 'Juanda' },
      { id: 'p3', name: 'Carol' },
    ],
    impostorCount: 1,
    chaosMode: false,
    finalJudgmentMode: true,
    roundDuration: 120,
    selectedCategoryIds: ['cat-movies-series'],
  };

  it('cuando descubren al impostor, entra a JUDGMENT y si adivina la palabra roba la victoria', () => {
    const store = useGameStore.getState();
    store.resetGame();

    // Mock active voting phase where Laura is the impostor
    useGameStore.setState({
      settings: baseSettings,
      currentScreen: 'VOTING',
      roundState: {
        categoryName: 'Futbolistas',
        secretWord: 'Jude Bellingham',
        assignments: [
          { playerId: 'p1', playerName: 'Laura', isImpostor: true },
          { playerId: 'p2', playerName: 'Juanda', isImpostor: false },
          { playerId: 'p3', playerName: 'Carol', isImpostor: false },
        ],
        starterPlayerName: 'Juanda',
        rotationDirection: 'CLOCKWISE',
        chaosEventTriggered: null,
        voteResult: null,
        eliminatedPlayerIds: [],
        interimElimination: null,
        debateRemainingSeconds: null,
      },
    });

    // 1. Group votes out Laura (the impostor)
    store.submitVote('p1');

    const stateAtJudgment = useGameStore.getState();
    // Must transition to JUDGMENT, NOT directly to RESOLUTION
    expect(stateAtJudgment.currentScreen).toBe('JUDGMENT');
    expect(stateAtJudgment.roundState?.voteResult?.votedPlayerName).toBe('Laura');

    // 2. Laura attempts to guess the word and succeeds!
    store.submitImpostorGuess('Bellingham');

    const stateAtResolution = useGameStore.getState();
    expect(stateAtResolution.currentScreen).toBe('RESOLUTION');
    expect(stateAtResolution.roundState?.voteResult?.impostorStoleVictory).toBe(true);
    expect(stateAtResolution.roundState?.voteResult?.innocentsWon).toBe(false); // Impostor stole victory!
  });

  it('cuando descubren al impostor y falla la adivinanza, los inocentes ganan definitivamente', () => {
    const store = useGameStore.getState();
    store.resetGame();

    useGameStore.setState({
      settings: baseSettings,
      currentScreen: 'VOTING',
      roundState: {
        categoryName: 'Futbolistas',
        secretWord: 'Jude Bellingham',
        assignments: [
          { playerId: 'p1', playerName: 'Laura', isImpostor: true },
          { playerId: 'p2', playerName: 'Juanda', isImpostor: false },
          { playerId: 'p3', playerName: 'Carol', isImpostor: false },
        ],
        starterPlayerName: 'Juanda',
        rotationDirection: 'CLOCKWISE',
        chaosEventTriggered: null,
        voteResult: null,
        eliminatedPlayerIds: [],
        interimElimination: null,
        debateRemainingSeconds: null,
      },
    });

    store.submitVote('p1');
    expect(useGameStore.getState().currentScreen).toBe('JUDGMENT');

    // Laura guesses incorrectly
    store.submitImpostorGuess('Cristiano Ronaldo');

    const stateAtResolution = useGameStore.getState();
    expect(stateAtResolution.currentScreen).toBe('RESOLUTION');
    expect(stateAtResolution.roundState?.voteResult?.impostorStoleVictory).toBe(false);
    expect(stateAtResolution.roundState?.voteResult?.innocentsWon).toBe(true); // Innocents win!
  });

  it('si el impostor se rinde en el Juicio Final, la victoria va para los inocentes', () => {
    const store = useGameStore.getState();
    store.resetGame();

    useGameStore.setState({
      settings: baseSettings,
      currentScreen: 'VOTING',
      roundState: {
        categoryName: 'Futbolistas',
        secretWord: 'Jude Bellingham',
        assignments: [
          { playerId: 'p1', playerName: 'Laura', isImpostor: true },
          { playerId: 'p2', playerName: 'Juanda', isImpostor: false },
          { playerId: 'p3', playerName: 'Carol', isImpostor: false },
        ],
        starterPlayerName: 'Juanda',
        rotationDirection: 'CLOCKWISE',
        chaosEventTriggered: null,
        voteResult: null,
        eliminatedPlayerIds: [],
        interimElimination: null,
        debateRemainingSeconds: null,
      },
    });

    store.submitVote('p1');
    expect(useGameStore.getState().currentScreen).toBe('JUDGMENT');

    // Laura surrenders
    store.surrenderImpostor();

    const stateAtResolution = useGameStore.getState();
    expect(stateAtResolution.currentScreen).toBe('RESOLUTION');
    expect(stateAtResolution.roundState?.voteResult?.innocentsWon).toBe(true);
    expect(stateAtResolution.roundState?.voteResult?.impostorStoleVictory).toBe(false);
  });

  it('cuando finalJudgmentMode está desactivado (false), al descubrir al impostor va DIRECTO a RESOLUTION sin pasar por JUDGMENT', () => {
    const store = useGameStore.getState();
    store.resetGame();

    useGameStore.setState({
      settings: {
        ...baseSettings,
        finalJudgmentMode: false,
      },
      currentScreen: 'VOTING',
      roundState: {
        categoryName: 'Futbolistas',
        secretWord: 'Jude Bellingham',
        assignments: [
          { playerId: 'p1', playerName: 'Laura', isImpostor: true },
          { playerId: 'p2', playerName: 'Juanda', isImpostor: false },
          { playerId: 'p3', playerName: 'Carol', isImpostor: false },
        ],
        starterPlayerName: 'Juanda',
        rotationDirection: 'CLOCKWISE',
        chaosEventTriggered: null,
        voteResult: null,
        eliminatedPlayerIds: [],
        interimElimination: null,
        debateRemainingSeconds: null,
      },
    });

    // Group votes out Laura
    store.submitVote('p1');

    const state = useGameStore.getState();
    // Must bypass JUDGMENT completely and go straight to RESOLUTION
    expect(state.currentScreen).toBe('RESOLUTION');
    expect(state.roundState?.voteResult?.innocentsWon).toBe(true);
    expect(state.roundState?.voteResult?.wasImpostor).toBe(true);
    expect(state.roundState?.voteResult?.votedPlayerName).toBe('Laura');
  });

  it('toggleFinalJudgmentMode alterna correctamente el estado del Juicio Final', () => {
    const store = useGameStore.getState();
    useGameStore.setState({
      settings: {
        ...baseSettings,
        finalJudgmentMode: true,
      },
    });

    expect(useGameStore.getState().settings.finalJudgmentMode).toBe(true);
    store.toggleFinalJudgmentMode();
    expect(useGameStore.getState().settings.finalJudgmentMode).toBe(false);
    store.toggleFinalJudgmentMode();
    expect(useGameStore.getState().settings.finalJudgmentMode).toBe(true);
  });
});

