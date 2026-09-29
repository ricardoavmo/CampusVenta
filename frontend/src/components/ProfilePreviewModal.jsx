import React from 'react';
import { Link } from 'react-router-dom';
import {
  IconStore,
  IconSchool,
  IconClose,
  IconVerified,
  IconLocation,
  IconInstagram,
  IconWhatsApp,
  IconTikTok,
  IconFacebook,
  IconX,
  IconLinkedIn,
  IconTelegram
} from './Icons';

export const PLATFORMS_CONFIG = {
  instagram: {
    label: 'Instagram',
    color: 'from-amber-500 via-pink-500 to-purple-600',
    bgColor: 'bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-300',
    IconComponent: IconInstagram,
    placeholder: '@usuario o https://instagram.com/usuario',
    formatUrl: (input) => {
      if (!input) return '#';
      const clean = input.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      return `https://instagram.com/${clean.replace(/^@/, '')}`;
    },
    getDisplayText: (input) => {
      if (!input) return '';
      const clean = input.trim();
      if (clean.includes('instagram.com/')) {
        return '@' + clean.split('instagram.com/')[1].replace(/\/$/, '');
      }
      return clean.startsWith('@') ? clean : `@${clean}`;
    }
  },
  whatsapp: {
    label: 'WhatsApp',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300',
    IconComponent: IconWhatsApp,
    placeholder: '972341311 o https://wa.me/51...',
    formatUrl: (input) => {
      if (!input) return '#';
      const clean = input.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      const digits = clean.replace(/\D/g, '');
      const withCountry = digits.startsWith('51') ? digits : `51${digits}`;
      return `https://wa.me/${withCountry}`;
    },
    getDisplayText: (input) => {
      if (!input) return '';
      const clean = input.trim();
      if (clean.includes('wa.me/')) {
        return '+51 ' + clean.split('wa.me/')[1].replace(/^51/, '');
      }
      return clean.startsWith('+') ? clean : `+51 ${clean}`;
    }
  },
  tiktok: {
    label: 'TikTok',
    color: 'from-slate-900 to-black',
    bgColor: 'bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300',
    IconComponent: IconTikTok,
    placeholder: '@usuario o https://tiktok.com/@usuario',
    formatUrl: (input) => {
      if (!input) return '#';
      const clean = input.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      return `https://tiktok.com/@${clean.replace(/^@/, '')}`;
    },
    getDisplayText: (input) => {
      if (!input) return '';
      const clean = input.trim();
      if (clean.includes('tiktok.com/@')) {
        return '@' + clean.split('tiktok.com/@')[1].replace(/\/$/, '');
      }
      return clean.startsWith('@') ? clean : `@${clean}`;
    }
  },
  facebook: {
    label: 'Facebook',
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
    IconComponent: IconFacebook,
    placeholder: 'usuario o https://facebook.com/usuario',
    formatUrl: (input) => {
      if (!input) return '#';
      const clean = input.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      return `https://facebook.com/${clean.replace(/^@/, '')}`;
    },
    getDisplayText: (input) => {
      if (!input) return '';
      const clean = input.trim();
      if (clean.includes('facebook.com/')) {
        return clean.split('facebook.com/')[1].replace(/\/$/, '');
      }
      return clean;
    }
  },
  linkedin: {
    label: 'LinkedIn',
    color: 'from-sky-700 to-blue-800',
    bgColor: 'bg-sky-50 text-sky-800 border-sky-200 hover:border-sky-300',
    IconComponent: IconLinkedIn,
    placeholder: 'nombre-apellido o https://linkedin.com/in/...',
    formatUrl: (input) => {
      if (!input) return '#';
      const clean = input.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      return `https://linkedin.com/in/${clean.replace(/^@/, '')}`;
    },
    getDisplayText: (input) => {
      if (!input) return '';
      const clean = input.trim();
      if (clean.includes('linkedin.com/in/')) {
        return clean.split('linkedin.com/in/')[1].replace(/\/$/, '');
      }
      return clean;
    }
  },
  x: {
    label: 'X (Twitter)',
    color: 'from-slate-900 to-slate-950',
    bgColor: 'bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400',
    IconComponent: IconX,
    placeholder: '@usuario o https://x.com/usuario',
    formatUrl: (input) => {
      if (!input) return '#';
      const clean = input.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      return `https://x.com/${clean.replace(/^@/, '')}`;
    },
    getDisplayText: (input) => {
      if (!input) return '';
      const clean = input.trim();
      if (clean.includes('x.com/')) {
        return '@' + clean.split('x.com/')[1].replace(/\/$/, '');
      }
      if (clean.includes('twitter.com/')) {
        return '@' + clean.split('twitter.com/')[1].replace(/\/$/, '');
      }
      return clean.startsWith('@') ? clean : `@${clean}`;
    }
  },
  telegram: {
    label: 'Telegram',
    color: 'from-sky-500 to-cyan-600',
    bgColor: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:border-cyan-300',
    IconComponent: IconTelegram,
    placeholder: '@usuario o https://t.me/usuario',
    formatUrl: (input) => {
      if (!input) return '#';
      const clean = input.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      return `https://t.me/${clean.replace(/^@/, '')}`;
    },
    getDisplayText: (input) => {
      if (!input) return '';
      const clean = input.trim();
      if (clean.includes('t.me/')) {
        return '@' + clean.split('t.me/')[1].replace(/\/$/, '');
      }
      return clean.startsWith('@') ? clean : `@${clean}`;
    }
  },
};

