export const titleCase = str =>
  `${str.charAt(0).toUpperCase()}${str.substring(1)}`;

export const generateRandom = (length: number) => {
  const characters = '0123456489';
  // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};
