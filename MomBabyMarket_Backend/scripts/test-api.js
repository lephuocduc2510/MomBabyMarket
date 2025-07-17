#!/usr/bin/env node

/**
 * Test script to verify API endpoints and database functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:9000';

class APITester {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      const result = await testFn();
      console.log(`✅ ${name}: PASSED`);
      this.results.push({ name, status: 'PASSED', result });
      return result;
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`);
      this.results.push({ name, status: 'FAILED', error: error.message });
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting API Tests...\n');

    // Test 1: Health Check
    await this.test('Health Check', async () => {
      const response = await axios.get(`${this.baseUrl}/health`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      return response.data;
    });

    // Test 2: API Info
    await this.test('API Info', async () => {
      const response = await axios.get(`${this.baseUrl}/api`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      return response.data;
    });

    // Test 3: Get All Products
    await this.test('Get All Products', async () => {
      const response = await axios.get(`${this.baseUrl}/api/products`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      return response.data;
    });

    // Test 4: Get Products with Pagination
    await this.test('Get Products with Pagination', async () => {
      const response = await axios.get(`${this.baseUrl}/api/products?page=1&limit=5`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.data.pagination) throw new Error('Pagination data missing');
      return response.data;
    });

    // Test 5: Get Products Statistics
    await this.test('Get Products Statistics', async () => {
      const response = await axios.get(`${this.baseUrl}/api/products/stats`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (typeof response.data.data.totalProducts !== 'number') throw new Error('Total products should be a number');
      return response.data;
    });

    // Test 6: Search Products
    await this.test('Search Products', async () => {
      const response = await axios.get(`${this.baseUrl}/api/products/search?q=Product`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!Array.isArray(response.data.data.products)) throw new Error('Products should be an array');
      return response.data;
    });

    // Test 7: Get Products by Date Range
    await this.test('Get Products by Date Range', async () => {
      const startDate = '2025-07-16';
      const endDate = '2025-07-17';
      const response = await axios.get(`${this.baseUrl}/api/products/date-range?startDate=${startDate}&endDate=${endDate}`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      return response.data;
    });

    // Test 8: Get Specific Product (if exists)
    await this.test('Get Product by ID', async () => {
      try {
        const response = await axios.get(`${this.baseUrl}/api/products/47`);
        if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return { message: 'Product not found (expected if no data imported)' };
        }
        throw error;
      }
    });

    // Test 9: Error Handling - Invalid Product ID
    await this.test('Error Handling - Invalid Product ID', async () => {
      try {
        const response = await axios.get(`${this.baseUrl}/api/products/999999`);
        if (response.status === 404) {
          return { message: 'Correctly returned 404 for non-existent product' };
        }
        throw new Error(`Expected 404, got ${response.status}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return { message: 'Correctly returned 404 for non-existent product' };
        }
        throw error;
      }
    });

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`   • ${r.name}: ${r.error}`));
    }

    console.log(`\n🎯 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;
