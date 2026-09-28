import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { IconArrowBack, IconCheck, IconTrash } from '../components/Icons';

export default function Configuracion() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tema, setTema] = useState(() => localStorage.getItem('campusventa_tema') || 'claro');
  const [notifBajones, setNotifBajones] = useState(true);
  const [sonidoHaptico, setSonidoHaptico] = useState(true);
  const [ahorroDatos, setAhorroDatos] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const aplicarTema = (nuevoTema) => {
    setTema(nuevoTema);
    localStorage.setItem('campusventa_tema', nuevoTema);
    const root = document.documentElement;
    if (nuevoTema === 'oscuro') {
      root.classList.add('dark');
    } else if (nuevoTema === 'claro') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    showToast(`Tema ${nuevoTema} aplicado`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased pb-32 sm:pb-16 selection:bg-primary/20">
      <Navbar />

      {/* Floating Animated Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50 liquid-glass-dark text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce-subtle border border-white/20">
          <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-heading font-bold text-xs sm:text-sm leading-tight">
            {toastMessage}
          </span>
        </div>
      )}

      <main className="max-w-[720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Back Row */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-text-secondary hover:text-text-main transition-colors"
          >
            <IconArrowBack className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>

        {/* Hero Title */}
        <section className="relative overflow-hidden liquid-glass-hero rounded-3xl p-6 sm:p-7 shadow-sm border border-white/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#BA122D] flex items-center justify-center border border-rose-100 shadow-xs shrink-0">
              <span className="material-symbols-outlined text-2xl text-[#BA122D]">settings</span>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main leading-tight">
                Configuración y Preferencias
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Ajusta las notificaciones, apariencia, almacenamiento y rol de tu cuenta
              </p>
            </div>
          </div>
        </section>

        {/* Card: Tema Visual */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-xs border border-white/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">palette</span>
              <span>Tema de Apariencia</span>
            </h2>
            <span className="text-[11px] font-heading font-extrabold text-primary">
              {tema === 'oscuro' ? 'Oscuro OLED' : tema === 'claro' ? 'Claro Cristal' : 'Automático'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => aplicarTema('claro')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
                tema === 'claro'
                  ? 'liquid-glass-crimson text-white shadow-sm ring-2 ring-primary/40 border-transparent'
                  : 'liquid-glass text-text-secondary hover:text-text-main border-white/70'
              }`}
            >
              <span className="material-symbols-outlined text-xl mb-1">light_mode</span>
              <span className="text-xs font-heading font-bold">Claro</span>
            </button>

            <button
              type="button"
              onClick={() => aplicarTema('oscuro')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
                tema === 'oscuro'
                  ? 'liquid-glass-crimson text-white shadow-sm ring-2 ring-primary/40 border-transparent'
                  : 'liquid-glass text-text-secondary hover:text-text-main border-white/70'
              }`}
            >
              <span className="material-symbols-outlined text-xl mb-1">dark_mode</span>
              <span className="text-xs font-heading font-bold">Oscuro</span>
            </button>

            <button
              type="button"
              onClick={() => aplicarTema('sistema')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
                tema === 'sistema'
                  ? 'liquid-glass-crimson text-white shadow-sm ring-2 ring-primary/40 border-transparent'
                  : 'liquid-glass text-text-secondary hover:text-text-main border-white/70'
              }`}
            >
              <span className="material-symbols-outlined text-xl mb-1">brightness_auto</span>
              <span className="text-xs font-heading font-bold">Automático</span>
            </button>
          </div>
        </section>

        {/* Card: Modo App PWA */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-xs border border-white/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-text-main flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">install_mobile</span>
              <span>Modo App (Pantalla completa sin navegador)</span>
            </span>
            <span className="text-[10px] font-heading font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              PWA Nativa
            </span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Instala CampusVenta en tu celular para abrirla como app nativa, sin barra de direcciones URL ni controles del navegador.
          </p>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
            }}
            className="w-full py-2.5 px-4 rounded-full liquid-glass border border-primary/30 hover:border-primary text-primary font-heading font-bold text-xs shadow-2xs hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_to_home_screen</span>
            <span>Instalar CampusVenta en tu Celular</span>
          </button>
        </section>

        {/* Card: Preferencias y Notificaciones */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-xs border border-white/80 space-y-3 text-xs">
          <h2 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">tune</span>
            <span>Preferencias del Sistema</span>
          </h2>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-2xl liquid-glass border border-white/70 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
                <div>
                  <span className="font-heading font-bold text-text-main block">Alertas de postres y bajones</span>
                  <span className="text-[11px] text-text-secondary">Notificarme durante los recesos de campus</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifBajones}
                onChange={(e) => {
                  setNotifBajones(e.target.checked);
                  showToast(e.target.checked ? 'Alertas activadas' : 'Alertas pausadas');
                }}
                className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl liquid-glass border border-white/70 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-lg">vibration</span>
                <div>
                  <span className="font-heading font-bold text-text-main block">Sonido y respuesta háptica</span>
                  <span className="text-[11px] text-text-secondary">Al confirmar pedidos por WhatsApp</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sonidoHaptico}
                onChange={(e) => setSonidoHaptico(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl liquid-glass border border-white/70 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-lg">network_check</span>
                <div>
                  <span className="font-heading font-bold text-text-main block">Modo ahorro de datos móviles</span>
                  <span className="text-[11px] text-text-secondary">Cargar fotos optimizadas en Wi-Fi / 4G UTP</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ahorroDatos}
                onChange={(e) => {
                  setAhorroDatos(e.target.checked);
                  showToast(e.target.checked ? 'Ahorro de datos activado' : 'Modo normal activo');
                }}
                className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Card: Acciones de Cuenta */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-xs border border-white/80 space-y-3">
          <h2 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">shield</span>
            <span>Mantenimiento de la Cuenta</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                showToast('Caché y datos temporales restablecidos');
              }}
              className="w-full h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 active:scale-95 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-base text-slate-500">restart_alt</span>
              <span>Limpiar Caché Temporal</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-11 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-heading font-bold text-xs flex items-center justify-center gap-1.5 border border-red-200 active:scale-95 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
