import { Server, Socket } from 'socket.io'

export function setupSocketEvents(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id)

    // Subscribe to lead updates
    socket.on('subscribe_lead', (leadId: string) => {
      socket.join(`lead_${leadId}`)
      console.log(`Socket ${socket.id} subscribed to lead ${leadId}`)
    })

    // Unsubscribe from lead updates
    socket.on('unsubscribe_lead', (leadId: string) => {
      socket.leave(`lead_${leadId}`)
      console.log(`Socket ${socket.id} unsubscribed from lead ${leadId}`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}

