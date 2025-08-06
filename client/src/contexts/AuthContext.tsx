// client/src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define a estrutura dos dados do utilizador que vamos guardar
interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Define o que o nosso contexto irá fornecer
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (data: { user: AuthUser; token: string }) => void;
  logout: () => void;
  isLoading: boolean;
}

// Cria o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o "Provedor", o componente que irá gerir e fornecer o estado
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Na primeira vez que a aplicação carrega, verifica se já existe um token guardado
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Função para fazer o login
  const login = (data: { user: AuthUser; token: string }) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  // Função para fazer o logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Cria um "hook" personalizado para facilitar o uso do nosso contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
