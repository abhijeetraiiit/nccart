import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Seller routes
router.get('/dashboard', authenticate, authorize('SELLER'), (req, res) => {
  res.json({ success: true, message: 'Seller dashboard endpoint' });
});

export default router;
