import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconVerified, IconCheck } from '../components/Icons';

export default function AdminLogin() {
  const { loginAdmin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Si ya tiene sesión activa como Administrador, redirige inmediatamente a /admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const destination = location.state?.from || '/admin';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identificador.trim()) {
      setErrorMessage('Por favor, ingresa tu correo administrativo o código.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    try {
      setSubmitting(true);
      await loginAdmin(identificador.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      console.error('[AdminLogin] Error:', err);
      const serverMsg = err?.response?.data?.message;
      if (err?.response?.status === 403) {
        setErrorMessage(serverMsg || 'Acceso denegado: tu cuenta no posee permisos de administración institucional.');
      } else if (err?.response?.status === 401) {
        setErrorMessage('Credenciales inválidas: usuario o contraseña incorrectos.');
      } else {
        setErrorMessage(serverMsg || 'No se pudo conectar con el servidor central. Intenta nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-slate-50 to-red-50/60 flex flex-col justify-start sm:justify-center items-center px-4 py-6 sm:py-10 pb-16 relative overflow-x-hidden font-body selection:bg-[#BA122D]/20 text-slate-900">
      {/* Luces y difuminados de fondo idénticos al login de usuarios */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-gradient-to-b from-[#BA122D]/28 via-rose-500/18 to-transparent rounded-full blur-[110px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-500/15 rounded-full blur-[95px] pointer-events-none -z-0"></div>
      <div className="absolute bottom-12 -right-20 w-80 h-80 bg-[#BA122D]/18 rounded-full blur-[95px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-rose-400/15 rounded-full blur-[90px] pointer-events-none -z-0"></div>

      {/* Main Glass Card con el mismo estilo visual */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(186,18,45,0.15)] border border-slate-200/90 relative z-10 animate-scale-up">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#BA122D] via-[#D31837] to-[#BA122D] text-white flex items-center justify-center shadow-md shadow-[#BA122D]/25 ring-4 ring-rose-100/70">
              <span className="material-symbols-outlined text-2xl text-white">admin_panel_settings</span>
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
              Consola oficial de control, auditoría & moderación institucional UTP Piura
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#BA122D] border border-rose-200/80 text-[11px] font-heading font-bold shadow-2xs">
            <IconVerified className="w-3.5 h-3.5 text-[#BA122D]" />
            <span>Acceso Exclusivo · Personal Autorizado</span>
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-heading font-semibold border border-red-200 flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-heading font-bold text-slate-700">
              Correo Institucional o Identificador Admin *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                badge
              </span>
              <input
                type="text"
                required
                autoFocus
                disabled={submitting}
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="admin@utp.edu.pe"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-heading font-bold text-slate-700">
              Contraseña de Administración *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 h-11 rounded-full bg-gradient-to-r from-[#BA122D] via-[#C91433] to-[#BA122D] hover:brightness-110 text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-[#BA122D]/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Verificando credenciales de administración...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                <span>Ingresar a la Consola Admin</span>
              </>
            )}
          </button>
        </form>

        {/* Garantías y Seguridad Universitaria */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-heading font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#BA122D]">verified_user</span>
              <span>DTI & Auditoría</span>
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

        {/* Enlace para volver al marketplace de estudiantes */}
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-xs font-heading font-bold text-slate-500 hover:text-[#BA122D] transition-colors inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Volver al Login de Estudiantes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
