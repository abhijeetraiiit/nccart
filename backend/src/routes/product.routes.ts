import { Router } from 'express';
import { body } from 'express-validator';
import productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', productController.getProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));

// Protected seller routes
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  productController.createProduct.bind(productController)
);

router.put(
  '/:id',
  authenticate,
  productController.updateProduct.bind(productController)
);

router.delete(
  '/:id',
  authenticate,
  productController.deleteProduct.bind(productController)
);

router.patch(
  '/:id/stock',
  authenticate,
  productController.updateStock.bind(productController)
);

// Seller's product management
router.get(
  '/seller/my-products',
  authenticate,
  productController.getSellerProducts.bind(productController)
);

router.get(
  '/seller/analytics',
  authenticate,
  productController.getAnalytics.bind(productController)
);

export default router;
