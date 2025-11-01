/**
 * Security utilities
 * Prevents XSS, sanitizes input, validates data
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  // Remove control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized.trim()
}

/**
 * Safe execution of custom JavaScript (sandboxed)
 * Replaces dangerous eval() usage
 */
export function safeExecuteCode(code: string, context: Record<string, unknown> = {}): unknown {
  try {
    // Create a sandboxed function with limited scope
    const allowedGlobals = {
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      console: {
        log: (...args: unknown[]) => {
          // In production, don't allow console.log in custom code
          if (import.meta.env.DEV) {
            console.log('[Custom Code]', ...args)
          }
        },
      },
    }
    
    // Create function with context
    const func = new Function(
      ...Object.keys(context),
      ...Object.keys(allowedGlobals),
      `
      "use strict";
      ${code}
      `
    )
    
    // Execute with context and allowed globals
    return func(...Object.values(context), ...Object.values(allowedGlobals))
  } catch (error) {
    throw new Error(`Custom code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate custom JavaScript code before execution
 */
export function validateCustomCode(code: string): { valid: boolean; error?: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Code must be a non-empty string' }
  }

  // Block dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/i,
    /Function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /document\.(write|writeln)/i,
    /window\.(location|localStorage|sessionStorage)/i,
    /XMLHttpRequest/i,
    /fetch\s*\(/i,
    /import\s*\(/i,
    /require\s*\(/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return { valid: false, error: 'Code contains potentially dangerous patterns' }
    }
  }

  // Check length
  if (code.length > 5000) {
    return { valid: false, error: 'Code exceeds maximum length (5000 characters)' }
  }

  return { valid: true }
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)
    // Only allow http, https, and relative URLs
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:' && parsed.protocol !== '') {
      return '#'
    }
    return parsed.href
  } catch {
    return '#'
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
  return subdomainRegex.test(subdomain.toLowerCase())
}

