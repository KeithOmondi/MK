// src/utils/tokenStorage.ts
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "accessToken";

// ==========================
// Types
// ==========================
interface DecodedToken {
  exp?: number; // expiry timestamp in seconds
  iat?: number; // issued at timestamp
  [key: string]: any;
}

// ==========================
// Save Token
// ==========================
export const saveAccessToken = (token?: string): string | null => {
  if (token) {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      return token;
    } catch (e) {
      console.error("Failed to save access token:", e);
    }
  }
  return null;
};

// ==========================
// Get Token
// ==========================
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    console.error("Failed to read access token:", e);
    return null;
  }
};

// ==========================
// Remove Token
// ==========================
export const removeAccessToken = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    console.error("Failed to remove access token:", e);
  }
};

// ==========================
// Check if Token is Valid
// ==========================
export const hasValidToken = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (decoded.exp && Date.now() < decoded.exp * 1000) {
      return true; // token not expired
    }
    return false; // expired
  } catch (e) {
    console.error("Invalid token format:", e);
    return false;
  }
};
