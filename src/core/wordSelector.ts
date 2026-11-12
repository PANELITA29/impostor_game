import type { Category } from '../types/game';
import { getRandomInt, shuffleArray } from './random';

export interface WordSelectionResult {
  categoryName: string;
  secretWord: string;
  updatedHistory: string[];
  cycleReset: boolean;
}

interface AvailableWordItem {
  categoryName: string;
  word: string;
  normalized: string;
}

/**
 * Normalizes a word string for collision-free comparison in history.
 */
function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

/**
 * Selects a random word from the active selected categories ensuring:
 * 1. No repetition of words that already exist in `usedWordsHistory`.
 * 2. If all words in the selected categories have been used, it resets only the
 *    entries corresponding to the selected pool and starts a clean cycle.
 *
 * Pure function: Does not mutate arguments or depend on external browser/storage state.
 */
export function selectNextWord(
  categories: readonly Category[],
  selectedIds: readonly string[],
  usedWordsHistory: readonly string[]
): WordSelectionResult {
  // 1. Filter active categories that have at least one valid word
  const activeCategories = categories.filter(
    (c) => selectedIds.includes(c.id) && Array.isArray(c.words) && c.words.length > 0
  );

  if (activeCategories.length === 0) {
    throw new Error('No hay categorías activas o válidas para seleccionar una palabra.');
  }

  // 2. Build full pool of words from active categories
  const allAvailableItems: AvailableWordItem[] = [];
  const selectedCategoryWordsNormalized = new Set<string>();

  for (const cat of activeCategories) {
    for (const rawWord of cat.words) {
      const trimmed = rawWord.trim();
      if (!trimmed) continue;
      const normalized = normalizeWord(trimmed);
      selectedCategoryWordsNormalized.add(normalized);
      allAvailableItems.push({
        categoryName: cat.name,
        word: trimmed,
        normalized,
      });
    }
  }

  if (allAvailableItems.length === 0) {
    throw new Error('Las categorías seleccionadas no contienen palabras válidas.');
  }

  // 3. Find candidates not present in history
  const historySet = new Set(usedWordsHistory.map(normalizeWord));
  let candidates = allAvailableItems.filter((item) => !historySet.has(item.normalized));
  let cycleReset = false;
  let baseHistory = [...usedWordsHistory];

  // 4. If all words from the selected pool have been consumed, reset cycle for these categories
  if (candidates.length === 0) {
    cycleReset = true;
    // Remove only words belonging to currently active categories from history
    baseHistory = baseHistory.filter(
      (hWord) => !selectedCategoryWordsNormalized.has(normalizeWord(hWord))
    );
    // All pool items become candidates again
    candidates = [...allAvailableItems];
  }

  // 5. Select a random item using uniform shuffle
  const shuffledCandidates = shuffleArray(candidates);
  const selectedIndex = getRandomInt(shuffledCandidates.length);
  const picked = shuffledCandidates[selectedIndex];

  // 6. Append picked normalized word to history
  const updatedHistory = [...baseHistory, picked.normalized];

  return {
    categoryName: picked.categoryName,
    secretWord: picked.word,
    updatedHistory,
    cycleReset,
  };
}

