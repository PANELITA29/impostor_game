import type { Player, Category, RoundDuration, GameSettings, UserPreferences, GameTheme, GameLanguage } from '../types/game';

export const STORAGE_KEY_V1 = 'impostor_party_state_v1';
const MAX_HISTORY_ITEMS = 500;

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'midnight',
  language: 'es',
  sfxVolume: 0.8,
  musicVolume: 0.5,
  haptics: true,
  wakeLockEnabled: true,
};

export interface PersistedStorageSchema {
  version: 1;
  customCategories: Category[];
  players: Player[];
  settings: {
    impostorCount: number;
    chaosMode: boolean;
    roundDuration: RoundDuration;
    selectedCategoryIds: string[];
  };
  isMuted: boolean;
  usedWordsHistory: string[];
  preferences: UserPreferences;
}

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'Jugador 1' },
  { id: 'p2', name: 'Jugador 2' },
  { id: 'p3', name: 'Jugador 3' },
];

const DEFAULT_PERSISTED_STATE: PersistedStorageSchema = {
  version: 1,
  customCategories: [],
  players: DEFAULT_PLAYERS,
  settings: {
    impostorCount: 1,
    chaosMode: false,
    roundDuration: 180,
    selectedCategoryIds: ['cat-movies-series', 'cat-video-games', 'cat-food-drinks'],
  },
  isMuted: false,
  usedWordsHistory: [],
  preferences: DEFAULT_PREFERENCES,
};

// In-memory fallback for Incognito mode or QuotaExceededError
let memoryFallbackStore: PersistedStorageSchema = { ...DEFAULT_PERSISTED_STATE };
let isLocalStorageAvailable = true;

/**
 * Checks whether localStorage is safely readable and writable.
 */
function testStorageAvailability(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    const testKey = '__storage_probe__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

isLocalStorageAvailable = testStorageAvailability();

/**
 * Validates and sanitizes a list of players.
 * Guarantees between 3 and 15 players with valid strings and unique IDs.
 */
function sanitizePlayers(rawPlayers: unknown): Player[] {
  if (!Array.isArray(rawPlayers)) {
    return [...DEFAULT_PLAYERS];
  }

  const validPlayers: Player[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < rawPlayers.length; i++) {
    const item = rawPlayers[i];
    if (typeof item === 'object' && item !== null) {
      const id = typeof (item as any).id === 'string' && (item as any).id.trim()
        ? (item as any).id.trim()
        : `p-${i + 1}`;
      const name = typeof (item as any).name === 'string' && (item as any).name.trim()
        ? (item as any).name.trim().slice(0, 30)
        : `Jugador ${i + 1}`;

      const finalId = seenIds.has(id) ? `p-${Date.now()}-${i}` : id;
      seenIds.add(finalId);
      validPlayers.push({ id: finalId, name });
    }
    if (validPlayers.length >= 15) break;
  }

  // Ensure minimum 3 players
  while (validPlayers.length < 3) {
    const nextIdx = validPlayers.length + 1;
    validPlayers.push({ id: `p-${nextIdx}`, name: `Jugador ${nextIdx}` });
  }

  return validPlayers;
}

/**
 * Validates and sanitizes user custom categories.
 * Enforces: id, non-empty name, isCustom: true, and at least 3 clean words.
 */
function sanitizeCustomCategories(rawCategories: unknown): Category[] {
  if (!Array.isArray(rawCategories)) {
    return [];
  }

  const validCategories: Category[] = [];

  for (const item of rawCategories) {
    if (typeof item === 'object' && item !== null) {
      const id = typeof (item as any).id === 'string' ? (item as any).id.trim() : '';
      const name = typeof (item as any).name === 'string' ? (item as any).name.trim().slice(0, 40) : '';

      if (!id || !name) continue;

      const rawWords = Array.isArray((item as any).words) ? (item as any).words : [];
      const cleanWords: string[] = [];
      const seenWords = new Set<string>();

      for (const w of rawWords) {
        if (typeof w === 'string') {
          const trimmed = w.trim();
          const lower = trimmed.toLowerCase();
          if (trimmed.length > 0 && !seenWords.has(lower)) {
            seenWords.add(lower);
            cleanWords.push(trimmed.slice(0, 40));
          }
        }
      }

      // Minimum 3 words required
      if (cleanWords.length >= 3) {
        validCategories.push({
          id,
          name,
          words: cleanWords,
          isCustom: true,
        });
      }
    }
  }

  return validCategories;
}

/**
 * Sanitizes round duration to allowed values.
 */
function sanitizeDuration(raw: unknown): RoundDuration {
  const allowed = [60, 120, 180, 300, null];
  if (allowed.includes(raw as any)) {
    return raw as RoundDuration;
  }
  return 180;
}

/**
 * Reads and verifies persisted state from storage with fallback.
 */
export function loadPersistedData(): PersistedStorageSchema {
  if (!isLocalStorageAvailable) {
    return { ...memoryFallbackStore };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) {
      return { ...DEFAULT_PERSISTED_STATE };
    }

    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { ...DEFAULT_PERSISTED_STATE };
    }

    const players = sanitizePlayers(parsed.players);
    const customCategories = sanitizeCustomCategories(parsed.customCategories);

    const impostorCount = typeof parsed.settings?.impostorCount === 'number'
      ? Math.max(1, Math.min(parsed.settings.impostorCount, Math.max(1, Math.floor((players.length - 1) / 2))))
      : 1;

    const chaosMode = Boolean(parsed.settings?.chaosMode);
    const roundDuration = sanitizeDuration(parsed.settings?.roundDuration);

    const selectedCategoryIds = Array.isArray(parsed.settings?.selectedCategoryIds)
      ? (parsed.settings.selectedCategoryIds as string[]).filter((id) => typeof id === 'string')
      : ['cat-movies-series', 'cat-video-games', 'cat-food-drinks'];

    const isMuted = Boolean(parsed.isMuted);

    const usedWordsHistory = Array.isArray(parsed.usedWordsHistory)
      ? (parsed.usedWordsHistory as string[])
          .filter((w) => typeof w === 'string')
          .slice(-MAX_HISTORY_ITEMS)
      : [];

    // Sanitize user preferences
    const validThemes: GameTheme[] = ['midnight', 'cyberpunk', 'crimson', 'amethyst'];
    const validLanguages: GameLanguage[] = ['es', 'en'];

    const rawPrefs = parsed.preferences || {};
    const preferences: UserPreferences = {
      theme: validThemes.includes(rawPrefs.theme) ? rawPrefs.theme : DEFAULT_PREFERENCES.theme,
      language: validLanguages.includes(rawPrefs.language) ? rawPrefs.language : DEFAULT_PREFERENCES.language,
      sfxVolume: typeof rawPrefs.sfxVolume === 'number' ? Math.max(0, Math.min(1, rawPrefs.sfxVolume)) : DEFAULT_PREFERENCES.sfxVolume,
      musicVolume: typeof rawPrefs.musicVolume === 'number' ? Math.max(0, Math.min(1, rawPrefs.musicVolume)) : DEFAULT_PREFERENCES.musicVolume,
      haptics: typeof rawPrefs.haptics === 'boolean' ? rawPrefs.haptics : DEFAULT_PREFERENCES.haptics,
      wakeLockEnabled: typeof rawPrefs.wakeLockEnabled === 'boolean' ? rawPrefs.wakeLockEnabled : DEFAULT_PREFERENCES.wakeLockEnabled,
    };

    const sanitizedData: PersistedStorageSchema = {
      version: 1,
      customCategories,
      players,
      settings: {
        impostorCount,
        chaosMode,
        roundDuration,
        selectedCategoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : ['cat-movies-series'],
      },
      isMuted,
      usedWordsHistory,
      preferences,
    };

    memoryFallbackStore = { ...sanitizedData };
    return sanitizedData;
  } catch (err) {
    console.warn('[Storage] Error al leer localStorage. Restaurando configuración por defecto.', err);
    return { ...DEFAULT_PERSISTED_STATE };
  }
}