export default function ProfilePreviewModal({
  user,
  isOpen,
  onClose,
  isOwner = false,
  onEditClick,
}) {
  if (!isOpen || !user) return null;

  const nombre = user.nombre || user.vendedorNombre || 'Estudiante UTP';
  const avatar = user.avatar || user.avatarUrl;
  const rol = user.rol || (user.emprendimientoId ? 'vendedor' : 'comprador');
  const isSeller = rol === 'vendedor';
  const carrera = user.carrera || 'Estudiante UTP';
  const ciclo = user.ciclo || 'Campus Piura';
  const bio = user.bio || (isSeller ? 'Vendedor oficial de productos y postres en el campus.' : 'Estudiante de la comunidad UTP.');
  const torre = user.torreHabitual || user.torre || 'Torre A';
  const piso = user.piso || '';
  const redes = Array.isArray(user.redesSociales)
    ? user.redesSociales.filter((r) => r.visible !== false && r.handle && r.handle.trim())
    : [];

  const getInitials = (name) => {
    if (!name) return 'UTP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md liquid-glass-card bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/90 flex flex-col gap-5 animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with Close button */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-primary">
              Vista de Perfil
            </span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-secondary font-medium">Comunidad UTP</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass text-text-muted hover:text-text-main flex items-center justify-center transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Identity Section */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={nombre}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full liquid-glass-crimson text-white flex items-center justify-center font-heading font-extrabold text-2xl ring-4 ring-primary/20 shadow-md">
                {getInitials(nombre)}
              </div>
            )}
            <span
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center shadow-xs ${
                isSeller ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
              }`}
              title={isSeller ? 'Vendedor Verificado' : 'Estudiante Activo'}
            >
              <IconVerified className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <h3 className="font-heading font-extrabold text-lg text-text-main">
                {nombre}
              </h3>
              <span className="px-2 py-0.5 rounded-full liquid-glass-crimson text-white text-[10px] font-heading font-bold shadow-2xs">
                {isSeller ? 'Vendedor Oficial' : 'Alumno UTP'}
              </span>
            </div>
            <p className="text-xs font-heading font-semibold text-text-secondary mt-0.5">
              {carrera} · {ciclo}
            </p>
            <p className="text-[11px] text-text-muted flex items-center justify-center gap-1 mt-0.5">
              <IconSchool className="w-3.5 h-3.5 text-primary" />
              <span>UTP Sede Piura</span>
            </p>
          </div>
        </div>

        {/* Bio / Campus Location */}
        {bio && (
          <div className="p-3.5 rounded-2xl liquid-glass border border-white/80 text-xs text-text-main leading-relaxed text-center sm:text-left">
            <span className="text-[10px] font-heading font-bold text-text-muted uppercase tracking-wider block mb-1">
              Sobre mí / Dónde me ubicas en Campus:
            </span>
            <p className="italic font-medium">"{bio}"</p>
            <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-secondary font-semibold">
              <span className="flex items-center gap-1">
                <IconLocation className="w-3.5 h-3.5 text-primary" />
                <span>Zona habitual: {torre} {piso ? `(${piso})` : ''}</span>
              </span>
              <span className="text-emerald-600 font-bold">● Recesos de clases</span>
            </div>
          </div>
        )}

        {/* Redes Sociales Habilitadas con Logos Oficiales y Enlace Directo */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-text-main">
              Canales y Redes Sociales Oficiales:
            </span>
            <span className="text-[11px] text-text-muted font-medium">
              {redes.length > 0 ? `${redes.length} canal(es) activo(s)` : 'Sin redes públicas'}
            </span>
          </div>

          {redes.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {redes.map((item) => {
                const conf = PLATFORMS_CONFIG[item.plataforma] || PLATFORMS_CONFIG.instagram;
                const linkUrl = conf.formatUrl(item.handle);
                const displayText = conf.getDisplayText(item.handle);
                const IconSvg = conf.IconComponent || IconInstagram;

                return (
                  <a
                    key={item.id || item.plataforma}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all hover:scale-[1.01] active:scale-95 text-decoration-none shadow-xs group ${conf.bgColor}`}
                    title={`Abrir perfil de ${conf.label}: ${linkUrl}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${conf.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconSvg className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider block leading-tight">
                          {conf.label}
                        </span>
                        <span className="text-xs font-heading font-bold truncate block">
                          {displayText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-current text-[11px] font-heading font-bold shrink-0 shadow-2xs group-hover:bg-white">
                      <span>Ir al perfil</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl liquid-glass border border-dashed border-border text-center text-xs text-text-muted">
              Este usuario no ha habilitado redes sociales públicas en su perfil.
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-5 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-xs text-xs font-heading font-bold transition-all active:scale-95 text-center"
          >
            Cerrar
          </button>

          {isSeller && user.emprendimientoId && (
            <Link
              to={`/emprendimiento/${user.emprendimientoId}`}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5 text-decoration-none text-center"
            >
              <IconStore className="w-3.5 h-3.5" />
              <span>Ver Puesto</span>
            </Link>
          )}

          {isOwner && onEditClick && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditClick();
              }}
              className="flex-1 py-2.5 px-4 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-md hover:brightness-110 transition-all text-center"
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
