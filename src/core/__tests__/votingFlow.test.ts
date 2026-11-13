import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/useGameStore';
import type { GameSettings } from '../../types/game';

describe('Voting Flow & Multi-Impostor Dynamics', () => {
  const multiImpostorSettings: GameSettings = {
    players: [
      { id: 'p1', name: 'Laura' },
      { id: 'p2', name: 'Arenas' },
      { id: 'p3', name: 'Juanda' },
      { id: 'p4', name: 'Carol' },
      { id: 'p5', name: 'Juanse' },
      { id: 'p6', name: 'Santiago' },
    ],
    impostorCount: 2,
    chaosMode: false,
    finalJudgmentMode: true,
    roundDuration: 120,
    selectedCategoryIds: ['cat-movies-series'],
  };

  beforeEach(() => {
    const store = useGameStore.getState();
    store.resetGame();
  });

  it('en partida con 2 impostores, al expulsar al primer impostor la ronda NO termina ni revela la palabra secreta', () => {
    const store = useGameStore.getState();

    // Mock an active round with 2 impostors: p1 (Laura) and p2 (Arenas)
    useGameStore.setState({
      settings: multiImpostorSettings,
      currentScreen: 'VOTING',
      roundState: {
        categoryName: 'Futbolistas',
        secretWord: 'Jude Bellingham',
        assignments: [
          { playerId: 'p1', playerName: 'Laura', isImpostor: true },
          { playerId: 'p2', playerName: 'Arenas', isImpostor: true },
          { playerId: 'p3', playerName: 'Juanda', isImpostor: false },
          { playerId: 'p4', playerName: 'Carol', isImpostor: false },
          { playerId: 'p5', playerName: 'Juanse', isImpostor: false },
          { playerId: 'p6', playerName: 'Santiago', isImpostor: false },
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

    // Vote out Laura (p1)
    store.submitVote('p1');

    const stateAfterVote1 = useGameStore.getState();

    // 1. Must NOT go to RESOLUTION
    expect(stateAfterVote1.currentScreen).toBe('VOTING');

    // 2. Must register interim elimination
    expect(stateAfterVote1.roundState?.interimElimination).not.toBeNull();
    expect(stateAfterVote1.roundState?.interimElimination?.wasImpostor).toBe(true);
    expect(stateAfterVote1.roundState?.interimElimination?.votedPlayerName).toBe('Laura');
    expect(stateAfterVote1.roundState?.interimElimination?.remainingImpostorCount).toBe(1);

    // 3. Must record Laura as eliminated
    expect(stateAfterVote1.roundState?.eliminatedPlayerIds).toContain('p1');

    // 4. Must NOT have final voteResult yet
    expect(stateAfterVote1.roundState?.voteResult).toBeNull();

    // 5. When resuming debate, clears interim elimination and restarts round
    store.resumeDebateAfterElimination();

    const stateAfterResume = useGameStore.getState();
    expect(stateAfterResume.currentScreen).toBe('ACTIVE_ROUND');
    expect(stateAfterResume.roundState?.interimElimination).toBeNull();
    expect(stateAfterResume.roundState?.debateRemainingSeconds).toBeNull(); // clean full duration restart

    // 6. Next round: Now players vote out the second impostor Arenas (p2)
    useGameStore.setState({ currentScreen: 'VOTING' });
    store.submitVote('p2');

    const stateAfterVote2 = useGameStore.getState();

    // Now all impostors are caught -> Transitions to El Juicio Final!
    expect(stateAfterVote2.currentScreen).toBe('JUDGMENT');
    expect(stateAfterVote2.roundState?.eliminatedPlayerIds).toEqual(['p1', 'p2']);

    // Impostor surrenders or fails in Judgment
    store.surrenderImpostor();

    const stateAtResolution = useGameStore.getState();
    expect(stateAtResolution.currentScreen).toBe('RESOLUTION');
    expect(stateAtResolution.roundState?.voteResult?.innocentsWon).toBe(true);
    expect(stateAtResolution.roundState?.voteResult?.wasImpostor).toBe(true);
  });

  it('exitGameToLobby cancela la ronda activa y regresa de forma segura al LOBBY', () => {
    const store = useGameStore.getState();
    store.resetGame();

    // Iniciar ronda activa
    useGameStore.setState({
      settings: multiImpostorSettings,
      currentScreen: 'ACTIVE_ROUND',
      roundState: {
        categoryName: 'Películas y Series',
        secretWord: 'Inception',
        assignments: [
          { playerId: 'p1', playerName: 'Laura', isImpostor: true },
          { playerId: 'p2', playerName: 'Arenas', isImpostor: false },
          { playerId: 'p3', playerName: 'Juanda', isImpostor: false },
        ],
        starterPlayerName: 'Laura',
        rotationDirection: 'CLOCKWISE',
        chaosEventTriggered: null,
        voteResult: null,
        eliminatedPlayerIds: [],
        interimElimination: null,
        debateRemainingSeconds: 90,
      },
    });

    expect(useGameStore.getState().currentScreen).toBe('ACTIVE_ROUND');
    expect(useGameStore.getState().roundState).not.toBeNull();

    // El usuario confirma salir de la partida
    store.exitGameToLobby();

    const stateAfterExit = useGameStore.getState();
    expect(stateAfterExit.currentScreen).toBe('LOBBY');
    expect(stateAfterExit.roundState).toBeNull();
  });
});

