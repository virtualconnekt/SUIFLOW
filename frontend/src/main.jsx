import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'  // Make sure this imports App, not router

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
