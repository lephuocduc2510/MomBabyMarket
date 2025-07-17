'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Menu, User, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/services/productService';
import ConnectionStatus from '@/components/ConnectionStatus';
import '@/utils/testConnection';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { products, loading, error, pagination, refetch } = useProducts({
    page: currentPage,
    limit: itemsPerPage
  });

  const handleSearch = () => {
    const filters = {
      page: 1, // Reset to first page when searching
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedPlatform !== 'all' && { platform: selectedPlatform })
    };
    setCurrentPage(1);
    refetch(filters);
  };

  const handlePlatformFilter = (platform: string) => {
    setSelectedPlatform(platform);
    const filters = {
      page: 1, // Reset to first page when filtering
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(platform !== 'all' && { platform })
    };
    setCurrentPage(1);
    refetch(filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const filters = {
      page,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedPlatform !== 'all' && { platform: selectedPlatform })
    };
    refetch(filters);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    const filters = {
      page: 1,
      limit: newLimit,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedPlatform !== 'all' && { platform: selectedPlatform })
    };
    refetch(filters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="font-bold text-xl text-gray-900">vivid</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-900 font-medium border-b-2 border-teal-600 pb-1">
                Home
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 font-medium">
                Auto-detect violations
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 font-medium">
                Violation reviewed
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 font-medium">
                Submit violations
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 font-medium">
                Analysis
              </Link>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <button className="p-2 text-gray-500 hover:text-gray-900">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-900">
                <Menu className="w-5 h-5" />
              </button>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-700">
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Mom & Baby Market
              </h1>
              <p className="text-xl mb-8 text-teal-100">
                Discover curated products and content from trusted sources across social media platforms and e-commerce websites.
              </p>

              {/* Search Bar */}
              <div className="flex mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 placeholder-gray-300 border border-r-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleSearch}
                  className="bg-teal-500 hover:bg-teal-400 px-6 py-3 rounded-r-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Platform Filters */}
              <div className="flex flex-wrap gap-2">
                {['all', 'facebook', 'instagram', 'website'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformFilter(platform)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedPlatform === platform
                      ? 'bg-white text-teal-600'
                      : 'bg-teal-500 hover:bg-teal-400 text-white'
                      }`}
                  >
                    {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                      <ShoppingCart className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Content Detection</h3>
                      <p className="text-sm text-gray-500">24/7 monitoring</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Facebook Posts</span>
                      <span className="font-medium text-gray-900">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">
                {loading ? '...' : pagination.total || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {loading ? '...' : Array.isArray(products) ? products.filter(p => p.platform === 'facebook').length : 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Facebook Posts (Current Page)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">
                {loading ? '...' : Array.isArray(products) ? products.filter(p => p.platform === 'instagram').length : 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Instagram Posts (Current Page)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {loading ? '...' : Array.isArray(products) ? products.filter(p => p.platform === 'website').length : 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Website Products (Current Page)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
              <p className="text-gray-600 mt-2">
                {loading ? 'Loading products...' :
                  error ? 'Error loading products' :
                    `Found ${pagination.total} products from various platforms (Page ${pagination.page} of ${pagination.pages})`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <button
                onClick={() => refetch({ page: currentPage, limit: itemsPerPage })}
                className="flex items-center text-teal-600 hover:text-teal-700 font-medium bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠</span>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
                <p className="text-red-600 mb-4">
                  {error.includes('Network Error') ?
                    'Cannot connect to server. Please check if backend is running.' :
                    error
                  }
                </p>
                <button
                  onClick={() => refetch()}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : Array.isArray(products) && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow group relative">
                  <Link href={`/product/${product._id}`}>
                    <div className="cursor-pointer">
                      <div className="aspect-square relative overflow-hidden rounded-t-xl">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                            product.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {product.platform}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {product.title || 'Untitled Product'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          From: {product.source ? new URL(product.source).hostname : 'Unknown source'}
                        </p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">
                            {new Date(product.crawledAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs text-gray-400">
                            ID: #{product.id}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-teal-600">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {product.articleUrl && (
                    <a
                      href={product.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded shadow-sm border z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Original ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedPlatform !== 'all' ?
                    'Try adjusting your search terms or filters.' :
                    'No products have been crawled yet. Please check back later.'
                  }
                </p>
                {(searchTerm || selectedPlatform !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPlatform('all');
                      setCurrentPage(1);
                      refetch({ page: 1, limit: itemsPerPage });
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && Array.isArray(products) && products.length > 0 && pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} products
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const totalPages = pagination.pages;
                    const currentPage = pagination.page;

                    // Show first page
                    if (currentPage > 3) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      if (currentPage > 4) {
                        pages.push(
                          <span key="dots1" className="px-2 text-gray-500">...</span>
                        );
                      }
                    }

                    // Show pages around current page
                    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${i === currentPage
                            ? 'bg-teal-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Show last page
                    if (currentPage < totalPages - 2) {
                      if (currentPage < totalPages - 3) {
                        pages.push(
                          <span key="dots2" className="px-2 text-gray-500">...</span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page >= pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-teal-600 font-bold text-sm">V</span>
                </div>
                <span className="font-bold text-xl">vivid</span>
              </div>
              <p className="text-teal-100 mb-4">
                Your trusted platform for monitoring and analyzing mom & baby market content across social media and e-commerce platforms.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-teal-100 hover:text-white">About Us</Link></li>
                <li><Link href="#" className="text-teal-100 hover:text-white">Contact</Link></li>
                <li><Link href="#" className="text-teal-100 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-teal-100 hover:text-white">Facebook</Link></li>
                <li><Link href="#" className="text-teal-100 hover:text-white">Instagram</Link></li>
                <li><Link href="#" className="text-teal-100 hover:text-white">Website</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-teal-500 mt-8 pt-8 text-center">
            <p className="text-teal-100">&copy; 2025 MomBabyMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
