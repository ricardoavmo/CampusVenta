import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getEmprendimientos } from '../services/api';
import {
  IconHeart,
  IconCheck,
  IconStar,
  IconLocation,
  IconVerified,
  IconWhatsApp,
  IconStore,
  IconArrowRight
} from '../components/Icons';

export default function MisPedidos() {
  const [activeTab, setActiveTab] = useState('favoritos'); // 'favoritos' | 'pedidos' | 'resenas'
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesIds, setFavoritesIds] = useState([]);

  // Pedidos de muestra / persistidos
  const [pedidos] = useState([
    {
      id: 'PED-1082',
      vendedorNombre: 'Valeria Mendoza',
      tiendaNombre: 'SweetHub UTP',
      producto: '2x Brownies Melcochudos de Chocolate',
      total: 9.00,
      torre: 'Torre A',
      piso: 'Piso 3',
      fecha: 'Hoy, 10:20 AM (Receso)',
      estado: 'Entregado en aula',
      whatsapp: '51972341311',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    {
      id: 'PED-1049',
      vendedorNombre: 'Carlos Morales',
      tiendaNombre: 'Bajones & Snacks UTP',
      producto: '1x Empanada de Pollo al Horno + Chicha',
      total: 6.50,
      torre: 'Torre B',
      piso: 'Piso 2',
      fecha: 'Ayer, 4:15 PM',
      estado: 'Entregado en bancas',
      whatsapp: '51987654321',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'
    }
  ]);

  // Reseñas emitidas
  const [misResenas] = useState([
    {
      id: 1,
      tiendaNombre: 'SweetHub UTP',
      calificacion: 5,
      comentario: 'Los brownies me salvaron durante el parcial de Cálculo en Torre A. Llegaron calentitos en menos de 3 minutos.',
      fecha: 'Hace 2 días',
      verificado: true
    },
    {
      id: 2,
      tiendaNombre: 'TecnoCampus Cables',
      calificacion: 5,
      comentario: 'Compré un cable Tipo C para cargar mi laptop en biblioteca. Me salvó la vida académica 100%.',
      fecha: 'Hace 1 semana',
      verificado: true
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('campusventa_favoritos');
    if (saved) {
      try {
        setFavoritesIds(JSON.parse(saved));
      } catch {
        setFavoritesIds([1, 2]);
      }
    } else {
      setFavoritesIds([1, 2]);
    }

    async function loadStores() {
      try {
        setLoading(true);
        const data = await getEmprendimientos();
        setEmprendimientos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar tiendas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStores();

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('campusventa_favoritos');
        if (saved) setFavoritesIds(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = (id) => {
    const numId = Number(id);
    let updated;
    if (favoritesIds.map(Number).includes(numId)) {
      updated = favoritesIds.filter((favId) => Number(favId) !== numId);
    } else {
      updated = [...favoritesIds, numId];
    }
    setFavoritesIds(updated);
    localStorage.setItem('campusventa_favoritos', JSON.stringify(updated));
  };

  const favoriteStores = emprendimientos.filter((e) =>
    favoritesIds.map(Number).includes(Number(e.id))
  );

  const openWhatsApp = (store) => {
    const phone = store.whatsapp ? store.whatsapp.replace(/\D/g, '') : '51999999999';
    const num = phone.startsWith('51') ? phone : `51${phone}`;
    const text = encodeURIComponent(
      `¡Hola ${store.vendedorNombre || store.nombre}! Te tengo en mis favoritos de CampusVenta. ¿Estás activo hoy en ${store.torre || 'el campus'} para hacerte un pedido?`
    );
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased pb-32 sm:pb-16 selection:bg-primary/20">
      <Navbar />

      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Header Hero Banner with Liquid Glass */}
        <section className="liquid-glass-hero p-5 sm:p-7 rounded-3xl shadow-sm border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-badge text-primary font-heading font-bold text-xs uppercase tracking-wider border border-primary/20 shadow-xs">
              <IconHeart className="w-3.5 h-3.5 text-primary" filled />
              <span>Área Personal del Estudiante</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight">
              Mis Pedidos y <span className="text-gradient-crimson">Favoritos</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
              Tus puestos de confianza, pedidos coordinados en el campus y el historial de tus reseñas verificadas.
            </p>
          </div>

          {/* DOS KPIS: PEDIDOS Y PUESTOS FAVORITOS (UNO AL COSTADO DEL OTRO EN MÓVIL Y DESKTOP) */}
          <div className="w-full sm:w-auto grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
            {/* KPI 1: Pedidos Realizados */}
            <button
              type="button"
              onClick={() => setActiveTab('pedidos')}
              className={`p-3 sm:p-4 rounded-2xl liquid-glass border transition-all text-center flex flex-col items-center justify-center shadow-xs active:scale-95 group ${
                activeTab === 'pedidos'
                  ? 'border-primary/50 bg-primary/10 ring-2 ring-primary/20'
                  : 'border-white/80 hover:border-primary/30 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-text-muted mb-1">
                <span className="material-symbols-outlined text-sm sm:text-base text-primary">receipt_long</span>
                <span className="text-[10px] sm:text-[11px] font-heading font-extrabold uppercase tracking-wider text-text-secondary">
                  Pedidos
                </span>
              </div>
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main group-hover:scale-105 transition-transform leading-none">
                {pedidos.length}
              </span>
              <span className="text-[10px] text-text-muted mt-1 font-medium">
                Coordinados
              </span>
            </button>

            {/* KPI 2: Puestos Favoritos */}
            <button
              type="button"
              onClick={() => setActiveTab('favoritos')}
              className={`p-3 sm:p-4 rounded-2xl liquid-glass border transition-all text-center flex flex-col items-center justify-center shadow-xs active:scale-95 group ${
                activeTab === 'favoritos'
                  ? 'border-primary/50 bg-primary/10 ring-2 ring-primary/20'
                  : 'border-white/80 hover:border-primary/30 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-text-muted mb-1">
                <IconHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" filled />
                <span className="text-[10px] sm:text-[11px] font-heading font-extrabold uppercase tracking-wider text-text-secondary">
                  Favoritos
                </span>
              </div>
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-rose-600 group-hover:scale-105 transition-transform leading-none">
                {favoriteStores.length}
              </span>
              <span className="text-[10px] text-text-muted mt-1 font-medium">
                Puestos guardados
              </span>
            </button>
          </div>
        </section>

        {/* Tab Switcher Pills */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('favoritos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === 'favoritos'
                ? 'liquid-glass-crimson text-white shadow-xs'
                : 'liquid-glass hover:bg-white/90 text-text-secondary border border-white/60'
            }`}
          >
            <IconHeart className="w-4 h-4" filled={activeTab === 'favoritos'} />
            <span>Vendedores Favoritos ({favoriteStores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === 'pedidos'
                ? 'liquid-glass-crimson text-white shadow-xs'
                : 'liquid-glass hover:bg-white/90 text-text-secondary border border-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Historial de Pedidos ({pedidos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resenas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === 'resenas'
                ? 'liquid-glass-crimson text-white shadow-xs'
                : 'liquid-glass hover:bg-white/90 text-text-secondary border border-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">reviews</span>
            <span>Mis Reseñas ({misResenas.length})</span>
          </button>
        </section>

        {/* TAB 1: VENDEDORES FAVORITOS */}
        {activeTab === 'favoritos' && (
          <section className="space-y-4">
            {favoriteStores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteStores.map((store) => (
                  <article
                    key={store.id}
                    className="liquid-glass-card rounded-3xl p-4 border border-white/80 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 group relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={store.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={store.vendedorNombre || store.nombre}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs"
                          />
                          <div>
                            <h3 className="font-heading font-bold text-base text-text-main group-hover:text-primary transition-colors">
                              {store.nombre}
                            </h3>
                            <p className="text-xs text-text-secondary">
                              {store.vendedorNombre} · {store.carreraCiclo || 'Comunidad UTP'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(store.id)}
                          className="p-1.5 rounded-full liquid-glass text-rose-500 hover:scale-110 transition-transform shadow-xs"
                          title="Eliminar de favoritos"
                        >
                          <IconHeart className="w-4 h-4 fill-rose-500 text-rose-500" filled />
                        </button>
                      </div>

                      <div className="mt-3 liquid-glass p-3 rounded-2xl border border-white/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-text-secondary font-medium">
                            <IconLocation className="w-3.5 h-3.5 text-primary" />
                            <span>{store.torre} · {store.piso}</span>
                          </span>
                          <span className="text-amber-500 font-heading font-bold flex items-center gap-0.5">
                            <IconStar className="w-3.5 h-3.5 text-amber-500" />
                            <span>{store.calificacion || '4.9'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {store.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                      <button
                        onClick={() => openWhatsApp(store)}
                        className="flex-1 py-2 px-3 rounded-full liquid-glass-crimson hover:brightness-110 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <IconWhatsApp className="w-3.5 h-3.5 text-white" />
                        <span>Pedir por WhatsApp</span>
                      </button>

                      <Link
                        to={`/emprendimiento/${store.id}`}
                        className="p-2 rounded-full liquid-glass hover:bg-white/90 text-text-main transition-colors shadow-xs"
                        title="Ver Tienda"
                      >
                        <IconArrowRight className="w-4 h-4 text-text-main" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="liquid-glass-card rounded-3xl p-10 border border-white/80 text-center space-y-3 max-w-md mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-text-muted mx-auto">
                  <IconHeart className="w-6 h-6 text-text-muted" />
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  Aún no tienes puestos favoritos guardados
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Explora el catálogo y pulsa el corazón en las tiendas que te gusten para tenerlas a mano.
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-xs text-decoration-none hover:brightness-110 transition-all"
                >
                  Explorar Puestos
                </Link>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: HISTORIAL DE PEDIDOS */}
        {activeTab === 'pedidos' && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pedidos.map((ped) => (
                <div
                  key={ped.id}
                  className="liquid-glass-card rounded-3xl p-5 border border-white/80 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ped.avatarUrl}
                        alt={ped.tiendaNombre}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-text-muted font-bold">
                            {ped.id}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full liquid-glass-emerald font-heading text-[10px] font-bold">
                            <IconCheck className="w-2.5 h-2.5 inline mr-1 text-emerald-700" />
                            <span>{ped.estado}</span>
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-base text-text-main">
                          {ped.tiendaNombre}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {ped.producto}
                        </p>
                      </div>
                    </div>

                    <span className="font-heading font-extrabold text-base text-primary">
                      S/ {ped.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="liquid-glass p-3 rounded-2xl border border-white/60 flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <IconLocation className="w-3.5 h-3.5 text-primary" />
                      <span>{ped.torre} · {ped.piso}</span>
                    </div>
                    <span className="text-text-muted text-[11px]">{ped.fecha}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                    <a
                      href={`https://wa.me/${ped.whatsapp}?text=${encodeURIComponent(
                        `¡Hola ${ped.vendedorNombre}! Quisiera repetir el pedido que te hice anteriormente.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 liquid-glass-crimson hover:brightness-110 text-white text-xs font-heading font-bold rounded-full transition-all flex items-center gap-1.5 shadow-xs text-decoration-none"
                    >
                      <IconWhatsApp className="w-3.5 h-3.5 text-white" />
                      <span>Repedir por WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: MIS RESEÑAS */}
        {activeTab === 'resenas' && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {misResenas.map((res) => (
                <div
                  key={res.id}
                  className="liquid-glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-text-main">
                        {res.tiendaNombre}
                      </h3>
                      <span className="text-[11px] text-text-muted">{res.fecha}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-heading font-bold text-xs liquid-glass-badge px-2.5 py-0.5 rounded-full border border-amber-200">
                      <IconStar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{res.calificacion}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed liquid-glass p-3 rounded-2xl border border-white/60">
                    "{res.comentario}"
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-heading font-bold">
                    <IconVerified className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reseña verificada con carné UTP</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
