// Real-time Types
export interface RealtimeEvent {
  type: string
  data: any
  timestamp: Date
  userId: string
}

export interface CollaborationEvent extends RealtimeEvent {
  type: 'collaboration'
  data: {
    elementId: string
    updates: any
    userId: string
    userName: string
  }
}

export interface CursorEvent extends RealtimeEvent {
  type: 'cursor'
  data: {
    x: number
    y: number
    userId: string
    userName: string
  }
}

export interface TypingEvent extends RealtimeEvent {
  type: 'typing'
  data: {
    elementId: string
    isTyping: boolean
    userId: string
    userName: string
  }
}

export interface UserPresenceEvent extends RealtimeEvent {
  type: 'presence'
  data: {
    userId: string
    userName: string
    isActive: boolean
    lastSeen: Date
  }
}

export interface WebsiteEvent extends RealtimeEvent {
  type: 'website'
  data: {
    websiteId: string
    action: 'published' | 'updated' | 'deleted'
    userId: string
  }
}

export interface AnalyticsEvent extends RealtimeEvent {
  type: 'analytics'
  data: {
    websiteId: string
    metrics: any
    timestamp: Date
  }
}

// Real-time connection types
export interface RealtimeConnection {
  isConnected: boolean
  userId: string
  userName: string
  currentRoom?: string
  lastSeen: Date
}

export interface RealtimeRoom {
  id: string
  name: string
  type: 'website' | 'page' | 'element'
  participants: RealtimeConnection[]
  createdAt: Date
}

// Real-time message types
export interface RealtimeMessage {
  id: string
  type: string
  content: any
  userId: string
  userName: string
  timestamp: Date
  roomId: string
}

export interface ChatMessage extends RealtimeMessage {
  type: 'chat'
  content: {
    text: string
    mentions?: string[]
  }
}

export interface SystemMessage extends RealtimeMessage {
  type: 'system'
  content: {
    action: string
    details: any
  }
}

// Real-time configuration
export interface RealtimeConfig {
  serverUrl: string
  autoConnect: boolean
  reconnectAttempts: number
  reconnectDelay: number
  heartbeatInterval: number
  presenceTimeout: number
}
