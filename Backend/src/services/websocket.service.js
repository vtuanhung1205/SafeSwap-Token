const { logger } = require('../utils/logger');

class WebSocketService {
  constructor(io, priceFeedService) {
    this.io = io;
    this.priceFeedService = priceFeedService;
    this.connectedClients = new Map();
    this.init();
    if (this.priceFeedService) {
      this.startPriceBroadcast();
    }
  }

  init() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      if (this.priceFeedService) {
        const prices = this.priceFeedService.getAllPrices();
        const priceArray = Object.values(prices);
        socket.emit('initial_prices', { success: true, data: priceArray });
      }

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on('subscribe_prices', (tokens) => {
        tokens.forEach(token => socket.join(`price_${token}`));
        logger.info(`Client ${socket.id} subscribed to prices: ${tokens}`);
        socket.emit('subscription_success', { subscribed: tokens });
      });

      socket.on('unsubscribe_prices', (tokens) => {
        tokens.forEach(token => socket.leave(`price_${token}`));
        logger.info(`Client ${socket.id} unsubscribed from prices: ${tokens}`);
        socket.emit('unsubscription_success', { unsubscribed: tokens });
      });
    });
  }

  emitToSocket(socketId, event, data) {
    this.io.to(socketId).emit(event, data);
  }

  broadcastGlobal(event, data) {
    this.io.emit(event, data);
  }

  broadcast(channel, data) {
    this.io.to(channel).emit('data', data);
  }

  startPriceBroadcast() {
    // Fetch and broadcast prices every 10 seconds
    setInterval(async () => {
      try {
        const symbols = ['APT', 'ETH', 'BTC', 'USDC', 'USDT'];
        await this.priceFeedService.getMultiplePrices(symbols);
        const prices = this.priceFeedService.getAllPrices();
        
        Object.values(prices).forEach(price => {
          // Emit to anyone who subscribed to this token's room (or just globally for simplicity? let's do global so the frontend useWebSocket doesn't miss if rooms break)
          this.io.emit('price_update', { type: 'price_update', data: price });
        });
      } catch (error) {
        logger.error('Error broadcasting prices:', error.message);
      }
    }, 10000);
  }

  getConnectedClientsCount() {
    return this.connectedClients.size;
  }
}

module.exports = { WebSocketService };
