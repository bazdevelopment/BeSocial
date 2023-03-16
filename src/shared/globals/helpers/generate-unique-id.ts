/**
 * Helper method used to generate a random unique id
 */
export const generateUniqueId = (): number => {
  const head = Date.now();
  const tail = Math.random().toString().slice(2);
  return head + Number(tail);
};
