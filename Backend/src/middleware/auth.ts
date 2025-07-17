import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

const authService = new AuthService();

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Access token is required', 401);
    }

    const decoded = authService.verifyAccessToken(token);
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      throw createError('User not found', 404);
    }

    // Attach user to request
    (req as any).user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
      walletAddress: user.walletAddress,
    };

    next();
  } catch (error: any) { // Add type any to error
    logger.error('Authentication failed:', error);
    
    const response = {
      success: false,
      message: 'Authentication failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    res.status(401).json(response);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = authService.verifyAccessToken(token);
      const user = await authService.getUserById(decoded.userId);

      if (user) {
        (req as any).user = {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          walletAddress: user.walletAddress,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors
    logger.warn('Optional authentication failed:', error);
    next();
  }
}; 