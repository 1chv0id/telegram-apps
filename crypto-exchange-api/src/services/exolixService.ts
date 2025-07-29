import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  Currency,
  Network,
  CurrenciesResponse,
  NetworksResponse,
  RateRequest,
  RateResponse,
  Transaction,
  CreateTransactionRequest,
  TransactionsResponse,
  TransactionFilters,
  ExolixError
} from '../types/exolix';
import logger from '../utils/logger';

class ExolixService {
  private api: AxiosInstance;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.EXOLIX_API_KEY;
    
    this.api = axios.create({
      baseURL: process.env.EXOLIX_API_URL || 'https://exolix.com/api/v2',
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': this.apiKey })
      }
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        logger.info(`Exolix API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('Exolix API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info(`Exolix API Response: ${response.status} ${response.config.url}`, {
          data: response.data
        });
        return response;
      },
      (error) => {
        const errorMessage = error.response?.data?.message || error.message;
        logger.error('Exolix API Response Error:', {
          status: error.response?.status,
          message: errorMessage,
          url: error.config?.url
        });
        
        throw new ExolixError({
          message: errorMessage,
          code: error.response?.status?.toString(),
          details: error.response?.data
        });
      }
    );
  }

  /**
   * Get list of available currencies
   */
  async getCurrencies(params?: {
    page?: number;
    size?: number;
    search?: string;
    withNetworks?: boolean;
  }): Promise<CurrenciesResponse> {
    try {
      const response = await this.api.get<CurrenciesResponse>('/currencies', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching currencies:', error);
      throw error;
    }
  }

  /**
   * Get networks for a specific currency
   */
  async getCurrencyNetworks(currencyCode: string): Promise<Network[]> {
    try {
      const response = await this.api.get<Network[]>(`/currencies/${currencyCode.toLowerCase()}/networks`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching networks for currency ${currencyCode}:`, error);
      throw error;
    }
  }

  /**
   * Get list of all available networks
   */
  async getAllNetworks(params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<NetworksResponse> {
    try {
      const response = await this.api.get<NetworksResponse>('/currencies/networks', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching all networks:', error);
      throw error;
    }
  }

  /**
   * Get exchange rate for currency pair
   */
  async getRate(rateRequest: RateRequest): Promise<RateResponse> {
    try {
      const response = await this.api.get<RateResponse>('/rate', { 
        params: rateRequest 
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching exchange rate:', error);
      throw error;
    }
  }

  /**
   * Create new exchange transaction
   */
  async createTransaction(transactionRequest: CreateTransactionRequest): Promise<Transaction> {
    try {
      const response = await this.api.post<Transaction>('/transactions', transactionRequest);
      logger.info(`Transaction created: ${response.data.id}`, {
        from: `${transactionRequest.amount} ${transactionRequest.coinFrom}`,
        to: `${response.data.amountTo} ${transactionRequest.coinTo}`,
        status: response.data.status
      });
      return response.data;
    } catch (error) {
      logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await this.api.get<Transaction>(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction history (requires API key)
   */
  async getTransactions(filters?: TransactionFilters): Promise<TransactionsResponse> {
    if (!this.apiKey) {
      throw new ExolixError({
        message: 'API key required for transaction history',
        code: 'UNAUTHORIZED'
      });
    }

    try {
      const response = await this.api.get<TransactionsResponse>('/transactions', { 
        params: filters 
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Check if API key is configured
   */
  isAuthenticated(): boolean {
    return !!this.apiKey;
  }

  /**
   * Validate currency and network combination
   */
  async validateCurrencyNetwork(currencyCode: string, networkCode?: string): Promise<boolean> {
    try {
      const networks = await this.getCurrencyNetworks(currencyCode);
      
      if (!networkCode) {
        return networks.length > 0;
      }
      
      return networks.some(network => 
        network.network.toLowerCase() === networkCode.toLowerCase()
      );
    } catch (error) {
      logger.warn(`Currency/network validation failed for ${currencyCode}/${networkCode}:`, error);
      return false;
    }
  }
}

export default new ExolixService();