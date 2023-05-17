/**
 * helper function used to check if the image is base64 or not based on a Regex expression
 */

export const isBase64Image = (imageUrl: string): boolean => {
  const base64Rexex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
  return base64Rexex.test(imageUrl);
};
