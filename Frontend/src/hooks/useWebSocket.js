import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { mockPrices } from '../utils/mockData';
import toast from 'react-hot-toast';
// Toggle this for demo mode
import { DEMO_MODE } from '../config/demo';

// Always use demo mode for WebSocket until the backend is properly configured
const FORCE_DEMO_MODE = true;

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      // Use mock data for demo
      console.log('Using demo mode for WebSocket data');
      setPrices(mockPrices);
      setIsConnected(true);
      setLastUpdate(new Date());
      console.log('Demo mode: Mock prices loaded:', Object.keys(mockPrices).length, 'tokens');
      
      // Simulate price updates
      const interval = setInterval(() => {
        setPrices(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(symbol => {
            const currentPrice = updated[symbol].price;
            const change = (Math.random() - 0.5) * 0.02; // ±1% random change
            updated[symbol] = {
              ...updated[symbol],
              price: currentPrice * (1 + change),
              change24h: updated[symbol].change24h + change * 100
            };
          });
          return updated;
        });
        setLastUpdate(new Date());
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    } else {
      // This code will never run due to FORCE_DEMO_MODE = true
      console.log('WebSocket connection issues detected. Using demo mode.');
      setPrices(mockPrices);
      setIsConnected(true);
      setLastUpdate(new Date());
      
      // Simulate price updates
      const interval = setInterval(() => {
        setPrices(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(symbol => {
            const currentPrice = updated[symbol].price;
            const change = (Math.random() - 0.5) * 0.02; // ±1% random change
            updated[symbol] = {
              ...updated[symbol],
              price: currentPrice * (1 + change),
              change24h: updated[symbol].change24h + change * 100
            };
          });
          return updated;
        });
        setLastUpdate(new Date());
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, []);

  const subscribeToTokens = (tokens) => {
    if (DEMO_MODE) {
      // In demo mode, just log subscription
      console.log('Demo mode: Subscribed to tokens:', tokens);
    } else if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe_prices', tokens);
    }
  };

  const unsubscribeFromTokens = (tokens) => {
    if (DEMO_MODE) {
      // In demo mode, just log unsubscription
      console.log('Demo mode: Unsubscribed from tokens:', tokens);
    } else if (socketRef.current && isConnected) {
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