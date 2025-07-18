import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { checkEnv } from './utils/envCheck'

// Check environment variables
const env = checkEnv();
console.log('Environment check from main.jsx:', env);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
