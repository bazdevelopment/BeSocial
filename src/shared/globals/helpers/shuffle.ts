/**
 * helper function for generating random elements from a list
 */
export function shuffle(list: string[]) {
  return [...list].sort(() => Math.random() - 0.5);
}
