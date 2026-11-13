import { create } from 'zustand';
import type {
  ScreenId,
  RoundDuration,
  Player,
  Category,
  GameSettings,
  RoundState,
  VoteResult,
  InterimElimination,
  UserPreferences,
} from '../types/game';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { generateRound } from '../core/gameEngine';
import {
  loadPersistedData,
  saveCustomCategories,
  saveGameSettings,
  saveMutePreference,
  saveUsedWordsHistory,
  savePreferences,
  resetAllData,
} from '../storage/localRepository';
import { audioManager } from '../audio/audioManager';
import { isWordMatch } from '../utils/textMatching';

interface GameStoreState {
  currentScreen: ScreenId;
  isMuted: boolean;
  preferences: UserPreferences;
  settings: GameSettings;
  categories: Category[];
  usedWordsHistory: string[];
  roundState: RoundState | null;
  errorMessage: string | null;

  // Actions
  setScreen: (screen: ScreenId) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  clearHistory: () => void;
  resetAllToDefaults: () => void;
  clearError: () => void;

  // Settings & Players
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  setImpostorCount: (count: number) => void;
  toggleChaosMode: () => void;
  toggleFinalJudgmentMode: () => void;
  setRoundDuration: (duration: RoundDuration) => void;
  toggleCategorySelection: (categoryId: string) => void;

  // Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, categoryData: Partial<Omit<Category, 'id'>>) => void;
  removeCategory: (id: string) => void;
  selectAllCategories: () => void;
  deselectAllCategories: () => void;

  // Round flow with Game Engine
  startRound: () => boolean;
  endRound: () => void;
  submitVote: (votedPlayerId: string) => void;
  submitImpostorGuess: (guess: string) => void;
  surrenderImpostor: () => void;
  resumeDebateAfterElimination: () => void;
  setDebateRemainingSeconds: (seconds: number | null) => void;
  exitGameToLobby: () => void;
  resetGame: () => void;
}

// Hydrate state from local storage and default categories
const persisted = loadPersistedData();
audioManager.setMuted(persisted.isMuted);
audioManager.setSfxVolume(persisted.preferences.sfxVolume);
audioManager.setMusicVolume(persisted.preferences.musicVolume);

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', persisted.preferences.theme);
}

const allInitialCategories: Category[] = [
  ...DEFAULT_CATEGORIES,
  ...persisted.customCategories,
];

