import jwt from 'jsonwebtoken';
import { User, IUser } from '@/models/User.model';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private jwtRefreshSecret: string;
  private jwtRefreshExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_key';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  public async validateUser(email: string, password: string): Promise<IUser | null> {
    try {
      // For demo purposes, just find user by email (no password check)
      return await User.findOne({ email });
    } catch (error) {
      logger.error('User validation failed:', error);
      return null;
    }
  }

  public generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    // Create payload object
    const payload = { id: userId };
    
    const accessToken = jwt.sign(
      payload,
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
    
    const refreshToken = jwt.sign(
      payload,
      this.jwtRefreshSecret,
      { expiresIn: this.jwtRefreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  public verifyToken(token: string, isRefreshToken = false): any {
    try {
      const secret = isRefreshToken ? this.jwtRefreshSecret : this.jwtSecret;
      return jwt.verify(token, secret);
    } catch (error) {
      throw createError(401, 'Invalid or expired token');
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

  public async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.verifyToken(refreshToken, true);
      const user = await this.getUserById(decoded.id);

      if (!user) {
        throw createError('User not found', 404);
      }

      const newTokens = this.generateTokens(user._id.toString());

      return newTokens;
    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      throw error;
    }
  }

  public async validateTokenAndGetUser(token: string): Promise<IUser> {
    try {
      const decoded = this.verifyToken(token);
      const user = await this.getUserById(decoded.id);

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