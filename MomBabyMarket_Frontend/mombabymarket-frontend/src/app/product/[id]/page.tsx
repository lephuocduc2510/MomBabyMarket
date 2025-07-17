'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Share2, Copy, Calendar, Globe, Tag, ChevronLeft } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';

export default function ProductDetail() {
  const params = useParams();
  const [copied, setCopied] = useState(false);
  
  const { product, loading, error } = useProduct(params.id as string);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'website':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">vivid</span>
                </div>
              </div>
              <Link href="/" className="bg-teal-600 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-700">
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="font-bold text-xl text-gray-900">vivid</span>
              </div>
            </div>
            <Link href="/" className="bg-teal-600 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-700 flex items-center">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-teal-600">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Product Details</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-white shadow-lg">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No image available</p>
                  </div>
                </div>
              )}
              
              {/* Platform Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPlatformColor(product.platform)}`}>
                  {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.title || 'Untitled Product'}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Crawled: {new Date(product.crawledAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>Source: {new URL(product.source).hostname}</span>
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                  <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{product.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getPlatformColor(product.platform)}`}>
                    {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                  </span>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                  <a
                    href={product.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 break-all inline-flex items-start"
                  >
                    {product.source}
                    <ExternalLink className="w-4 h-4 ml-1 mt-0.5 flex-shrink-0" />
                  </a>
                </div>
                
                {product.articleUrl && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Article URL</label>
                    <a
                      href={product.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 break-all inline-flex items-start"
                    >
                      {product.articleUrl}
                      <ExternalLink className="w-4 h-4 ml-1 mt-0.5 flex-shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              {product.articleUrl && (
                <a
                  href={product.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors inline-flex items-center"
                >
                  View Original Post
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              )}
              
              <button
                onClick={handleCopyUrl}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                {copied ? (
                  <>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </button>
              
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <h4 className="font-semibold text-teal-900 mb-2">About this content</h4>
              <p className="text-teal-700 text-sm leading-relaxed">
                This content was automatically crawled from {product.platform} and is part of our MomBabyMarket monitoring system. 
                The information shown reflects the original post from the source platform at the time of crawling.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-600 text-white py-12 mt-16">
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
