import React, { useState, useEffect } from 'react';
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
  const { login, registro, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [identificador, setIdentificador] = useState('');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('Ingeniería de Sistemas');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (tab === 'login') {
      const cleanId = identificador.trim();
      if (!cleanId) {
        setError('Ingresa tu correo institucional UTP (@utp.edu.pe) o tu código de estudiante (ej: U20210045).');
        return;
      }
      if (!password) {
        setError('Ingresa tu contraseña.');
        return;
      }

      setSubmitting(true);
      try {
        await login(cleanId, password);
        const destination = location.state?.from || '/';
        navigate(destination);
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Registro
      const cleanNombre = nombre.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanCodigo = codigo.trim().toUpperCase();

      if (!cleanNombre) {
        setError('El nombre completo es obligatorio.');
        return;
      }
      if (!cleanEmail.endsWith('@utp.edu.pe')) {
        setError('El correo debe pertenecer obligatoriamente al dominio institucional @utp.edu.pe');
        return;
      }
      if (!/^U[0-9]{8}$/i.test(cleanCodigo)) {
        setError('El código institucional debe iniciar con "U" seguido de 8 dígitos numéricos (ej: U20210045).');
        return;
      }
      if (!password || password.length < 6) {
        setError('La contraseña debe tener un mínimo de 6 caracteres.');
        return;
      }

      setSubmitting(true);
      try {
        await registro({
          nombre: cleanNombre,
          email: cleanEmail,
          codigo: cleanCodigo,
          password: password,
          carrera: carrera,
        });
        navigate('/');
      } catch (err) {
        if (err.response?.data?.errors) {
          const firstError = Object.values(err.response.data.errors)[0];
          setError(firstError);
        } else {
          setError(err.response?.data?.message || 'Error al registrar usuario institucional.');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-slate-50 to-red-50/60 flex flex-col justify-start sm:justify-center items-center px-4 py-6 sm:py-10 pb-16 relative overflow-x-hidden font-body selection:bg-[#BA122D]/20 text-slate-900">
      {/* Luces y difuminados de fondo */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-gradient-to-b from-[#BA122D]/28 via-rose-500/18 to-transparent rounded-full blur-[110px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-500/15 rounded-full blur-[95px] pointer-events-none -z-0"></div>
      <div className="absolute bottom-12 -right-20 w-80 h-80 bg-[#BA122D]/18 rounded-full blur-[95px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-rose-400/15 rounded-full blur-[90px] pointer-events-none -z-0"></div>

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

        {/* Selector Iniciar Sesión / Registro */}
        <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${tab === 'login'
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
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${tab === 'register'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-heading font-semibold border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {tab === 'login' ? (
            /* Login Fields */
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Correo Institucional UTP *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="u20210045@utp.edu.pe"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Contraseña *
                </label>
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
            </>
          ) : (
            /* Register Fields */
            <>
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
                    placeholder="u20210045@utp.edu.pe"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-colors placeholder:text-slate-400 uppercase"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Carrera Profesional *
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
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                    <option value="Administración de Empresas">Administración de Empresas</option>
                    <option value="Derecho">Derecho</option>
                    <option value="Psicología">Psicología</option>
                    <option value="Arquitectura">Arquitectura</option>
                    <option value="Ingeniería Civil">Ingeniería Civil</option>
                    <option value="Contabilidad">Contabilidad</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Contraseña (mínimo 6 caracteres) *
                </label>
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
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 h-11 rounded-full bg-gradient-to-r from-[#BA122D] via-[#C91433] to-[#BA122D] hover:brightness-110 text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-[#BA122D]/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Verificando credenciales institucionales...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>{tab === 'login' ? 'Ingresar a CampusVenta' : 'Crear mi Cuenta UTP'}</span>
              </>
            )}
          </button>
        </form>

        {/* Garantías y Seguridad Universitaria */}
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
    </div>
  );
}
