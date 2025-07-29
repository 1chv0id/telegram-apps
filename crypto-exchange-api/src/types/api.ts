// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface RateCalculationRequest {
  coinFrom: string;
  coinTo: string;
  networkFrom?: string;
  networkTo?: string;
  amount: string;
  rateType?: 'float' | 'fixed';
}

export interface ExchangeRequest {
  coinFrom: string;
  coinTo: string;
  networkFrom: string;
  networkTo: string;
  amount: number;
  withdrawalAddress: string;
  withdrawalExtraId?: string;
  refundAddress?: string;
  refundExtraId?: string;
  rateType?: 'float' | 'fixed';
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: ValidationError[];
  timestamp: string;
}