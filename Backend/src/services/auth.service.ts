import jwt from 'jsonwebtoken';
import { User, IUser } from '@/models/User.model';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  public generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign({ id: userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
    const refreshToken = jwt.sign({ id: userId }, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
    });
    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      logger.error('Access token verification failed:', error);
      throw createError('Invalid access token', 401);
    }
  }

  public verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtRefreshSecret) as JWTPayload;
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      throw createError('Invalid refresh token', 401);
    }
  }

  public async createUserFromGoogle(googleProfile: any): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ 
        $or: [
          { email: googleProfile.emails[0].value },
          { googleId: googleProfile.id }
        ]
      });

      if (existingUser) {
        // Update existing user with Google ID if not present
        if (!existingUser.googleId) {
          existingUser.googleId = googleProfile.id;
          await existingUser.save();
        }
        return existingUser;
      }

      // Create new user
      const newUser = new User({
        email: googleProfile.emails[0].value,
        name: googleProfile.displayName,
        avatar: googleProfile.photos[0]?.value,
        googleId: googleProfile.id,
        isVerified: true, // Google accounts are considered verified
      });

      await newUser.save();
      logger.info(`New user created via Google OAuth: ${newUser.email}`);
      
      return newUser;
    } catch (error) {
      logger.error('Failed to create user from Google profile:', error);
      throw createError('Failed to create user', 500);
    }
  }

  public async createUser(userData: {
    email: string;
    name: string;
    avatar?: string;
  }): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        throw createError('User already exists', 400);
      }

      const newUser = new User({
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        isVerified: false,
      });

      await newUser.save();
      logger.info(`New user created: ${newUser.email}`);
      
      return newUser;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  public async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      logger.error(`Failed to get user by ID ${userId}:`, error);
      return null;
    }
  }

  public async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      logger.error(`Failed to get user by email ${email}:`, error);
      return null;
    }
  }

  public async updateUserWallet(userId: string, walletAddress: string): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { walletAddress },
        { new: true }
      );

      if (!user) {
        throw createError('User not found', 404);
      }

      logger.info(`User ${userId} wallet updated: ${walletAddress}`);
      return user;
    } catch (error) {
      logger.error(`Failed to update user wallet:`, error);
      throw error;
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        throw createError('User not found', 404);
      }

      const newTokens = this.generateTokens({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      return newTokens;
    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      throw error;
    }
  }

  public async validateTokenAndGetUser(token: string): Promise<IUser> {
    try {
      const decoded = this.verifyAccessToken(token);
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      logger.error('Token validation failed:', error);
      throw error;
    }
  }
} 