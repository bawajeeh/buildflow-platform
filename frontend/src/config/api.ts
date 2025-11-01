// API Configuration - BuildFlow Backend
// Enforce explicit API base in production to avoid accidental wrong endpoints
let API_BASE_URL = (import.meta as any).env?.VITE_API_URL as string | undefined

if (!API_BASE_URL) {
  const isProd = Boolean((import.meta as any).env?.PROD)
  if (isProd) {
    throw new Error('VITE_API_URL must be set in production environment')
  }
  // Sensible default for local development only
  API_BASE_URL = 'http://localhost:5000'
}

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
    PUBLISH: {
      WEBSITE: (websiteId: string) => `${API_BASE_URL}/api/publish/website/${websiteId}`,
      REVALIDATE: `${API_BASE_URL}/api/revalidate`,
    },
    WEBSITES: {
      LIST: `${API_BASE_URL}/api/websites`,
      CREATE: `${API_BASE_URL}/api/websites`,
      GET: (id: string) => `${API_BASE_URL}/api/websites/${id}`,
      GET_BY_SUBDOMAIN: (subdomain: string) => `${API_BASE_URL}/api/websites/subdomain/${subdomain}`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/websites/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/websites/${id}`,
      PUBLISH: (id: string) => `${API_BASE_URL}/api/websites/${id}/publish`,
      UNPUBLISH: (id: string) => `${API_BASE_URL}/api/websites/${id}/unpublish`,
      GET_THEME: (id: string) => `${API_BASE_URL}/api/websites/${id}/theme`,
      UPDATE_THEME: (id: string) => `${API_BASE_URL}/api/websites/${id}/theme`,
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
      LIST: (pageId: string) => `${API_BASE_URL}/api/elements/page/${pageId}`,
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
    COMPONENTS: {
      LIST: (websiteId: string) => `${API_BASE_URL}/api/components/website/${websiteId}`,
      CREATE: `${API_BASE_URL}/api/components`,
      GET: (id: string) => `${API_BASE_URL}/api/components/${id}`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/components/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/components/${id}`,
    },
    SNAPSHOTS: {
      LIST: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/snapshots`,
      CREATE: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/snapshots`,
      RESTORE: (websiteId: string, snapshotId: string) => `${API_BASE_URL}/api/websites/${websiteId}/snapshots/${snapshotId}/restore`,
    },
    TEMPLATES: {
      LIST: `${API_BASE_URL}/api/templates`,
      GET: (id: string) => `${API_BASE_URL}/api/templates/${id}`,
      EXPORT_WEBSITE: (websiteId: string) => `${API_BASE_URL}/api/templates/export/website/${websiteId}`,
      IMPORT_TO_WEBSITE: `${API_BASE_URL}/api/templates/import`,
    },
    WEBHOOK: {
      GET: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/webhook`,
      SET: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/webhook`,
    },
    BACKUPS: {
      LIST: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/backups`,
      CREATE: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/backups`,
      RESTORE: (websiteId: string, backupId: string) => `${API_BASE_URL}/api/websites/${websiteId}/backups/${backupId}/restore`,
    },
    TEAMS: {
      LIST: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/collaborators`,
      ADD: (websiteId: string) => `${API_BASE_URL}/api/websites/${websiteId}/collaborators`,
      REMOVE: (websiteId: string, userId: string) => `${API_BASE_URL}/api/websites/${websiteId}/collaborators/${userId}`,
    },
    BILLING: {
      PLANS: `${API_BASE_URL}/api/billing/plans`,
      CHECKOUT: `${API_BASE_URL}/api/billing/checkout`,
    },
    MEDIA: {
      LIST: (websiteId?: string) => `${API_BASE_URL}/api/media${websiteId ? `?websiteId=${websiteId}` : ''}`,
      UPLOAD: `${API_BASE_URL}/api/media`,
      UPLOAD_MULTIPLE: `${API_BASE_URL}/api/media/upload-multiple`,
      GET: (id: string) => `${API_BASE_URL}/api/media/${id}`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/media/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/media/${id}`,
      SERVE: (filename: string) => `${API_BASE_URL}/api/media/serve/${filename}`,
    },
  },
}

export default API_CONFIG