/**
 * Writes data securely with QuotaExceeded / Private browsing fallback.
 */
function writeToStorage(updater: (current: PersistedStorageSchema) => PersistedStorageSchema): void {
  const current = loadPersistedData();
  const updated = updater(current);
  memoryFallbackStore = { ...updated };

  if (!isLocalStorageAvailable) return;

  try {
    window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(updated));
  } catch (err) {
    // If setItem fails (e.g. QuotaExceededError or private browsing restrictions),
    // mark localStorage as unavailable so subsequent reads pull from memoryFallbackStore directly
    isLocalStorageAvailable = false;
    console.warn('[Storage] Fallo al escribir en localStorage (¿Modo incógnito o almacenamiento lleno?). Guardando en memoria RAM.', err);
  }
}

/**
 * Persists the user's custom categories list.
 */
export function saveCustomCategories(categories: Category[]): void {
  const sanitized = sanitizeCustomCategories(categories);
  writeToStorage((curr) => ({
    ...curr,
    customCategories: sanitized,
  }));
}

/**
 * Persists the game settings and players.
 */
export function saveGameSettings(settings: GameSettings): void {
  const sanitizedPlayers = sanitizePlayers(settings.players);
  const maxImpostors = Math.max(1, Math.floor((sanitizedPlayers.length - 1) / 2));
  const safeImpostorCount = Math.max(1, Math.min(settings.impostorCount, maxImpostors));

  writeToStorage((curr) => ({
    ...curr,
    players: sanitizedPlayers,
    settings: {
      impostorCount: safeImpostorCount,
      chaosMode: Boolean(settings.chaosMode),
      roundDuration: sanitizeDuration(settings.roundDuration),
      selectedCategoryIds: settings.selectedCategoryIds.filter((id) => typeof id === 'string'),
    },
  }));
}

/**
 * Persists sound mute preference.
 */
export function saveMutePreference(isMuted: boolean): void {
  writeToStorage((curr) => ({
    ...curr,
    isMuted: Boolean(isMuted),
  }));
}

/**
 * Persists used words history, capped at MAX_HISTORY_ITEMS.
 */
export function saveUsedWordsHistory(history: string[]): void {
  const safeHistory = history.filter((w) => typeof w === 'string').slice(-MAX_HISTORY_ITEMS);
  writeToStorage((curr) => ({
    ...curr,
    usedWordsHistory: safeHistory,
  }));
}

/**
 * Persists user preferences (theme, language, audio levels, haptics, wake lock).
 */
export function savePreferences(preferences: UserPreferences): void {
  writeToStorage((curr) => ({
    ...curr,
    preferences: { ...preferences },
  }));
}

/**
 * Resets all saved data back to factory defaults.
 */
export function resetAllData(): void {
  memoryFallbackStore = { ...DEFAULT_PERSISTED_STATE };
  if (isLocalStorageAvailable) {
    try {
      window.localStorage.removeItem(STORAGE_KEY_V1);
    } catch (err) {
      console.warn('[Storage] Error al limpiar localStorage', err);
    }
  }
}

