import { describe, it, expect } from 'vitest';
import { DEFAULT_CATEGORIES } from '../../data/defaultCategories';
import { selectNextWord } from '../wordSelector';
import type { Category } from '../../types/game';

describe('wordSelector & defaultCategories', () => {
  it('todas las categorías predeterminadas tienen al menos 25 palabras únicas y no vacías', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(10);

    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.words.length).toBeGreaterThanOrEqual(25);

      const normalizedWords = cat.words.map((w) => w.trim().toLowerCase());
      const uniqueWords = new Set(normalizedWords);

      // Verify no duplicates
      expect(uniqueWords.size).toBe(cat.words.length);

      // Verify no empty entries
      for (const word of cat.words) {
        expect(word.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('no repite ninguna palabra dentro de un mismo ciclo completo de selección', () => {
    const testCat: Category = {
      id: 'test-cat',
      name: 'Categoría Test',
      isCustom: true,
      words: ['Palabra 1', 'Palabra 2', 'Palabra 3', 'Palabra 4', 'Palabra 5'],
    };

    let history: string[] = [];
    const extractedWords = new Set<string>();

    for (let i = 0; i < testCat.words.length; i++) {
      const result = selectNextWord([testCat], [testCat.id], history);

      expect(extractedWords.has(result.secretWord.toLowerCase())).toBe(false);
      expect(result.cycleReset).toBe(false);
      expect(result.categoryName).toBe(testCat.name);

      extractedWords.add(result.secretWord.toLowerCase());
      history = result.updatedHistory;
    }

    expect(extractedWords.size).toBe(testCat.words.length);
  });

  it('se reinicia automáticamente sin fallar en la selección N+1 cuando se agota el mazo', () => {
    const testCat: Category = {
      id: 'test-small',
      name: 'Categoría Reducida',
      isCustom: true,
      words: ['Alfa', 'Beta', 'Gamma'],
    };

    let history: string[] = [];

    // Extract all 3 words
    for (let i = 0; i < 3; i++) {
      const res = selectNextWord([testCat], [testCat.id], history);
      history = res.updatedHistory;
    }

    // 4th extraction must trigger cycleReset
    const resetResult = selectNextWord([testCat], [testCat.id], history);
    expect(resetResult.cycleReset).toBe(true);
    expect(['Alfa', 'Beta', 'Gamma']).toContain(resetResult.secretWord);
    expect(resetResult.updatedHistory.length).toBe(1);
  });

  it('distribuye y selecciona correctamente entre múltiples categorías activas simultáneamente', () => {
    const catA: Category = {
      id: 'cat-a',
      name: 'Cat A',
      isCustom: true,
      words: ['A1', 'A2', 'A3'],
    };
    const catB: Category = {
      id: 'cat-b',
      name: 'Cat B',
      isCustom: true,
      words: ['B1', 'B2', 'B3'],
    };

    let history: string[] = [];
    const selectedWords: string[] = [];

    // Total 6 words
    for (let i = 0; i < 6; i++) {
      const res = selectNextWord([catA, catB], [catA.id, catB.id], history);
      expect(selectedWords).not.toContain(res.secretWord);
      selectedWords.push(res.secretWord);
      history = res.updatedHistory;
    }

    expect(selectedWords.length).toBe(6);
  });

  it('lanza un error descriptivo si no hay categorías válidas o activas seleccionadas', () => {
    expect(() => {
      selectNextWord([], [], []);
    }).toThrow('No hay categorías activas');

    const emptyCat: Category = {
      id: 'empty',
      name: 'Vacía',
      isCustom: true,
      words: [],
    };

    expect(() => {
      selectNextWord([emptyCat], [emptyCat.id], []);
    }).toThrow('No hay categorías activas');
  });
});
