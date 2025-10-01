// src/utils/tokenStorage.ts

// Save token to localStorage
export const saveAccessToken = (token?: string): string | null => {
  if (token) {
    localStorage.setItem("accessToken", token);
    return token;
  }
  return null;
};

// Get token from localStorage
export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

// Remove token from localStorage
export const removeAccessToken = (): void => {
  localStorage.removeItem("accessToken");
};
