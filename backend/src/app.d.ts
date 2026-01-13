// Type declarations for Express app extensions
import { Server as SocketIOServer } from 'socket.io'

declare global {
  namespace Express {
    interface Application {
      get(key: 'io'): SocketIOServer
      set(key: 'io', value: SocketIOServer): void
    }
  }
}

export {}

