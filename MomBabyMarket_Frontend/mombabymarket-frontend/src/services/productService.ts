import apiClient from '@/lib/api';

// Types
export interface Product {
  _id: string;
  id: number;
  title: string;
  imageUrl: string;
  articleUrl: string;
  localImagePath: string;
  source: string;
  platform: string;
  crawledAt: string;
  description?: string;
  price?: string;
  category?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProductsData {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters?: any;
}

export interface PaginatedResponse extends ApiResponse<ProductsData> {
}

export interface ProductFilters {
  search?: string;
  platform?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Service Class
class ProductService {
  // Get all products with filters
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await apiClient.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      
      // Return a properly formatted error response
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch products',
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  // Get single product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch product',
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  // Get products by platform
  async getProductsByPlatform(platform: string, filters: Omit<ProductFilters, 'platform'> = {}): Promise<PaginatedResponse> {
    return this.getProducts({ ...filters, platform });
  }

  // Search products
  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<PaginatedResponse> {
    return this.getProducts({ ...filters, search: query });
  }

  // Get statistics
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/products/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productService = new ProductService();

// Export individual methods for convenience
export const {
  getProducts,
  getProductById,
  getProductsByPlatform,
  searchProducts,
  getStats
} = productService;
