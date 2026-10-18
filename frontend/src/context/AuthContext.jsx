import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, loginAdminApi, registroApi, getMeApi } from '../services/api';

const AuthContext = createContext();

const TOKEN_KEY = 'campusventa_token';
const USER_KEY = 'campusventa_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Al iniciar, valida la sesión con el backend si hay token
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (!currentToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const me = await getMeApi();
        if (isMounted) {
          setUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        }
      } catch (err) {
        console.warn('[AuthContext] Sesión expirada o token inválido:', err?.message);
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identificador, password) => {
    const authData = await loginApi(identificador, password);
    setToken(authData.token);
    setUser(authData.usuario);
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.usuario));
    return authData.usuario;
  };

  const loginAdmin = async (identificador, password) => {
    const authData = await loginAdminApi(identificador, password);
    setToken(authData.token);
    setUser(authData.usuario);
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.usuario));
    return authData.usuario;
  };

  const registro = async (datosRegistro) => {
    const authData = await registroApi(datosRegistro);
    setToken(authData.token);
    setUser(authData.usuario);
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.usuario));
    return authData.usuario;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch {}
  };

  const isAuthenticated = !!token && !!user;
  const isSeller = user?.rol?.toUpperCase() === 'VENDEDOR' || user?.rol?.toUpperCase() === 'ADMIN';
  const isAdmin = user?.rol?.toUpperCase() === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isSeller,
        isAdmin,
        login,
        loginAdmin,
        registro,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
