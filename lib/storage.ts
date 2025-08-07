// Utility for safe localStorage access during SSR
export const storage = {
  get: (key: string, defaultValue: string = "[]"): string => {
    if (typeof window === "undefined") return defaultValue
    try {
      return localStorage.getItem(key) || defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail if localStorage is not available
    }
  }
}
