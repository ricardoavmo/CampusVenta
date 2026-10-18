import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user, isSeller } = useAuth();

  // No renderizar barra inferior en páginas de login o administración
  if (
    location.pathname === '/login' ||
    location.pathname === '/admin' ||
    location.pathname === '/admin/login'
  ) {
    return null;
  }

  const isUserSeller = user?.rol?.toUpperCase() === 'VENDEDOR';

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
      className="fixed bottom-0 left-0 right-0 w-full z-40 md:hidden liquid-glass border-t border-white/60 dark:border-white/10 pt-1.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] px-3 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all"
    >
      <div className="max-w-md mx-auto flex items-center justify-around w-full">
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
