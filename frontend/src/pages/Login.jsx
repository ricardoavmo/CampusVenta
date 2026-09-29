import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconStore,
  IconSchool,
  IconCheck,
  IconArrowBack,
  IconVerified
} from '../components/Icons';

export default function Login() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickDemo = (demoRole) => {
    loginAsDemo(demoRole);
    navigate('/');
  };

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('Ing. Sistemas');
  const [rol, setRol] = useState('vendedor'); // 'vendedor' | 'comprador'
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Ingresa tu correo institucional UTP.');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setError('Ingresa un formato de correo válido (ej: u20210045@utp.edu.pe).');
      return;
    }
    if (!password || password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (tab === 'register') {
      if (!nombre.trim()) {
        setError('Ingresa tu nombre completo.');
        return;
      }
      if (!codigo.trim()) {
        setError('Ingresa tu código de alumno UTP.');
        return;
      }
    }

    setSubmitting(true);
    setTimeout(() => {
      // Si el email corresponde al demo vendedor o ingresa como vendedor
      const isSellerUser = tab === 'register' ? rol === 'vendedor' : cleanEmail.includes('vendedor') || cleanEmail.includes('valeria') || cleanEmail.includes('20210045');

      const userCodigo = tab === 'register'
        ? (codigo.trim().toUpperCase().startsWith('U') ? codigo.trim().toUpperCase() : `U${codigo.trim()}`)
        : (cleanEmail.match(/u\d+/i) ? cleanEmail.match(/u\d+/i)[0].toUpperCase() : 'U20210045');

      const userName = tab === 'register'
        ? nombre.trim()
        : (cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()));

      const newUser = {
        id: Date.now(),
        nombre: userName,
        email: cleanEmail,
        codigo: userCodigo,
        rol: isSellerUser ? 'vendedor' : 'comprador',
        carrera: carrera,
        ciclo: 'Ciclo Actual',
        emprendimientoId: isSellerUser ? 1 : null,
        tiendaNombre: isSellerUser ? 'SweetHub UTP' : null,
        avatar: isSellerUser
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      };

      login(newUser);
      setSubmitting(false);
      navigate('/');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-slate-50 to-red-50/60 flex flex-col justify-start sm:justify-center items-center px-4 py-6 sm:py-10 pb-16 relative overflow-x-hidden font-body selection:bg-[#BA122D]/20 text-slate-900">
      {/* Auroras y Difuminados Rojos Suaves (Efecto difuminado moderno) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-gradient-to-b from-[#BA122D]/28 via-rose-500/18 to-transparent rounded-full blur-[110px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-500/15 rounded-full blur-[95px] pointer-events-none -z-0"></div>
      <div className="absolute bottom-12 -right-20 w-80 h-80 bg-[#BA122D]/18 rounded-full blur-[95px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-rose-400/15 rounded-full blur-[90px] pointer-events-none -z-0"></div>

      {/* Top Header Navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 hover:text-slate-900 transition-all text-decoration-none px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-slate-200/90 shadow-2xs active:scale-95"
        >
          <IconArrowBack className="w-3.5 h-3.5 text-slate-600" />
          <span>Volver al inicio</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/90 text-[11px] font-heading font-bold text-slate-700 shadow-2xs">
          <IconSchool className="w-3.5 h-3.5 text-[#BA122D]" />
          <span>Sede UTP Piura</span>
        </span>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(186,18,45,0.15)] border border-slate-200/90 relative z-10 animate-scale-up">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#BA122D] via-[#D31837] to-[#BA122D] text-white flex items-center justify-center shadow-md shadow-[#BA122D]/25 ring-4 ring-rose-100/70">
              <IconStore className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs">
              <IconCheck className="w-3 h-3 text-white" />
            </div>
          </div>

          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center justify-center gap-1">
              <span>Campus</span>
              <span className="text-[#BA122D]">Venta</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Marketplace oficial de compra y venta exclusiva entre estudiantes de la UTP Piura
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#BA122D] border border-rose-200/80 text-[11px] font-heading font-bold shadow-2xs">
            <IconVerified className="w-3.5 h-3.5 text-[#BA122D]" />
            <span>Acceso institucional con correo UTP</span>
          </div>
        </div>

        {/* Segmented Control: Iniciar Sesión / Registro */}
        <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-heading font-semibold border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {tab === 'register' && (
            <>
              {/* Nombre Completo */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Valeria Mendoza"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Código UTP por separado */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Código de Alumno UTP *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej: U20210045"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* Correo Institucional UTP (Para ingresar y para registrarse) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-heading font-bold text-slate-700">
              Correo Institucional UTP *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                alternate_email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno@utp.edu.pe"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-bold text-slate-700">
                Contraseña *
              </label>
              {tab === 'login' && (
                <span className="text-[11px] text-slate-400 hover:text-[#BA122D] cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </span>
              )}
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Carrera Profesional
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    school
                  </span>
                  <select
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-heading font-bold text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none"
                  >
                    <option value="Ing. Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ing. Industrial">Ingeniería Industrial</option>
                    <option value="Administración">Administración de Empresas</option>
                    <option value="Derecho">Derecho</option>
                    <option value="Psicología">Psicología</option>
                    <option value="Arquitectura">Arquitectura</option>
                    <option value="Otra Carrera">Otra Carrera UTP</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  ¿Cómo usarás CampusVenta?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRol('vendedor')}
                    className={`py-2 px-3 rounded-xl text-xs font-heading font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                      rol === 'vendedor'
                        ? 'bg-gradient-to-r from-[#BA122D] to-[#990F24] text-white border-transparent shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    <span>Quiero Vender</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRol('comprador')}
                    className={`py-2 px-3 rounded-xl text-xs font-heading font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                      rol === 'comprador'
                        ? 'bg-gradient-to-r from-[#BA122D] to-[#990F24] text-white border-transparent shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    <span>Solo Comprar</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 h-11 rounded-full bg-gradient-to-r from-[#BA122D] via-[#C91433] to-[#BA122D] hover:brightness-110 text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-[#BA122D]/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Verificando credenciales...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>{tab === 'login' ? 'Ingresar a CampusVenta' : 'Crear mi Cuenta UTP'}</span>
              </>
            )}
          </button>
        </form>

        {/* Garantías y Seguridad Universitaria (Barra unificada y armónica) */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-heading font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#BA122D]">verified_user</span>
              <span>Comunidad UTP</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#BA122D]">lock</span>
              <span>Acceso Seguro</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#BA122D]">near_me</span>
              <span>Sede Piura</span>
            </div>
          </div>
        </div>
      </div>

      {/* CÁPSULA TEMPORAL DE PRUEBAS / QA (Fácil de eliminar más adelante) */}
      <div className="w-full max-w-md mt-4 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-lg flex items-center justify-between gap-2.5 z-10 animate-fade-in">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-300/30">
            <span className="material-symbols-outlined text-sm">science</span>
          </div>
          <div className="leading-tight truncate">
            <span className="text-[11px] font-heading font-bold block text-white truncate">Test de Perfiles</span>
            <span className="text-[9px] text-rose-200/90 truncate">Acceso 1-clic temporal</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleQuickDemo('vendedor')}
            className="px-3 py-1.5 rounded-xl bg-white text-[#BA122D] hover:bg-slate-100 font-heading font-bold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">storefront</span>
            <span>Vendedor</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('comprador')}
            className="px-3 py-1.5 rounded-xl bg-slate-950/50 hover:bg-slate-950/70 text-white border border-white/30 font-heading font-bold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm text-rose-300">shopping_bag</span>
            <span>Comprador</span>
          </button>
        </div>
      </div>
    </div>
  );
}
