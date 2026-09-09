import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL =
  (import.meta.env.VITE_WEBSOCKET_URL
    ? import.meta.env.VITE_WEBSOCKET_URL.replace(/^http/, 'ws')
    : 'ws://localhost:5000');

// Singleton socket — shared across all component instances to prevent
// creating multiple connections when useWebSocket is called in multiple places
let sharedSocket = null;
let connectionCount = 0;

// Cache Intl.NumberFormat instances to prevent massive CPU overhead on every render
const formatterStandard = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatterDecimals = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
});

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    connectionCount++;

    // Reuse existing socket if it exists
    if (!sharedSocket) {
      sharedSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        // Reconnect with exponential backoff to avoid hammering the server
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 5,
      });
    }

    socketRef.current = sharedSocket;
    const socket = sharedSocket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = () => setIsConnected(false);

    const onInitialPrices = (data) => {
      if (data.success && data.data) {
        const priceMap = {};
        data.data.forEach(price => {
          priceMap[price.symbol] = price;
        });
        setPrices(priceMap);
        setLastUpdate(new Date());
      }
    };

    const onPriceUpdate = (data) => {
      if (data.type === 'price_update' && data.data) {
        setPrices(prev => ({
          ...prev,
          [data.data.symbol]: {
            ...prev[data.data.symbol],
            ...data.data,
          }
        }));
        setLastUpdate(new Date());
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('initial_prices', onInitialPrices);
    socket.on('price_update', onPriceUpdate);

    // If socket already connected, sync state immediately
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('initial_prices', onInitialPrices);
      socket.off('price_update', onPriceUpdate);

      connectionCount--;
      // Only disconnect the socket when NO components are using it
      if (connectionCount === 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
      }
    };
  }, []);

  const subscribeToTokens = useCallback((tokens) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_prices', tokens);
    }
  }, []);

  const unsubscribeFromTokens = useCallback((tokens) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe_prices', tokens);
    }
  }, []);

  const getTokenPrice = useCallback((symbol) => {
    return prices[symbol?.toUpperCase()] || null;
  }, [prices]);

  const getAllPrices = useCallback(() => prices, [prices]);

  const getFormattedPrice = useCallback((symbol, decimals = 6) => {
    const price = prices[symbol?.toUpperCase()];
    if (!price) return '$0.00';
    return price.price < 1
      ? formatterDecimals.format(price.price)
      : formatterStandard.format(price.price);
  }, [prices]);

  const getPriceChange24h = useCallback((symbol) => {
    return prices[symbol?.toUpperCase()]?.change24h || 0;
  }, [prices]);

  const getFormattedPriceChange = useCallback((symbol) => {
    const change = prices[symbol?.toUpperCase()]?.change24h || 0;
    const isPositive = change >= 0;
    return {
      value: change,
      formatted: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
      isPositive,
      className: isPositive ? 'text-green-500' : 'text-red-500',
    };
  }, [prices]);

  return {
    isConnected,
    prices,
    lastUpdate,
    subscribeToTokens,
    unsubscribeFromTokens,
    getTokenPrice,
    getAllPrices,
    getFormattedPrice,
    getPriceChange24h,
    getFormattedPriceChange,
  };
};