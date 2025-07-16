import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockDB } from '@/services/mockDatabase.service';
import { logger } from '@/utils/logger';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  walletAddress?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MockAuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'mock-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'mock-refresh-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  public generateTokens(payload: JWTPayload): AuthTokens {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      logger.error('Access token verification failed:', error);
      throw new Error('Invalid access token');
    }
  }

  public async registerUser(email: string, password: string, name: string): Promise<{ user: MockUser; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await mockDB.findUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = await mockDB.createUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        isVerified: false
      });

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        name: user.name
      });

      logger.info(`New user registered: ${email}`);

      return { user, tokens };
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  public async loginUser(email: string, password: string): Promise<{ user: MockUser; tokens: AuthTokens }> {
    try {
      // Find user by email
      const user = await mockDB.findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        name: user.name
      });

      logger.info(`User logged in: ${email}`);

      return { user, tokens };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  public async getUserById(userId: string): Promise<MockUser | null> {
    try {
      return await mockDB.findUserById(userId);
    } catch (error) {
      logger.error('Get user by ID failed:', error);
      throw error;
    }
  }

  public async updateUser(userId: string, updates: Partial<MockUser>): Promise<MockUser | null> {
    try {
      return await mockDB.updateUser(userId, updates);
    } catch (error) {
      logger.error('Update user failed:', error);
      throw error;
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as JWTPayload;
      
      // Verify user still exists
      const user = await mockDB.findUserById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        name: user.name
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new Error('Invalid refresh token');
    }
  }
}
