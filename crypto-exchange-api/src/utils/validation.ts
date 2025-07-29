import Joi from 'joi';
import { RateCalculationRequest, ExchangeRequest } from '../types/api';

// Common validation schemas
const currencyCodeSchema = Joi.string().min(2).max(10).uppercase().required();
const networkCodeSchema = Joi.string().min(2).max(20).uppercase();
const addressSchema = Joi.string().min(10).max(200).required();
const amountSchema = Joi.number().positive().precision(18).required();

// Rate calculation validation
export const rateRequestSchema = Joi.object<RateCalculationRequest>({
  coinFrom: currencyCodeSchema,
  coinTo: currencyCodeSchema,
  networkFrom: networkCodeSchema.optional(),
  networkTo: networkCodeSchema.optional(),
  amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  rateType: Joi.string().valid('float', 'fixed').default('float')
});

// Exchange transaction validation
export const exchangeRequestSchema = Joi.object<ExchangeRequest>({
  coinFrom: currencyCodeSchema,
  coinTo: currencyCodeSchema,
  networkFrom: networkCodeSchema.required(),
  networkTo: networkCodeSchema.required(),
  amount: amountSchema,
  withdrawalAddress: addressSchema,
  withdrawalExtraId: Joi.string().max(100).optional().allow(''),
  refundAddress: addressSchema.optional(),
  refundExtraId: Joi.string().max(100).optional().allow(''),
  rateType: Joi.string().valid('float', 'fixed').default('float')
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(25),
  search: Joi.string().max(100).optional()
});

// Transaction ID validation
export const transactionIdSchema = Joi.string().alphanum().min(10).max(50).required();

// Address validation by network type
export const validateAddress = (address: string, network: string): boolean => {
  const patterns: Record<string, RegExp> = {
    BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
    XMR: /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/,
    // Add more patterns as needed
  };

  const pattern = patterns[network.toUpperCase()];
  return pattern ? pattern.test(address) : true; // Default to true for unknown networks
};

// Sanitize input strings
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validate and sanitize pagination parameters
export const validatePagination = (query: any) => {
  const { error, value } = paginationSchema.validate(query);
  if (error) {
    throw new Error(`Pagination validation error: ${error.details[0]?.message}`);
  }
  return value;
};