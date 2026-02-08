import { Router } from 'express';
import { body } from 'express-validator';
import cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes are protected with authentication
router.use(authenticate);

// GET /api/cart - Get user's cart
router.get('/', cartController.getCart.bind(cartController));

// GET /api/cart/total - Get cart total
router.get('/total', cartController.getCartTotal.bind(cartController));

// GET /api/cart/validate - Validate cart items
router.get('/validate', cartController.validateCart.bind(cartController));

// POST /api/cart - Add item to cart
router.post(
  '/',
  [
    body('productId')
      .notEmpty()
      .withMessage('Product ID is required')
      .isString()
      .withMessage('Product ID must be a string'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  cartController.addToCart.bind(cartController)
);

// PUT /api/cart/:productId - Update cart item quantity
router.put(
  '/:productId',
  [
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
  ],
  cartController.updateCartItem.bind(cartController)
);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', cartController.removeFromCart.bind(cartController));

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart.bind(cartController));

export default router;
