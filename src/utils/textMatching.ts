/**
 * Normalizes text for lenient comparison:
 * - Lowercases
 * - Strips accents/diacritics (á -> a, ñ -> n, etc.)
 * - Strips punctuation and symbols
 * - Collapses extra whitespace
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Standard Levenshtein Distance implementation for typo tolerance.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Evaluates whether an impostor's guess accurately identifies the secret word.
 *
 * Rules:
 * 1. Normalized exact match (ignores accents, case, punctuation).
 * 2. Spaceless match (e.g. "Star Wars" matches "starwars").
 * 3. Typo tolerance via Levenshtein distance (1 typo for medium words, 2 for long words).
 * 4. Multi-word containment: If the secret word is multi-part (e.g. "Jude Bellingham", "Harry Potter"),
 *    guessing the distinctive name (e.g. "Bellingham", "Potter") with length >= 4 counts as correct.
 */
export function isWordMatch(rawGuess: string, rawSecretWord: string): boolean {
  const guess = normalizeText(rawGuess);
  const secret = normalizeText(rawSecretWord);

  if (!guess || !secret) return false;

  // 1. Direct normalized match
  if (guess === secret) return true;

  // 2. Compact match (no spaces)
  const compactGuess = guess.replace(/\s+/g, '');
  const compactSecret = secret.replace(/\s+/g, '');
  if (compactGuess === compactSecret) return true;

  // 3. Typo tolerance based on length
  const maxTolerance = secret.length <= 4 ? 0 : secret.length <= 8 ? 1 : 2;
  if (levenshteinDistance(guess, secret) <= maxTolerance) {
    return true;
  }
  if (levenshteinDistance(compactGuess, compactSecret) <= maxTolerance) {
    return true;
  }

  // 4. Multi-word target matching:
  // If target has multiple words (e.g. "Jude Bellingham"), check if guess matches any word with len >= 4
  const secretTokens = secret.split(' ').filter((t) => t.length >= 4);
  for (const token of secretTokens) {
    if (guess === token) return true;
    if (token.length >= 6 && levenshteinDistance(guess, token) <= 1) {
      return true;
    }
  }

  return false;
}

