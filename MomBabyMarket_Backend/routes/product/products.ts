import express from 'express';
import { ProductController } from '../../controllers';

const router = express.Router();

// GET /api/products - Get all products with pagination and filtering
router.get('/', ProductController.getAllProducts);

// GET /api/products/search - Search products by title
router.get('/search', ProductController.searchProducts);

// GET /api/products/stats - Get products statistics
router.get('/stats', ProductController.getProductsStats);

// GET /api/products/date-range - Get products by date range
router.get('/date-range', ProductController.getProductsByDateRange);

// GET /api/products/:id - Get product by ID
router.get('/:id', ProductController.getProductById);

// DELETE /api/products/all - Delete all products (DANGEROUS - Development only)
router.delete('/all', ProductController.deleteAllProducts);

export default router;
