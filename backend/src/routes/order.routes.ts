import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Order routes
router.get('/', authenticate, (req, res) => {
  res.json({ success: true, message: 'Orders list endpoint' });
});

export default router;
