// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormData {
  [key: string]: any
}

export interface FormErrors {
  [key: string]: string
}

export interface FormState {
  data: FormData
  errors: FormErrors
  isSubmitting: boolean
  isValid: boolean
}

// Contact form types
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// Newsletter form types
export interface NewsletterFormData {
  email: string
}

// Product form types
export interface ProductFormData {
  name: string
  description: string
  price: number
  comparePrice?: number
  sku: string
  quantity: number
  category: string
  tags: string[]
  images: string[]
  isPublished: boolean
}

// Service form types
export interface ServiceFormData {
  name: string
  description: string
  type: string
  duration: number
  price: number
  capacity: number
  isPublished: boolean
}

// Booking form types
export interface BookingFormData {
  serviceId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  notes?: string
}

// User profile form types
export interface UserProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
}

// Website settings form types
export interface WebsiteSettingsFormData {
  name: string
  domain?: string
  description?: string
  logo?: string
  favicon?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  analyticsId?: string
  customCSS?: string
}
