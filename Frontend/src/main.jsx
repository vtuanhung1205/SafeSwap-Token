import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- Aptos Wallet Imports ---
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PontemWalletAdapter } from "@pontem/aptos-wallet-adapter";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";

// Configure React Router future flags
import { 
  createRoutesFromChildren, 
  matchRoutes,
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext,
  UNSAFE_NavigationContext,
  UNSAFE_LocationContext,
  UNSAFE_RouteContext
} from "react-router-dom";

// Apply future flags
UNSAFE_DataRouterContext.displayName = "DataRouter";
UNSAFE_DataRouterStateContext.displayName = "DataRouterState";
UNSAFE_NavigationContext.displayName = "Navigation";
UNSAFE_LocationContext.displayName = "Location";
UNSAFE_RouteContext.displayName = "Route";

const wallets = [
  new MartianWallet(),
  new PontemWalletAdapter(),
  new RiseWallet(),
  new FewchaWallet(),
];

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false}
      onError={(error) => {
        console.error("Wallet Adapter Error", error);
      }}
    >
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
    <App />
        </AuthProvider>
      </Router>
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
