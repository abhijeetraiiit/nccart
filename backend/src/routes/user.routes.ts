import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authenticate, (req, res) => {
  res.json({ success: true, message: 'User profile endpoint' });
});

export default router;
