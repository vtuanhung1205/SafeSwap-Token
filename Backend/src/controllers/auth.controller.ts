import { Request, Response } from 'express';
import passport from 'passport';
import { AuthService } from '@/services/auth.service';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public googleAuth = asyncHandler(async (req: Request, res: Response) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
  });

  public googleCallback = asyncHandler(async (req: Request, res: Response) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      if (err) {
        logger.error('Google OAuth error:', err);
        return res.redirect(`${process.env.CORS_ORIGIN}/auth/error`);
      }

      if (!user) {
        logger.warn('Google OAuth failed:', info);
        return res.redirect(`${process.env.CORS_ORIGIN}/auth/error`);
      }

      try {
        const tokens = this.authService.generateTokens({
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
        });

        // Set secure cookies
        res.cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.redirect(`${process.env.CORS_ORIGIN}/dashboard`);
      } catch (error) {
        logger.error('Token generation failed:', error);
        res.redirect(`${process.env.CORS_ORIGIN}/auth/error`);
      }
    })(req, res);
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, name } = req.body;

    if (!email || !name) {
      throw createError('Email and name are required', 400);
    }

    try {
      // For demo purposes, we'll create user if not exists
      let user = await this.authService.getUserByEmail(email);
      
      if (!user) {
        user = await this.authService.createUser({ email, name });
      }

      const tokens = this.authService.generateTokens({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isVerified: user.isVerified,
            walletAddress: user.walletAddress,
          },
          tokens,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  });

  public register = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, avatar } = req.body;

    if (!email || !name) {
      throw createError('Email and name are required', 400);
    }

    try {
      const user = await this.authService.createUser({ email, name, avatar });

      const tokens = this.authService.generateTokens({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isVerified: user.isVerified,
            walletAddress: user.walletAddress,
          },
          tokens,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token is required', 400);
    }

    try {
      const tokens = await this.authService.refreshAccessToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  });

  public logout = asyncHandler(async (req: Request, res: Response) => {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  public getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
      const user = await this.authService.getUserById(userId);

      if (!user) {
        throw createError('User not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isVerified: user.isVerified,
            walletAddress: user.walletAddress,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  });

  public updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { name, avatar } = req.body;

    try {
      const user = await this.authService.getUserById(userId);

      if (!user) {
        throw createError('User not found', 404);
      }

      if (name) user.name = name;
      if (avatar) user.avatar = avatar;

      await user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isVerified: user.isVerified,
            walletAddress: user.walletAddress,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update profile failed:', error);
      throw error;
    }
  });

  public connectWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      throw createError('Wallet address is required', 400);
    }

    try {
      const user = await this.authService.updateUserWallet(userId, walletAddress);

      const response: ApiResponse = {
        success: true,
        message: 'Wallet connected successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isVerified: user.isVerified,
            walletAddress: user.walletAddress,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Connect wallet failed:', error);
      throw error;
    }
  });

  public validateToken = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;

    const response: ApiResponse = {
      success: true,
      message: 'Token is valid',
      data: { user },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });
} 