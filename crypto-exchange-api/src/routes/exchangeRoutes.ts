import { Router } from 'express';
import exchangeController from '../controllers/exchangeController';
import { createRateLimit } from '../middleware/security';

const router = Router();

// Apply different rate limits for different operations
const rateCalculationLimit = createRateLimit(5 * 60 * 1000, 100); // 100 requests per 5 minutes
const exchangeCreationLimit = createRateLimit(15 * 60 * 1000, 10); // 10 exchanges per 15 minutes
const statusCheckLimit = createRateLimit(5 * 60 * 1000, 200); // 200 status checks per 5 minutes

// Rate calculation endpoints (higher rate limit)
router.post('/rate', rateCalculationLimit, exchangeController.calculateRate);
router.get('/estimate', rateCalculationLimit, exchangeController.estimateExchange);
router.get('/limits', rateCalculationLimit, exchangeController.getExchangeLimits);

// Exchange creation (lower rate limit for security)
router.post('/create', exchangeCreationLimit, exchangeController.createExchange);

// Status checking (moderate rate limit)
router.get('/:id', statusCheckLimit, exchangeController.getExchangeStatus);

export default router;