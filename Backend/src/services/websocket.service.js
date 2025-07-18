const { logger } = require('../utils/logger');

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connectedClients = new Map();
    this.init();
  }

  init() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on('subscribe', (data) => {
        const { channel } = data;
        socket.join(channel);
        logger.info(`Client ${socket.id} subscribed to ${channel}`);
      });

      socket.on('unsubscribe', (data) => {
        const { channel } = data;
        socket.leave(channel);
        logger.info(`Client ${socket.id} unsubscribed from ${channel}`);
      });
    });
  }

  broadcast(channel, data) {
    this.io.to(channel).emit('data', data);
  }

  getConnectedClientsCount() {
    return this.connectedClients.size;
  }
}

module.exports = { WebSocketService };
