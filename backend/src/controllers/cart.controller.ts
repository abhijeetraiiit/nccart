import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import cartService from '../services/cart.service';

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

      const customerId = await cartService.getCustomerIdFromUserId(userId);
      const cart = await cartService.getCart(customerId);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'Customer profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
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

      const customerId = await cartService.getCustomerIdFromUserId(userId);
      const { productId, quantity } = req.body;

      const cart = await cartService.addToCart(
        customerId,
        productId,
        quantity
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'Customer profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
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

      const customerId = await cartService.getCustomerIdFromUserId(userId);
      const { productId } = req.params;
      const { quantity } = req.body;

      const cart = await cartService.updateCartItem(
        customerId,
        productId,
        quantity
      );

      res.json({
        success: true,
        message: 'Cart updated successfully',
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'Customer profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
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

      const customerId = await cartService.getCustomerIdFromUserId(userId);
      const { productId } = req.params;

      const cart = await cartService.removeFromCart(customerId, productId);

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'Customer profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
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

      const customerId = await cartService.getCustomerIdFromUserId(userId);
      const result = await cartService.clearCart(customerId);

      res.json({
        success: true,
        message: 'Cart cleared successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Customer profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
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

      const customerId = await cartService.getCustomerIdFromUserId(userId);
      const total = await cartService.getCartTotal(customerId);

      res.json({
        success: true,
        data: total,
      });
    } catch (error: any) {
      if (error.message === 'Customer profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
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

      const customerId = await cartService.getCustomerIdFromUserId(userId);
      const validation = await cartService.validateCart(customerId);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error: any) {
      if (error.message === 'Customer profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

export default new CartController();
