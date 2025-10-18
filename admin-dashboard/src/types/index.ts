// Admin Dashboard Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  subscription?: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: string;
  };
}

export interface Website {
  id: string;
  userId: string;
  name: string;
  subdomain: string;
  domain?: string;
  status: 'draft' | 'published' | 'archived';
  settings: {
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      borderRadius: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface AnalyticsData {
  period: string;
  visitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  chartData: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
}

export interface PlatformStats {
  totalUsers: number;
  totalWebsites: number;
  totalRevenue: number;
  monthlyActiveUsers: number;
  newUsersThisMonth: number;
  websitesPublishedThisMonth: number;
  revenueThisMonth: number;
}

export interface AdminDashboardState {
  users: User[];
  websites: Website[];
  platformStats: PlatformStats;
  analytics: AnalyticsData;
  loading: boolean;
  error?: string;
}

export interface AdminAction {
  type: string;
  payload?: any;
}

export interface AdminContextType {
  state: AdminDashboardState;
  dispatch: (action: AdminAction) => void;
  fetchUsers: () => Promise<void>;
  fetchWebsites: () => Promise<void>;
  fetchPlatformStats: () => Promise<void>;
  fetchAnalytics: (period: string) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateWebsite: (websiteId: string, data: Partial<Website>) => Promise<void>;
  deleteWebsite: (websiteId: string) => Promise<void>;
}