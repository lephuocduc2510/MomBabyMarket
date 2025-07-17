import { Request, Response } from 'express';
import { Product } from '../models';

export class ProductController {
  /**
   * Get all products with pagination and filtering
   */
  static async getAllProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const platform = req.query.platform as string;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || 'crawledAt';
      const sortOrder = req.query.sortOrder as string || 'desc';

      // Build filter
      const filter: any = {};
      if (platform) filter.platform = platform;

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      let query = Product.find(filter);

      // Text search if search parameter provided
      if (search) {
        query = Product.find({
          ...filter,
          $text: { $search: search }
        }, {
          score: { $meta: 'textScore' }
        }).sort({ score: { $meta: 'textScore' } });
      } else {
        query = query.sort(sort);
      }

      // Execute query with pagination
      const [products, total] = await Promise.all([
        query.skip((page - 1) * limit).limit(limit),
        Product.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          filters: {
            platform,
            search,
            sortBy,
            sortOrder
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Try to find by MongoDB _id first, then by custom id field
      let product = null;
      
      // If id looks like MongoDB ObjectId (24 hex characters)
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id);
      }
      
      // If not found or not ObjectId format, try by custom id field
      if (!product) {
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          product = await Product.findOne({ id: numericId });
        }
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message
      });
    }
  }

  /**
   * Get products by date range
   */
  static async getProductsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }

      const products = await Product.find({
        crawledAt: {
          $gte: start,
          $lte: end
        }
      }).sort({ crawledAt: -1 });

      res.json({
        success: true,
        data: {
          products,
          count: products.length,
          dateRange: {
            startDate: start.toISOString(),
            endDate: end.toISOString()
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching products by date range',
        error: error.message
      });
    }
  }

  /**
   * Get products statistics
   */
  static async getProductsStats(req: Request, res: Response) {
    try {
      const [
        totalCount,
        platformStats,
        dateStats,
        recentProducts
      ] = await Promise.all([
        Product.countDocuments(),
        Product.aggregate([
          { $group: { _id: '$platform', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Product.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$crawledAt' },
                month: { $month: '$crawledAt' },
                day: { $dayOfMonth: '$crawledAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
          { $limit: 7 }
        ]),
        Product.find().sort({ crawledAt: -1 }).limit(5)
      ]);

      res.json({
        success: true,
        data: {
          totalProducts: totalCount,
          platformStats,
          recentActivity: dateStats,
          recentProducts
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }

  /**
   * Search products by title
   */
  static async searchProducts(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const products = await Product.find({
        $text: { $search: q as string }
      }, {
        score: { $meta: 'textScore' }
      }).sort({ score: { $meta: 'textScore' } }).limit(20);

      res.json({
        success: true,
        data: {
          products,
          count: products.length,
          query: q
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error searching products',
        error: error.message
      });
    }
  }

  /**
   * Delete all products - DANGEROUS OPERATION
   * Requires confirmation parameter for safety
   */
  static async deleteAllProducts(req: Request, res: Response) {
    try {
      const { confirm } = req.body;

      // Safety check - require explicit confirmation
      if (confirm !== 'DELETE_ALL_PRODUCTS') {
        return res.status(400).json({
          success: false,
          message: 'Confirmation required. Please send { "confirm": "DELETE_ALL_PRODUCTS" } in request body'
        });
      }

      // Check environment - only allow in development
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'This operation is not allowed in production environment'
        });
      }

      // Get count before deletion for response
      const totalCount = await Product.countDocuments();

      // Delete all products
      const deleteResult = await Product.deleteMany({});

      res.json({
        success: true,
        message: 'All products have been deleted successfully',
        data: {
          deletedCount: deleteResult.deletedCount,
          totalCount: totalCount,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting products',
        error: error.message
      });
    }
  }
}
