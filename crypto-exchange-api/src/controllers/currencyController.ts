import { Request, Response } from 'express';
import exolixService from '../services/exolixService';
import { ApiResponse, PaginationParams } from '../types/api';
import { validatePagination } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

class CurrencyController {
  /**
   * Get list of available currencies
   * GET /api/currencies
   */
  getCurrencies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const params = validatePagination(req.query);
    const withNetworks = req.query.withNetworks === 'true';
    
    logger.info('Fetching currencies', { params, withNetworks });
    
    const result = await exolixService.getCurrencies({
      ...params,
      withNetworks
    });
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Retrieved ${result.data.length} currencies`
    };
    
    res.json(response);
  });

  /**
   * Get networks for a specific currency
   * GET /api/currencies/:code/networks
   */
  getCurrencyNetworks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params;
    
    if (!code || code.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Invalid currency code',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    logger.info('Fetching networks for currency', { currencyCode: code });
    
    const networks = await exolixService.getCurrencyNetworks(code);
    
    const response: ApiResponse = {
      success: true,
      data: networks,
      message: `Retrieved ${networks.length} networks for ${code.toUpperCase()}`
    };
    
    res.json(response);
  });

  /**
   * Get all available networks
   * GET /api/networks
   */
  getAllNetworks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const params = validatePagination(req.query);
    
    logger.info('Fetching all networks', { params });
    
    const result = await exolixService.getAllNetworks(params);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Retrieved ${result.data.length} networks`
    };
    
    res.json(response);
  });

  /**
   * Search currencies by code or name
   * GET /api/currencies/search?q=bitcoin
   */
  searchCurrencies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    logger.info('Searching currencies', { query: q });
    
    const result = await exolixService.getCurrencies({
      search: q.toString(),
      size: 50 // Limit search results
    });
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Found ${result.data.length} currencies matching "${q}"`
    };
    
    res.json(response);
  });

  /**
   * Get popular currencies (top 20 by market cap)
   * GET /api/currencies/popular
   */
  getPopularCurrencies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Fetching popular currencies');
    
    // Get first 20 currencies (usually sorted by popularity)
    const result = await exolixService.getCurrencies({
      page: 1,
      size: 20,
      withNetworks: true
    });
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Retrieved ${result.data.length} popular currencies`
    };
    
    res.json(response);
  });

  /**
   * Validate currency and network combination
   * GET /api/currencies/:code/networks/:network/validate
   */
  validateCurrencyNetwork = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code, network } = req.params;
    
    if (!code || !network) {
      res.status(400).json({
        success: false,
        error: 'Currency code and network are required',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    logger.info('Validating currency/network combination', { code, network });
    
    const isValid = await exolixService.validateCurrencyNetwork(code, network);
    
    const response: ApiResponse = {
      success: true,
      data: {
        valid: isValid,
        currency: code.toUpperCase(),
        network: network.toUpperCase()
      },
      message: isValid 
        ? `${code.toUpperCase()} is supported on ${network.toUpperCase()} network`
        : `${code.toUpperCase()} is not supported on ${network.toUpperCase()} network`
    };
    
    res.json(response);
  });
}

export default new CurrencyController();