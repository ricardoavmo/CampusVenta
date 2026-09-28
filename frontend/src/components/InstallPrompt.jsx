import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showGenericModal, setShowGenericModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(!!standalone);
    if (standalone) {
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    const externalTrigger = () => {
      if (isIosDevice) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(({ outcome }) => {
          if (outcome === 'accepted') {
            setShowPrompt(false);
            setDeferredPrompt(null);
          }
        });
      } else {
        setShowGenericModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('trigger-pwa-install', externalTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('trigger-pwa-install', externalTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      setShowGenericModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {showPrompt && (
        <aside aria-label="Instalación de la aplicación" className="fixed bottom-24 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-50 liquid-glass-dark text-white p-4 rounded-3xl flex items-center justify-between gap-3 animate-bounce-subtle border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl liquid-glass-crimson flex items-center justify-center text-white shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-xl">install_mobile</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xs sm:text-sm text-white">Instalar CampusVenta</h3>
              <p className="text-[11px] text-gray-300">
                Úsala en pantalla completa sin las barras del navegador.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 liquid-glass-crimson text-white text-xs font-heading font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </aside>
      )}

      {/* Modal para usuarios de iPhone/iPad (Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] bg-dark/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">ios_share</span>
                <h3 className="font-heading font-bold text-lg text-text-main">Instalar en iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full liquid-glass text-text-muted hover:text-text-main flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Para disfrutar de <strong>CampusVenta</strong> sin barras de navegación como una app nativa:
            </p>
            <ol className="text-xs text-text-main space-y-2.5 list-decimal list-inside bg-surface-container p-3.5 rounded-2xl">
              <li>Toca el botón <strong>Compartir</strong> <span className="material-symbols-outlined text-sm align-middle text-primary">ios_share</span> en la barra inferior de Safari.</li>
              <li>Desliza hacia arriba y pulsa <strong>"Agregar a pantalla de inicio"</strong> <span className="material-symbols-outlined text-sm align-middle">add_box</span>.</li>
              <li>Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Listo! Se abrirá en pantalla completa.</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 liquid-glass-crimson text-white font-heading font-bold text-sm rounded-2xl shadow-sm"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Modal para Chrome / Android / PC si no se dispara el prompt automático */}
      {showGenericModal && (
        <div className="fixed inset-0 z-[100] bg-dark/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">app_shortcut</span>
                <h3 className="font-heading font-bold text-lg text-text-main">Instalar en Pantalla Completa</h3>
              </div>
              <button
                onClick={() => setShowGenericModal(false)}
                className="w-7 h-7 rounded-full liquid-glass text-text-muted hover:text-text-main flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Para ocultar las barras del navegador y usar <strong>CampusVenta</strong> como App:
            </p>
            <ol className="text-xs text-text-main space-y-2.5 list-decimal list-inside bg-surface-container p-3.5 rounded-2xl">
              <li>Toca los <strong>3 puntos del navegador</strong> (arriba a la derecha en Chrome).</li>
              <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
              <li>Ábrela desde el icono de tu pantalla de inicio para navegar en pantalla completa sin URLs ni barras.</li>
            </ol>
            <button
              onClick={() => setShowGenericModal(false)}
              className="w-full py-2.5 liquid-glass-crimson text-white font-heading font-bold text-sm rounded-2xl shadow-sm"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
