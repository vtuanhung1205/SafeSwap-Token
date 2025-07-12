import { Server, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { TokenPrice } from '@/models/TokenPrice.model';
import { PriceUpdateMessage } from '@/types';

export class WebSocketService {
  private io: Server;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    // Monitor price changes and broadcast updates
    this.startPriceMonitoring();

    logger.info('🔌 WebSocket service initialized');
  }

  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);

    logger.info(`🔗 Client connected: ${clientId}`);

    // Send initial price data
    this.sendInitialPriceData(socket);

    // Handle client events
    socket.on('subscribe_prices', (tokens: string[]) => {
      this.handlePriceSubscription(socket, tokens);
    });

    socket.on('unsubscribe_prices', (tokens: string[]) => {
      this.handlePriceUnsubscription(socket, tokens);
    });

    socket.on('disconnect', () => {
      this.handleDisconnection(clientId);
    });

    socket.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
    });
  }

  private async sendInitialPriceData(socket: Socket): Promise<void> {
    try {
      const prices = await TokenPrice.find({});
      const priceData = prices.map(price => ({
        symbol: price.symbol,
        price: price.price,
        change24h: price.change24h,
        volume24h: price.volume24h,
        marketCap: price.marketCap,
        lastUpdated: price.lastUpdated,
      }));

      socket.emit('initial_prices', {
        success: true,
        data: priceData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to send initial price data:', error);
      socket.emit('initial_prices', {
        success: false,
        error: 'Failed to load price data',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handlePriceSubscription(socket: Socket, tokens: string[]): void {
    tokens.forEach(token => {
      socket.join(`price_${token.toUpperCase()}`);
    });
    
    logger.info(`Client ${socket.id} subscribed to: ${tokens.join(', ')}`);
    
    socket.emit('subscription_success', {
      subscribed: tokens,
      timestamp: new Date().toISOString(),
    });
  }

  private handlePriceUnsubscription(socket: Socket, tokens: string[]): void {
    tokens.forEach(token => {
      socket.leave(`price_${token.toUpperCase()}`);
    });
    
    logger.info(`Client ${socket.id} unsubscribed from: ${tokens.join(', ')}`);
    
    socket.emit('unsubscription_success', {
      unsubscribed: tokens,
      timestamp: new Date().toISOString(),
    });
  }

  private handleDisconnection(clientId: string): void {
    this.connectedClients.delete(clientId);
    logger.info(`🔌 Client disconnected: ${clientId}`);
  }

  private startPriceMonitoring(): void {
    // Monitor TokenPrice collection for changes
    const changeStream = TokenPrice.watch();
    
    changeStream.on('change', (change) => {
      if (change.operationType === 'update' || change.operationType === 'replace') {
        this.handlePriceUpdate(change.fullDocument);
      }
    });

    changeStream.on('error', (error) => {
      logger.error('Price monitoring error:', error);
    });
  }

  private handlePriceUpdate(tokenPrice: any): void {
    if (!tokenPrice) return;

    const priceUpdate: PriceUpdateMessage = {
      type: 'price_update',
      data: {
        symbol: tokenPrice.symbol,
        price: tokenPrice.price,
        change24h: tokenPrice.change24h,
        volume24h: tokenPrice.volume24h,
        marketCap: tokenPrice.marketCap,
        lastUpdated: tokenPrice.lastUpdated,
      },
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all clients subscribed to this token
    this.io.to(`price_${tokenPrice.symbol}`).emit('price_update', priceUpdate);
    
    // Also broadcast to general price updates room
    this.io.emit('price_update', priceUpdate);
  }

  public broadcastMessage(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  public sendToClient(clientId: string, event: string, data: any): void {
    const socket = this.connectedClients.get(clientId);
    if (socket) {
      socket.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
} 