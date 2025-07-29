const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:3000/api';

// Example usage of the Crypto Exchange API
class ExchangeAPIExample {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Get available currencies
  async getCurrencies() {
    try {
      console.log('📋 Fetching available currencies...');
      const response = await this.api.get('/currencies?size=10');
      console.log(`✅ Found ${response.data.data.count} currencies`);
      console.log('Top 10 currencies:', response.data.data.data.map(c => `${c.code} (${c.name})`));
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching currencies:', error.response?.data || error.message);
    }
  }

  // Get networks for Bitcoin
  async getBitcoinNetworks() {
    try {
      console.log('\n🔗 Fetching Bitcoin networks...');
      const response = await this.api.get('/currencies/BTC/networks');
      console.log(`✅ Bitcoin networks:`, response.data.data.map(n => `${n.network} (${n.name})`));
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching Bitcoin networks:', error.response?.data || error.message);
    }
  }

  // Calculate exchange rate
  async calculateRate() {
    try {
      console.log('\n💱 Calculating BTC to ETH exchange rate...');
      const rateRequest = {
        coinFrom: 'BTC',
        coinTo: 'ETH',
        networkFrom: 'BTC',
        networkTo: 'ETH',
        amount: '0.1',
        rateType: 'float'
      };

      const response = await this.api.post('/exchange/rate', rateRequest);
      const rate = response.data.data;
      
      console.log(`✅ Exchange Rate:`);
      console.log(`   From: ${rate.fromAmount} BTC`);
      console.log(`   To: ${rate.toAmount} ETH`);
      console.log(`   Rate: 1 BTC = ${rate.rate} ETH`);
      console.log(`   Min Amount: ${rate.minAmount} BTC`);
      console.log(`   Max Amount: ${rate.maxAmount} BTC`);
      
      return rate;
    } catch (error) {
      console.error('❌ Error calculating rate:', error.response?.data || error.message);
    }
  }

  // Check API health
  async checkHealth() {
    try {
      console.log('🏥 Checking API health...');
      const response = await this.api.get('/health');
      console.log(`✅ API Status: ${response.data.data.status}`);
      console.log(`   Uptime: ${Math.round(response.data.data.uptime)} seconds`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error checking health:', error.response?.data || error.message);
    }
  }

  // Run all examples
  async runAllExamples() {
    console.log('🚀 Starting Crypto Exchange API Examples\n');
    
    await this.checkHealth();
    await this.getCurrencies();
    await this.getBitcoinNetworks();
    await this.calculateRate();
    
    console.log('\n✨ All examples completed!');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  const example = new ExchangeAPIExample();
  example.runAllExamples().catch(console.error);
}

module.exports = ExchangeAPIExample;