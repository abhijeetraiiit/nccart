import { Router } from 'express';

const router = Router();

// Category routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Categories list endpoint' });
});

export default router;
