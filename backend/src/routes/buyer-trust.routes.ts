import { Router } from 'express';
import { body, query } from 'express-validator';
import * as buyerTrustController from '../controllers/buyer-trust.controller';

const router = Router();

/**
 * GET /api/buyers/:id/trust-score
 * Get buyer trust score and stats
 */
router.get('/:id/trust-score', buyerTrustController.getBuyerTrustScore);

/**
 * GET /api/buyers/:id/payment-methods
 * Get available payment methods based on trust score
 */
router.get(
  '/:id/payment-methods',
  [
    query('orderTotal').optional().isFloat({ min: 0 })
      .withMessage('Order total must be a positive number'),
  ],
  buyerTrustController.getAvailablePaymentMethods
);

/**
 * POST /api/buyers/:id/refresh-score
 * Refresh/recalculate buyer trust score
 */
router.post(
  '/:id/refresh-score',
  [
    body('pincode').notEmpty().matches(/^[0-9]{6}$/)
      .withMessage('Invalid pincode'),
  ],
  buyerTrustController.refreshTrustScore
);

/**
 * GET /api/buyers/pincode/:pincode/risk
 * Get risk score for a pincode
 */
router.get('/pincode/:pincode/risk', buyerTrustController.getPincodeRisk);

/**
 * POST /api/buyers/orders/:orderId/outcome
 * Update order outcome for trust score calculation
 */
router.post(
  '/orders/:orderId/outcome',
  [
    body('wasReturned').optional().isBoolean()
      .withMessage('wasReturned must be boolean'),
    body('wasCancelled').optional().isBoolean()
      .withMessage('wasCancelled must be boolean'),
  ],
  buyerTrustController.updateOrderOutcome
);

export default router;
