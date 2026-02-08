import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, role, firstName, lastName, businessName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '10'));

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Create customer or seller profile
    if (role === 'CUSTOMER') {
      await prisma.customer.create({
        data: {
          userId: user.id,
          firstName: firstName || '',
          lastName: lastName || '',
        },
      });
    } else if (role === 'SELLER') {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + parseInt(process.env.TRIAL_PERIOD_DAYS || '240'));

      await prisma.seller.create({
        data: {
          userId: user.id,
          businessName: businessName || email,
          displayName: businessName || email,
          trialEndDate,
        },
      });

      // Initialize seller analytics
      await prisma.sellerAnalytics.create({
        data: {
          sellerId: user.id,
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check status
    if (user.status === 'SUSPENDED') {
      throw new AppError('Account suspended', 403);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password (placeholder - implement email sending)
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If email exists, password reset link has been sent',
      });
    }

    // TODO: Generate reset token and send email
    // For now, just return success
    res.json({
      success: true,
      message: 'If email exists, password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password (placeholder)
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement password reset logic
    res.json({
      success: true,
      message: 'Password reset functionality coming soon',
    });
  } catch (error) {
    next(error);
  }
};
