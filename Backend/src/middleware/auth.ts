import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User, IUser } from '@/models/User.model';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// Configure JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'default_secret_key',
};

// Initialize passport with JWT strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await User.findById(payload.id);
      
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Middleware to authenticate requests
export const authenticate = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: IUser | false) => {
      if (err) {
        logger.error('Authentication failed:', err);
        return next(createError(500, 'Authentication error'));
      }
      
      if (!user) {
        return next(createError(401, 'Unauthorized'));
      }
      
      // Attach user to request
      req.user = user;
      
      next();
    })(req, res, next);
  };
};

// Middleware to check if user has admin role
export const requireAdmin = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    
    if (!user) {
      return next(createError(401, 'Unauthorized'));
    }
    
    // Check if user has admin role (you need to add isAdmin field to your User model)
    if (!user.isAdmin) {
      return next(createError(403, 'Forbidden: Admin access required'));
    }
    
    next();
  };
}; 