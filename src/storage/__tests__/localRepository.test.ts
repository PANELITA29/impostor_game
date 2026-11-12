// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadPersistedData,
  saveCustomCategories,
  saveGameSettings,
  saveMutePreference,
  saveUsedWordsHistory,
  savePreferences,
  resetAllData,
  STORAGE_KEY_V1,
} from '../localRepository';
import type { Category, GameSettings } from '../../types/game';

describe('localRepository', () => {
  beforeEach(() => {
    resetAllData();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('guarda y recupera íntegramente las categorías personalizadas válidas', () => {
    const customCats: Category[] = [
      {
        id: 'cat-friends',
        name: 'Amigos del Barrio',
        isCustom: true,
        words: ['Lucas', 'Matias', 'Santiago', 'Nicolas'],
      },
    ];

    saveCustomCategories(customCats);
    const loaded = loadPersistedData();

    expect(loaded.customCategories.length).toBe(1);
    expect(loaded.customCategories[0].name).toBe('Amigos del Barrio');
    expect(loaded.customCategories[0].words).toEqual(['Lucas', 'Matias', 'Santiago', 'Nicolas']);
    expect(loaded.customCategories[0].isCustom).toBe(true);
  });

  it('ignora categorías personalizadas con menos de 3 palabras al sanitizar', () => {
    const invalidCat: any = {
      id: 'cat-too-short',
      name: 'Muy corta',
      isCustom: true,
      words: ['Uno', 'Dos'],
    };

    saveCustomCategories([invalidCat]);
    const loaded = loadPersistedData();
    expect(loaded.customCategories.length).toBe(0);
  });

  it('guarda y recupera jugadores y ajustes del juego respetando límites', () => {
    const testSettings: GameSettings = {
      players: [
        { id: 'p1', name: 'Batman' },
        { id: 'p2', name: 'Robin' },
        { id: 'p3', name: 'Joker' },
        { id: 'p4', name: 'Alfred' },
      ],
      impostorCount: 1,
      chaosMode: true,
      roundDuration: 300,
      selectedCategoryIds: ['cat-movies-series', 'cat-video-games'],
    };

    saveGameSettings(testSettings);
    const loaded = loadPersistedData();

    expect(loaded.players.length).toBe(4);
    expect(loaded.players[0].name).toBe('Batman');
    expect(loaded.settings.chaosMode).toBe(true);
    expect(loaded.settings.roundDuration).toBe(300);
    expect(loaded.settings.selectedCategoryIds).toEqual(['cat-movies-series', 'cat-video-games']);
  });

  it('guarda la preferencia de sonido (mute)', () => {
    saveMutePreference(true);
    let loaded = loadPersistedData();
    expect(loaded.isMuted).toBe(true);

    saveMutePreference(false);
    loaded = loadPersistedData();
    expect(loaded.isMuted).toBe(false);
  });

  it('acota el historial de palabras usadas a un máximo de 500 registros', () => {
    const largeHistory = Array.from({ length: 600 }, (_, i) => `palabra_${i}`);
    saveUsedWordsHistory(largeHistory);

    const loaded = loadPersistedData();
    expect(loaded.usedWordsHistory.length).toBe(500);
    expect(loaded.usedWordsHistory[499]).toBe('palabra_599');
  });

  it('si localStorage contiene JSON corrupto o malformado, retorna el estado seguro por defecto sin romper la app', () => {
    window.localStorage.setItem(STORAGE_KEY_V1, '{ corrupt-json ::: broken !!!');

    expect(() => {
      const loaded = loadPersistedData();
      expect(loaded.version).toBe(1);
      expect(loaded.players.length).toBe(3);
      expect(loaded.customCategories).toEqual([]);
    }).not.toThrow();
  });

  it('si localStorage.setItem lanza QuotaExceededError, degrada a memoria RAM sin lanzar excepciones', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });

    expect(() => {
      saveMutePreference(true);
    }).not.toThrow();

    // Fallback in RAM still holds updated data
    const loaded = loadPersistedData();
    expect(loaded.isMuted).toBe(true);
  });

  it('guarda y recupera preferencias de usuario (tema, idioma, volúmenes)', () => {
    savePreferences({
      theme: 'cyberpunk',
      language: 'en',
      sfxVolume: 0.9,
      musicVolume: 0.3,
      haptics: false,
      wakeLockEnabled: true,
    });

    const loaded = loadPersistedData();
    expect(loaded.preferences.theme).toBe('cyberpunk');
    expect(loaded.preferences.language).toBe('en');
    expect(loaded.preferences.sfxVolume).toBe(0.9);
    expect(loaded.preferences.musicVolume).toBe(0.3);
    expect(loaded.preferences.haptics).toBe(false);
  });
});

