import { Router } from 'express';
import { body } from 'express-validator';
import * as partnerController from '../controllers/partner.controller';

const router = Router();

/**
 * POST /api/partners/register
 * Register new delivery partner with KYC
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required')
      .matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
    body('partnerType').optional().isIn(['WALKER', 'BIKE', 'EV'])
      .withMessage('Invalid partner type'),
    body('aadhaarNumber').optional().matches(/^[0-9]{12}$/)
      .withMessage('Invalid Aadhaar number'),
  ],
  partnerController.registerPartner
);

/**
 * PUT /api/partners/:id/location
 * Update partner's current location
 */
router.put(
  '/:id/location',
  [
    body('latitude').notEmpty().isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('longitude').notEmpty().isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
  ],
  partnerController.updateLocation
);

/**
 * PUT /api/partners/:id/availability
 * Toggle partner availability (online/offline)
 */
router.put(
  '/:id/availability',
  [
    body('isAvailable').notEmpty().isBoolean()
      .withMessage('isAvailable must be boolean'),
  ],
  partnerController.toggleAvailability
);

/**
 * GET /api/partners/:id/orders
 * Get available delivery requests for partner
 */
router.get('/:id/orders', partnerController.getAvailableOrders);

/**
 * POST /api/partners/:id/accept
 * Accept a delivery request
 */
router.post(
  '/:id/accept',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
  ],
  partnerController.acceptDelivery
);

/**
 * GET /api/partners/:id/dashboard
 * Get partner dashboard with stats and earnings
 */
router.get('/:id/dashboard', partnerController.getPartnerDashboard);

/**
 * GET /api/partners/:id
 * Get partner profile
 */
router.get('/:id', partnerController.getPartnerProfile);

export default router;
