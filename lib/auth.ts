// lib/auth.ts
// This file provides client-side utilities for mock authentication.
// In a real application, you would use secure methods like HTTP-only cookies
// or a proper authentication library (e.g., NextAuth.js).

const USER_ID_KEY = "currentUserId"

export const setUserId = (userId: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_ID_KEY, userId)
  }
}

export const getUserId = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(USER_ID_KEY)
  }
  return null
}

export const clearUserId = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_ID_KEY)
  }
}
