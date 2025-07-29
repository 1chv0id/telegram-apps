const axios = require('axios');

// Test configuration
const API_BASE = 'http://localhost:3000/api';
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  validateStatus: () => true // Don't throw on HTTP errors
});

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition, message) {
  if (condition) {
    log('green', `✅ ${message}`);
    return true;
  } else {
    log('red', `❌ ${message}`);
    return false;
  }
}

// Test suite
class APITestSuite {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  async runTest(name, testFn) {
    log('blue', `\n🧪 Testing: ${name}`);
    try {
      const result = await testFn();
      if (result) {
        this.passed++;
      } else {
        this.failed++;
      }
    } catch (error) {
      log('red', `❌ Test failed with error: ${error.message}`);
      this.failed++;
    }
  }

  // Test health endpoint
  async testHealth() {
    const response = await api.get('/health');
    
    const checks = [
      assert(response.status === 200, 'Health endpoint returns 200'),
      assert(response.data.success === true, 'Response has success: true'),
      assert(response.data.data.status === 'healthy', 'Status is healthy'),
      assert(typeof response.data.data.uptime === 'number', 'Uptime is a number'),
      assert(response.data.data.version === '1.0.0', 'Version is correct')
    ];
    
    return checks.every(check => check);
  }

  // Test exchange rate calculation
  async testExchangeRate() {
    const requestData = {
      coinFrom: 'BTC',
      coinTo: 'ETH',
      networkFrom: 'BTC',
      networkTo: 'ETH',
      amount: '0.1',
      rateType: 'float'
    };

    const response = await api.post('/exchange/rate', requestData);
    
    const checks = [
      assert(response.status === 200, 'Exchange rate endpoint returns 200'),
      assert(response.data.success === true, 'Response has success: true'),
      assert(typeof response.data.data.rate === 'number', 'Rate is a number'),
      assert(response.data.data.rate > 0, 'Rate is positive')
    ];
    
    return checks.every(check => check);
  }

  // Run all tests
  async runAllTests() {
    log('blue', '🚀 Starting API Test Suite\n');
    
    await this.runTest('Health Check', () => this.testHealth());
    await this.runTest('Exchange Rate', () => this.testExchangeRate());
    
    // Summary
    log('blue', '\n📊 Test Results:');
    log('green', `✅ Passed: ${this.passed}`);
    log('red', `❌ Failed: ${this.failed}`);
    
    if (this.failed === 0) {
      log('green', '\n🎉 All tests passed!');
    } else {
      log('yellow', '\n⚠️  Some tests failed.');
    }
    
    return this.failed === 0;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new APITestSuite();
  testSuite.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = APITestSuite;