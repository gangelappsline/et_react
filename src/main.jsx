import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PayPalScriptProvider options={{ clientId }}>
      <App />
    </PayPalScriptProvider>
  </StrictMode>,
)
