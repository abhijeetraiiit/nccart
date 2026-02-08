import { Router } from 'express';

const router = Router();

// Public product routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Products list endpoint' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Product detail endpoint' });
});

export default router;
