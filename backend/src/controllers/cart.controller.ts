import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import cartService from '../services/cart.service';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class CartController {
  // Get user's cart
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get customer ID from user
      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
      }

      const cart = await cartService.getCart(customer.id);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  // Add item to cart
  async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
      }

      const { productId, quantity } = req.body;

      const cart = await cartService.addToCart(
        customer.id,
        productId,
        quantity
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: cart,
      });
    } catch (error: any) {
      if (
        error.message === 'Product not found' ||
        error.message === 'Product is not available for purchase' ||
        error.message.includes('stock')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Update cart item quantity
  async updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      const cart = await cartService.updateCartItem(
        customer.id,
        productId,
        quantity
      );

      res.json({
        success: true,
        message: 'Cart updated successfully',
        data: cart,
      });
    } catch (error: any) {
      if (
        error.message === 'Item not found in cart' ||
        error.message === 'Product not found' ||
        error.message.includes('stock')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Remove item from cart
  async removeFromCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
      }

      const { productId } = req.params;

      const cart = await cartService.removeFromCart(customer.id, productId);

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'Item not found in cart') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Clear entire cart
  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
      }

      const result = await cartService.clearCart(customer.id);

      res.json({
        success: true,
        message: 'Cart cleared successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get cart total
  async getCartTotal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
      }

      const total = await cartService.getCartTotal(customer.id);

      res.json({
        success: true,
        data: total,
      });
    } catch (error) {
      next(error);
    }
  }

  // Validate cart
  async validateCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found',
        });
      }

      const validation = await cartService.validateCart(customer.id);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
