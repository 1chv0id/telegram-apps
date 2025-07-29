import { Request, Response } from 'express';
import exolixService from '../services/exolixService';
import { ApiResponse, RateCalculationRequest, ExchangeRequest } from '../types/api';
import { rateRequestSchema, exchangeRequestSchema, transactionIdSchema } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

class ExchangeController {
  /**
   * Calculate exchange rate
   * POST /api/exchange/rate
   */
  calculateRate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { error, value } = rateRequestSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
      return;
    }

    const rateRequest: RateCalculationRequest = value;
    
    logger.info('Calculating exchange rate', rateRequest);

    // Validate currency/network combinations
    const fromValid = await exolixService.validateCurrencyNetwork(
      rateRequest.coinFrom, 
      rateRequest.networkFrom || rateRequest.coinFrom
    );
    const toValid = await exolixService.validateCurrencyNetwork(
      rateRequest.coinTo, 
      rateRequest.networkTo || rateRequest.coinTo
    );

    if (!fromValid || !toValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid currency/network combination',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const rate = await exolixService.getRate({
      coinFrom: rateRequest.coinFrom,
      networkFrom: rateRequest.networkFrom,
      coinTo: rateRequest.coinTo,
      networkTo: rateRequest.networkTo,
      amount: rateRequest.amount,
      rateType: rateRequest.rateType || 'float'
    });

    const response: ApiResponse = {
      success: true,
      data: rate,
      message: `Exchange rate calculated: 1 ${rateRequest.coinFrom} = ${rate.rate} ${rateRequest.coinTo}`
    };

    res.json(response);
  });

  /**
   * Create exchange transaction
   * POST /api/exchange/create
   */
  createExchange = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { error, value } = exchangeRequestSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
      return;
    }

    const exchangeRequest: ExchangeRequest = value;
    
    logger.info('Creating exchange transaction', {
      from: `${exchangeRequest.amount} ${exchangeRequest.coinFrom}`,
      to: exchangeRequest.coinTo,
      address: exchangeRequest.withdrawalAddress
    });

    // Validate currency/network combinations
    const fromValid = await exolixService.validateCurrencyNetwork(
      exchangeRequest.coinFrom, 
      exchangeRequest.networkFrom || exchangeRequest.coinFrom
    );
    const toValid = await exolixService.validateCurrencyNetwork(
      exchangeRequest.coinTo, 
      exchangeRequest.networkTo || exchangeRequest.coinTo
    );

    if (!fromValid || !toValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid currency/network combination',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // First get the rate to ensure the exchange is possible
    const rate = await exolixService.getRate({
      coinFrom: exchangeRequest.coinFrom,
      networkFrom: exchangeRequest.networkFrom,
      coinTo: exchangeRequest.coinTo,
      networkTo: exchangeRequest.networkTo,
      amount: exchangeRequest.amount.toString(),
      rateType: exchangeRequest.rateType || 'float'
    });

    // Check if amount meets minimum requirements
    if (exchangeRequest.amount < rate.minAmount) {
      res.status(400).json({
        success: false,
        error: `Minimum exchange amount is ${rate.minAmount} ${exchangeRequest.coinFrom}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if amount doesn't exceed maximum
    if (exchangeRequest.amount > rate.maxAmount) {
      res.status(400).json({
        success: false,
        error: `Maximum exchange amount is ${rate.maxAmount} ${exchangeRequest.coinFrom}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const transaction = await exolixService.createTransaction({
      coinFrom: exchangeRequest.coinFrom,
      networkFrom: exchangeRequest.networkFrom || exchangeRequest.coinFrom,
      coinTo: exchangeRequest.coinTo,
      networkTo: exchangeRequest.networkTo || exchangeRequest.coinTo,
      amount: exchangeRequest.amount,
      withdrawalAddress: exchangeRequest.withdrawalAddress,
      withdrawalExtraId: exchangeRequest.withdrawalExtraId,
      refundAddress: exchangeRequest.refundAddress,
      refundExtraId: exchangeRequest.refundExtraId,
      rateType: exchangeRequest.rateType || 'float'
    });

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: `Exchange transaction created with ID: ${transaction.id}`
    };

    res.status(201).json(response);
  });

  /**
   * Get exchange transaction status
   * GET /api/exchange/:id
   */
  getExchangeStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { error, value } = transactionIdSchema.validate(req.params.id);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid transaction ID format',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const transactionId = value;
    
    logger.info('Fetching exchange status', { transactionId });

    const transaction = await exolixService.getTransaction(transactionId);

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: `Transaction status: ${transaction.status}`
    };

    res.json(response);
  });

  /**
   * Get exchange limits for currency pair
   * GET /api/exchange/limits?coinFrom=BTC&coinTo=ETH&networkFrom=BTC&networkTo=ETH
   */
  getExchangeLimits = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { coinFrom, coinTo, networkFrom, networkTo } = req.query;

    if (!coinFrom || !coinTo) {
      res.status(400).json({
        success: false,
        error: 'coinFrom and coinTo parameters are required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Fetching exchange limits', { coinFrom, coinTo, networkFrom, networkTo });

    // Get rate with minimal amount to fetch limits
    const rate = await exolixService.getRate({
      coinFrom: coinFrom as string,
      networkFrom: (networkFrom as string) || (coinFrom as string),
      coinTo: coinTo as string,
      networkTo: (networkTo as string) || (coinTo as string),
      amount: '1',
      rateType: 'float'
    });

    const response: ApiResponse = {
      success: true,
      data: {
        minAmount: rate.minAmount,
        maxAmount: rate.maxAmount,
        withdrawMin: rate.withdrawMin,
        coinFrom: coinFrom,
        coinTo: coinTo,
        networkFrom: networkFrom,
        networkTo: networkTo
      },
      message: `Exchange limits for ${coinFrom} to ${coinTo}`
    };

    res.json(response);
  });

  /**
   * Estimate exchange output
   * GET /api/exchange/estimate?coinFrom=BTC&coinTo=ETH&amount=0.1&networkFrom=BTC&networkTo=ETH
   */
  estimateExchange = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { coinFrom, coinTo, amount, networkFrom, networkTo, rateType } = req.query;

    if (!coinFrom || !coinTo || !amount) {
      res.status(400).json({
        success: false,
        error: 'coinFrom, coinTo, and amount parameters are required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const numAmount = parseFloat(amount as string);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid amount value',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Estimating exchange', { coinFrom, coinTo, amount, networkFrom, networkTo });

    const rate = await exolixService.getRate({
      coinFrom: coinFrom as string,
      networkFrom: (networkFrom as string) || (coinFrom as string),
      coinTo: coinTo as string,
      networkTo: (networkTo as string) || (coinTo as string),
      amount: amount as string,
      rateType: (rateType as 'float' | 'fixed') || 'float'
    });

    const response: ApiResponse = {
      success: true,
      data: {
        fromAmount: rate.fromAmount,
        toAmount: rate.toAmount,
        rate: rate.rate,
        minAmount: rate.minAmount,
        maxAmount: rate.maxAmount,
        rateType: rateType || 'float',
        message: rate.message
      },
      message: `You will receive approximately ${rate.toAmount} ${coinTo}`
    };

    res.json(response);
  });
}

export default new ExchangeController();