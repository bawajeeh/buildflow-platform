// API Configuration - BuildFlow Backend
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://buildflow-platform.onrender.com'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
      REGISTER: `${API_BASE_URL}/api/auth/register`,
      FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
      RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
      PROFILE: `${API_BASE_URL}/api/auth/profile`,
      REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    },
    WEBSITES: {
      LIST: `${API_BASE_URL}/api/websites`,
      CREATE: `${API_BASE_URL}/api/websites`,
      GET: (id: string) => `${API_BASE_URL}/api/websites/${id}`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/websites/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/websites/${id}`,
      PUBLISH: (id: string) => `${API_BASE_URL}/api/websites/${id}/publish`,
      UNPUBLISH: (id: string) => `${API_BASE_URL}/api/websites/${id}/unpublish`,
    },
    PAGES: {
      LIST: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/pages`,
      CREATE: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/pages`,
      GET: (id: string) => `${API_BASE_URL}/api/pages/${id}`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/pages/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/pages/${id}`,
      SAVE: (id: string) => `${API_BASE_URL}/api/pages/${id}/save`,
    },
    ELEMENTS: {
      LIST: (pageId: string) => `${API_BASE_URL}/api/pages/${pageId}/elements`,
      CREATE: `${API_BASE_URL}/api/elements`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/elements/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/elements/${id}`,
      MOVE: (id: string) => `${API_BASE_URL}/api/elements/${id}/move`,
    },
    PRODUCTS: {
      LIST: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/products`,
      CREATE: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/products`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/products/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    },
    SERVICES: {
      LIST: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/services`,
      CREATE: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/services`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/services/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/services/${id}`,
    },
  },
}

export default API_CONFIG
