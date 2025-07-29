import { Router } from 'express';
import currencyController from '../controllers/currencyController';
import { createRateLimit } from '../middleware/security';

const router = Router();

// Apply rate limiting to currency routes
const currencyRateLimit = createRateLimit(15 * 60 * 1000, 200); // 200 requests per 15 minutes

router.use(currencyRateLimit);

// Currency routes
router.get('/', currencyController.getCurrencies);
router.get('/search', currencyController.searchCurrencies);
router.get('/popular', currencyController.getPopularCurrencies);
router.get('/:code/networks', currencyController.getCurrencyNetworks);
router.get('/:code/networks/:network/validate', currencyController.validateCurrencyNetwork);

// Network routes (handled by currency controller)
router.get('/networks', currencyController.getAllNetworks);

export default router;