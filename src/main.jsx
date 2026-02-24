import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouterRouter } from 'react-router-dom'
import BrothersProvider from './providers/BrothersProvider.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <BrothersProvider>
      <App />
    </BrothersProvider>
  </BrowserRouter>
)
