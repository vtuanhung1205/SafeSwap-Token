import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PontemWallet } from "@pontem/aptos-wallet-adapter";
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
  new PontemWallet(),
  new RiseWallet(),
  new FewchaWallet(),
];

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="68865718442-0na32flmllvguiilt67os6p6rvgl0eqi.apps.googleusercontent.com">
      <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Router>
      </AptosWalletAdapterProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
