import { Router } from 'express';
import transactionController from '../controllers/transactionController';
import { createRateLimit, requireApiKey } from '../middleware/security';

const router = Router();

// Apply rate limiting and API key requirement for all transaction routes
const transactionRateLimit = createRateLimit(15 * 60 * 1000, 50); // 50 requests per 15 minutes

router.use(transactionRateLimit);
router.use(requireApiKey); // All transaction endpoints require API key

// Transaction history routes
router.get('/', transactionController.getTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/search', transactionController.searchTransactions);
router.get('/pending', transactionController.getPendingTransactions);
router.get('/range', transactionController.getTransactionsByDateRange);
router.get('/status/:status', transactionController.getTransactionsByStatus);

export default router;