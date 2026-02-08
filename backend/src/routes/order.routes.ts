import { Router } from 'express';
import { body } from 'express-validator';
import orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Seller Order Routes (must come before /:id to avoid route conflicts)

// GET /api/orders/seller/orders - Get seller's orders
router.get(
  '/seller/orders',
  authorize('SELLER', 'ADMIN'),
  orderController.getSellerOrders.bind(orderController)
);

// GET /api/orders/seller/analytics - Get seller analytics
router.get(
  '/seller/analytics',
  authorize('SELLER', 'ADMIN'),
  orderController.getSellerAnalytics.bind(orderController)
);

// Customer Order Routes

// POST /api/orders - Create order from cart
router.post(
  '/',
  [
    body('addressId')
      .notEmpty()
      .withMessage('Address ID is required')
      .isString()
      .withMessage('Address ID must be a string'),
    body('paymentMethod')
      .optional()
      .isIn(['UPI', 'CARD', 'NETBANKING', 'WALLET', 'COD'])
      .withMessage('Invalid payment method'),
  ],
  orderController.createOrder.bind(orderController)
);

// GET /api/orders - Get customer's orders
router.get('/', orderController.getOrders.bind(orderController));

// GET /api/orders/:id - Get order details
router.get('/:id', orderController.getOrderById.bind(orderController));

// PUT /api/orders/:id/cancel - Cancel order
router.put(
  '/:id/cancel',
  [
    body('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string'),
  ],
  orderController.cancelOrder.bind(orderController)
);

// PUT /api/orders/:id/status - Update order status (seller only)
router.put(
  '/:id/status',
  authorize('SELLER', 'ADMIN'),
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
      .withMessage('Invalid order status'),
  ],
  orderController.updateOrderStatus.bind(orderController)
);

export default router;
