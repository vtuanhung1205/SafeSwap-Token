import { Request, Response } from 'express';
import { MockAuthService } from '@/services/mockAuth.service';
import { logger } from '@/utils/logger';

export class MockAuthController {
  private authService: MockAuthService;

  constructor() {
    this.authService = new MockAuthService();
  }

  // Basic email/password registration
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name, confirmPassword } = req.body;

      // Basic validation
      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          message: 'Email, password, and name are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Passwords do not match',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await this.authService.registerUser(email, password, name);
      
      // Set secure cookies
      this.setAuthCookies(res, result.tokens);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            isVerified: result.user.isVerified
          },
          tokens: result.tokens
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Basic email/password login
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await this.authService.loginUser(email, password);
      
      // Set secure cookies
      this.setAuthCookies(res, result.tokens);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            isVerified: result.user.isVerified,
            walletAddress: result.user.walletAddress
          },
          tokens: result.tokens
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Logout
  public logout = async (req: Request, res: Response) => {
    try {
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Get current user profile
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isVerified: user.isVerified,
            walletAddress: user.walletAddress,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        timestamp: new Date().toISOString()
      });
    }
  };

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
}
