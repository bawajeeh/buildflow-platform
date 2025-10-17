// API service for frontend-backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    this.token = null
    localStorage.removeItem('auth_token')
    return this.request('/api/auth/logout', { method: 'POST' })
  }

  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  // User endpoints
  async getProfile() {
    return this.request('/api/users/profile')
  }

  async updateProfile(userData: any) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Website endpoints
  async getWebsites() {
    return this.request('/api/websites')
  }

  async getWebsite(id: string) {
    return this.request(`/api/websites/${id}`)
  }

  async createWebsite(websiteData: any) {
    return this.request('/api/websites', {
      method: 'POST',
      body: JSON.stringify(websiteData),
    })
  }

  async updateWebsite(id: string, websiteData: any) {
    return this.request(`/api/websites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(websiteData),
    })
  }

  async deleteWebsite(id: string) {
    return this.request(`/api/websites/${id}`, {
      method: 'DELETE',
    })
  }

  async publishWebsite(id: string) {
    return this.request(`/api/websites/${id}/publish`, {
      method: 'POST',
    })
  }

  // Page endpoints
  async getPages(websiteId: string) {
    return this.request(`/api/websites/${websiteId}/pages`)
  }

  async getPage(websiteId: string, pageId: string) {
    return this.request(`/api/websites/${websiteId}/pages/${pageId}`)
  }

  async createPage(websiteId: string, pageData: any) {
    return this.request(`/api/websites/${websiteId}/pages`, {
      method: 'POST',
      body: JSON.stringify(pageData),
    })
  }

  async updatePage(websiteId: string, pageId: string, pageData: any) {
    return this.request(`/api/websites/${websiteId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    })
  }

  async deletePage(websiteId: string, pageId: string) {
    return this.request(`/api/websites/${websiteId}/pages/${pageId}`, {
      method: 'DELETE',
    })
  }

  // Element endpoints
  async getElements(pageId: string) {
    return this.request(`/api/pages/${pageId}/elements`)
  }

  async createElement(pageId: string, elementData: any) {
    return this.request(`/api/pages/${pageId}/elements`, {
      method: 'POST',
      body: JSON.stringify(elementData),
    })
  }

  async updateElement(elementId: string, elementData: any) {
    return this.request(`/api/elements/${elementId}`, {
      method: 'PUT',
      body: JSON.stringify(elementData),
    })
  }

  async deleteElement(elementId: string) {
    return this.request(`/api/elements/${elementId}`, {
      method: 'DELETE',
    })
  }

  // Product endpoints
  async getProducts(websiteId: string) {
    return this.request(`/api/websites/${websiteId}/products`)
  }

  async createProduct(websiteId: string, productData: any) {
    return this.request(`/api/websites/${websiteId}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(productId: string, productData: any) {
    return this.request(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(productId: string) {
    return this.request(`/api/products/${productId}`, {
      method: 'DELETE',
    })
  }

  // Order endpoints
  async getOrders(websiteId: string) {
    return this.request(`/api/websites/${websiteId}/orders`)
  }

  async getOrder(orderId: string) {
    return this.request(`/api/orders/${orderId}`)
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Service endpoints
  async getServices(websiteId: string) {
    return this.request(`/api/websites/${websiteId}/services`)
  }

  async createService(websiteId: string, serviceData: any) {
    return this.request(`/api/websites/${websiteId}/services`, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    })
  }

  async updateService(serviceId: string, serviceData: any) {
    return this.request(`/api/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    })
  }

  async deleteService(serviceId: string) {
    return this.request(`/api/services/${serviceId}`, {
      method: 'DELETE',
    })
  }

  // Booking endpoints
  async getBookings(websiteId: string) {
    return this.request(`/api/websites/${websiteId}/bookings`)
  }

  async createBooking(bookingData: any) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.request(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Analytics endpoints
  async getAnalytics(websiteId: string, period: string = '7d') {
    return this.request(`/api/websites/${websiteId}/analytics?period=${period}`)
  }

  // Media endpoints
  async uploadMedia(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/api/media/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    })
  }

  async getMedia() {
    return this.request('/api/media')
  }

  async deleteMedia(mediaId: string) {
    return this.request(`/api/media/${mediaId}`, {
      method: 'DELETE',
    })
  }

  // Template endpoints
  async getTemplates() {
    return this.request('/api/templates')
  }

  async getTemplate(templateId: string) {
    return this.request(`/api/templates/${templateId}`)
  }

  // Customer endpoints
  async getCustomers(websiteId: string) {
    return this.request(`/api/websites/${websiteId}/customers`)
  }

  async getCustomer(customerId: string) {
    return this.request(`/api/customers/${customerId}`)
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/api/settings')
  }

  async updateSettings(settings: any) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Utility methods
  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  getToken() {
    return this.token
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }
}

// Create singleton instance
const apiService = new ApiService()

export default apiService
export { ApiService, type ApiResponse }
