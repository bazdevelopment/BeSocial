/**
 * Helper function used to parse properties which are stringified
 * catch method will return only the properties which do not need to be parsed
 */
export const parseJson = (property: string): string => {
  try {
    return JSON.parse(property);
  } catch (error) {
    return property;
  }
};
