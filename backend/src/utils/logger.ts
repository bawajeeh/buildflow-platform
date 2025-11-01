/**
 * Professional logging utility for backend
 * Structured logging with proper error handling
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  stack?: string
  requestId?: string
  userId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'
  private logHistory: LogEntry[] = []
  private maxHistorySize = 500

  private formatMessage(level: LogLevel, message: string, data?: unknown, context?: { requestId?: string; userId?: string }): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: context?.requestId,
      userId: context?.userId,
    }

    if (data instanceof Error) {
      entry.stack = data.stack
      entry.data = {
        name: data.name,
        message: data.message,
      }
    } else {
      entry.data = data
    }

    return entry
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: { requestId?: string; userId?: string }): void {
    const entry = this.formatMessage(level, message, data, context)
    
    this.logHistory.push(entry)

    // Maintain history size
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }

    // Format for console output
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
    const contextStr = entry.requestId || entry.userId 
      ? ` [${[entry.requestId, entry.userId].filter(Boolean).join('|')}]` 
      : ''

    if (data !== undefined) {
      console[level === 'debug' ? 'log' : level](`${prefix}${contextStr} ${message}`, data)
    } else {
      console[level === 'debug' ? 'log' : level](`${prefix}${contextStr} ${message}`)
    }

    // In production, send critical errors to monitoring service
    if (!this.isDevelopment && level === 'error' && entry.data) {
      // TODO: Integrate with error tracking service (Sentry, etc.)
    }
  }

  debug(message: string, data?: unknown, context?: { requestId?: string; userId?: string }): void {
    if (this.isDevelopment) {
      this.log('debug', message, data, context)
    }
  }

  info(message: string, data?: unknown, context?: { requestId?: string; userId?: string }): void {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: unknown, context?: { requestId?: string; userId?: string }): void {
    this.log('warn', message, data, context)
  }

  error(message: string, error?: unknown, context?: { requestId?: string; userId?: string }): void {
    this.log('error', message, error, context)
  }

  getHistory(): LogEntry[] {
    return [...this.logHistory]
  }

  clearHistory(): void {
    this.logHistory = []
  }
}

// Export singleton instance
export const logger = new Logger()

