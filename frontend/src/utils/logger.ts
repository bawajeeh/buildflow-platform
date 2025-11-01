/**
 * Professional logging utility
 * Replaces all console.log/error/warn with proper logging system
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  stack?: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD
  private logHistory: LogEntry[] = []
  private maxHistorySize = 100

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error'
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    }

    if (data instanceof Error) {
      entry.stack = data.stack
      entry.data = {
        name: data.name,
        message: data.message,
      }
    }

    return entry
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return

    const entry = this.formatMessage(level, message, data)
    this.logHistory.push(entry)

    // Maintain history size
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }

    // Output to console in development, or send to logging service in production
    if (this.isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level
      if (data !== undefined) {
        console[consoleMethod](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, data)
      } else {
        console[consoleMethod](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`)
      }
    } else if (this.isProduction && (level === 'error' || level === 'warn')) {
      // In production, send errors/warnings to logging service (e.g., Sentry)
      // TODO: Integrate with error tracking service
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, error?: unknown): void {
    this.log('error', message, error)
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

