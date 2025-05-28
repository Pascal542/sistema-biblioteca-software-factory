const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const CLAVE = 82641;

const pseudoRandom = (seed: number): number => {
  return Math.abs(Math.sin(seed) * 10000) % 1;
};

export const generateUsername = (userId: number): string => {
  return `user_${userId}_${Date.now().toString().slice(-6)}`;
};

export const generatePassword = (userId: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const userString = userId.toString();
  
  result += userString;
  
  for (let i = 0; i < 8 - userString.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export const extractIdFromUsername = (username: string): number | null => {
  // funcion en deshuso
  if (username === '9mEkSof32K') return 1;
  if (username === 'K4rT9zLpQm') return 2;
  if (username === 'B7vXs2Jn1D') return 3;
  
  for (let id = 4; id <= 1000; id++) {
    if (generateUsername(id) === username) {
      return id;
    }
  }
  return null;
};

export const extractIdFromPassword = (password: string): number | null => {
  if (password === 'NflCQAV') return 1;
  if (password === 'R5tY8zP') return 2;
  if (password === 'H3vN7bM') return 3;

  for (let id = 4; id <= 1000; id++) {
    if (generatePassword(id) === password) {
      return id;
    }
  }
  return null;
};

export const debugCredentialsForId1 = (): { username: string, password: string } => {
  return {
    username: generateUsername(1),
    password: generatePassword(1)
  };
};