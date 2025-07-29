# Crypto Exchange API Documentation

## Overview

The Crypto Exchange API provides a secure and comprehensive interface for cryptocurrency exchange operations using the Exolix platform. It supports over 1,900 cryptocurrencies and multiple blockchain networks.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints are public and don't require authentication. However, transaction history endpoints require an API key:

```bash
# Set your Exolix API key in .env file
EXOLIX_API_KEY=your_api_key_here
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

## Rate Limiting

Different endpoints have different rate limits:

- **Currency/Network Info**: 200 requests per 15 minutes
- **Rate Calculations**: 100 requests per 5 minutes  
- **Exchange Creation**: 10 requests per 15 minutes
- **Status Checks**: 200 requests per 5 minutes
- **Transaction History**: 50 requests per 15 minutes

## Endpoints

### System Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-12-01T12:00:00.000Z",
    "version": "1.0.0",
    "uptime": 3600
  },
  "message": "API is running"
}
```

#### API Information
```http
GET /api/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Crypto Exchange API",
    "version": "1.0.0",
    "description": "Cryptocurrency exchange API using Exolix platform",
    "endpoints": {
      "currencies": "/api/currencies",
      "networks": "/api/networks", 
      "exchange": "/api/exchange",
      "transactions": "/api/transactions"
    },
    "features": [...]
  },
  "message": "API information"
}
```

### Currency & Network Endpoints

#### Get Currencies
```http
GET /api/currencies?page=1&size=10&withNetworks=false
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `size` (optional): Items per page (default: 10, max: 100)
- `withNetworks` (optional): Include network information (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "code": "BTC",
        "name": "Bitcoin",
        "icon": "https://exolix.com/icons/coins/BTC.png",
        "notes": ""
      }
    ],
    "count": 1960
  },
  "message": "Retrieved 10 currencies"
}
```

#### Search Currencies
```http
GET /api/currencies/search?q=bitcoin
```

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)

#### Get Popular Currencies
```http
GET /api/currencies/popular
```

Returns top 20 popular currencies with network information.

#### Get Currency Networks
```http
GET /api/currencies/{code}/networks
```

**Path Parameters:**
- `code` (required): Currency code (e.g., "BTC")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "coinNetworkId": 493,
      "network": "BTC",
      "name": "Bitcoin",
      "shortName": "",
      "isDefault": true,
      "blockExplorer": "https://mempool.space/tx/",
      "memoNeeded": false,
      "precision": 8,
      "addressRegex": "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^[(bc1q)|(bc1p)][0-9A-Za-z]{37,62}$"
    }
  ],
  "message": "Retrieved 15 networks for BTC"
}
```

#### Validate Currency/Network Combination
```http
GET /api/currencies/{code}/networks/{network}/validate
```

**Path Parameters:**
- `code` (required): Currency code
- `network` (required): Network name

#### Get All Networks
```http
GET /api/networks?page=1&size=10
```

### Exchange Endpoints

#### Calculate Exchange Rate
```http
POST /api/exchange/rate
```

**Request Body:**
```json
{
  "coinFrom": "BTC",
  "coinTo": "ETH", 
  "networkFrom": "BTC",
  "networkTo": "ETH",
  "amount": "0.1",
  "rateType": "float"
}
```

**Request Fields:**
- `coinFrom` (required): Source currency code
- `coinTo` (required): Target currency code
- `networkFrom` (optional): Source network (defaults to currency code)
- `networkTo` (optional): Target network (defaults to currency code)
- `amount` (required): Amount to exchange
- `rateType` (optional): "float" or "fixed" (default: "float")

**Response:**
```json
{
  "success": true,
  "data": {
    "fromAmount": 0.1,
    "toAmount": 3.109651,
    "rate": 31.09651,
    "minAmount": 0.00041704,
    "maxAmount": 642.90107231,
    "withdrawMin": 8.3616352785e-05,
    "message": null
  },
  "message": "Exchange rate calculated: 1 BTC = 31.09651 ETH"
}
```

#### Estimate Exchange
```http
GET /api/exchange/estimate?coinFrom=BTC&coinTo=ETH&amount=0.1&networkFrom=BTC&networkTo=ETH&rateType=float
```

**Query Parameters:**
- `coinFrom` (required): Source currency
- `coinTo` (required): Target currency
- `amount` (required): Amount to exchange
- `networkFrom` (optional): Source network
- `networkTo` (optional): Target network
- `rateType` (optional): "float" or "fixed"

#### Get Exchange Limits
```http
GET /api/exchange/limits?coinFrom=BTC&coinTo=ETH&networkFrom=BTC&networkTo=ETH
```

**Query Parameters:**
- `coinFrom` (required): Source currency
- `coinTo` (required): Target currency
- `networkFrom` (optional): Source network
- `networkTo` (optional): Target network

**Response:**
```json
{
  "success": true,
  "data": {
    "minAmount": 0.00041704,
    "maxAmount": 642.90107231,
    "withdrawMin": 8.3616352785e-05,
    "coinFrom": "BTC",
    "coinTo": "ETH"
  },
  "message": "Exchange limits for BTC to ETH"
}
```

#### Create Exchange Transaction
```http
POST /api/exchange/create
```

**Request Body:**
```json
{
  "coinFrom": "BTC",
  "coinTo": "ETH",
  "networkFrom": "BTC", 
  "networkTo": "ETH",
  "amount": 0.1,
  "withdrawalAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "withdrawalExtraId": "",
  "refundAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "refundExtraId": "",
  "rateType": "float"
}
```

**Request Fields:**
- `coinFrom` (required): Source currency code
- `coinTo` (required): Target currency code
- `networkFrom` (optional): Source network
- `networkTo` (optional): Target network
- `amount` (required): Amount to exchange (number)
- `withdrawalAddress` (required): Destination address
- `withdrawalExtraId` (optional): Memo/tag for withdrawal
- `refundAddress` (optional): Refund address
- `refundExtraId` (optional): Memo/tag for refund
- `rateType` (optional): "float" or "fixed"

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "status": "wait",
    "coinFrom": {
      "coinCode": "BTC",
      "coinName": "Bitcoin",
      "network": "BTC"
    },
    "coinTo": {
      "coinCode": "ETH", 
      "coinName": "Ethereum",
      "network": "ETH"
    },
    "amount": 0.1,
    "amountTo": 3.109651,
    "depositAddress": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    "withdrawalAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    "createdAt": "2023-12-01T12:00:00.000Z"
  },
  "message": "Exchange transaction created with ID: abc123def456"
}
```

