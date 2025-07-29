import { Router } from 'express';
import currencyRoutes from './currencyRoutes';
import exchangeRoutes from './exchangeRoutes';
import transactionRoutes from './transactionRoutes';
import { ApiResponse } from '../types/api';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    },
    message: 'API is running'
  };
  res.json(response);
});

// API info endpoint
router.get('/info', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: 'Crypto Exchange API',
      version: '1.0.0',
      description: 'Cryptocurrency exchange API using Exolix platform',
      endpoints: {
        currencies: '/api/currencies',
        networks: '/api/networks',
        exchange: '/api/exchange',
        transactions: '/api/transactions'
      },
      features: [
        'Get available currencies and networks',
        'Calculate exchange rates',
        'Create exchange transactions',
        'Track transaction status',
        'Transaction history (with API key)'
      ]
    },
    message: 'API information'
  };
  res.json(response);
});

// Mount route modules
router.use('/currencies', currencyRoutes);
router.use('/networks', currencyRoutes); // Networks are handled by currency controller
router.use('/exchange', exchangeRoutes);
router.use('/transactions', transactionRoutes);

export default router;