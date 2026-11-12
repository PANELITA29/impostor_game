/**
 * Randomization helpers using Fisher-Yates and crypto.getRandomValues when available,
 * falling back gracefully to Math.random() in non-secure or restricted environments.
 */

/**
 * Returns a cryptographically secure or pseudo-random integer in the range [0, max - 1].
 * @param max Upper bound (exclusive), must be > 0.
 */
export function getRandomInt(max: number): number {
  if (max <= 1) return 0;

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // Generate 32-bit random number with rejection sampling to eliminate modulo bias
    const array = new Uint32Array(1);
    const maxUint32 = 0xffffffff;
    const limit = maxUint32 - (maxUint32 % max);

    let randomVal: number;
    do {
      crypto.getRandomValues(array);
      randomVal = array[0];
    } while (randomVal >= limit);

    return randomVal % max;
  }

  return Math.floor(Math.random() * max);
}

/**
 * Creates an immutable shuffled copy of an array using the modern Fisher-Yates shuffle.
 * @param items Array of elements to shuffle.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

