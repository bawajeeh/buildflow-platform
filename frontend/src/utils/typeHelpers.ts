/**
 * Type-safe utilities to replace 'as any' casts
 * Professional type helpers for better type safety
 */

/**
 * Safe type assertion with validation
 */
export function safeCast<T>(value: unknown, typeGuard: (val: unknown) => val is T): T {
  if (!typeGuard(value)) {
    throw new Error(`Type assertion failed: expected type ${typeof value} but got invalid value`)
  }
  return value
}

/**
 * Type guard for Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard for element props
 */
export function isElementProps(value: unknown): value is Record<string, unknown> {
  return isRecord(value)
}

/**
 * Safe property access with type checking
 */
export function safeGetProp<T>(obj: Record<string, unknown>, key: string, defaultValue?: T): T | undefined {
  if (!isRecord(obj)) return defaultValue
  const value = obj[key]
  return value as T | undefined
}

/**
 * Type-safe partial update
 */
export function safePartialUpdate<T extends Record<string, unknown>>(
  original: T,
  updates: Partial<T>
): T {
  return { ...original, ...updates }
}

