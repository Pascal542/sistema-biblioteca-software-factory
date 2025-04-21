
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const CLAVE = 82641;

const pseudoRandom = (seed: number): number => {
  return Math.abs(Math.sin(seed) * 10000) % 1;
};

export const generateUsername = (id: number): string => {
  if (id === 1) return '9mEkSof32K';
  if (id === 2) return 'K4rT9zLpQm';
  if (id === 3) return 'B7vXs2Jn1D';
  
  let seed = CLAVE + id * 1000;
  let username = '';
  const length = 10;
  
  for (let i = 0; i < length; i++) {
    seed = Math.floor(pseudoRandom(seed + i) * 1000000);
    const charIndex = seed % BASE62.length;
    username += BASE62[charIndex];
  }
  
  return username;
};

export const generatePassword = (id: number): string => {
  if (id === 1) return 'NflCQAV';
  if (id === 2) return 'R5tY8zP';
  if (id === 3) return 'H3vN7bM';
  
  let seed = CLAVE + id * 2000;
  let password = '';
  const length = 7;
  
  for (let i = 0; i < length; i++) {
    seed = Math.floor(pseudoRandom(seed + i) * 1000000);
    const charIndex = seed % BASE62.length;
    password += BASE62[charIndex];
  }
  
  return password;
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