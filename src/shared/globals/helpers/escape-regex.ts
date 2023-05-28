/**
 * helper function used to find the special characters and separate spacing between words
 */
export const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
