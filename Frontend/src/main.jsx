import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Configuración para Vercel (siempre en raíz)
console.log('🚀 [APP INIT] Iniciando aplicación');
console.log('📍 [ROUTING] BasePath: /');
console.log('🌍 [ENV] MODE:', import.meta.env.MODE);
console.log('🔗 [API] URL:', import.meta.env.VITE_API_URL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
