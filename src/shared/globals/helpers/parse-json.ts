export const parseJson = (property: string): string => {
  try {
    return JSON.parse(property);
  } catch (error) {
    return property;
  }
};
