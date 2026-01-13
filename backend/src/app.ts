import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { setupSocketEvents } from './socket/events'

// Routes
import callsRouter from './routes/calls'
import emailsRouter from './routes/emails'
import leadsRouter from './routes/leads'
import followupsRouter from './routes/followups'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

app.set('io', io)

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/calls', callsRouter)
app.use('/api/emails', emailsRouter)
app.use('/api/leads', leadsRouter)
app.use('/api/followups', followupsRouter)

// Setup Socket.io events
setupSocketEvents(io)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📡 WebSocket server ready`)
})

