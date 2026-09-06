# Setup Guide

This guide covers everything you need to know to get SafeSwap running on your local machine for development and testing.

## Prerequisites
- **Node.js**: v18.0.0 or higher.
- **npm**: v8.0.0 or higher.
- **MongoDB**: A running MongoDB instance (Local or MongoDB Atlas).
- **Aptos Wallet Extension**: Install [Petra](https://petra.app/) or a similar Aptos wallet in your browser.

## 1. Clone & Install Dependencies
First, clone the repository and install the dependencies for both the Frontend and Backend concurrently from the root directory:

```bash
git clone <your-repo-url>
cd SafeSwap-Token

# Install all dependencies (Frontend + Backend)
npm install
```

*(Note: If you run into issues, you can also cd into `Backend` and `Frontend` directories and run `npm install` individually).*

## 2. Environment Variables

### Backend Configuration
1. Navigate to the `Backend` directory.
2. Copy the example file: `cp .env.example .env`
3. Fill in the `.env` variables:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET` & `JWT_REFRESH_SECRET`: Secure random strings for token generation.
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From your Google Cloud Console for OAuth.
   - `PORT`: Usually `5000`.
   - `APTOS_NETWORK`: `testnet` or `mainnet`.

### Frontend Configuration
1. Navigate to the `Frontend` directory.
2. Copy the example file: `cp .env.example .env`
3. Fill in the `.env` variables:
   - `VITE_API_URL`: Points to your backend (e.g., `http://localhost:5000/api`).
   - `VITE_WS_URL`: Points to your backend websocket (e.g., `ws://localhost:5000`).
   - `VITE_GOOGLE_CLIENT_ID`: The same Google Client ID used in the backend.

## 3. Running the Application

You can start both the Frontend (Vite) and Backend (Express) servers simultaneously from the root directory using Concurrently:

```bash
npm run dev
```

Alternatively, run them in separate terminal windows:
- **Backend:** `cd Backend && npm run dev`
- **Frontend:** `cd Frontend && npm run dev`

By default:
- The **Frontend** will be accessible at: `http://localhost:5173`
- The **Backend API** will be accessible at: `http://localhost:5000`

## 4. Testing the Aptos Integration
1. Open the Frontend at `http://localhost:5173`.
2. Login using your Google account.
3. Switch your Petra Wallet extension network to **Testnet**.
4. Navigate to the `/wallet` page and click **Connect Aptos Wallet**.
5. Approve the connection. Your wallet should successfully sync with the Backend database!
