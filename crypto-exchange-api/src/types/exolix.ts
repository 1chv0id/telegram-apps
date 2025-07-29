// Exolix API Types

export interface Currency {
  code: string;
  name: string;
  icon: string;
  notes: string;
  networks?: Network[];
}

export interface Network {
  network: string;
  name: string;
  shortName: string;
  notes: string | null;
  addressRegex: string | null;
  isDefault: boolean;
  blockExplorer: string | null;
  memoNeeded: boolean;
  memoName: string | null;
  memoRegex: string | null;
  precision: number;
  decimal: number | null;
  contract: string | null;
  icon: string | null;
}

export interface CurrenciesResponse {
  data: Currency[];
  count: number;
}

export interface NetworksResponse {
  data: Network[];
  count: number;
}

export interface RateRequest {
  coinFrom: string;
  networkFrom?: string | undefined;
  coinTo: string;
  networkTo?: string | undefined;
  amount: string;
  withdrawalAmount?: string | undefined;
  rateType: 'float' | 'fixed';
}

export interface RateResponse {
  fromAmount: number;
  toAmount: number;
  rate: number;
  message: string | null;
  minAmount: number;
  withdrawMin: number;
  maxAmount: number;
}

export interface CoinInfo {
  coinCode: string;
  coinName: string;
  network: string;
  networkName: string;
  networkShortName: string | null;
  icon: string;
  memoName: string | null;
  contract: string | null;
}

export interface HashInfo {
  hash: string | null;
  link: string | null;
}

export interface Transaction {
  id: string;
  amount: number;
  amountTo: number;
  coinFrom: CoinInfo;
  coinTo: CoinInfo;
  comment: string | null;
  createdAt: string;
  depositAddress: string;
  depositExtraId: string | null;
  withdrawalAddress: string;
  withdrawalExtraId: string | null;
  hashIn: HashInfo;
  hashOut: HashInfo;
  rate: number;
  rateType: 'float' | 'fixed';
  refundAddress: string | null;
  refundExtraId: string | null;
  status: 'wait' | 'confirmation' | 'confirmed' | 'exchanging' | 'sending' | 'success' | 'overdue' | 'refunded';
  source?: string;
}

export interface CreateTransactionRequest {
  coinFrom: string;
  networkFrom: string;
  coinTo: string;
  networkTo: string;
  amount: number;
  withdrawalAmount?: number | undefined;
  withdrawalAddress: string;
  withdrawalExtraId?: string | undefined;
  rateType?: 'float' | 'fixed' | undefined;
  refundAddress?: string | undefined;
  refundExtraId?: string | undefined;
}

export interface TransactionsResponse {
  data: Transaction[];
  count: number;
}

export interface TransactionFilters {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  statuses?: string;
}

export class ExolixError extends Error {
  public code?: string | undefined;
  public details?: any;

  constructor(options: { message: string; code?: string | undefined; details?: any }) {
    super(options.message);
    this.name = 'ExolixError';
    this.code = options.code || undefined;
    this.details = options.details;
  }
}