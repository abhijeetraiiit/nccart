import { Router } from 'express';
import { body, query } from 'express-validator';
import * as dispatchController from '../controllers/dispatch.controller';

const router = Router();

/**
 * POST /api/dispatch/assign
 * Trigger smart dispatch algorithm for an order
 */
router.post(
  '/assign',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('vendorLocation').notEmpty().withMessage('Vendor location is required'),
    body('vendorLocation.latitude').notEmpty().isFloat({ min: -90, max: 90 })
      .withMessage('Invalid vendor latitude'),
    body('vendorLocation.longitude').notEmpty().isFloat({ min: -180, max: 180 })
      .withMessage('Invalid vendor longitude'),
    body('customerLocation').notEmpty().withMessage('Customer location is required'),
    body('customerLocation.latitude').notEmpty().isFloat({ min: -90, max: 90 })
      .withMessage('Invalid customer latitude'),
    body('customerLocation.longitude').notEmpty().isFloat({ min: -180, max: 180 })
      .withMessage('Invalid customer longitude'),
  ],
  dispatchController.assignDeliveryPartner
);

/**
 * GET /api/dispatch/:orderId/status
 * Get dispatch status and logs for an order
 */
router.get('/:orderId/status', dispatchController.getDispatchStatus);

/**
 * GET /api/dispatch/nearby
 * Get nearby available partners (utility endpoint)
 */
router.get(
  '/nearby',
  [
    query('latitude').notEmpty().isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    query('longitude').notEmpty().isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    query('radius').optional().isFloat({ min: 0.1, max: 50 })
      .withMessage('Radius must be between 0.1 and 50 km'),
    query('type').optional().isIn(['WALKER', 'BIKE', 'EV'])
      .withMessage('Invalid partner type'),
  ],
  dispatchController.getNearbyPartners
);

export default router;
