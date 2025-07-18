import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL || 'https://safeswap-backend-service.onrender.com';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
      path: '/socket.io', // Chỉ định đường dẫn ở đây
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      // Price update handlers
      socket.on('initial_prices', (data) => {
        if (data.success && data.data) {
          const priceMap = {};
          data.data.forEach(price => {
            priceMap[price.symbol] = price;
          });
          setPrices(priceMap);
          setLastUpdate(new Date());
          console.log('Initial prices loaded:', Object.keys(priceMap).length, 'tokens');
        }
      });

      socket.on('price_update', (data) => {
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
      });

      socket.on('subscription_success', (data) => {
        console.log('Subscribed to tokens:', data.subscribed);
      });

      socket.on('unsubscription_success', (data) => {
        console.log('Unsubscribed from tokens:', data.unsubscribed);
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
  }, []);

  const subscribeToTokens = (tokens) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe_prices', tokens);
    }
  };

  const unsubscribeFromTokens = (tokens) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('unsubscribe_prices', tokens);
    }
  };

  const getTokenPrice = (symbol) => {
    return prices[symbol?.toUpperCase()] || null;
  };

  const getAllPrices = () => {
    return prices;
  };

  const getFormattedPrice = (symbol, decimals = 6) => {
    const price = getTokenPrice(symbol);
    if (!price) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price.price < 1 ? decimals : 2,
      maximumFractionDigits: price.price < 1 ? decimals : 2,
    }).format(price.price);
  };

  const getPriceChange24h = (symbol) => {
    const price = getTokenPrice(symbol);
    return price?.change24h || 0;
  };

  const getFormattedPriceChange = (symbol) => {
    const change = getPriceChange24h(symbol);
    const isPositive = change >= 0;
    
    return {
      value: change,
      formatted: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
      isPositive,
      className: isPositive ? 'text-green-500' : 'text-red-500',
    };
  };

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