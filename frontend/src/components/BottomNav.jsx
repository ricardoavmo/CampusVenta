import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user, isSeller } = useAuth();

  // No renderizar barra inferior en la página de login para evitar colisiones
  if (location.pathname === '/login') {
    return null;
  }

  // Determinar si el usuario está actualmente en rol vendedor
  const isUserSeller = user?.rol === 'vendedor';

  // Configuración de pestañas según el rol
  const navItems = isUserSeller
    ? [
        {
          to: '/',
          label: 'Explorar',
          icon: 'storefront',
          exact: true,
        },
        {
          to: '/pedidos',
          label: 'Pedidos',
          icon: 'favorite',
        },
        {
          to: '/panel',
          label: 'Mi Panel',
          icon: 'tune',
        },
        {
          to: '/perfil',
          label: 'Perfil',
          icon: 'person',
          avatar: user?.avatar,
        },
      ]
    : user
    ? [
        {
          to: '/',
          label: 'Explorar',
          icon: 'storefront',
          exact: true,
        },
        {
          to: '/pedidos',
          label: 'Mis Pedidos',
          icon: 'favorite',
        },
        {
          to: '/perfil',
          label: 'Perfil',
          icon: 'person',
          avatar: user?.avatar,
        },
      ]
    : [
        {
          to: '/',
          label: 'Explorar',
          icon: 'storefront',
          exact: true,
        },
        {
          to: '/pedidos',
          label: 'Mis Pedidos',
          icon: 'favorite',
        },
        {
          to: '/login',
          label: 'Ingresar',
          icon: 'account_circle',
        },
      ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 sm:left-auto sm:right-auto sm:w-[420px] sm:left-1/2 sm:-translate-x-1/2 z-40 md:hidden liquid-glass rounded-3xl p-1.5 px-2 transition-all shadow-[0_12px_40px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-center justify-around w-full">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : item.to
            ? location.pathname.startsWith(item.to)
            : false;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all text-decoration-none min-w-[64px] active:scale-95"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'liquid-glass-crimson text-white shadow-md scale-105 ring-2 ring-primary/30'
                    : 'text-text-secondary hover:text-text-main hover:bg-surface-container/60'
                }`}
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.label}
                    className={`w-7 h-7 rounded-full object-cover transition-all ${
                      isActive ? 'ring-2 ring-white' : 'ring-1 ring-border'
                    }`}
                  />
                ) : (
                  <span
                    className={`material-symbols-outlined text-xl sm:text-2xl transition-transform ${
                      isActive ? 'font-bold' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-heading tracking-tight mt-0.5 transition-colors ${
                  isActive
                    ? 'font-black text-primary'
                    : 'font-semibold text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
