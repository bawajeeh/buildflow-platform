import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Website, Page, Element, WebsiteStatus } from '../types'
import { API_CONFIG } from '../config/api'

// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const data = await response.json()
          
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          // API call to Render backend
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            throw new Error('Registration failed')
          }

          const data = await response.json()
          
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
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

      forgotPassword: async (email: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          })

          if (!response.ok) {
            throw new Error('Failed to send reset email')
          }

          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, password }),
          })

          if (!response.ok) {
            throw new Error('Password reset failed')
          }

          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true })
        try {
          const { token } = get()
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            throw new Error('Profile update failed')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      refreshToken: async () => {
        try {
          const { token } = get()
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data = await response.json()
          
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Website Store
interface WebsiteState {
  websites: Website[]
  currentWebsite: Website | null
  isLoading: boolean
  fetchWebsites: () => Promise<void>
  createWebsite: (websiteData: {
    name: string
    subdomain: string
    description?: string
  }) => Promise<Website>
  updateWebsite: (id: string, updates: Partial<Website>) => Promise<void>
  deleteWebsite: (id: string) => Promise<void>
  setCurrentWebsite: (website: Website | null) => void
  publishWebsite: (id: string) => Promise<void>
  unpublishWebsite: (id: string) => Promise<void>
}

export const useWebsiteStore = create<WebsiteState>()((set) => ({
  websites: [],
  currentWebsite: null,
  isLoading: false,

  fetchWebsites: async () => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      console.log('Fetching websites with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch('https://buildflow-platform.onrender.com/api/websites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error('Failed to fetch websites')
      }

      const data = await response.json()
      console.log('Fetched websites data:', data)
      
      set({
        websites: data,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error fetching websites:', error)
      set({ isLoading: false })
      throw error
    }
  },

  createWebsite: async (websiteData) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch('https://buildflow-platform.onrender.com/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(websiteData),
      })

      if (!response.ok) {
        throw new Error('Failed to create website')
      }

      const data = await response.json()
      
      set((state) => ({
        websites: [...state.websites, data],
        isLoading: false,
      }))

      return data
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updateWebsite: async (id: string, updates: Partial<Website>) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/websites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update website')
      }

      const data = await response.json()
      
      set((state) => ({
        websites: state.websites.map((website) =>
          website.id === id ? { ...website, ...data.website } : website
        ),
        currentWebsite: state.currentWebsite?.id === id 
          ? { ...state.currentWebsite, ...data.website }
          : state.currentWebsite,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  deleteWebsite: async (id: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/websites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete website')
      }

      set((state) => ({
        websites: state.websites.filter((website) => website.id !== id),
        currentWebsite: state.currentWebsite?.id === id ? null : state.currentWebsite,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  setCurrentWebsite: (website: Website | null) => {
    set({ currentWebsite: website })
  },

  publishWebsite: async (id: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/websites/${id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to publish website')
      }

      set((state) => ({
        websites: state.websites.map((website) =>
          website.id === id ? { ...website, status: WebsiteStatus.PUBLISHED } : website
        ),
        currentWebsite: state.currentWebsite?.id === id 
          ? { ...state.currentWebsite, status: WebsiteStatus.PUBLISHED }
          : state.currentWebsite,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  unpublishWebsite: async (id: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/websites/${id}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to unpublish website')
      }

      set((state) => ({
        websites: state.websites.map((website) =>
          website.id === id ? { ...website, status: WebsiteStatus.DRAFT } : website
        ),
        currentWebsite: state.currentWebsite?.id === id 
          ? { ...state.currentWebsite, status: WebsiteStatus.DRAFT }
          : state.currentWebsite,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
}))

// Builder Store
interface BuilderState {
  pages: Page[]
  currentPage: Page | null
  selectedElement: Element | null
  hoveredElement: Element | null
  isPreviewMode: boolean
  isLoading: boolean
  fetchPages: (websiteId: string) => Promise<void>
  createPage: (pageData: {
    name: string
    slug: string
    title: string
    description?: string
    isHomePage?: boolean
  }) => Promise<Page>
  updatePage: (id: string, updates: Partial<Page>) => Promise<void>
  deletePage: (id: string) => Promise<void>
  setCurrentPage: (page: Page | null) => void
  addElement: (element: Element, parentId?: string) => Promise<void>
  updateElement: (id: string, updates: Partial<Element>) => Promise<void>
  deleteElement: (id: string) => Promise<void>
  moveElement: (id: string, newParentId: string, newOrder: number) => Promise<void>
  selectElement: (element: Element | null) => void
  hoverElement: (element: Element | null) => void
  togglePreviewMode: () => void
  saveLayout: () => Promise<void>
}

export const useBuilderStore = create<BuilderState>()((set, get) => ({
  pages: [],
  currentPage: null,
  selectedElement: null,
  hoveredElement: null,
  isPreviewMode: false,
  isLoading: false,

  fetchPages: async (websiteId: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/websites/${websiteId}/pages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pages')
      }

      const data = await response.json()
      
      set({
        pages: data.pages,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  createPage: async (pageData) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const { currentWebsite } = useWebsiteStore.getState()
      
      if (!currentWebsite) {
        throw new Error('No website selected')
      }

      const response = await fetch(`https://buildflow-platform.onrender.com/api/websites/${currentWebsite.id}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(pageData),
      })

      if (!response.ok) {
        throw new Error('Failed to create page')
      }

      const data = await response.json()
      
      set((state) => ({
        pages: [...state.pages, data.page],
        isLoading: false,
      }))

      return data.page
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updatePage: async (id: string, updates: Partial<Page>) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update page')
      }

      const data = await response.json()
      
      set((state) => ({
        pages: state.pages.map((page) =>
          page.id === id ? { ...page, ...data.page } : page
        ),
        currentPage: state.currentPage?.id === id 
          ? { ...state.currentPage, ...data.page }
          : state.currentPage,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  deletePage: async (id: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/pages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete page')
      }

      set((state) => ({
        pages: state.pages.filter((page) => page.id !== id),
        currentPage: state.currentPage?.id === id ? null : state.currentPage,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  setCurrentPage: (page: Page | null) => {
    set({ currentPage: page })
  },

  addElement: async (element: Element, parentId?: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const { currentPage } = get()
      
      if (!currentPage) {
        throw new Error('No page selected')
      }

      const response = await fetch(`https://buildflow-platform.onrender.com/api/pages/${currentPage.id}/elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...element, parentId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add element')
      }

      const data = await response.json()
      
      set((state) => ({
        pages: state.pages.map((page) =>
          page.id === currentPage.id
            ? { ...page, elements: [...page.elements, data.element] }
            : page
        ),
        currentPage: state.currentPage?.id === currentPage.id
          ? { ...state.currentPage, elements: [...state.currentPage.elements, data.element] }
          : state.currentPage,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updateElement: async (id: string, updates: Partial<Element>) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/elements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update element')
      }

      const data = await response.json()
      
      set((state) => ({
        pages: state.pages.map((page) => ({
          ...page,
          elements: page.elements.map((element) =>
            element.id === id ? { ...element, ...data.element } : element
          ),
        })),
        currentPage: state.currentPage ? {
          ...state.currentPage,
          elements: state.currentPage.elements.map((element) =>
            element.id === id ? { ...element, ...data.element } : element
          ),
        } : null,
        selectedElement: state.selectedElement?.id === id 
          ? { ...state.selectedElement, ...data.element }
          : state.selectedElement,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  deleteElement: async (id: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/elements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete element')
      }

      set((state) => ({
        pages: state.pages.map((page) => ({
          ...page,
          elements: page.elements.filter((element) => element.id !== id),
        })),
        currentPage: state.currentPage ? {
          ...state.currentPage,
          elements: state.currentPage.elements.filter((element) => element.id !== id),
        } : null,
        selectedElement: state.selectedElement?.id === id ? null : state.selectedElement,
        isLoading: false,
      }))
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  moveElement: async (id: string, newParentId: string, newOrder: number) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`https://buildflow-platform.onrender.com/api/elements/${id}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ parentId: newParentId, order: newOrder }),
      })

      if (!response.ok) {
        throw new Error('Failed to move element')
      }

      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  selectElement: (element: Element | null) => {
    set({ selectedElement: element })
  },

  hoverElement: (element: Element | null) => {
    set({ hoveredElement: element })
  },

  togglePreviewMode: () => {
    set((state) => ({ isPreviewMode: !state.isPreviewMode }))
  },

  saveLayout: async () => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const { currentPage } = get()
      
      if (!currentPage) {
        throw new Error('No page selected')
      }

      const response = await fetch(`https://buildflow-platform.onrender.com/api/pages/${currentPage.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ elements: currentPage.elements }),
      })

      if (!response.ok) {
        throw new Error('Failed to save layout')
      }

      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
}))
