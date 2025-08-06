import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ou o seu componente de rotas principal
import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // Importa o nosso Provedor

// A correção é garantir que <AuthProvider> envolve <App />.
// Isto faz com que o estado de autenticação (user, login, logout)
// fique disponível para todos os componentes dentro de <App />.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
