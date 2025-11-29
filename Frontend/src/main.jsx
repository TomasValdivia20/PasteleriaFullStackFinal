import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Basename dinámico: solo en producción (GitHub Pages)
const basename = import.meta.env.MODE === 'production' 
  ? '/Pasteleria-Mil-Sabores-VersionReactFinalFinal'
  : '/';

console.log('🌐 [Router] Configurando basename:', basename);
console.log('   MODE:', import.meta.env.MODE);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
