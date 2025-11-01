import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { getPrismaClient } from '../services/database'


// Types
interface AuthenticatedSocket extends Socket {
  userId?: string
  userName?: string
  currentRoom?: string
}

interface CollaborationData {
  elementId: string
  updates?: any
  userId: string
  timestamp: Date
}

interface CursorData {
  userId: string
  x: number
  y: number
  timestamp: Date
}

// Room management
const rooms = new Map<string, Set<string>>()
const userSockets = new Map<string, string>()
const locksByRoom = new Map<string, Map<string, string>>() // roomId -> (elementId -> userId)

// Initialize Socket.IO server
export const initializeSocket = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Try to get token from auth object first, then from query/headers as fallback
      const token = socket.handshake.auth?.token || 
                    socket.handshake.query?.token as string ||
                    socket.handshake.headers?.authorization?.replace('Bearer ', '')
      
      if (!token || token === 'null' || token === 'undefined') {
        console.error('Socket authentication failed: No token provided', {
          auth: socket.handshake.auth,
          query: socket.handshake.query,
          headers: socket.handshake.headers
        })
        return next(new Error('Authentication error: No token provided'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
      
      // Get user from database
      const user = await getPrismaClient().user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      })

      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }

      socket.userId = user.id
      socket.userName = `${user.firstName} ${user.lastName}`
      
      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication error: Invalid token'))
    }
  })

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userName} connected with socket ${socket.id}`)
    
    // Store socket mapping
    if (socket.userId) {
      userSockets.set(socket.userId, socket.id)
    }

    // Join room
    socket.on('join-room', (roomId: string) => {
      console.log(`User ${socket.userName} joining room ${roomId}`)
      
      // Leave previous room if any
      if (socket.currentRoom) {
        socket.leave(socket.currentRoom)
        removeUserFromRoom(socket.currentRoom, socket.userId!)
      }

      // Join new room
      socket.join(roomId)
      socket.currentRoom = roomId
      addUserToRoom(roomId, socket.userId!)

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date(),
      })

      // Send current room members to the new user
      const roomMembers = getRoomMembers(roomId)
      socket.emit('room-members', roomMembers)
    })

    // Leave room
    socket.on('leave-room', (roomId: string) => {
      console.log(`User ${socket.userName} leaving room ${roomId}`)
      
      socket.leave(roomId)
      removeUserFromRoom(roomId, socket.userId!)
      
      // Notify others in the room
      socket.to(roomId).emit('user-left', socket.userId)
    })

    // Element updates
    socket.on('element-update', (data: CollaborationData) => {
      if (!socket.currentRoom) return

      console.log(`Element update from ${socket.userName}:`, data.elementId)

      // Enforce locks: if element is locked by another user, deny
      const locks = locksByRoom.get(socket.currentRoom)
      const owner = locks?.get(data.elementId)
      if (owner && owner !== socket.userId) {
        socket.emit('element-lock-denied', { elementId: data.elementId, owner })
        return
      }

      // Broadcast to other users in the room
      socket.to(socket.currentRoom).emit('element-updated', {
        elementId: data.elementId,
        updates: data.updates,
        userId: socket.userId,
        timestamp: data.timestamp,
      })

      // Log the update for analytics
      logElementUpdate(socket.userId!, data.elementId, data.updates)
    })

    // Element selection
    socket.on('element-select', (data: { elementId: string; timestamp: Date }) => {
      if (!socket.currentRoom) return

      console.log(`Element selected by ${socket.userName}:`, data.elementId)

      // Broadcast to other users in the room
      socket.to(socket.currentRoom).emit('element-selected', {
        elementId: data.elementId,
        userId: socket.userId,
        timestamp: data.timestamp,
      })
    })

    // Element locking
    socket.on('lock-element', (data: { elementId: string }) => {
      if (!socket.currentRoom || !socket.userId) return
      const room = socket.currentRoom
      if (!locksByRoom.has(room)) locksByRoom.set(room, new Map())
      const locks = locksByRoom.get(room)!
      if (!locks.has(data.elementId)) {
        locks.set(data.elementId, socket.userId)
        socket.to(room).emit('element-locked', { elementId: data.elementId, userId: socket.userId })
      } else {
        // If lock owned by someone else, inform requester
        const owner = locks.get(data.elementId)
        socket.emit('element-lock-denied', { elementId: data.elementId, owner })
      }
    })

    socket.on('unlock-element', (data: { elementId: string }) => {
      if (!socket.currentRoom || !socket.userId) return
      const room = socket.currentRoom
      const locks = locksByRoom.get(room)
      if (!locks) return
      const owner = locks.get(data.elementId)
      if (owner === socket.userId) {
        locks.delete(data.elementId)
        socket.to(room).emit('element-unlocked', { elementId: data.elementId, userId: socket.userId })
      }
    })

    // Cursor movement
    socket.on('cursor-move', (data: CursorData) => {
      if (!socket.currentRoom) return

      // Broadcast to other users in the room
      socket.to(socket.currentRoom).emit('cursor-moved', {
        userId: socket.userId,
        x: data.x,
        y: data.y,
        timestamp: data.timestamp,
      })
    })

    // Typing indicators
    socket.on('typing-start', (data: { elementId: string }) => {
      if (!socket.currentRoom) return

      socket.to(socket.currentRoom).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
        elementId: data.elementId,
        timestamp: new Date(),
      })
    })

    socket.on('typing-stop', () => {
      if (!socket.currentRoom) return

      socket.to(socket.currentRoom).emit('user-stopped-typing', {
        userId: socket.userId,
        timestamp: new Date(),
      })
    })

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`User ${socket.userName} disconnected`)
      
      if (socket.userId) {
        userSockets.delete(socket.userId)
        
        // Notify others in the room
        if (socket.currentRoom) {
          socket.to(socket.currentRoom).emit('user-left', socket.userId)
          removeUserFromRoom(socket.currentRoom, socket.userId)
          // Release locks held by this user
          const locks = locksByRoom.get(socket.currentRoom)
          if (locks) {
            for (const [elId, owner] of Array.from(locks.entries())) {
              if (owner === socket.userId) {
                locks.delete(elId)
                socket.to(socket.currentRoom).emit('element-unlocked', { elementId: elId, userId: socket.userId })
              }
            }
          }
        }
      }
    })

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userName}:`, error)
    })
  })

  // Periodic cleanup of empty rooms
  setInterval(() => {
    for (const [roomId, members] of rooms.entries()) {
      if (members.size === 0) {
        rooms.delete(roomId)
        console.log(`Cleaned up empty room: ${roomId}`)
      }
    }
  }, 60000) // Clean up every minute
}

