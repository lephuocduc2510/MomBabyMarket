import { useState, useEffect } from 'react';
import { productService, Product, ProductFilters, PaginatedResponse } from '@/services/productService';

// Hook for fetching products with pagination and filters
export const useProducts = (initialFilters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });

  const fetchProducts = async (filters: ProductFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedFilters = { ...initialFilters, ...filters };
      const response = await productService.getProducts(mergedFilters);
      
      if (response.success) {
        // Extract products from the nested data structure
        const productsData = response.data.products || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          pages: 0
        });
      } else {
        setProducts([]);
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]); // Ensure products is always an array
      setError('Network error: Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const refetch = (newFilters?: ProductFilters) => {
    fetchProducts(newFilters);
  };

  useEffect(() => {
    fetchProducts(initialFilters);
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    refetch,
    fetchProducts
  };
};

// Hook for fetching a single product
export const useProduct = (id: string | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductById(productId);
      
      if (response.success) {
        setProduct(response.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const refetch = () => {
    if (id) {
      fetchProduct(id);
    }
  };

  return {
    product,
    loading,
    error,
    refetch
  };
};

// Hook for searching products
export const useProductSearch = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, filters: Omit<ProductFilters, 'search'> = {}) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.searchProducts(query, filters);
      
      if (response.success) {
        setProducts(response.data.products || []);
      } else {
        setProducts([]);
        setError('Search failed');
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setProducts([]);
      setError('Search error');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setProducts([]);
    setError(null);
  };

  return {
    products,
    loading,
    error,
    search,
    clearSearch
  };
};
