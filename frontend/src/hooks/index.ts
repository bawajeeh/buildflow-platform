// Custom React hooks for BuildFlow

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store'
import apiService from '@/services/api'
import { logger } from '@/utils/logger'

// Auth hook
export const useAuth = () => {
  const { user, token, login: storeLogin, logout: storeLogout, isLoading } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    // Use store login instead of apiService to avoid conflicts
    try {
      await storeLogin(email, password)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    }
  }, [storeLogin])

  const logout = useCallback(() => {
    apiService.clearToken()
    storeLogout()
  }, [storeLogout])

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  }
}

// API hook for data fetching
export const useApi = <T>(endpoint: string, options: { immediate?: boolean } = {}) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiService.request<T>(endpoint)
      if (response.success) {
        setData(response.data || null)
      } else {
        setError(response.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData()
    }
  }, [fetchData, options.immediate])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// Local storage hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}"`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}"`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// Debounced value hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Previous value hook
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

// Click outside hook
export const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}

// Window size hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Copy to clipboard hook
export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      logger.error('Failed to copy text to clipboard', error)
    }
  }, [])

  return { copied, copy }
}

// Form validation hook
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: any) => string | null>>
) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate field when touched
    const rule = validationRules[field]
    if (rule) {
      const error = rule(values[field])
      setErrors(prev => ({ ...prev, [field]: error || undefined }))
    }
  }, [values, validationRules])

  const validateField = useCallback((field: keyof T) => {
    const rule = validationRules[field]
    if (rule) {
      const error = rule(values[field])
      setErrors(prev => ({ ...prev, [field]: error || undefined }))
      return !error
    }
    return true
  }, [values, validationRules])

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof T]
      if (rule) {
        const error = rule(values[field as keyof T])
        if (error) {
          newErrors[field as keyof T] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validationRules])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    reset,
    isValid: Object.keys(errors).length === 0,
  }
}
