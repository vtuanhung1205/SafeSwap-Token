import * as dotenv from 'dotenv';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// User Schema
interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  walletAddress?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  walletAddress: {
    type: String,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete (ret as any).password;
    delete (ret as any).__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// JWT Helper Functions
const generateToken = (userId: string) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'default-secret', 
    { expiresIn: '7d' }
  );
};

const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
};

// Middleware to protect routes
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded: any = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==============================================
// AUTHENTICATION ENDPOINTS
// ==============================================

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, walletAddress } = req.body;
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, firstName, and lastName are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      walletAddress
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        walletAddress: user.walletAddress,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
    
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      message: error.message 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        walletAddress: user.walletAddress,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      message: error.message 
    });
  }
});

// Get current user profile (protected route)
app.get('/api/auth/profile', authMiddleware, async (req: any, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to get profile', 
      message: error.message 
    });
  }
});

// Update user profile (protected route)
app.put('/api/auth/profile', authMiddleware, async (req: any, res) => {
  try {
    const { firstName, lastName, walletAddress } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (walletAddress) user.walletAddress = walletAddress;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        walletAddress: user.walletAddress,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to update profile', 
      message: error.message 
    });
  }
});

// Change password (protected route)
app.put('/api/auth/change-password', authMiddleware, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check current password
    const isMatch = await (user as any).comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to change password', 
      message: error.message 
    });
  }
});

// List all users (for demo purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').limit(50);
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to get users', 
      message: error.message 
    });
  }
});

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    database: mongoose.connection.db?.databaseName || 'unknown'
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'SafeSwap Backend API',
    version: '1.0.0',
    description: 'Token Swap Platform on Aptos',
    endpoints: {
      health: '/health',
      info: '/api/info',
      database: '/api/database/test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile',
      updateProfile: 'PUT /api/auth/profile',
      changePassword: 'PUT /api/auth/change-password',
      users: 'GET /api/users'
    }
  });
});

// Database test endpoint
app.get('/api/database/test', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Get database stats
    const stats = await mongoose.connection.db.stats();
    
    res.json({
      status: 'success',
      database: mongoose.connection.db.databaseName,
      collections: collections.map(c => c.name),
      stats: {
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Database test failed', 
      message: error.message 
    });
  }
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found');
    }

    await mongoose.connect(mongoUri);
    console.log('📦 MongoDB connected successfully');
    
    // Test ping
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Database ping successful');
    }
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 SafeSwap Backend Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
