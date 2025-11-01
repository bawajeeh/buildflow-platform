// Real-time communication service using Socket.IO

import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store'
import { API_CONFIG } from '@/config/api'

interface RealTimeConfig {
  serverUrl: string
  autoConnect: boolean
  reconnectAttempts: number
  reconnectDelay: number
}

interface CollaborationData {
  elementId: string
  updates: any
  userId: string
  timestamp: Date
}

interface CursorData {
  userId: string
  x: number
  y: number
  timestamp: Date
}

interface UserPresence {
  userId: string
  userName: string
  isActive: boolean
  lastSeen: Date
}

class RealTimeService {
  private socket: Socket | null = null
  private config: RealTimeConfig
  private isConnected: boolean = false
  private reconnectAttempts: number = 0

  constructor(config: RealTimeConfig = {
    serverUrl: import.meta.env.VITE_API_URL || API_CONFIG.BASE_URL,
    autoConnect: true,
    reconnectAttempts: 5,
    reconnectDelay: 1000
  }) {
    this.config = config
    
    if (config.autoConnect) {
      this.connect()
    }
  }

  // Connect to the server
  connect(): void {
    if (this.socket?.connected) return

    // Get token with better error handling
    let token: string | null = null
    try {
      const authState = useAuthStore.getState()
      token = authState?.token || null
      
      // If no token, don't connect (authentication required)
      if (!token) {
        logger.warn('No authentication token available for Socket.IO connection')
        return
      }
    } catch (error) {
      logger.error('Error getting auth token', error)
      return
    }

    this.socket = io(this.config.serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      auth: { token }, // Always send token (never undefined)
      withCredentials: true, // Important for CORS with credentials
    })

    this.setupEventListeners()
  }

  // Disconnect from the server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Connected to real-time server')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from real-time server:', reason)
      this.isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      // Don't reconnect if it's an authentication error (user needs to log in)
      if (error.message?.includes('Authentication error')) {
        console.error('🔐 Authentication failed - please log in again')
        this.isConnected = false
        return
      }
      this.handleReconnect()
    })

    // Collaboration events
    this.socket.on('element-updated', (data: CollaborationData) => {
      this.handleElementUpdate(data)
    })
    this.socket.on('element-locked', (data: { elementId: string; userId: string }) => {
      window.dispatchEvent(new CustomEvent('realtime:element:locked', { detail: data }))
    })
    this.socket.on('element-unlocked', (data: { elementId: string; userId: string }) => {
      window.dispatchEvent(new CustomEvent('realtime:element:unlocked', { detail: data }))
    })
    this.socket.on('element-lock-denied', (data: { elementId: string; owner: string }) => {
      window.dispatchEvent(new CustomEvent('realtime:element:lockdenied', { detail: data }))
    })

    this.socket.on('cursor-moved', (data: CursorData) => {
      this.handleCursorMove(data)
    })

    this.socket.on('user-joined', (data: UserPresence) => {
      this.handleUserJoined(data)
    })

    this.socket.on('user-left', (data: UserPresence) => {
      this.handleUserLeft(data)
    })

    // Website events
    this.socket.on('website:published', (data: any) => {
      this.handleWebsitePublished(data)
    })

    this.socket.on('website:updated', (data: any) => {
      this.handleWebsiteUpdated(data)
    })

    // Analytics events
    this.socket.on('analytics:update', (data: any) => {
      this.handleAnalyticsUpdate(data)
    })
  }

  // Handle reconnection
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.config.reconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, this.config.reconnectDelay * this.reconnectAttempts)
  }

  // Join a website room
  joinWebsite(websiteId: string): void {
    if (!this.socket?.connected) return

    this.socket.emit('join-room', websiteId)
  }

  // Leave a website room
  leaveWebsite(websiteId: string): void {
    if (!this.socket?.connected) return

    this.socket.emit('leave-room', websiteId)
  }

  // Send element update
  updateElement(elementId: string, updates: any, websiteId: string): void {
    if (!this.socket?.connected) return

    const data: CollaborationData = {
      elementId,
      updates,
      userId: this.getCurrentUserId(),
      timestamp: new Date()
    }

    this.socket.emit('element-update', data)
  }

  lockElement(elementId: string): void {
    if (!this.socket?.connected) return
    this.socket.emit('lock-element', { elementId })
  }

  unlockElement(elementId: string): void {
    if (!this.socket?.connected) return
    this.socket.emit('unlock-element', { elementId })
  }

  // Send cursor position
  updateCursor(x: number, y: number, websiteId: string): void {
    if (!this.socket?.connected) return

    const data: CursorData = {
      userId: this.getCurrentUserId(),
      x,
      y,
      timestamp: new Date()
    }

    this.socket.emit('cursor-move', data)
  }

  // Send typing indicator
  sendTypingIndicator(elementId: string, isTyping: boolean, websiteId: string): void {
    if (!this.socket?.connected) return

    this.socket.emit('typing:indicator', {
      elementId,
      isTyping,
      userId: this.getCurrentUserId(),
      websiteId
    })
  }

  // Event handlers (to be implemented by the consuming component)
  private handleElementUpdate(data: CollaborationData): void {
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('realtime:element:updated', { detail: data }))
  }

  private handleCursorMove(data: CursorData): void {
    window.dispatchEvent(new CustomEvent('realtime:cursor:moved', { detail: data }))
  }

  private handleUserJoined(data: UserPresence): void {
    window.dispatchEvent(new CustomEvent('realtime:user:joined', { detail: data }))
  }

  private handleUserLeft(data: UserPresence): void {
    window.dispatchEvent(new CustomEvent('realtime:user:left', { detail: data }))
  }

  private handleWebsitePublished(data: any): void {
    window.dispatchEvent(new CustomEvent('realtime:website:published', { detail: data }))
  }

  private handleWebsiteUpdated(data: any): void {
    window.dispatchEvent(new CustomEvent('realtime:website:updated', { detail: data }))
  }

  private handleAnalyticsUpdate(data: any): void {
    window.dispatchEvent(new CustomEvent('realtime:analytics:update', { detail: data }))
  }

  // Get current user ID (implement based on your auth system)
  private getCurrentUserId(): string {
    // This should be implemented based on your authentication system
    return 'current-user-id'
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket
  }

  // Update configuration
  updateConfig(newConfig: Partial<RealTimeConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Create singleton instance
const realTimeService = new RealTimeService()

export default realTimeService
export { RealTimeService, type RealTimeConfig, type CollaborationData, type CursorData, type UserPresence }