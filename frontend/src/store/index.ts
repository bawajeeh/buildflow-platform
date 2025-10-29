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
          console.log('Register API URL:', API_CONFIG.ENDPOINTS.AUTH.REGISTER)
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
      
      const response = await fetch(API_CONFIG.ENDPOINTS.WEBSITES.LIST, {
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
      const response = await fetch(API_CONFIG.ENDPOINTS.WEBSITES.CREATE, {
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
      const response = await fetch(API_CONFIG.ENDPOINTS.WEBSITES.GET(id), {
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
      const response = await fetch(API_CONFIG.ENDPOINTS.WEBSITES.GET(id), {
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
      const response = await fetch(API_CONFIG.ENDPOINTS.WEBSITES.PUBLISH(id), {
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
      const response = await fetch(API_CONFIG.ENDPOINTS.WEBSITES.UNPUBLISH(id), {
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
  history: Element[][] // For undo/redo
  historyIndex: number // Current position in history
  clipboard: Element | null // For copy/paste
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
  duplicateElement: (elementId: string) => Promise<void>
  copyElement: (elementId: string) => void
  pasteElement: () => Promise<void>
  undo: () => void
  redo: () => void
  searchElements: (query: string) => Element[]
}

export const useBuilderStore = create<BuilderState>()((set, get) => ({
  pages: [],
  currentPage: null,
  selectedElement: null,
  hoveredElement: null,
  isPreviewMode: false,
  isLoading: false,
  history: [],
  historyIndex: -1,
  clipboard: null,

  fetchPages: async (websiteId: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(API_CONFIG.ENDPOINTS.PAGES.LIST(websiteId), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pages')
      }

      const pages = await response.json()
      
      set({
        pages: Array.isArray(pages) ? pages : [],
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  createPage: async (pageData: {
    name: string
    slug: string
    title: string
    description?: string
    isHomePage?: boolean
  }) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const { currentWebsite } = useWebsiteStore.getState()
      
      if (!currentWebsite) {
        throw new Error('No website selected')
      }

      // Map frontend data to backend format
      const backendData = {
        name: pageData.name,
        slug: pageData.slug,
        isHome: pageData.isHomePage || false,
      }

      const response = await fetch(API_CONFIG.ENDPOINTS.PAGES.CREATE(currentWebsite.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
      })

      if (!response.ok) {
        throw new Error('Failed to create page')
      }

      const newPage = await response.json()
      
      // Map backend response to frontend format
      const mappedPage = {
        ...newPage,
        title: pageData.title,
        description: pageData.description || '',
        isHomePage: newPage.isHome || false,
        seo: {
          title: pageData.title,
          description: pageData.description || '',
          keywords: []
        }
      }
      
      set((state) => ({
        pages: [...state.pages, mappedPage],
        currentPage: mappedPage,
        isLoading: false,
      }))
      
      return mappedPage
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updatePage: async (id: string, updates: Partial<Page>) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(API_CONFIG.ENDPOINTS.PAGES.GET(id), {
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
      const response = await fetch(API_CONFIG.ENDPOINTS.PAGES.GET(id), {
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
      const { currentPage } = get()
      
      if (!currentPage) {
        throw new Error('No page selected')
      }

      // Add element immediately to page (optimistic update)
      const tempId = `temp-${Date.now()}`
      const newElement: Element = { 
        ...element, 
        id: tempId,
        pageId: currentPage.id,
        parentId,
      }
      
      // Update store with new element
      set((state) => ({
        pages: state.pages.map((page) =>
          page.id === currentPage.id
            ? { ...page, elements: [...(page.elements || []), newElement] }
            : page
        ),
        currentPage: state.currentPage ? {
          ...state.currentPage,
          elements: [...(state.currentPage.elements || []), newElement]
        } : null,
        isLoading: false,
      }))

      // Push history snapshot
      set((state) => {
        const elementsSnapshot = (state.currentPage?.elements || []).map(e => ({ ...e }))
        const trimmed = state.history.slice(0, state.historyIndex + 1)
        return {
          history: [...trimmed, elementsSnapshot],
          historyIndex: (trimmed.length),
        } as Partial<BuilderState>
      })

      // Try to save to backend in background
      try {
        const { token } = useAuthStore.getState()
        const response = await fetch(API_CONFIG.ENDPOINTS.ELEMENTS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            pageId: currentPage.id,
            type: element.type,
            name: element.name,
            props: element.props || {},
            styles: element.styles || {},
            parentId: parentId || null,
            order: element.order || 0,
          }),
        })
        
        if (response.ok) {
          const savedElement = await response.json()
          console.log('Element saved to backend:', savedElement)
          
          // Update with real ID from backend
          set((state) => ({
            pages: state.pages.map((page) => ({
              ...page,
              elements: page.elements.map((el) => 
                el.id === tempId ? { ...el, id: savedElement.id } : el
              ),
            })),
            currentPage: state.currentPage ? {
              ...state.currentPage,
              elements: state.currentPage.elements.map((el) => 
                el.id === tempId ? { ...el, id: savedElement.id } : el
              ),
            } : null,
          }))
        } else {
          console.error('Failed to save element to backend:', await response.text())
        }
      } catch (backendError) {
        console.error('Backend save failed:', backendError)
      }
    } catch (error) {
      set({ isLoading: false })
      console.error('Error adding element:', error)
      throw error
    }
  },

  updateElement: async (id: string, updates: Partial<Element>) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(API_CONFIG.ENDPOINTS.ELEMENTS.UPDATE(id), {
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

      // Push history snapshot
      set((state) => {
        const elementsSnapshot = (state.currentPage?.elements || []).map(e => ({ ...e }))
        const trimmed = state.history.slice(0, state.historyIndex + 1)
        return {
          history: [...trimmed, elementsSnapshot],
          historyIndex: (trimmed.length),
        } as Partial<BuilderState>
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  deleteElement: async (id: string) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(API_CONFIG.ENDPOINTS.ELEMENTS.UPDATE(id), {
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

      // Push history snapshot
      set((state) => {
        const elementsSnapshot = (state.currentPage?.elements || []).map(e => ({ ...e }))
        const trimmed = state.history.slice(0, state.historyIndex + 1)
        return {
          history: [...trimmed, elementsSnapshot],
          historyIndex: (trimmed.length),
        } as Partial<BuilderState>
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  moveElement: async (id: string, newParentId: string, newOrder: number) => {
    set({ isLoading: true })
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(API_CONFIG.ENDPOINTS.ELEMENTS.MOVE(id), {
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

      // After successful move, refresh elements order locally
      set((state) => {
        const page = state.currentPage
        if (!page) return { isLoading: false }
        const elements = [...page.elements]
        const idx = elements.findIndex(e => e.id === id)
        if (idx !== -1) {
          elements[idx] = { ...elements[idx], parentId: newParentId, order: newOrder }
        }
        // Re-sort by order
        elements.sort((a, b) => (a.order || 0) - (b.order || 0))
        const elementsSnapshot = elements.map(e => ({ ...e }))
        const trimmed = state.history.slice(0, state.historyIndex + 1)
        return {
          currentPage: { ...page, elements },
          isLoading: false,
          history: [...trimmed, elementsSnapshot],
          historyIndex: (trimmed.length),
        } as Partial<BuilderState>
      })
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

      // Best-effort: if backend has a save endpoint use it, otherwise resolve silently
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.PAGES.SAVE(currentPage.id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ elements: currentPage.elements }),
        })
        if (!response.ok) {
          // No save endpoint: fall back without failing the UX
          console.warn('Save endpoint not available, skipping server save')
        }
      } catch {
        console.warn('Save skipped (endpoint missing)')
      }
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      // Do not throw to keep UI responsive even if server save is missing
    }
  },

  // Advanced Features
  
  // Duplicate element
  duplicateElement: async (elementId: string) => {
    const { currentPage } = get()
    if (!currentPage) throw new Error('No page selected')
    
    const element = currentPage.elements.find(el => el.id === elementId)
    if (!element) throw new Error('Element not found')
    
    const duplicatedElement: Element = {
      ...element,
      id: `element-${Date.now()}`,
      name: `${element.name} (Copy)`,
    }
    
    await addElement(duplicatedElement, element.parentId)
    toast.success('Element duplicated!')
  },

  // Copy element
  copyElement: (elementId: string) => {
    const { currentPage } = get()
    if (!currentPage) return
    
    const element = currentPage.elements.find(el => el.id === elementId)
    if (element) {
      set({ clipboard: { ...element } })
      toast.success('Element copied!')
    }
  },

  // Paste element
  pasteElement: async () => {
    const { clipboard, currentPage } = get()
    if (!clipboard || !currentPage) return
    
    const pastedElement: Element = {
      ...clipboard,
      id: `element-${Date.now()}`,
      name: `${clipboard.name} (Pasted)`,
    }
    
    await addElement(pastedElement, clipboard.parentId)
    toast.success('Element pasted!')
  },

  // Undo
  undo: () => {
    const { history, historyIndex, currentPage } = get()
    if (historyIndex <= 0 || !currentPage) {
      toast.info('Nothing to undo')
      return
    }
    
    const previousElements = history[historyIndex - 1]
    set({
      currentPage: { ...currentPage, elements: previousElements },
      historyIndex: historyIndex - 1,
    })
    toast.success('Undone!')
  },

  // Redo
  redo: () => {
    const { history, historyIndex, currentPage } = get()
    if (historyIndex >= history.length - 1 || !currentPage) {
      toast.info('Nothing to redo')
      return
    }
    
    const nextElements = history[historyIndex + 1]
    set({
      currentPage: { ...currentPage, elements: nextElements },
      historyIndex: historyIndex + 1,
    })
    toast.success('Redone!')
  },

  // Search elements
  searchElements: (query: string) => {
    const { currentPage } = get()
    if (!currentPage) return []
    
    const lowerQuery = query.toLowerCase()
    return currentPage.elements.filter(el => 
      el.name.toLowerCase().includes(lowerQuery) ||
      el.type.toLowerCase().includes(lowerQuery)
    )
  },
}))
