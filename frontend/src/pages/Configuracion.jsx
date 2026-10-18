import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { applyTheme, getStoredTheme, resolveIsDark } from '../utils/theme';

/**
 * Switch Toggle con estilo nativo iOS
 */
function IosSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#BA122D]' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/**
 * Switch Toggle celestial animado (Sol / Luna) como en el diseño de referencia
 */
function CelestialThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-16 h-8 rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shrink-0 ${
        isDark
          ? 'bg-slate-800 border border-slate-700 shadow-inner'
          : 'bg-sky-200/90 border border-sky-300 shadow-inner'
      }`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      aria-label="Alternar modo visual"
    >
      {/* Elementos celestiales de fondo */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none overflow-hidden rounded-full">
        <span
          className={`transition-opacity duration-300 text-sky-400 font-bold ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="material-symbols-outlined text-[13px] text-white">cloud</span>
        </span>
        <span
          className={`transition-opacity duration-300 text-amber-300 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="material-symbols-outlined text-[11px]">star</span>
        </span>
      </div>

      {/* Perilla deslizante con Sol o Luna */}
      <div
        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md transform transition-all duration-300 ease-in-out ${
          isDark
            ? 'translate-x-8 bg-indigo-500 text-white'
            : 'translate-x-0 bg-gradient-to-tr from-amber-400 to-amber-300 text-amber-900'
        }`}
      >
        <span className="material-symbols-outlined text-xs">
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
    </button>
  );
}

