import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { checkEnv } from './utils/envCheck'

import { WalletProvider } from './contexts/WalletProvider.jsx'

// Check environment variables
const env = checkEnv();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </HelmetProvider>
  </StrictMode>,
)
