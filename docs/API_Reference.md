# API Reference

The SafeSwap Backend provides a robust RESTful API built with Express.js. All authenticated endpoints require a JWT Bearer token in the `Authorization` header.

## Base URL
- **Local:** `http://localhost:5000/api`
- **Production:** `(Your Production Domain)/api`

## Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user account with email/password. | No |
| POST | `/login` | Authenticate user and receive JWT and Refresh tokens. | No |
| GET | `/google` | Initiate Google OAuth2 login flow. | No |
| GET | `/google/callback` | Callback URL for Google OAuth2. | No |
| POST | `/logout` | Invalidate the current session tokens. | Yes |
| GET | `/profile` | Get the authenticated user's profile details. | Yes |
| POST | `/refresh-token` | Obtain a new access token using a refresh token. | No |

## Wallet Management (`/api/wallet`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/connect` | Map an Aptos wallet (`address`, `publicKey`) to the user. | Yes |
| POST | `/disconnect`| Unlink the currently connected wallet. | Yes |
| GET | `/info` | Get connected wallet details and current balance. | Yes |
| GET | `/transactions`| Fetch recent blockchain transactions for the connected wallet.| Yes |

## Token Swaps (`/api/swap`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/quote` | Get a real-time price quote for swapping two tokens. | No |
| POST | `/execute` | Execute a swap using a previously generated `quoteId`. | Yes |
| POST | `/create-transaction`| Create a raw Aptos transaction payload for client signing. | Yes |
| GET | `/history` | Fetch paginated swap history for the authenticated user. | Yes |
| GET | `/history/:id` | Fetch specific details for a single swap transaction. | Yes |
| GET | `/stats` | Get aggregated user statistics (total volume, success rate).| Yes |
| POST | `/cancel/:id`| Cancel a pending swap transaction. | Yes |

## Price Feeds (`/api/price`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/all` | Get the latest prices and market data for all supported tokens. | No |
| GET | `/:symbol` | Get the latest price for a specific token (e.g., `APT`). | No |

## Scam Detection (`/api/scam`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/analyze` | Submit a token address to calculate its scam risk score. | Yes |

---

## WebSocket Events

The backend uses `socket.io` to push real-time updates to connected clients. Connect to the base URL (e.g., `ws://localhost:5000`).

### Client-to-Server Events
- `subscribe:price`: Subscribe to real-time price updates. Payload: `{ symbol: 'APT' }`.
- `unsubscribe:price`: Unsubscribe from price updates.

### Server-to-Client Events
- `price:update`: Emitted when a token's price changes. Payload: `{ symbol, price, change24h }`.
- `swap:status`: Emitted to a specific user's room when their swap completes or fails. Payload: `{ transactionId, status }`.