export default function Configuracion() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.rol?.toUpperCase() === 'ADMIN';

  const [tema, setTema] = useState(() => getStoredTheme());
  const isDark = resolveIsDark(tema);

  // Estados de toggles
  const [notifBajones, setNotifBajones] = useState(true);
  const [sonidoHaptico, setSonidoHaptico] = useState(true);
  const [ahorroDatos, setAhorroDatos] = useState(false);
  const [alertaModeracion, setAlertaModeracion] = useState(true);
  const [modoCompactoAdmin, setModoCompactoAdmin] = useState(false);

  // Estados de modales
  const [activeModal, setActiveModal] = useState(null); // 'appearance' | 'language' | 'privacy' | 'security'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const aplicarTema = (nuevoTema) => {
    setTema(nuevoTema);
    applyTheme(nuevoTema);
    showToast(`Tema ${nuevoTema === 'oscuro' ? 'Oscuro' : nuevoTema === 'claro' ? 'Claro' : 'Automático'} aplicado`);
  };

  const handleToggleTheme = () => {
    const nextTheme = isDark ? 'claro' : 'oscuro';
    aplicarTema(nextTheme);
  };

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? '/admin/login' : '/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col theme-bg-canvas font-body antialiased selection:bg-[#BA122D]/20 transition-colors duration-200 pb-28 sm:pb-16">
      {/* Cabecera para Administrador (Mantiene el aislamiento institucional) */}
      {isAdmin ? (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#121724]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl liquid-glass-crimson text-white flex items-center justify-center font-heading font-black text-sm shadow-xs">
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-lg text-slate-900 dark:text-white tracking-tight">
                    Campus<span className="text-[#BA122D]">Venta</span>
                  </span>
                  <span className="text-[10px] font-heading font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#BA122D]/10 text-[#BA122D] border border-[#BA122D]/20">
                    CONSOLA AUDITORA
                  </span>
                </div>
                <p className="text-[11px] font-heading font-semibold text-slate-400 hidden sm:block">
                  Gestión Centralizada, Integridad & Moderación
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/admin"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors shadow-xs text-decoration-none"
                title="Volver al Panel"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                <span>Volver al Panel</span>
              </Link>

              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-700 dark:text-slate-200 hover:text-red-600 border border-slate-200/80 dark:border-slate-700 hover:border-red-200 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Cerrar sesión"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        <Navbar />
      )}

      {/* Floating Animated Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce-subtle backdrop-blur-md border border-white/20">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span className="font-heading font-bold text-xs sm:text-sm leading-tight">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Contenedor Principal tipo Teléfono / iOS Moderno */}
      <main className="max-w-[500px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Cabecera Superior con Botón Circular y Título */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/admin' : -1)}
            className="w-10 h-10 rounded-full settings-card text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all group"
            title="Volver"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
              arrow_back_ios_new
            </span>
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Configuración
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isAdmin
                ? 'Personaliza la consola auditora a tu medida.'
                : 'Personaliza la app a tu estilo.'}
            </p>
          </div>
        </div>

        {/* HERO CARD: Alternador de Modo Claro / Oscuro con estilo celestial */}
        <section className="settings-card rounded-3xl p-4 sm:p-5 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 dark:border dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="material-symbols-outlined text-2xl">
                {isDark ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                {isDark ? 'Modo Oscuro' : 'Modo Claro'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-0.5">
                {isDark ? 'Toca para activar modo claro' : 'Toca para activar modo oscuro'}
              </p>
            </div>
          </div>

          <CelestialThemeToggle isDark={isDark} onToggle={handleToggleTheme} />
        </section>

        {/* SECCIÓN 1: PERSONALIZACIÓN */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
            {isAdmin ? 'PERSONALIZACIÓN AUDITORA' : 'PERSONALIZACIÓN'}
          </h3>

          <div className="settings-card rounded-3xl overflow-hidden settings-divider transition-all">
            {/* Fila: Apariencia */}
            <div
              onClick={() => setActiveModal('appearance')}
              className="settings-row p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-500/15 dark:border dark:border-pink-500/30 text-pink-500 dark:text-pink-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(236,72,153,0.18)]">
                  <span className="material-symbols-outlined text-xl">palette</span>
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                    Apariencia
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                    {tema === 'oscuro' ? 'Oscuro OLED' : tema === 'claro' ? 'Claro Cristal' : 'Automático'} · Tipografía Outfit
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg group-hover:translate-x-0.5 transition-transform shrink-0">
                chevron_right
              </span>
            </div>

            {/* Fila: Idioma y Región */}
            <div
              onClick={() => setActiveModal('language')}
              className="settings-row p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/15 dark:border dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(168,85,247,0.18)]">
                  <span className="material-symbols-outlined text-xl">translate</span>
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                    Idioma y Región
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                    Español (Perú - Campus Piura)
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg group-hover:translate-x-0.5 transition-transform shrink-0">
                chevron_right
              </span>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: ALERTAS Y NOTIFICACIONES */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
            {isAdmin ? 'NOTIFICACIONES DE LA CONSOLA' : 'ALERTAS Y NOTIFICACIONES'}
          </h3>

          <div className="settings-card rounded-3xl overflow-hidden settings-divider transition-all">
            {isAdmin ? (
              /* Opciones Exclusivas de Administrador */
              <>
                <div className="settings-row p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 dark:border dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(99,102,241,0.18)]">
                      <span className="material-symbols-outlined text-xl">shield_with_heart</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                        Alertas de Moderación
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                        Avisos en vivo de puestos y reportes
                      </span>
                    </div>
                  </div>
                  <IosSwitch
                    checked={alertaModeracion}
                    onChange={(val) => {
                      setAlertaModeracion(val);
                      showToast(val ? 'Alertas de moderación activadas' : 'Alertas pausadas');
                    }}
                  />
                </div>

                <div className="settings-row p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/15 dark:border dark:border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(20,184,166,0.18)]">
                      <span className="material-symbols-outlined text-xl">volume_up</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                        Sonido de Confirmación
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                        Tono al cambiar estados de cuentas
                      </span>
                    </div>
                  </div>
                  <IosSwitch
                    checked={sonidoHaptico}
                    onChange={(val) => {
                      setSonidoHaptico(val);
                      showToast(val ? 'Sonido activado' : 'Sonido desactivado');
                    }}
                  />
                </div>

                <div className="settings-row p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/15 dark:border dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(168,85,247,0.18)]">
                      <span className="material-symbols-outlined text-xl">table_rows</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                        Modo Alta Densidad
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                        Supervisar más registros en tablas
                      </span>
                    </div>
                  </div>
                  <IosSwitch
                    checked={modoCompactoAdmin}
                    onChange={(val) => {
                      setModoCompactoAdmin(val);
                      showToast(val ? 'Modo alta densidad activado' : 'Modo normal activo');
                    }}
                  />
                </div>
              </>
            ) : (
              /* Opciones de Estudiante */
              <>
                <div className="settings-row p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 dark:border dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(99,102,241,0.18)]">
                      <span className="material-symbols-outlined text-xl">notifications</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                        Notificaciones
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                        Avisos de postres en recesos de campus
                      </span>
                    </div>
                  </div>
                  <IosSwitch
                    checked={notifBajones}
                    onChange={(val) => {
                      setNotifBajones(val);
                      showToast(val ? 'Alertas activadas' : 'Alertas pausadas');
                    }}
                  />
                </div>

                <div className="settings-row p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/15 dark:border dark:border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(20,184,166,0.18)]">
                      <span className="material-symbols-outlined text-xl">vibration</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                        Respuesta Háptica
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                        Sonido al confirmar pedidos por WhatsApp
                      </span>
                    </div>
                  </div>
                  <IosSwitch
                    checked={sonidoHaptico}
                    onChange={(val) => {
                      setSonidoHaptico(val);
                      showToast(val ? 'Respuesta háptica activada' : 'Respuesta háptica pausada');
                    }}
                  />
                </div>

                <div className="settings-row p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/15 dark:border dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(245,158,11,0.18)]">
                      <span className="material-symbols-outlined text-xl">network_check</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                        Ahorro de Datos Móviles
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                        Optimizar imágenes en Wi-Fi / 4G UTP
                      </span>
                    </div>
                  </div>
                  <IosSwitch
                    checked={ahorroDatos}
                    onChange={(val) => {
                      setAhorroDatos(val);
                      showToast(val ? 'Ahorro de datos activado' : 'Modo normal activo');
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* SECCIÓN 3: PRIVACIDAD Y SEGURIDAD */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
            PRIVACIDAD Y SEGURIDAD
          </h3>

          <div className="settings-card rounded-3xl overflow-hidden settings-divider transition-all">
            {/* Fila: Privacidad */}
            <div
              onClick={() => setActiveModal('privacy')}
              className="settings-row p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-500/15 dark:border dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(6,182,212,0.18)]">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                    Privacidad
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                    Comunidad UTP Piura · Acceso Restringido
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg group-hover:translate-x-0.5 transition-transform shrink-0">
                chevron_right
              </span>
            </div>

            {/* Fila: Seguridad */}
            <div
              onClick={() => setActiveModal('security')}
              className="settings-row p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 dark:border dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(16,185,129,0.18)]">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                    Seguridad
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                    {user?.email || 'Credenciales @utp.edu.pe'} · JWT Activo
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg group-hover:translate-x-0.5 transition-transform shrink-0">
                chevron_right
              </span>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4 (SOLO ESTUDIANTES): MODO APP PWA */}
        {!isAdmin && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
              APLICACIÓN NATIVA
            </h3>

            <div className="settings-card rounded-3xl overflow-hidden settings-divider transition-all">
              <div
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
                  showToast('Abriendo instalador de CampusVenta...');
                }}
                className="settings-row p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/15 dark:border dark:border-rose-500/30 text-[#BA122D] dark:text-rose-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(244,63,94,0.18)]">
                    <span className="material-symbols-outlined text-xl">install_mobile</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                      Instalar CampusVenta
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                      Pantalla completa sin barra de navegación
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg group-hover:translate-x-0.5 transition-transform shrink-0">
                  chevron_right
                </span>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 5: SESIÓN Y MANTENIMIENTO */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
            {isAdmin ? 'SESIÓN Y MANTENIMIENTO' : 'SISTEMA Y SESIÓN'}
          </h3>

          <div className="settings-card rounded-3xl overflow-hidden settings-divider transition-all">
            {/* Limpiar Caché */}
            <div
              onClick={() => {
                showToast(isAdmin ? 'Caché de auditoría restablecido' : 'Caché temporal restablecido');
              }}
              className="settings-row p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/15 dark:border dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(245,158,11,0.18)]">
                  <span className="material-symbols-outlined text-xl">cached</span>
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                    Limpiar Caché Temporal
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium truncate block">
                    Restablecer datos locales y optimizar rendimiento
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg group-hover:translate-x-0.5 transition-transform shrink-0">
                restart_alt
              </span>
            </div>

            {/* Cerrar Sesión */}
            <div
              onClick={handleLogout}
              className="settings-row p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/15 dark:border dark:border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 dark:shadow-[0_0_12px_rgba(239,68,68,0.18)]">
                  <span className="material-symbols-outlined text-xl">logout</span>
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs sm:text-sm text-red-600 dark:text-red-400 block">
                    Cerrar Sesión
                  </span>
                  <span className="text-[11px] sm:text-xs text-red-400 dark:text-red-400/80 font-medium truncate block">
                    Desconectar tu cuenta de este dispositivo
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-red-400 text-lg group-hover:translate-x-0.5 transition-transform shrink-0">
                chevron_right
              </span>
            </div>
          </div>
        </section>

        {/* Footer institucional discreto */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 dark:text-slate-600 font-heading font-semibold">
            CampusVenta UTP · Versión 2.4.0 (Build 2026)
          </p>
        </div>
      </main>

      {/* ========================================================== */}
      {/* MODAL: SELECCIÓN DE APARIENCIA (THEME)                     */}
      {/* ========================================================== */}
      {activeModal === 'appearance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="settings-card rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-500/15 dark:border dark:border-pink-500/30 text-pink-500 dark:text-pink-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">palette</span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Apariencia
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona el estilo visual que deseas para toda la plataforma CampusVenta:
            </p>

            <div className="space-y-2">
              {/* Opción Claro */}
              <button
                type="button"
                onClick={() => {
                  aplicarTema('claro');
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  tema === 'claro'
                    ? 'border-[#BA122D] bg-[#BA122D]/5 dark:bg-[#BA122D]/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500 text-xl">light_mode</span>
                  <div>
                    <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      Claro Cristal
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Fondo luminoso con contrastes nítidos
                    </span>
                  </div>
                </div>
                {tema === 'claro' && (
                  <span className="material-symbols-outlined text-[#BA122D] text-lg">check_circle</span>
                )}
              </button>

              {/* Opción Oscuro */}
              <button
                type="button"
                onClick={() => {
                  aplicarTema('oscuro');
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  tema === 'oscuro'
                    ? 'border-[#BA122D] bg-[#BA122D]/5 dark:bg-[#BA122D]/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-indigo-400 text-xl">dark_mode</span>
                  <div>
                    <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      Oscuro OLED
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tonos oscuros ideales para baja luminosidad
                    </span>
                  </div>
                </div>
                {tema === 'oscuro' && (
                  <span className="material-symbols-outlined text-[#BA122D] text-lg">check_circle</span>
                )}
              </button>

              {/* Opción Automático */}
              <button
                type="button"
                onClick={() => {
                  aplicarTema('sistema');
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  tema === 'sistema'
                    ? 'border-[#BA122D] bg-[#BA122D]/5 dark:bg-[#BA122D]/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-xl">brightness_auto</span>
                  <div>
                    <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      Automático
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Sincronizado con el sistema operativo
                    </span>
                  </div>
                </div>
                {tema === 'sistema' && (
                  <span className="material-symbols-outlined text-[#BA122D] text-lg">check_circle</span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-heading font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: IDIOMA Y REGIÓN                                     */}
      {/* ========================================================== */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="settings-card rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/15 dark:border dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">translate</span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Idioma y Región
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl border border-[#BA122D] bg-[#BA122D]/5 flex items-center justify-between">
                <div>
                  <span className="font-heading font-bold text-xs text-slate-900 dark:text-white block">
                    Español (Perú)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Configuración activa para Campus Piura
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#BA122D] text-lg">check_circle</span>
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 opacity-50 flex items-center justify-between">
                <div>
                  <span className="font-heading font-bold text-xs text-slate-900 dark:text-white block">
                    English (US)
                  </span>
                  <span className="text-[11px] text-slate-400">Próximamente</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Beta</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-heading font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: PRIVACIDAD                                         */}
      {/* ========================================================== */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="settings-card rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 dark:border dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Privacidad
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                Tu información en <strong className="text-slate-900 dark:text-white">CampusVenta</strong> está protegida y es visible únicamente para estudiantes y personal docente verificados de la <strong className="text-[#BA122D]">UTP Sede Piura</strong>.
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Dominio Exclusivo @utp.edu.pe</span>
                </div>
                <p className="text-slate-400">
                  No se comparten números de WhatsApp ni códigos universitarios fuera de la red de ventas de campus.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-heading font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: SEGURIDAD DE LA CUENTA                             */}
      {/* ========================================================== */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="settings-card rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 dark:border dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Seguridad
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Cuenta Activa</span>
                <p className="font-heading font-bold text-slate-900 dark:text-white">
                  {user?.nombre || 'Usuario UTP'}
                </p>
                <p className="font-mono text-[11px] text-[#BA122D] font-bold">
                  {user?.email || 'estudiante@utp.edu.pe'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Cifrado & Autenticación</span>
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Contraseñas con BCrypt & Sesión Stateless JWT</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-heading font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
