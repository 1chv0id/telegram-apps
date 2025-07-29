import { Request, Response } from 'express';
import exolixService from '../services/exolixService';
import { ApiResponse } from '../types/api';
import { TransactionFilters } from '../types/exolix';
import { validatePagination } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

class TransactionController {
  /**
   * Get transaction history (requires API key)
   * GET /api/transactions
   */
  getTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!exolixService.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'API key required for transaction history',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const pagination = validatePagination(req.query);
    const { sort, order, dateFrom, dateTo, statuses } = req.query;

    const filters: TransactionFilters = {
      ...pagination,
      sort: sort as string,
      order: order as 'asc' | 'desc',
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      statuses: statuses as string
    };

    logger.info('Fetching transaction history', filters);

    const result = await exolixService.getTransactions(filters);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Retrieved ${result.data.length} transactions`
    };

    res.json(response);
  });

  /**
   * Get transaction statistics
   * GET /api/transactions/stats
   */
  getTransactionStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!exolixService.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'API key required for transaction statistics',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Fetching transaction statistics');

    // Get recent transactions to calculate stats
    const result = await exolixService.getTransactions({
      page: 1,
      size: 100 // Get last 100 transactions for stats
    });

    const transactions = result.data;
    const stats = {
      total: result.count,
      recent: transactions.length,
      statusBreakdown: {} as Record<string, number>,
      totalVolume: 0,
      averageAmount: 0,
      successRate: 0
    };

    // Calculate statistics
    let totalAmount = 0;
    let successCount = 0;

    transactions.forEach(tx => {
      // Status breakdown
      stats.statusBreakdown[tx.status] = (stats.statusBreakdown[tx.status] || 0) + 1;
      
      // Volume calculation
      totalAmount += tx.amount;
      
      // Success rate
      if (tx.status === 'success') {
        successCount++;
      }
    });

    stats.totalVolume = totalAmount;
    stats.averageAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
    stats.successRate = transactions.length > 0 ? (successCount / transactions.length) * 100 : 0;

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'Transaction statistics calculated'
    };

    res.json(response);
  });

  /**
   * Get transactions by status
   * GET /api/transactions/status/:status
   */
  getTransactionsByStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!exolixService.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'API key required for transaction history',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { status } = req.params;
    const validStatuses = ['wait', 'confirmation', 'confirmed', 'exchanging', 'sending', 'success', 'overdue', 'refunded'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const pagination = validatePagination(req.query);

    logger.info('Fetching transactions by status', { status, ...pagination });

    const result = await exolixService.getTransactions({
      ...pagination,
      statuses: status
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Retrieved ${result.data.length} transactions with status: ${status}`
    };

    res.json(response);
  });

  /**
   * Search transactions
   * GET /api/transactions/search?q=transaction_id_or_address
   */
  searchTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!exolixService.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'API key required for transaction search',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 3) {
      res.status(400).json({
        success: false,
        error: 'Search query must be at least 3 characters long',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const pagination = validatePagination(req.query);

    logger.info('Searching transactions', { query: q, ...pagination });

    const result = await exolixService.getTransactions({
      ...pagination,
      search: q.toString()
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Found ${result.data.length} transactions matching "${q}"`
    };

    res.json(response);
  });

  /**
   * Get transactions within date range
   * GET /api/transactions/range?dateFrom=2023-01-01&dateTo=2023-12-31
   */
  getTransactionsByDateRange = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!exolixService.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'API key required for transaction history',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({
        success: false,
        error: 'Both dateFrom and dateTo parameters are required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate date format
    const fromDate = new Date(dateFrom as string);
    const toDate = new Date(dateTo as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD format',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (fromDate > toDate) {
      res.status(400).json({
        success: false,
        error: 'dateFrom cannot be later than dateTo',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const pagination = validatePagination(req.query);

    logger.info('Fetching transactions by date range', { 
      dateFrom, 
      dateTo, 
      ...pagination 
    });

    const result = await exolixService.getTransactions({
      ...pagination,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Retrieved ${result.data.length} transactions from ${dateFrom} to ${dateTo}`
    };

    res.json(response);
  });

  /**
   * Get pending transactions (wait, confirmation, confirmed, exchanging, sending)
   * GET /api/transactions/pending
   */
  getPendingTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!exolixService.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'API key required for transaction history',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const pagination = validatePagination(req.query);
    const pendingStatuses = 'wait,confirmation,confirmed,exchanging,sending';

    logger.info('Fetching pending transactions', pagination);

    const result = await exolixService.getTransactions({
      ...pagination,
      statuses: pendingStatuses
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Retrieved ${result.data.length} pending transactions`
    };

    res.json(response);
  });
}

export default new TransactionController();