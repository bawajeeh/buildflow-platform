import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          // Mock admin login - in production, this would call the API
          if (email === 'admin@buildflow.com' && password === 'admin123') {
            const mockUser: User = {
              id: '1',
              email: 'admin@buildflow.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'SUPER_ADMIN',
              subscription: {
                id: '1',
                userId: '1',
                plan: 'ENTERPRISE',
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                cancelAtPeriodEnd: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            set({
              user: mockUser,
              token: 'mock-admin-token',
              isAuthenticated: true,
            })
          } else {
            throw new Error('Invalid credentials')
          }
        } catch (error) {
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
      
      setUser: (user: User) => {
        set({ user })
      },
      
      setToken: (token: string) => {
        set({ token })
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
)
