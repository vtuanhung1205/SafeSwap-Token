import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL || 'https://safeswap-backend-service.onrender.com';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null); // Removed TypeScript syntax

  // Function to connect the socket
  const connectSocket = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      setIsConnected(true);
      toast.success('Live data connection established!');
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      if (reason !== 'io client disconnect') {
        toast.error('Live data connection lost. Reconnecting...');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      setIsConnected(false);
    });
    
    socket.on('initial_prices', (data) => {
      if (data.success && data.data) {
        const priceMap = {};
        data.data.forEach(price => {
          priceMap[price.symbol] = price;
        });
        setPrices(priceMap);
        setLastUpdate(new Date());
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

  }, []);

  // Effect to manage connection lifecycle
  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);
  
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
    if (!price || typeof price.price !== 'number') return '$0.00'; // Added check for price type
    
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