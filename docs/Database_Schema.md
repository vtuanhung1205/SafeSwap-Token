# Database Schema

SafeSwap uses MongoDB with Mongoose ORM. Below are the details of the core collections and their respective schemas.

## 1. User (`users`)
Stores user profiles and authentication details.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Auto | Unique identifier. |
| `email` | String | Required, Unique | User's email address. |
| `name` | String | Required | Full name of the user. |
| `password` | String | Conditional | Required if `googleId` is not present. Minimum 6 characters, securely hashed with bcrypt. |
| `avatar` | String | Default: null | Profile picture URL. |
| `googleId` | String | Unique, Sparse | Google OAuth2 identifier. |
| `walletAddress` | String | Unique, Sparse | Linked wallet address. |
| `isVerified` | Boolean | Default: false | Email verification status. |
| `isAdmin` | Boolean | Default: false | Admin privileges flag. |

## 2. Wallet (`wallets`)
Maps a user's Aptos wallet connection to their account.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Auto | Unique identifier. |
| `userId` | ObjectId | Ref: 'User' | The owner of the wallet. |
| `address` | String | Required, Unique | Aptos wallet address (hex). |
| `publicKey` | String | Required | Wallet's public key for signature verification. |
| `chainId` | String | Default: 'aptos-testnet' | Blockchain network. |
| `balance` | Number | Default: 0 | Last synced APT balance. |
| `isConnected` | Boolean| Default: false | Whether the wallet adapter is currently active. |
| `lastSyncAt` | Date | Default: Date.now | Timestamp of the last balance check. |

## 3. SwapTransaction (`swaptransactions`)
Records intent and history of token swaps performed by the user on the platform.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Auto | Unique identifier. |
| `userId` | ObjectId | Ref: 'User' | User who initiated the swap. |
| `fromToken` | String | Required | Token symbol being sold (e.g., APT). |
| `toToken` | String | Required | Token symbol being bought (e.g., USDT). |
| `fromAmount`| Number | Required, Min: 0| Amount of `fromToken` sent. |
| `toAmount` | Number | Required, Min: 0| Estimated/final amount of `toToken` received. |
| `exchangeRate`| Number| Required | The conversion rate at the time of swap. |
| `transactionHash`| String| Required, Unique | Blockchain transaction hash. |
| `status` | String | Enum: pending, completed, failed, cancelled | Current state of the swap. |
| `scamRisk` | Number | Min: 0, Max: 100| Risk score assessed by the scam detection engine. |
| `fee` | Number | Default: 0 | Platform fee taken. |
| `slippage` | Number | Default: 0.5 | Allowed slippage percentage. |
| `walletAddress`| String| Required | Address used for the swap. |
| `blockNumber`| Number | Default: null | Block where the tx was confirmed. |

## 4. TokenPrice (`tokenprices`)
Caches real-time market data for tokens to prevent excessive external API calls.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Auto | Unique identifier. |
| `symbol` | String | Required, Unique | Ticker symbol (e.g., BTC, APT). |
| `name` | String | Required | Full token name. |
| `price` | Number | Required, Min: 0| Current USD price. |
| `change24h` | Number | Default: 0 | 24-hour percentage price change. |
| `volume24h` | Number | Default: 0 | 24-hour trading volume. |
| `marketCap` | Number | Default: 0 | Total market capitalization. |
| `lastUpdated`| Date | Default: Date.now | When the price was last fetched from the oracle/exchange. |
| `source` | String | Default: 'api' | Source of the price data (e.g., CCXT). |

## Database Indexing Strategy
- `Wallet`: Indexed on `userId`, `isConnected`, and `chainId` for fast queries when restoring user sessions.
- `SwapTransaction`: Indexed on `userId`, `status`, `createdAt` (descending), and `walletAddress` to optimize the Dashboard History and Analytics queries.
- `TokenPrice`: Indexed on `price` and `lastUpdated` for fast retrieval of top gainers/losers and stale data invalidation.
