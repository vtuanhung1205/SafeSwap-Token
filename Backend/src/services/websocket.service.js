const { logger } = require('../utils/logger');

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connectedClients = new Map();
    this.init();
  }

  init() {
    // Add namespace for better organization
    const mainNamespace = this.io.of('/');
    
    mainNamespace.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Send welcome message to confirm connection
      socket.emit('connection_established', {
        message: 'Connected to SafeSwap WebSocket server',
        socketId: socket.id
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on('subscribe', (data) => {
        try {
          const { channel } = data;
          if (!channel) {
            socket.emit('error', { message: 'Channel name is required' });
            return;
          }
          
          socket.join(channel);
          logger.info(`Client ${socket.id} subscribed to ${channel}`);
          
          // Confirm subscription
          socket.emit('subscribed', { channel });
        } catch (error) {
          logger.error(`Error in subscribe handler: ${error.message}`);
          socket.emit('error', { message: 'Failed to subscribe to channel' });
        }
      });

      socket.on('unsubscribe', (data) => {
        try {
          const { channel } = data;
          if (!channel) {
            socket.emit('error', { message: 'Channel name is required' });
            return;
          }
          
          socket.leave(channel);
          logger.info(`Client ${socket.id} unsubscribed from ${channel}`);
          
          // Confirm unsubscription
          socket.emit('unsubscribed', { channel });
        } catch (error) {
          logger.error(`Error in unsubscribe handler: ${error.message}`);
          socket.emit('error', { message: 'Failed to unsubscribe from channel' });
        }
      });
      
      // Add ping/pong for connection health check
      socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
          callback({ 
            time: Date.now(),
            status: 'ok'
          });
        } else {
          socket.emit('pong', { time: Date.now() });
        }
      });
    });
  }

  broadcast(channel, data) {
    try {
      this.io.to(channel).emit('data', {
        channel,
        timestamp: Date.now(),
        data
      });
    } catch (error) {
      logger.error(`Error broadcasting to ${channel}: ${error.message}`);
    }
  }

  getConnectedClientsCount() {
    return this.connectedClients.size;
  }
  
  // Helper method to send direct message to specific client
  sendToClient(socketId, event, data) {
    try {
      const socket = this.connectedClients.get(socketId);
      if (socket) {
        socket.emit(event, data);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error sending to client ${socketId}: ${error.message}`);
      return false;
    }
  }
}

module.exports = { WebSocketService };
