import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import BrothersProvider from './providers/BrothersProvider.jsx'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <BrothersProvider>
      <App />
    </BrothersProvider>
  </HashRouter>
)
