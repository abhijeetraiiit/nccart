import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import orderService from '../services/order.service';
import cartService from '../services/cart.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class OrderController {
  // Create order from cart
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
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

      const { addressId, paymentMethod } = req.body;

      // Get customer ID
      const customerId = await cartService.getCustomerIdFromUserId(userId);

      // Get cart items
      const cart = await cartService.getCart(customerId);

      if (!cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty',
        });
      }

      // Validate cart before creating order
      const validation = await cartService.validateCart(customerId);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Cart validation failed',
          issues: validation.issues,
        });
      }

      // Create order
      const order = await orderService.createOrder(
        userId,
        addressId,
        cart.items,
        paymentMethod || PaymentMethod.COD
      );

      // Clear cart after successful order
      await cartService.clearCart(customerId);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      if (
        error.message.includes('Cart is empty') ||
        error.message.includes('Address not found') ||
        error.message.includes('not found') ||
        error.message.includes('not available') ||
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

  // Get customer's orders
  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const {
        status,
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        status: status as OrderStatus | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as 'createdAt' | 'total',
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await orderService.getOrders(userId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get single order details
  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = req.params;

      const order = await orderService.getOrderById(id, userId);

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Cancel order
  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const order = await orderService.cancelOrder(id, userId, reason);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error: any) {
      if (
        error.message === 'Order not found' ||
        error.message.includes('Cannot cancel')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Update order status (seller only)
  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
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

      // Get seller ID from user ID
      const seller = await this.getSellerFromUserId(userId);
      if (!seller) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can update order status',
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(
        id,
        status as OrderStatus,
        seller.id
      );

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error: any) {
      if (
        error.message.includes('not found') ||
        error.message.includes('permission') ||
        error.message.includes('Cannot transition')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Get seller's orders
  async getSellerOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get seller ID from user ID
      const seller = await this.getSellerFromUserId(userId);
      if (!seller) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can access this endpoint',
        });
      }

      const {
        status,
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        dateFrom,
        dateTo,
      } = req.query;

      const filters = {
        status: status as OrderStatus | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as 'createdAt' | 'total',
        sortOrder: sortOrder as 'asc' | 'desc',
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const result = await orderService.getSellerOrders(seller.id, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get seller analytics
  async getSellerAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get seller ID from user ID
      const seller = await this.getSellerFromUserId(userId);
      if (!seller) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can access this endpoint',
        });
      }

      const analytics = await orderService.getOrderAnalytics(seller.id);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Helper method to get seller from user ID
  private async getSellerFromUserId(userId: string) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const seller = await prisma.seller.findUnique({
        where: { userId },
        select: { id: true, businessName: true, status: true },
      });

      if (!seller) {
        return null;
      }

      if (seller.status !== 'ACTIVE') {
        throw new Error('Seller account is not active');
      }

      return seller;
    } finally {
      await prisma.$disconnect();
    }
  }
}

export default new OrderController();
