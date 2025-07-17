import apiClient from '@/lib/api';

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔄 Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/health`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Health check passed:', healthData);
    
    // Test API endpoint
    const apiResponse = await apiClient.get('/products?limit=1');
    console.log('✅ API test passed:', apiResponse.data);
    
    return {
      success: true,
      health: healthData,
      api: apiResponse.data
    };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testConnection();
  }, 1000);
}
