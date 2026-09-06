# Services Overview

The SafeSwap backend offloads complex business logic from the controllers into dedicated Service classes located in `Backend/src/services/`.

## 1. AptosService (`aptos.service.js`)
Handles all direct interactions with the Aptos blockchain.
- **Node Connection:** Initializes the Aptos SDK client and connects to the specified network (Testnet/Mainnet).
- **Wallet Connection:** Validates hex addresses and stores them in the MongoDB `Wallet` collection.
- **Balance Fetching:** Queries `0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>` to get user balances.
- **Transaction Simulation:** Simulates swap payloads before returning them to the client to ensure they won't fail on-chain.
- **Transaction Verification:** Verifies signed transactions and monitors their completion status on the ledger.

## 2. AuthService (`auth.service.js`)
Manages user authentication, session, and JWT lifecycle.
- **Google OAuth Integration:** Works alongside Passport.js to link Google accounts with MongoDB `User` documents.
- **Token Generation:** Signs JWT Access Tokens and Refresh Tokens.
- **Password Hashing:** Contains utilities for bcrypt password hashing (for non-Google accounts).

## 3. PriceFeedService (`priceFeed.service.js`)
Fetches and aggregates market data for supported tokens.
- **Data Sourcing:** Utilizes the CCXT library (and fallback public APIs like CoinGecko/Binance) to fetch real-time crypto prices.
- **Caching:** Caches prices in the `TokenPrice` MongoDB collection to prevent rate-limiting and ensure ultra-fast response times.
- **Cron Jobs:** Runs a background task every minute to automatically refresh prices and emit WebSocket events for changes.

## 4. ScamDetectionService (`scamDetection.service.js`)
A security layer designed to protect users from malicious tokens.
- **Risk Scoring:** Analyzes token contract addresses and applies heuristics (e.g., honeypot detection, unlocked liquidity, contract age) to generate a risk score from 0-100.
- **Swap Interception:** If a user attempts to swap to a token with a high risk score, the service blocks the swap payload creation and warns the user.

## 5. WalletService (`wallet.service.js`)
A higher-level abstraction that combines `AptosService` and local database tracking.
- **Syncing:** Periodically syncs the local database balance with the on-chain Aptos balance.
- **Transaction History:** Aggregates on-chain transactions and local `SwapTransaction` records to provide a unified history for the `/wallet` dashboard.

## 6. WebsocketService (`websocket.service.js`)
Manages the `socket.io` server instance.
- **Connection Handling:** Authenticates WebSocket connections using the JWT token passed in the handshake.
- **Rooms & Subscriptions:** Allows clients to join specific "rooms" (e.g., `price:APT`, `user:12345`) to receive targeted push notifications without polling.
