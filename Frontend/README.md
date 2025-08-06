# SafeSwap Frontend

A decentralized token swap application built on Aptos blockchain.

## Features

- 🔐 **Secure Wallet Connection**: Connect Aptos wallets (Petra, Martian, Rise)
- 💱 **Token Swapping**: Swap tokens using Liquidswap SDK
- 📊 **Real-time Balance**: Display wallet balances from blockchain
- 📜 **Transaction History**: View transaction history
- 🪙 **Token List**: Browse Aptos tokens from Panora API
- 🛡️ **AI Scam Detection**: Detect potential scam tokens

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Aptos wallet (Petra, Martian, or Rise)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SafeSwap-Token/Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=68865718442-0na32flmllvguiilt67os6p6rvgl0eqi.apps.googleusercontent.com

# Backend API
VITE_API_BASE_URL=https://safeswap-backend-service.onrender.com

# Aptos Configuration
VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
```

4. **Start development server**
```bash
npm run dev
```

## Production Setup

### Aptos API Key (Recommended)

For production, you should use an API key to avoid rate limits:

1. **Get API Key**:
   - [QuickNode](https://www.quicknode.com/) (Recommended)
   - [Alchemy](https://www.alchemy.com/)

2. **Configure Environment**:
```bash
# Production
VITE_APTOS_NODE_URL=68865718442-0na32flmllvguiilt67os6p6rvgl0eqi.apps.googleusercontent.com
```

See [APTOS_API_SETUP.md](./APTOS_API_SETUP.md) for detailed instructions.

### Deploy

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/          # Authentication components
│   ├── Dashboard/     # Dashboard components
│   ├── pages/         # Page components
│   └── ...
├── config/            # Configuration files
│   └── aptos.js      # Aptos configuration
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── utils/             # Utility functions
└── ...
```

## Key Features

### 1. Wallet Connection
- Connect Aptos wallets (Petra, Martian, Rise)
- Display wallet address and balance
- Real-time balance updates

### 2. Token Swapping
- Swap tokens using Liquidswap SDK
- Real-time price quotes
- Transaction signing and submission

### 3. Token List
- Browse Aptos tokens from Panora API
- Filter by token type (Native, Emojicoin, Meme)
- Search functionality

### 4. Transaction History
- View transaction history
- Transaction details and status

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@aptos-labs/wallet-adapter-react** - Aptos wallet integration
- **@pontem/liquidswap-sdk** - Token swapping
- **Axios** - HTTP client

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
