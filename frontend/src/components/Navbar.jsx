import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getEmprendimientos } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IconStore, IconSchool, IconAdd } from './Icons';

export default function Navbar({ onSearch, showSearch = false, initialSearch = '' }) {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activosCount, setActivosCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getEmprendimientos()
      .then((data) => {
        if (Array.isArray(data)) {
          setActivosCount(data.filter((e) => e.disponible).length);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 liquid-glass border-b border-white/60 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Logo & Campus Tag */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/" className="flex items-center gap-2 text-decoration-none group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl liquid-glass-crimson flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <IconStore className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-primary">
              Campus<span className="text-secondary">Venta</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-primary font-heading font-bold text-xs uppercase tracking-wider border border-primary/20 shadow-xs">
            <IconSchool className="w-3.5 h-3.5 text-primary" />
            <span>UTP Sede Piura</span>
          </span>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-container/60 p-1.5 rounded-full border border-border">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-xs font-heading font-bold transition-all text-decoration-none ${
                isActive
                  ? 'bg-dark text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-container'
              }`
            }
          >
            Explorar
          </NavLink>
          <NavLink
            to="/pedidos"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-heading font-bold transition-all text-decoration-none ${
                isActive
                  ? 'bg-dark text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-sm text-primary">favorite</span>
            <span>Mis Pedidos</span>
          </NavLink>
          {user?.rol === 'vendedor' && (
            <NavLink
              to="/panel"
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-xs font-heading font-bold transition-all text-decoration-none ${
                  isActive
                    ? 'bg-dark text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-main hover:bg-surface-container'
                }`
              }
            >
              Mi Panel
            </NavLink>
          )}
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-xs font-heading font-bold transition-all text-decoration-none ${
                isActive
                  ? 'bg-dark text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-container'
              }`
            }
          >
            Perfil
          </NavLink>
        </nav>

        {/* Quick Search if enabled */}
        {showSearch && (
          <div className="hidden xl:flex items-center flex-1 max-w-xs mx-2">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center bg-surface-container rounded-full px-3.5 py-1 border border-border">
              <span className="material-symbols-outlined text-text-muted mr-1.5 text-lg">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar antojos o puestos..."
                className="w-full bg-transparent border-none outline-none font-body text-xs text-text-main placeholder:text-text-muted"
              />
            </form>
          </div>
        )}

        {/* Right Header Status Actions (Botón de configuración y botón de logout o ingresar) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/configuracion"
            title="Configuración"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full liquid-glass border border-white/80 text-text-muted hover:text-text-main hover:border-slate-300 hover:bg-white transition-all flex items-center justify-center shadow-xs active:scale-95 text-decoration-none"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl text-slate-600">settings</span>
          </Link>

          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Cerrar sesión"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full liquid-glass border border-white/80 text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-white transition-all flex items-center justify-center shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full liquid-glass border border-primary/30 text-primary font-heading font-bold text-xs hover:bg-white transition-all text-decoration-none shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span>Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
