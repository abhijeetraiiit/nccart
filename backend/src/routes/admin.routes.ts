import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin routes
router.get('/dashboard', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Admin dashboard endpoint' });
});

export default router;
