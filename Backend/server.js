const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Sample data (in a real app, this would be in a database)
const users = [];
const swapHistory = [
  {
    _id: '1',
    fromToken: 'BTC',
    toToken: 'ETH',
    fromAmount: 0.5,
    toAmount: 8.2,
    usdValue: 31500,
    status: 'completed',
    scamRisk: 15,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: '2',
    fromToken: 'ETH',
    toToken: 'USDT',
    fromAmount: 2.5,
    toAmount: 6250,
    usdValue: 6250,
    status: 'completed',
    scamRisk: 5,
    createdAt: '2024-01-14T14:22:00Z'
  },
  {
    _id: '3',
    fromToken: 'APT',
    toToken: 'BTC',
    fromAmount: 1000,
    toAmount: 0.125,
    usdValue: 7875,
    status: 'pending',
    scamRisk: 25,
    createdAt: '2024-01-13T09:15:00Z'
  }
];

const prices = {
  BTC: { price: 63000, change24h: 2.5 },
  ETH: { price: 2500, change24h: -1.2 },
  APT: { price: 7.85, change24h: 5.8 },
  USDT: { price: 1.0, change24h: 0.1 },
  USDC: { price: 1.0, change24h: 0.0 },
  SOL: { price: 63, change24h: 3.2 },
  ADA: { price: 1.0, change24h: -0.8 },
  MATIC: { price: 0.85, change24h: 1.5 },
  DOGE: { price: 0.084, change24h: -2.1 }
};

const stats = {
  totalSwaps: 47,
  totalVolume: 125420.50,
  successRate: 85.1,
  avgAmount: 2668.95
};

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// JWT Secret
const JWT_SECRET = 'your-secret-key';
const REFRESH_SECRET = 'your-refresh-secret';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Routes
app.get('/', (req, res) => {
  res.send('SafeSwap API is running');
});

// Auth routes
app.post('/api/v1/auth/login', (req, res) => {
  const { email, name } = req.body;
  
  // Find user or create new one
  let user = users.find(u => u.email === email);
  
  if (!user) {
    user = {
      id: users.length + 1,
      email,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=06b6d4&color=fff&size=128`,
      walletAddress: '0x' + Math.random().toString(16).substr(2, 40)
    };
    users.push(user);
  }
  
  const tokens = generateTokens(user);
  
  res.json({
    success: true,
    data: {
      user,
      tokens
    }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { email, name, avatar } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }
  
  const user = {
    id: users.length + 1,
    email,
    name,
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=06b6d4&color=fff&size=128`,
    walletAddress: '0x' + Math.random().toString(16).substr(2, 40)
  };
  
  users.push(user);
  const tokens = generateTokens(user);
  
  res.json({
    success: true,
    data: {
      user,
      tokens
    }
  });
});

app.get('/api/v1/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      user
    }
  });
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required'
    });
  }
  
  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET);
    const tokens = generateTokens({ id: user.id });
    
    res.json({
      success: true,
      data: {
        tokens
      }
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

app.get('/api/v1/auth/validate', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  res.json({
    success: true,
    data: {
      user
    }
  });
});

// Swap routes
app.post('/api/v1/swap/quote', authenticateToken, (req, res) => {
  const { fromToken, toToken, amount } = req.body;
  
  // Get prices
  const fromPrice = prices[fromToken]?.price || 1;
  const toPrice = prices[toToken]?.price || 1;
  const rate = fromPrice / toPrice;
  const calculatedAmount = parseFloat(amount) * rate * 0.997; // 0.3% fee
  
  const quote = {
    fromAmount: parseFloat(amount),
    toAmount: calculatedAmount,
    exchangeRate: rate,
    slippage: 0.5,
    fee: parseFloat(amount) * 0.003,
    priceImpact: 0.1
  };
  
  res.json({
    success: true,
    data: {
      quote
    }
  });
});

app.post('/api/v1/swap/execute', authenticateToken, (req, res) => {
  const { fromToken, toToken, fromAmount, toAmount } = req.body;
  
  // Create new swap transaction
  const transaction = {
    _id: Date.now().toString(),
    fromToken,
    toToken,
    fromAmount: parseFloat(fromAmount),
    toAmount: parseFloat(toAmount),
    usdValue: parseFloat(fromAmount) * (prices[fromToken]?.price || 1),
    status: 'pending',
    scamRisk: Math.floor(Math.random() * 30),
    hash: '0x' + Math.random().toString(16).substr(2, 64),
    createdAt: new Date().toISOString()
  };
  
  swapHistory.unshift(transaction);
  
  res.json({
    success: true,
    data: {
      transaction
    }
  });
});

app.get('/api/v1/swap/history', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  
  let filteredSwaps = swapHistory;
  
  if (status) {
    filteredSwaps = filteredSwaps.filter(swap => swap.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedSwaps = filteredSwaps.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      swaps: paginatedSwaps,
      total: filteredSwaps.length,
      page,
      limit
    }
  });
});

app.get('/api/v1/swap/stats', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: stats
  });
});

// Price routes
app.get('/api/v1/price/all', (req, res) => {
  res.json({
    success: true,
    data: prices
  });
});

app.get('/api/v1/price/token/:symbol', (req, res) => {
  const { symbol } = req.params;
  const price = prices[symbol];
  
  if (!price) {
    return res.status(404).json({
      success: false,
      message: 'Token not found'
    });
  }
  
  res.json({
    success: true,
    data: price
  });
});

app.post('/api/v1/price/analyze', (req, res) => {
  const { tokenAddress, tokenName, tokenSymbol } = req.body;
  
  // Mock scam analysis
  const analysis = {
    isScam: Math.random() > 0.8, // 20% chance of being flagged
    riskScore: Math.floor(Math.random() * 100),
    confidence: Math.floor(Math.random() * 30) + 70,
    reasons: ['Price volatility detected', 'Low liquidity warning'],
    recommendation: 'Proceed with caution'
  };
  
  res.json({
    success: true,
    data: {
      analysis
    }
  });
});

// WebSocket setup for real-time price updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial prices
  socket.emit('initial_prices', {
    success: true,
    data: Object.entries(prices).map(([symbol, data]) => ({
      symbol,
      ...data
    }))
  });
  
  // Handle token subscriptions
  socket.on('subscribe_prices', (tokens) => {
    console.log('Client subscribed to tokens:', tokens);
    socket.emit('subscription_success', {
      subscribed: tokens
    });
  });
  
  socket.on('unsubscribe_prices', (tokens) => {
    console.log('Client unsubscribed from tokens:', tokens);
    socket.emit('unsubscription_success', {
      unsubscribed: tokens
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Simulate price updates
setInterval(() => {
  Object.keys(prices).forEach(symbol => {
    const currentPrice = prices[symbol].price;
    const change = (Math.random() - 0.5) * 0.02; // ±1% random change
    
    prices[symbol] = {
      price: currentPrice * (1 + change),
      change24h: prices[symbol].change24h + change * 100
    };
    
    // Broadcast price update to all connected clients
    io.emit('price_update', {
      type: 'price_update',
      data: {
        symbol,
        ...prices[symbol]
      }
    });
  });
}, 5000); // Update every 5 seconds 