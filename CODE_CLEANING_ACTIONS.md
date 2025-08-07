# SafeSwap Code Cleaning Action Plan

## 🎯 Immediate Actions (This Week)

### **1. Frontend Code Cleaning**

#### **A. Import Organization**
```bash
# Files to clean imports
- src/components/WalletAdapterDemo.jsx
- src/components/Auth/AptosConnectModal.jsx
- src/components/Dashboard/Dashboard.jsx
- src/components/pages/Wallet.jsx
```

#### **B. Error Handling Standardization**
```javascript
// Standard error handling pattern
const handleAsyncOperation = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const result = await operation();
    setData(result);
    toast.success('Operation successful');
    
  } catch (error) {
    console.error('Operation failed:', error);
    setError(error.message);
    toast.error('Operation failed');
    
  } finally {
    setIsLoading(false);
  }
};
```

#### **C. Component Documentation**
```javascript
/**
 * WalletAdapterDemo Component
 * 
 * A comprehensive demo component for testing the SafeSwap wallet adapter.
 * Provides UI for connecting/disconnecting wallets, signing transactions,
 * and testing all wallet adapter functionality.
 * 
 * @component
 * @example
 * <WalletAdapterDemo />
 */
const WalletAdapterDemo = () => {
  // Component implementation
};
```

### **2. Backend Code Cleaning**

#### **A. Route Organization**
```javascript
// Standard route structure
const router = express.Router();

// GET /api/wallet/balance
router.get('/balance', auth, asyncHandler(async (req, res) => {
  const balance = await walletService.getBalance(req.user.id);
  res.json({ success: true, data: balance });
}));

// POST /api/wallet/connect
router.post('/connect', auth, asyncHandler(async (req, res) => {
  const result = await walletService.connect(req.user.id, req.body);
  res.json({ success: true, data: result });
}));
```

#### **B. Service Layer Implementation**
```javascript
// src/services/walletService.js
class WalletService {
  async getBalance(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      
      const balance = await aptosService.getAccountBalance(user.walletAddress);
      return balance;
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      throw error;
    }
  }
  
  async connect(userId, walletData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      
      // Update user wallet info
      user.walletAddress = walletData.address;
      user.walletPublicKey = walletData.publicKey;
      await user.save();
      
      return { success: true, walletAddress: walletData.address };
    } catch (error) {
      logger.error('Failed to connect wallet:', error);
      throw error;
    }
  }
}

module.exports = new WalletService();
```

## 🔄 Integration Improvements

### **1. API Service Layer**

```javascript
// src/services/apiService.js
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
    localStorage.removeItem('token');
  }

  // Wallet methods
  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async connectWallet(walletData) {
    return this.request('/wallet/connect', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  // Transaction methods
  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }
}

export default new ApiService();
```

### **2. WebSocket Service**

```javascript
// src/services/websocketService.js
import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.socket.emit('join-user', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
    });

    this.socket.on('transaction-update', (data) => {
      this.notifyListeners('transaction-update', data);
    });

    this.socket.on('wallet-update', (data) => {
      this.notifyListeners('wallet-update', data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', error);
    });
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('WebSocket listener error:', error);
        }
      });
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default new WebSocketService();
```

## 🧪 Testing Implementation

### **1. Frontend Tests**

```javascript
// src/components/__tests__/WalletAdapterDemo.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletAdapterDemo from '../WalletAdapterDemo';

describe('WalletAdapterDemo', () => {
  test('renders wallet adapter demo', () => {
    render(<WalletAdapterDemo />);
    expect(screen.getByText('SafeSwap Wallet Adapter Demo')).toBeInTheDocument();
  });

  test('connects wallet successfully', async () => {
    render(<WalletAdapterDemo />);
    
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Wallet connected successfully!')).toBeInTheDocument();
    });
  });

  test('displays wallet status', () => {
    render(<WalletAdapterDemo />);
    expect(screen.getByText('Wallet Status')).toBeInTheDocument();
  });
});
```

### **2. Backend Tests**

```javascript
// src/routes/__tests__/wallet.test.js
const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');

describe('Wallet Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('GET /api/wallet/balance returns balance', async () => {
    const user = await User.create({
      email: 'test@example.com',
      walletAddress: '0x123',
    });

    const response = await request(app)
      .get('/api/wallet/balance')
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /api/wallet/connect connects wallet', async () => {
    const user = await User.create({
      email: 'test@example.com',
    });

    const walletData = {
      address: '0x123',
      publicKey: '0x456',
    };

    const response = await request(app)
      .post('/api/wallet/connect')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send(walletData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## 📊 Performance Monitoring

### **1. Frontend Monitoring**

```javascript
// src/utils/monitoring.js
class FrontendMonitor {
  constructor() {
    this.errors = [];
    this.performance = [];
  }

  trackError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    this.errors.push(errorData);
    console.error('Tracked error:', errorData);

    // Send to monitoring service
    this.sendToMonitoring('error', errorData);
  }

  trackPerformance(metric) {
    const performanceData = {
      ...metric,
      timestamp: new Date().toISOString(),
    };

    this.performance.push(performanceData);
    console.log('Performance metric:', performanceData);

    // Send to monitoring service
    this.sendToMonitoring('performance', performanceData);
  }

  sendToMonitoring(type, data) {
    // Implementation for sending to monitoring service
    fetch('/api/monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    }).catch(console.error);
  }
}

export default new FrontendMonitor();
```

### **2. Backend Monitoring**

```javascript
// src/utils/monitoring.js
const logger = require('./logger');

class BackendMonitor {
  trackRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    });
    
    next();
  }

  trackError(error, req) {
    logger.error('Application error', {
      message: error.message,
      stack: error.stack,
      url: req?.url,
      method: req?.method,
      userAgent: req?.get('User-Agent'),
      ip: req?.ip,
    });
  }

  trackPerformance(operation, duration) {
    logger.info('Performance metric', {
      operation,
      duration,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new BackendMonitor();
```

## 🚀 Deployment Checklist

### **Frontend Deployment**
- [ ] Build optimization
- [ ] Environment variables
- [ ] CDN configuration
- [ ] Error tracking setup
- [ ] Performance monitoring

### **Backend Deployment**
- [ ] Database migration
- [ ] Environment configuration
- [ ] SSL certificate
- [ ] Load balancer setup
- [ ] Monitoring dashboard

## 📈 Success Metrics

### **Code Quality Metrics**
- [ ] Test coverage > 80%
- [ ] TypeScript migration > 50%
- [ ] Documentation coverage > 90%
- [ ] Performance score > 90

### **Integration Metrics**
- [ ] API response time < 200ms
- [ ] WebSocket connection success > 99%
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%

## 🎯 Next Steps

1. **Week 1**: Implement API service layer
2. **Week 2**: Add WebSocket service
3. **Week 3**: Implement monitoring
4. **Week 4**: Add comprehensive tests
5. **Week 5**: Performance optimization
6. **Week 6**: Documentation completion

This action plan will significantly improve the code quality, maintainability, and performance of the SafeSwap project.
