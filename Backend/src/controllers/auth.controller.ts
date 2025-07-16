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

  // Basic email/password registration
  public register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, confirmPassword } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      throw createError('Email, password, and name are required', 400);
    }

    if (password !== confirmPassword) {
      throw createError('Passwords do not match', 400);
    }

    if (password.length < 6) {
      throw createError('Password must be at least 6 characters long', 400);
    }

    try {
      const result = await this.authService.registerUser(email, password, name);
      
      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.user._id,
            email: result.user.email,
            name: result.user.name,
            isVerified: result.user.isVerified
          },
          tokens: result.tokens
        },
        timestamp: new Date().toISOString()
      };

      // Set secure cookies
      this.setAuthCookies(res, result.tokens);

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('E11000')) {
        throw createError('User with this email already exists', 409);
      }
      throw error;
    }
  });

  // Basic email/password login
  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    try {
      const result = await this.authService.loginUser(email, password);
      
      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user._id,
            email: result.user.email,
            name: result.user.name,
            isVerified: result.user.isVerified,
            walletAddress: result.user.walletAddress
          },
          tokens: result.tokens
        },
        timestamp: new Date().toISOString()
      };

      // Set secure cookies
      this.setAuthCookies(res, result.tokens);

      res.status(200).json(response);
    } catch (error) {
      throw createError('Invalid credentials', 401);
    }
  });

  // Logout
  public logout = asyncHandler(async (req: Request, res: Response) => {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  });

  // Get current user profile
  public getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

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
            isVerified: user.isVerified,
            walletAddress: user.walletAddress,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      throw createError('Failed to fetch user profile', 500);
    }
  });

  // Refresh token
  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw createError('Refresh token not provided', 401);
    }

    try {
      const result = await this.authService.refreshAccessToken(refreshToken);
      
      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: result
        },
        timestamp: new Date().toISOString()
      };

      // Set new cookies
      this.setAuthCookies(res, result);

      res.status(200).json(response);
    } catch (error) {
      throw createError('Invalid refresh token', 401);
    }
  });

  // Update user profile
  public updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { name, avatar } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    try {
      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        throw createError('User not found', 404);
      }

      // Update user fields
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
            updatedAt: user.updatedAt
          }
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      throw createError('Failed to update profile', 500);
    }
  });

  // Connect Aptos wallet
  public connectWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { walletAddress, publicKey } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    if (!walletAddress) {
      throw createError('Wallet address is required', 400);
    }

    try {
      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        throw createError('User not found', 404);
      }

      // Update user wallet address
      user.walletAddress = walletAddress;
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Wallet connected successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            walletAddress: user.walletAddress,
            updatedAt: user.updatedAt
          }
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      throw createError('Failed to connect wallet', 500);
    }
  });

  // Helper method to set auth cookies
  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
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
  }

  // Validate token
  public validateToken = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw createError('Token is invalid', 401);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Token is valid',
      data: {
        userId,
        valid: true
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  });
}