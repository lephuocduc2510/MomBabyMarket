import express from 'express';
import productRoutes from './product/products';

const router = express.Router();

// API Routes
router.use('/products', productRoutes);

// API Info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MomBabyMarket API v1.0',
    endpoints: {
      products: '/api/products',
      search: '/api/products/search',
      stats: '/api/products/stats',
      dateRange: '/api/products/date-range'
    },
    documentation: {
      products: 'GET /api/products?page=1&limit=10&platform=website&search=text&sortBy=crawledAt&sortOrder=desc',
      productById: 'GET /api/products/:id',
      search: 'GET /api/products/search?q=search-term',
      stats: 'GET /api/products/stats',
      dateRange: 'GET /api/products/date-range?startDate=2025-01-01&endDate=2025-12-31'
    }
  });
});

export default router;
