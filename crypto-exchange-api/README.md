# Crypto Exchange API

A secure and robust cryptocurrency exchange API built with Node.js, TypeScript, and Express, utilizing the Exolix platform for cryptocurrency exchanges.

## Features

- 🔐 **Secure**: Built with security best practices including rate limiting, CORS, helmet, and input validation
- 🚀 **Fast**: Optimized for performance with proper error handling and logging
- 📝 **TypeScript**: Fully typed for better development experience and reliability
- 🔄 **Real-time**: Get live exchange rates and transaction status updates
- 📊 **Comprehensive**: Support for 500+ cryptocurrencies and multiple networks
- 🛡️ **Robust**: Comprehensive error handling and validation

## API Endpoints

### Currencies & Networks
- `GET /api/currencies` - Get list of available currencies
- `GET /api/currencies/search?q=bitcoin` - Search currencies
- `GET /api/currencies/popular` - Get popular currencies
- `GET /api/currencies/:code/networks` - Get networks for currency
- `GET /api/networks` - Get all available networks

### Exchange Operations
- `POST /api/exchange/rate` - Calculate exchange rate
- `GET /api/exchange/estimate` - Estimate exchange output
- `GET /api/exchange/limits` - Get exchange limits
- `POST /api/exchange/create` - Create exchange transaction
- `GET /api/exchange/:id` - Get exchange status

### Transaction Management (Requires API Key)
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/transactions/search` - Search transactions
- `GET /api/transactions/pending` - Get pending transactions
- `GET /api/transactions/status/:status` - Get transactions by status

### System
- `GET /api/health` - Health check
- `GET /api/info` - API information

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-exchange-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Exolix API Configuration
EXOLIX_API_URL=https://exolix.com/api/v2
EXOLIX_API_KEY=your_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

5. Build and start:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Usage Examples

### Calculate Exchange Rate

```bash
curl -X POST http://localhost:3000/api/exchange/rate \
  -H "Content-Type: application/json" \
  -d '{
    "coinFrom": "BTC",
    "coinTo": "ETH",
    "networkFrom": "BTC",
    "networkTo": "ETH",
    "amount": "0.1",
    "rateType": "float"
  }'
```

### Create Exchange Transaction

```bash
curl -X POST http://localhost:3000/api/exchange/create \
  -H "Content-Type: application/json" \
  -d '{
    "coinFrom": "BTC",
    "coinTo": "ETH",
    "networkFrom": "BTC",
    "networkTo": "ETH",
    "amount": 0.1,
    "withdrawalAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    "rateType": "float"
  }'
```

### Get Exchange Status

```bash
curl http://localhost:3000/api/exchange/abc123def456
```

### Get Available Currencies

```bash
curl http://localhost:3000/api/currencies?page=1&size=10
```

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

## Security Features

- **Rate Limiting**: Different limits for different operations
- **CORS Protection**: Configurable allowed origins
- **Helmet Security**: Security headers and CSP
- **Input Validation**: Comprehensive request validation
- **Sanitization**: Input sanitization to prevent XSS
- **Logging**: Comprehensive request and error logging
- **API Key Protection**: Secure transaction history access

## Rate Limits

- **Currency/Network Info**: 200 requests per 15 minutes
- **Rate Calculations**: 100 requests per 5 minutes
- **Exchange Creation**: 10 requests per 15 minutes
- **Status Checks**: 200 requests per 5 minutes
- **Transaction History**: 50 requests per 15 minutes

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Network timeouts
- Exolix API errors
- Rate limit exceeded
- Invalid currency/network combinations
- Insufficient amounts
- Invalid addresses

## Logging

Logs are written to:
- Console (development)
- `logs/app.log` (all logs)
- `logs/error.log` (errors only)

Log levels: `error`, `warn`, `info`, `debug`

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Lint code
npm run lint
npm run lint:fix
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXOLIX_API_URL` | Exolix API base URL | `https://exolix.com/api/v2` |
| `EXOLIX_API_KEY` | Your Exolix API key | - |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |
| `LOG_FILE` | Log file path | `logs/app.log` |

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Contact Exolix support: support@exolix.com
- Check the API documentation: https://exolix.com/developers