// Pre-select all categories if list is empty
const initialSelectedIds =
  persisted.settings.selectedCategoryIds.length > 0
    ? persisted.settings.selectedCategoryIds
    : allInitialCategories.map((c) => c.id);

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentScreen: 'HOME',
  isMuted: persisted.isMuted,
  preferences: persisted.preferences,
  settings: {
    players: persisted.players,
    impostorCount: persisted.settings.impostorCount,
    chaosMode: persisted.settings.chaosMode,
    finalJudgmentMode: persisted.settings.finalJudgmentMode !== false,
    roundDuration: persisted.settings.roundDuration,
    selectedCategoryIds: initialSelectedIds,
  },
  categories: allInitialCategories,
  usedWordsHistory: persisted.usedWordsHistory,
  roundState: null,
  errorMessage: null,

  setScreen: (screen) => {
    audioManager.playSfx('tap');
    set({ currentScreen: screen, errorMessage: null });
  },

  clearError: () => set({ errorMessage: null }),

  updatePreferences: (newPrefs) => {
    set((state) => {
      const merged: UserPreferences = { ...state.preferences, ...newPrefs };
      if (newPrefs.theme && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newPrefs.theme);
      }
      if (typeof newPrefs.sfxVolume === 'number') {
        audioManager.setSfxVolume(newPrefs.sfxVolume);
      }
      if (typeof newPrefs.musicVolume === 'number') {
        audioManager.setMusicVolume(newPrefs.musicVolume);
      }
      savePreferences(merged);
      return { preferences: merged };
    });
  },

  clearHistory: () => {
    audioManager.playSfx('tap');
    saveUsedWordsHistory([]);
    set({ usedWordsHistory: [] });
  },

  resetAllToDefaults: () => {
    resetAllData();
    const fresh = loadPersistedData();
    audioManager.setMuted(fresh.isMuted);
    audioManager.setSfxVolume(fresh.preferences.sfxVolume);
    audioManager.setMusicVolume(fresh.preferences.musicVolume);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', fresh.preferences.theme);
    }
    set({
      currentScreen: 'HOME',
      isMuted: fresh.isMuted,
      preferences: fresh.preferences,
      settings: {
        players: fresh.players,
        impostorCount: fresh.settings.impostorCount,
        chaosMode: fresh.settings.chaosMode,
        finalJudgmentMode: fresh.settings.finalJudgmentMode !== false,
        roundDuration: fresh.settings.roundDuration,
        selectedCategoryIds: fresh.settings.selectedCategoryIds,
      },
      categories: [...DEFAULT_CATEGORIES],
      usedWordsHistory: [],
      roundState: null,
      errorMessage: null,
    });
  },

  toggleMute: () =>
    set((state) => {
      const nextMuted = !state.isMuted;
      audioManager.setMuted(nextMuted);
      saveMutePreference(nextMuted);
      return { isMuted: nextMuted };
    }),

  setMuted: (isMuted) => {
    audioManager.setMuted(isMuted);
    saveMutePreference(isMuted);
    set({ isMuted });
  },

  addPlayer: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    audioManager.playSfx('tap');
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
    };
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        players: [...state.settings.players, newPlayer],
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  removePlayer: (id) => {
    audioManager.playSfx('tap');
    set((state) => {
      const remaining = state.settings.players.filter((p) => p.id !== id);
      const maxImpostors = Math.max(1, Math.floor((remaining.length - 1) / 2));
      const updatedSettings = {
        ...state.settings,
        players: remaining,
        impostorCount: Math.min(state.settings.impostorCount, maxImpostors),
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  updatePlayerName: (id, name) =>
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        players: state.settings.players.map((p) =>
          p.id === id ? { ...p, name: name.trim() || p.name } : p
        ),
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    }),

  setImpostorCount: (count) => {
    audioManager.playSfx('tap');
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        impostorCount: Math.max(1, count),
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  toggleChaosMode: () => {
    audioManager.playSfx('tap');
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        chaosMode: !state.settings.chaosMode,
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  toggleFinalJudgmentMode: () => {
    audioManager.playSfx('tap');
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        finalJudgmentMode: !state.settings.finalJudgmentMode,
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  setRoundDuration: (roundDuration) => {
    audioManager.playSfx('tap');
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        roundDuration,
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  toggleCategorySelection: (categoryId) => {
    audioManager.playSfx('tap');
    set((state) => {
      const current = state.settings.selectedCategoryIds;
      const exists = current.includes(categoryId);
      const updated = exists
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId];

      const updatedSettings = {
        ...state.settings,
        selectedCategoryIds: updated,
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings, errorMessage: null };
    });
  },

  addCategory: (categoryData) => {
    audioManager.playSfx('tap');
    const newCat: Category = {
      ...categoryData,
      id: `cat-custom-${Date.now()}`,
      isCustom: true,
    };
    set((state) => {
      const nextCategories = [...state.categories, newCat];
      const nextSelected = [...state.settings.selectedCategoryIds, newCat.id];
      const updatedSettings = {
        ...state.settings,
        selectedCategoryIds: nextSelected,
      };
      saveCustomCategories(nextCategories.filter((c) => c.isCustom));
      saveGameSettings(updatedSettings);
      return {
        categories: nextCategories,
        settings: updatedSettings,
      };
    });
  },

  updateCategory: (id, categoryData) => {
    audioManager.playSfx('tap');
    set((state) => {
      const nextCategories = state.categories.map((c) =>
        c.id === id ? { ...c, ...categoryData } : c
      );
      saveCustomCategories(nextCategories.filter((c) => c.isCustom));
      return { categories: nextCategories };
    });
  },

  removeCategory: (id) => {
    audioManager.playSfx('tap');
    set((state) => {
      const nextCategories = state.categories.filter((c) => c.id !== id);
      const updatedSettings = {
        ...state.settings,
        selectedCategoryIds: state.settings.selectedCategoryIds.filter((cid) => cid !== id),
      };
      saveCustomCategories(nextCategories.filter((c) => c.isCustom));
      saveGameSettings(updatedSettings);
      return {
        categories: nextCategories,
        settings: updatedSettings,
      };
    });
  },

  selectAllCategories: () => {
    audioManager.playSfx('tap');
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        selectedCategoryIds: state.categories.map((c) => c.id),
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings, errorMessage: null };
    });
  },

  deselectAllCategories: () => {
    audioManager.playSfx('tap');
    set((state) => {
      const updatedSettings = {
        ...state.settings,
        selectedCategoryIds: [],
      };
      saveGameSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },

  startRound: () => {
    const { settings, categories, usedWordsHistory } = get();

    try {
      const generated = generateRound(settings, categories, usedWordsHistory);

      saveUsedWordsHistory(generated.updatedWordsHistory);
      audioManager.playSfx('tap');

      set({
        roundState: generated.roundState,
        usedWordsHistory: generated.updatedWordsHistory,
        currentScreen: 'PASS_AND_PLAY',
        errorMessage: null,
      });
      return true;
    } catch (err: any) {
      set({
        errorMessage: err?.message || 'Error al generar la ronda. Verifica los ajustes.',
      });
      return false;
    }
  },

  endRound: () => {
    audioManager.stopAmbientMusic();
    audioManager.playSfx('tap');
    set({ currentScreen: 'RESOLUTION' });
  },

  setDebateRemainingSeconds: (seconds) => {
    const { roundState } = get();
    if (!roundState) return;
    set({
      roundState: {
        ...roundState,
        debateRemainingSeconds: seconds,
      },
    });
  },

  resumeDebateAfterElimination: () => {
    const { roundState } = get();
    if (!roundState) return;

    audioManager.playSfx('tap');
    set({
      roundState: {
        ...roundState,
        interimElimination: null,
        debateRemainingSeconds: null, // Reset to fresh full timer
      },
      currentScreen: 'ACTIVE_ROUND',
    });
  },

  submitVote: (votedPlayerId: string) => {
    const { roundState, settings } = get();
    if (!roundState) return;

    audioManager.stopAmbientMusic();

    const votedAssignment = roundState.assignments.find((a) => a.playerId === votedPlayerId);
    const wasImpostor = !!votedAssignment?.isImpostor;

    const currentEliminated = roundState.eliminatedPlayerIds || [];
    const nextEliminated = [...currentEliminated, votedPlayerId];

    // Compute remaining active players
    const activeAssignments = roundState.assignments.filter(
      (a) => !nextEliminated.includes(a.playerId)
    );
    const remainingImpostors = activeAssignments.filter((a) => a.isImpostor);
    const remainingInnocents = activeAssignments.filter((a) => !a.isImpostor);

    if (wasImpostor) {
      if (remainingImpostors.length === 0) {
        // ALL impostors caught!
        const voteResult: VoteResult = {
          votedPlayerId,
          votedPlayerName: votedAssignment?.playerName || 'Jugador',
          wasImpostor: true,
          innocentsWon: true,
        };

        if (settings.finalJudgmentMode !== false) {
          // Enter the Judgment Phase ("El Juicio Final")
          set({
            roundState: {
              ...roundState,
              eliminatedPlayerIds: nextEliminated,
              voteResult,
              interimElimination: null,
            },
            currentScreen: 'JUDGMENT',
          });
        } else {
          // Final Judgment is disabled -> Innocents win directly!
          audioManager.playSfx('reveal');
          set({
            roundState: {
              ...roundState,
              eliminatedPlayerIds: nextEliminated,
              voteResult,
              interimElimination: null,
            },
            currentScreen: 'RESOLUTION',
          });
        }
      } else {
        // Impostor caught, BUT others remain! The game continues!
        const interimElimination: InterimElimination = {
          votedPlayerId,
          votedPlayerName: votedAssignment?.playerName || 'Jugador',
          wasImpostor: true,
          remainingImpostorCount: remainingImpostors.length,
          remainingInnocentCount: remainingInnocents.length,
        };

        set({
          roundState: {
            ...roundState,
            eliminatedPlayerIds: nextEliminated,
            interimElimination,
            voteResult: null,
          },
        });
      }
    } else {
      // An innocent was voted out!
      // In 1-impostor games or if remaining innocents <= remaining impostors -> Impostors win!
      if (settings.impostorCount === 1 || remainingInnocents.length <= remainingImpostors.length) {
        const voteResult: VoteResult = {
          votedPlayerId,
          votedPlayerName: votedAssignment?.playerName || 'Jugador',
          wasImpostor: false,
          innocentsWon: false,
        };

        set({
          roundState: {
            ...roundState,
            eliminatedPlayerIds: nextEliminated,
            voteResult,
            interimElimination: null,
          },
          currentScreen: 'RESOLUTION',
        });
      } else {
        // Innocent eliminated, but innocents still outnumber impostors -> Game continues!
        const interimElimination: InterimElimination = {
          votedPlayerId,
          votedPlayerName: votedAssignment?.playerName || 'Jugador',
          wasImpostor: false,
          remainingImpostorCount: remainingImpostors.length,
          remainingInnocentCount: remainingInnocents.length,
        };

        set({
          roundState: {
            ...roundState,
            eliminatedPlayerIds: nextEliminated,
            interimElimination,
            voteResult: null,
          },
        });
      }
    }
  },

  submitImpostorGuess: (guess: string) => {
    const { roundState } = get();
    if (!roundState) return;

    audioManager.stopAmbientMusic();
    const secretWord = roundState.secretWord;
    const isCorrect = isWordMatch(guess, secretWord);

    if (isCorrect) {
      // Impostor successfully guessed and stole the victory!
      audioManager.playSfx('reveal');
      const voteResult: VoteResult = {
        votedPlayerId: roundState.voteResult?.votedPlayerId || '',
        votedPlayerName: roundState.voteResult?.votedPlayerName || 'Impostor',
        wasImpostor: true,
        innocentsWon: false,
        impostorStoleVictory: true,
        impostorGuess: guess.trim(),
      };

      set({
        roundState: {
          ...roundState,
          voteResult,
        },
        currentScreen: 'RESOLUTION',
      });
    } else {
      // Impostor guessed wrong! Innocents win decisively!
      const voteResult: VoteResult = {
        votedPlayerId: roundState.voteResult?.votedPlayerId || '',
        votedPlayerName: roundState.voteResult?.votedPlayerName || 'Impostor',
        wasImpostor: true,
        innocentsWon: true,
        impostorStoleVictory: false,
        impostorGuess: guess.trim(),
      };

      set({
        roundState: {
          ...roundState,
          voteResult,
        },
        currentScreen: 'RESOLUTION',
      });
    }
  },

  surrenderImpostor: () => {
    const { roundState } = get();
    if (!roundState) return;

    audioManager.playSfx('tap');
    const voteResult: VoteResult = {
      votedPlayerId: roundState.voteResult?.votedPlayerId || '',
      votedPlayerName: roundState.voteResult?.votedPlayerName || 'Impostor',
      wasImpostor: true,
      innocentsWon: true,
      impostorStoleVictory: false,
    };

    set({
      roundState: {
        ...roundState,
        voteResult,
      },
      currentScreen: 'RESOLUTION',
    });
  },

  exitGameToLobby: () => {
    audioManager.stopAmbientMusic();
    audioManager.playSfx('tap');
    set({
      roundState: null,
      currentScreen: 'LOBBY',
      errorMessage: null,
    });
  },

  resetGame: () => {
    audioManager.stopAmbientMusic();
    audioManager.playSfx('tap');
    set({
      roundState: null,
      currentScreen: 'HOME',
      errorMessage: null,
    });
  },
}));
