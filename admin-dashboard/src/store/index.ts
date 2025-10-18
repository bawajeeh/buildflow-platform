// Admin Dashboard Store

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, Website, PlatformStats, AnalyticsData } from '../types';

interface AdminState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // Data
  users: User[];
  websites: Website[];
  platformStats: PlatformStats | null;
  analytics: AnalyticsData | null;

  // UI State
  loading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';

  // Pagination
  usersPage: number;
  websitesPage: number;
  usersTotal: number;
  websitesTotal: number;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUsers: (users: User[], total: number) => void;
  setWebsites: (websites: Website[], total: number) => void;
  setPlatformStats: (stats: PlatformStats) => void;
  setAnalytics: (analytics: AnalyticsData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUsersPage: (page: number) => void;
  setWebsitesPage: (page: number) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateWebsite: (websiteId: string, updates: Partial<Website>) => void;
  removeUser: (userId: string) => void;
  removeWebsite: (websiteId: string) => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: localStorage.getItem('admin_token'),

      users: [],
      websites: [],
      platformStats: null,
      analytics: null,

      loading: false,
      error: null,
      sidebarOpen: true,
      theme: (localStorage.getItem('admin_theme') as 'light' | 'dark') || 'light',

      usersPage: 1,
      websitesPage: 1,
      usersTotal: 0,
      websitesTotal: 0,

      // Actions
      setAuth: (user, token) => {
        localStorage.setItem('admin_token', token);
        set({ isAuthenticated: true, user, token });
      },

      clearAuth: () => {
        localStorage.removeItem('admin_token');
        set({ isAuthenticated: false, user: null, token: null });
      },

      setUsers: (users, total) => {
        set({ users, usersTotal: total });
      },

      setWebsites: (websites, total) => {
        set({ websites, websitesTotal: total });
      },

      setPlatformStats: (platformStats) => {
        set({ platformStats });
      },

      setAnalytics: (analytics) => {
        set({ analytics });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setTheme: (theme) => {
        localStorage.setItem('admin_theme', theme);
        set({ theme });
      },

      setUsersPage: (usersPage) => {
        set({ usersPage });
      },

      setWebsitesPage: (websitesPage) => {
        set({ websitesPage });
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, ...updates } : user
          ),
        }));
      },

      updateWebsite: (websiteId, updates) => {
        set((state) => ({
          websites: state.websites.map((website) =>
            website.id === websiteId ? { ...website, ...updates } : website
          ),
        }));
      },

      removeUser: (userId) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
          usersTotal: state.usersTotal - 1,
        }));
      },

      removeWebsite: (websiteId) => {
        set((state) => ({
          websites: state.websites.filter((website) => website.id !== websiteId),
          websitesTotal: state.websitesTotal - 1,
        }));
      },
    }),
    {
      name: 'admin-store',
    }
  )
);

// Selectors
export const useAuth = () => useAdminStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user,
  token: state.token,
  setAuth: state.setAuth,
  clearAuth: state.clearAuth,
}));

export const useUsers = () => useAdminStore((state) => ({
  users: state.users,
  usersPage: state.usersPage,
  usersTotal: state.usersTotal,
  setUsers: state.setUsers,
  setUsersPage: state.setUsersPage,
  updateUser: state.updateUser,
  removeUser: state.removeUser,
}));

export const useWebsites = () => useAdminStore((state) => ({
  websites: state.websites,
  websitesPage: state.websitesPage,
  websitesTotal: state.websitesTotal,
  setWebsites: state.setWebsites,
  setWebsitesPage: state.setWebsitesPage,
  updateWebsite: state.updateWebsite,
  removeWebsite: state.removeWebsite,
}));

export const usePlatformStats = () => useAdminStore((state) => ({
  platformStats: state.platformStats,
  setPlatformStats: state.setPlatformStats,
}));

export const useAnalytics = () => useAdminStore((state) => ({
  analytics: state.analytics,
  setAnalytics: state.setAnalytics,
}));

export const useUI = () => useAdminStore((state) => ({
  loading: state.loading,
  error: state.error,
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
  setLoading: state.setLoading,
  setError: state.setError,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
}));