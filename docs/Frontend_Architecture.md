# Frontend Architecture

The SafeSwap Frontend is a modern, single-page React application built with Vite and TailwindCSS, designed for speed, responsiveness, and deep integration with the Aptos blockchain.

## Directory Structure
```
Frontend/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── components/         # Reusable UI components (Navbar, Footer, Modals)
│   ├── config/             # Environment & global configuration variables
│   ├── contexts/           # React Context Providers (e.g., WalletProvider)
│   ├── hooks/              # Custom React Hooks (e.g., useWebSocket, useAuth)
│   ├── pages/              # Route-level components (Home, Dashboard, Wallet)
│   ├── services/           # API and abstract service wrappers
│   ├── utils/              # Helper functions (Axios setup, formatters)
│   ├── App.jsx             # Main Router and layout wrapper
│   └── main.jsx            # React root and Provider injection
├── tailwind.config.js      # Utility class design system
└── vite.config.js          # Build tool configuration
```

## Core Technologies

### 1. State Management & Contexts
- **`WalletProvider`**: Wraps the application using `@aptos-labs/wallet-adapter-react`. It provides the `useWallet()` hook to any component, exposing the user's connected Aptos wallet address, public key, and signing functions.
- **Local State**: Managed via standard React `useState` and `useEffect` for isolated component logic (like modal toggles or form inputs).

### 2. Routing (`react-router-dom`)
- Centralized in `App.jsx`.
- **Public Routes:** `/` (Landing Page).
- **Protected Routes:** `/dashboard`, `/wallet`, `/swap`. Protected routes check for a valid JWT before rendering.

### 3. API Communication
- **Axios Instance (`utils/api.js`)**: A globally configured Axios client that automatically attaches the JWT `Authorization: Bearer <token>` to all outgoing requests. It intercepts 401 Unauthorized responses to trigger automatic logouts or token refreshes.
- **WebSocket Hook (`hooks/useWebSocket.js`)**: Custom hook establishing a persistent `socket.io` connection to the backend, enabling components to listen to real-time `price:update` and `swap:status` events.

### 4. Aptos Integration
- Uses the official Aptos Wallet Adapter suite (`@aptos-labs/wallet-adapter-react`).
- The `WalletConnectModal` UI component allows users to select from a list of installed extensions (like Petra).
- On connection, `Wallet.jsx` syncs the `account.address` and `account.publicKey` (coerced to strings via `.toString()`) to the Backend via `/api/wallet/connect`.

## Component Design Pattern
SafeSwap uses a "Container-Presenter" mixed approach:
- **Pages (Containers):** e.g., `Dashboard.jsx`. Responsible for fetching data on mount (via `api.js`) and maintaining complex state.
- **Components (Presenters):** e.g., `SwapForm.jsx`, `TokenList.jsx`. Pure or mostly-pure components that receive data via props and emit user actions via callbacks.

## Styling
- Heavily utilizes **TailwindCSS** for utility-first styling.
- Custom colors, gradients, and animations are defined in `tailwind.config.js` to maintain a consistent, premium "glassmorphism" design aesthetic.
