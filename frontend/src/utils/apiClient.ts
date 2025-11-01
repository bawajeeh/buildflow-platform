/**
 * Professional API client with retry logic and error handling
 * Replaces direct fetch calls throughout the codebase
 */

import { API_CONFIG } from '@/config/api'
import { logger } from './logger'
import { useAuthStore } from '@/store'

interface RequestOptions extends RequestInit {
  retries?: number
  retryDelay?: number
  timeout?: number
}

interface ApiError extends Error {
  status?: number
  code?: string
  details?: unknown
}

class ApiClient {
  private baseURL: string
  private defaultTimeout = 30000 // 30 seconds
  private defaultRetries = 3
  private defaultRetryDelay = 1000 // 1 second

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      timeout = this.defaultTimeout,
      ...fetchOptions
    } = options

    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Get auth token
        const token = useAuthStore.getState().token
        const headers = new Headers(fetchOptions.headers)
        
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        
        headers.set('Content-Type', 'application/json')

        const url = `${this.baseURL}${endpoint}`
        const response = await this.fetchWithTimeout(url, {
          ...fetchOptions,
          headers,
          credentials: 'include',
        }, timeout)

        // Handle successful responses
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json()
            return (data.data || data) as T
          }
          return (await response.text()) as unknown as T
        }

        // Handle client errors (4xx) - don't retry
        if (response.status >= 400 && response.status < 500) {
          const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
          const error = new Error(errorData.error || `HTTP ${response.status}`) as ApiError
          error.status = response.status
          error.code = errorData.code
          error.details = errorData.details
          throw error
        }

        // Handle server errors (5xx) - retry
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`)
        }

        throw new Error(`Unexpected status: ${response.status}`)
      } catch (error) {
        lastError = error

        // Don't retry on client errors
        if (error instanceof Error && 'status' in error && (error as ApiError).status && (error as ApiError).status! < 500) {
          throw error
        }

        // Last attempt, throw error
        if (attempt === retries) {
          break
        }

        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt)
        logger.warn(`Request failed, retrying (${attempt + 1}/${retries})`, { endpoint, delay })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError || new Error('Request failed after retries')
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { ...options, method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types
export type { ApiError, RequestOptions }

