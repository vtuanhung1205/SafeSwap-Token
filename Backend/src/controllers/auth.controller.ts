import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { IUser } from '@/models/User.model';
import { ApiResponse } from '@/types';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { User } from '@/models/User.model';


export class AuthController {
  private authService = new AuthService();

  public register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, 'User with this email already exists'));
    }

    const newUser = new User({ email, name, avatar });
    await newUser.save();

    const { accessToken, refreshToken } = this.authService.generateTokens(newUser._id);

    res.status(201).json(new ApiResponse({
      user: newUser.toJSON(),
      tokens: { accessToken, refreshToken },
    }, 'User registered successfully'));
  });

  public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }
    
    const { accessToken, refreshToken } = this.authService.generateTokens(user._id);
    
    res.json(new ApiResponse({
      user: user.toJSON(),
      tokens: { accessToken, refreshToken }
    }, 'Login successful'));
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(createError(400, 'Refresh token is required'));
    }

    try {
      const decoded = this.authService.verifyToken(refreshToken, true);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(createError(401, 'Invalid refresh token'));
      }

      const { accessToken } = this.authService.generateTokens(user._id);
      res.json(new ApiResponse({ accessToken }, 'Token refreshed successfully'));
    } catch (error) {
      return next(createError(401, 'Invalid or expired refresh token'));
    }
  });

  public getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // req.user is populated by the 'authenticate' middleware
    const user = req.user as IUser; 
    
    // The user object from the token might be stale, so we fetch the latest from DB
    const userProfile = await User.findById(user._id).select('-password');

    if (!userProfile) {
      return next(createError(404, 'User not found'));
    }

    res.json(new ApiResponse({ user: userProfile }, 'Profile retrieved successfully'));
  });

  public updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true }).select('-password');
    
    if (!updatedUser) {
      return next(createError(404, 'User not found'));
    }
    
    res.json(new ApiResponse({ user: updatedUser }, 'Profile updated successfully'));
  });

  public validateToken(req: Request, res: Response) {
    res.json(new ApiResponse({ valid: true }, 'Token is valid'));
  }
} 