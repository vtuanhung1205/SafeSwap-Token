# SafeSwap Demo Guide

This guide will help you set up and run the SafeSwap demo with a backend connection.

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd Frontend
npm install
```

### 3. Start the Backend Server

```bash
cd Backend
npm run dev
```

The backend server will start on port 5000. You should see:
```
Server running on port 5000
```

### 4. Start the Frontend Development Server

In a new terminal:
```bash
cd Frontend
npm run dev
```

The frontend development server will start, typically on port 5173.

## Using the Demo

1. **Authentication**:
   - The system will automatically create a user account when you log in
   - Use any email and name to log in

2. **Token Swapping**:
   - Select tokens from the dropdown
   - Enter an amount to swap
   - Get a quote and review the transaction details
   - Click "Swap" to execute the transaction

3. **Dashboard**:
   - View your swap history
   - Check statistics about your trading activity
   - Monitor token prices in real-time

4. **Security Features**:
   - The system includes token scam detection
   - High-risk tokens will trigger warnings

## API Endpoints

The backend provides the following API endpoints:

- **Authentication**:
  - POST `/api/v1/auth/login` - Log in or create a new user
  - POST `/api/v1/auth/register` - Register a new user
  - GET `/api/v1/auth/profile` - Get user profile
  - GET `/api/v1/auth/validate` - Validate authentication token

- **Swap Operations**:
  - POST `/api/v1/swap/quote` - Get a quote for a token swap
  - POST `/api/v1/swap/execute` - Execute a token swap
  - GET `/api/v1/swap/history` - Get swap history
  - GET `/api/v1/swap/stats` - Get swap statistics

- **Price Information**:
  - GET `/api/v1/price/all` - Get all token prices
  - GET `/api/v1/price/token/:symbol` - Get price for a specific token
  - POST `/api/v1/price/analyze` - Analyze a token for scam risk

## WebSocket Events

The backend also provides real-time updates via WebSocket:

- `initial_prices` - Sent when a client connects, contains all current prices
- `price_update` - Sent when a token price changes
- `subscription_success` - Confirmation of token subscription
- `unsubscription_success` - Confirmation of token unsubscription

## Troubleshooting

- If you encounter CORS issues, make sure both servers are running
- If WebSocket connection fails, check that the backend server is running
- For authentication issues, try clearing your browser's local storage 