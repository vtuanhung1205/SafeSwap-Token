"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var express = require("express");
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// Load environment variables
dotenv.config();
var userSchema = new mongoose.Schema({
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
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!this.isModified('password'))
                        return [2 /*return*/, next()];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, bcrypt.genSalt(12)];
                case 2:
                    salt = _b.sent();
                    _a = this;
                    return [4 /*yield*/, bcrypt.hash(this.password, salt)];
                case 3:
                    _a.password = _b.sent();
                    next();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    next(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
});
// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcrypt.compare(candidatePassword, this.password)];
        });
    });
};
// Remove password from JSON output
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});
var User = mongoose.model('User', userSchema);
var app = express();
var PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json());
// CORS middleware for development
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// JWT Helper Functions
var generateToken = function (userId) {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
};
var verifyToken = function (token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
};
// Middleware to protect routes
var authMiddleware = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, user, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
                if (!token) {
                    return [2 /*return*/, res.status(401).json({ error: 'No token provided' })];
                }
                decoded = verifyToken(token);
                return [4 /*yield*/, User.findById(decoded.userId).select('-password')];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ error: 'User not found' })];
                }
                req.user = user;
                next();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                res.status(401).json({ error: 'Invalid token' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// ==============================================
// AUTHENTICATION ENDPOINTS
// ==============================================
// Register endpoint
app.post('/api/auth/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, firstName, lastName, walletAddress, existingUser, user, token, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName, walletAddress = _a.walletAddress;
                // Validation
                if (!email || !password || !firstName || !lastName) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Email, password, firstName, and lastName are required'
                        })];
                }
                if (password.length < 6) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Password must be at least 6 characters long'
                        })];
                }
                return [4 /*yield*/, User.findOne({ email: email.toLowerCase() })];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({ error: 'User already exists with this email' })];
                }
                user = new User({
                    email: email.toLowerCase(),
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    walletAddress: walletAddress
                });
                return [4 /*yield*/, user.save()];
            case 2:
                _b.sent();
                token = generateToken(user._id.toString());
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    token: token,
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
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Register error:', error_3);
                res.status(500).json({
                    error: 'Registration failed',
                    message: error_3.message
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Login endpoint
app.post('/api/auth/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isMatch, token, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                // Validation
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Email and password are required'
                        })];
                }
                return [4 /*yield*/, User.findOne({ email: email.toLowerCase() })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid email or password' })];
                }
                return [4 /*yield*/, user.comparePassword(password)];
            case 2:
                isMatch = _b.sent();
                if (!isMatch) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid email or password' })];
                }
                token = generateToken(user._id.toString());
                res.json({
                    success: true,
                    message: 'Login successful',
                    token: token,
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
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error('Login error:', error_4);
                res.status(500).json({
                    error: 'Login failed',
                    message: error_4.message
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Get current user profile (protected route)
app.get('/api/auth/profile', authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            res.json({
                success: true,
                user: req.user
            });
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to get profile',
                message: error.message
            });
        }
        return [2 /*return*/];
    });
}); });
// Update user profile (protected route)
app.put('/api/auth/profile', authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, firstName, lastName, walletAddress, user, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, firstName = _a.firstName, lastName = _a.lastName, walletAddress = _a.walletAddress;
                return [4 /*yield*/, User.findById(req.user._id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                // Update fields if provided
                if (firstName)
                    user.firstName = firstName;
                if (lastName)
                    user.lastName = lastName;
                if (walletAddress)
                    user.walletAddress = walletAddress;
                return [4 /*yield*/, user.save()];
            case 2:
                _b.sent();
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
                return [3 /*break*/, 4];
            case 3:
                error_5 = _b.sent();
                res.status(500).json({
                    error: 'Failed to update profile',
                    message: error_5.message
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Change password (protected route)
app.put('/api/auth/change-password', authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, currentPassword, newPassword, user, isMatch, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, currentPassword = _a.currentPassword, newPassword = _a.newPassword;
                if (!currentPassword || !newPassword) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Current password and new password are required'
                        })];
                }
                if (newPassword.length < 6) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'New password must be at least 6 characters long'
                        })];
                }
                return [4 /*yield*/, User.findById(req.user._id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                return [4 /*yield*/, user.comparePassword(currentPassword)];
            case 2:
                isMatch = _b.sent();
                if (!isMatch) {
                    return [2 /*return*/, res.status(401).json({ error: 'Current password is incorrect' })];
                }
                // Update password
                user.password = newPassword;
                return [4 /*yield*/, user.save()];
            case 3:
                _b.sent();
                res.json({
                    success: true,
                    message: 'Password changed successfully'
                });
                return [3 /*break*/, 5];
            case 4:
                error_6 = _b.sent();
                res.status(500).json({
                    error: 'Failed to change password',
                    message: error_6.message
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// List all users (for demo purposes)
app.get('/api/users', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User.find().select('-password').limit(50)];
            case 1:
                users = _a.sent();
                res.json({
                    success: true,
                    count: users.length,
                    users: users
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                res.status(500).json({
                    error: 'Failed to get users',
                    message: error_7.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Simple health check
app.get('/health', function (req, res) {
    var _a;
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        database: ((_a = mongoose.connection.db) === null || _a === void 0 ? void 0 : _a.databaseName) || 'unknown'
    });
});
// API info endpoint
app.get('/api/info', function (req, res) {
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
app.get('/api/database/test', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var collections, stats, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!mongoose.connection.db) {
                    return [2 /*return*/, res.status(500).json({ error: 'Database not connected' })];
                }
                return [4 /*yield*/, mongoose.connection.db.listCollections().toArray()];
            case 1:
                collections = _a.sent();
                return [4 /*yield*/, mongoose.connection.db.stats()];
            case 2:
                stats = _a.sent();
                res.json({
                    status: 'success',
                    database: mongoose.connection.db.databaseName,
                    collections: collections.map(function (c) { return c.name; }),
                    stats: {
                        collections: stats.collections,
                        objects: stats.objects,
                        dataSize: stats.dataSize,
                        storageSize: stats.storageSize
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                res.status(500).json({
                    error: 'Database test failed',
                    message: error_8.message
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// MongoDB connection
var connectDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mongoUri, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                mongoUri = process.env.MONGODB_URI;
                if (!mongoUri) {
                    throw new Error('MONGODB_URI not found');
                }
                return [4 /*yield*/, mongoose.connect(mongoUri)];
            case 1:
                _a.sent();
                console.log('📦 MongoDB connected successfully');
                if (!mongoose.connection.db) return [3 /*break*/, 3];
                return [4 /*yield*/, mongoose.connection.db.admin().ping()];
            case 2:
                _a.sent();
                console.log('🏓 Database ping successful');
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                error_9 = _a.sent();
                console.error('❌ Database connection failed:', error_9.message);
                process.exit(1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Start server
var startServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, connectDB()];
            case 1:
                _a.sent();
                app.listen(PORT, function () {
                    console.log("\uD83D\uDE80 SafeSwap Backend Server running on port ".concat(PORT));
                    console.log("\uD83C\uDF0D Environment: ".concat(process.env.NODE_ENV || 'development'));
                    console.log("\uD83D\uDCE1 Health check: http://localhost:".concat(PORT, "/health"));
                });
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                console.error('Failed to start server:', error_10);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
startServer();