// Room management functions
const addUserToRoom = (roomId: string, userId: string) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set())
  }
  rooms.get(roomId)!.add(userId)
}

const removeUserFromRoom = (roomId: string, userId: string) => {
  const room = rooms.get(roomId)
  if (room) {
    room.delete(userId)
    if (room.size === 0) {
      rooms.delete(roomId)
    }
  }
}

const getRoomMembers = (roomId: string): string[] => {
  const room = rooms.get(roomId)
  return room ? Array.from(room) : []
}

// Analytics logging
const logElementUpdate = async (userId: string, elementId: string, updates: any) => {
  try {
    // Log element updates for analytics
    console.log(`Element update logged: User ${userId}, Element ${elementId}`)
    
    // You could store this in a database for analytics
    // await getPrismaClient().elementUpdateLog.create({
    //   data: {
    //     userId,
    //     elementId,
    //     updates: JSON.stringify(updates),
    //     timestamp: new Date(),
    //   },
    // })
  } catch (error) {
    console.error('Error logging element update:', error)
  }
}

// Broadcast functions for server-side events
export const broadcastToRoom = (io: SocketIOServer, roomId: string, event: string, data: any) => {
  io.to(roomId).emit(event, data)
}

export const broadcastToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  const socketId = userSockets.get(userId)
  if (socketId) {
    io.to(socketId).emit(event, data)
  }
}

export const getRoomStats = () => {
  const stats = {
    totalRooms: rooms.size,
    totalUsers: userSockets.size,
    rooms: Array.from(rooms.entries()).map(([roomId, members]) => ({
      roomId,
      memberCount: members.size,
      members: Array.from(members),
    })),
  }
  
  return stats
}

// Real-time notifications
export const sendNotification = (io: SocketIOServer, userId: string, notification: {
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  title?: string
}) => {
  broadcastToUser(io, userId, 'notification', {
    ...notification,
    timestamp: new Date(),
  })
}

// Website publish notifications
export const notifyWebsitePublished = (io: SocketIOServer, websiteId: string, userId: string) => {
  broadcastToUser(io, userId, 'website-published', {
    websiteId,
    message: 'Your website has been published successfully!',
    timestamp: new Date(),
  })
}

// Collaboration limits
export const MAX_COLLABORATORS_PER_ROOM = 10
export const MAX_ROOMS_PER_USER = 5

export const checkCollaborationLimits = (roomId: string, userId: string): boolean => {
  const room = rooms.get(roomId)
  if (room && room.size >= MAX_COLLABORATORS_PER_ROOM) {
    return false
  }
  
  // Check user's room count
  let userRoomCount = 0
  for (const [, members] of rooms.entries()) {
    if (members.has(userId)) {
      userRoomCount++
    }
  }
  
  return userRoomCount < MAX_ROOMS_PER_USER
}

export default initializeSocket
