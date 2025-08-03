import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  userType: "patient" | "doctor" | null
  login: (user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      userType: null,
      login: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          userType: user.role,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          userType: null,
        }),
      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "schedula-auth",
    },
  ),
)