#### Get Exchange Status
```http
GET /api/exchange/{id}
```

**Path Parameters:**
- `id` (required): Transaction ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "status": "success",
    "coinFrom": {...},
    "coinTo": {...},
    "amount": 0.1,
    "amountTo": 3.109651,
    "depositAddress": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    "withdrawalAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    "depositHash": "abc123...",
    "withdrawalHash": "def456...",
    "createdAt": "2023-12-01T12:00:00.000Z",
    "updatedAt": "2023-12-01T12:05:00.000Z"
  },
  "message": "Transaction status: success"
}
```

### Transaction Endpoints (Requires API Key)

#### Get Transaction History
```http
GET /api/transactions?page=1&size=10&sort=createdAt&order=desc
```

**Query Parameters:**
- `page` (optional): Page number
- `size` (optional): Items per page
- `sort` (optional): Sort field
- `order` (optional): "asc" or "desc"
- `dateFrom` (optional): Start date (YYYY-MM-DD)
- `dateTo` (optional): End date (YYYY-MM-DD)
- `statuses` (optional): Comma-separated status list

#### Get Transaction Statistics
```http
GET /api/transactions/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "recent": 100,
    "statusBreakdown": {
      "success": 85,
      "wait": 5,
      "exchanging": 3,
      "refunded": 2
    },
    "totalVolume": 15.5,
    "averageAmount": 0.155,
    "successRate": 85.0
  },
  "message": "Transaction statistics calculated"
}
```

#### Search Transactions
```http
GET /api/transactions/search?q=abc123
```

#### Get Transactions by Status
```http
GET /api/transactions/status/{status}
```

**Valid Statuses:**
- `wait` - Waiting for deposit
- `confirmation` - Confirming deposit
- `confirmed` - Deposit confirmed
- `exchanging` - Exchange in progress
- `sending` - Sending to withdrawal address
- `success` - Transaction completed
- `overdue` - Transaction overdue
- `refunded` - Transaction refunded

#### Get Pending Transactions
```http
GET /api/transactions/pending
```

Returns transactions with statuses: wait, confirmation, confirmed, exchanging, sending

#### Get Transactions by Date Range
```http
GET /api/transactions/range?dateFrom=2023-01-01&dateTo=2023-12-31
```

## Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | API key required |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External service unavailable |

## Examples

### Basic Exchange Flow

1. **Get available currencies:**
```bash
curl "http://localhost:3000/api/currencies?size=5"
```

2. **Check currency networks:**
```bash
curl "http://localhost:3000/api/currencies/BTC/networks"
```

3. **Calculate exchange rate:**
```bash
curl -X POST "http://localhost:3000/api/exchange/rate" \
  -H "Content-Type: application/json" \
  -d '{
    "coinFrom": "BTC",
    "coinTo": "ETH", 
    "amount": "0.1",
    "rateType": "float"
  }'
```

4. **Create exchange:**
```bash
curl -X POST "http://localhost:3000/api/exchange/create" \
  -H "Content-Type: application/json" \
  -d '{
    "coinFrom": "BTC",
    "coinTo": "ETH",
    "amount": 0.1,
    "withdrawalAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
  }'
```

5. **Check transaction status:**
```bash
curl "http://localhost:3000/api/exchange/abc123def456"
```

### JavaScript Example

```javascript
const API_BASE = 'http://localhost:3000/api';

// Calculate exchange rate
const response = await fetch(`${API_BASE}/exchange/rate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coinFrom: 'BTC',
    coinTo: 'ETH',
    amount: '0.1',
    rateType: 'float'
  })
});

const result = await response.json();
console.log('Exchange rate:', result.data.rate);
```

## Security Considerations

1. **Rate Limiting**: All endpoints have rate limits to prevent abuse
2. **Input Validation**: All inputs are validated and sanitized
3. **CORS Protection**: Configurable CORS settings
4. **Security Headers**: Helmet.js provides security headers
5. **API Key Protection**: Transaction endpoints require valid API key
6. **Error Handling**: Comprehensive error handling without exposing internals

## Support

- **API Issues**: Create an issue in the repository
- **Exolix Support**: support@exolix.com
- **Documentation**: https://exolix.com/developers