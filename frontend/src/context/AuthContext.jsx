import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_USERS = {
  vendedor: {
    id: 1,
    nombre: 'Valeria Mendoza',
    email: 'u20210045@utp.edu.pe',
    codigo: 'U20210045',
    rol: 'vendedor',
    carrera: 'Ing. Sistemas',
    ciclo: '6to Ciclo',
    emprendimientoId: 1,
    tiendaNombre: 'SweetHub UTP',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  comprador: {
    id: 2,
    nombre: 'Carlos Morales',
    email: 'u20220199@utp.edu.pe',
    codigo: 'U20220199',
    rol: 'comprador',
    carrera: 'Ing. Industrial',
    ciclo: '4to Ciclo',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
};

const STORAGE_KEY = 'campusventa_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEMO_USERS.vendedor; // Default initial session as seller
    } catch {
      return DEMO_USERS.vendedor;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Could not persist auth state:', err);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const loginAsDemo = (role = 'vendedor') => {
    const selected = DEMO_USERS[role] || DEMO_USERS.vendedor;
    setUser(selected);
    return selected;
  };

  const isAuthenticated = !!user;
  const isSeller = user?.rol === 'vendedor';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSeller,
        login,
        logout,
        loginAsDemo,
        DEMO_USERS,
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
