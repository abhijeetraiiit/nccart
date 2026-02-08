import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import productService from '../services/product.service';
import { ProductStatus } from '@prisma/client';

export class ProductController {
  // Create product
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const sellerId = (req as any).user.sellerId;
      if (!sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can create products',
        });
      }

      const product = await productService.createProduct({
        sellerId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all products
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        status,
        sellerId,
        categoryId,
        search,
        minPrice,
        maxPrice,
        inStock,
        page,
        limit,
      } = req.query;

      const result = await productService.getProducts({
        status: status as ProductStatus,
        sellerId: sellerId as string,
        categoryId: categoryId as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        inStock: inStock === 'true',
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const sellerId = (req as any).user.sellerId;

      if (!sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can update products',
        });
      }

      const product = await productService.updateProduct(id, sellerId, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error: any) {
      if (error.message === 'Product not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Delete product
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sellerId = (req as any).user.sellerId;

      if (!sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can delete products',
        });
      }

      const result = await productService.deleteProduct(id, sellerId);

      res.json(result);
    } catch (error: any) {
      if (error.message === 'Product not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Update stock
  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const sellerId = (req as any).user.sellerId;

      if (!sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can update stock',
        });
      }

      if (typeof quantity !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a number',
        });
      }

      const product = await productService.updateStock(id, sellerId, quantity);

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: product,
      });
    } catch (error: any) {
      if (error.message === 'Product not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // Get seller's products
  async getSellerProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = (req as any).user.sellerId;

      if (!sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can access this endpoint',
        });
      }

      const { page, limit, status, search } = req.query;

      const result = await productService.getProducts({
        sellerId,
        status: status as ProductStatus,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get analytics
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = (req as any).user.sellerId;

      if (!sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can access analytics',
        });
      }

      const analytics = await productService.getSellerProductAnalytics(sellerId);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
