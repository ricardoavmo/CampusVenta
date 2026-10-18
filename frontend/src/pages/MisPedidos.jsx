import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getEmprendimientos,
  getMisResenasApi,
  getMisPedidosApi,
  getMisFavoritosApi,
  toggleFavoritoApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('favoritos'); // 'favoritos' | 'pedidos' | 'resenas'
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesIds, setFavoritesIds] = useState([]);

  // Pedidos del usuario (coordinados en campus vía WhatsApp)
  const [pedidos, setPedidos] = useState(() => {
    try {
      const saved = localStorage.getItem('campusventa_pedidos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reseñas emitidas en PostgreSQL
  const [misResenas, setMisResenas] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Cargar Emprendimientos
        const data = await getEmprendimientos();
        const stores = Array.isArray(data) ? data : [];
        setEmprendimientos(stores);

        // 2. Cargar Favoritos (de API si autenticado, de lo contrario localStorage)
        let favsLoaded = false;
        if (user) {
          try {
            const apiFavs = await getMisFavoritosApi();
            if (Array.isArray(apiFavs)) {
              setFavoritesIds(apiFavs.map(Number));
              localStorage.setItem('campusventa_favoritos', JSON.stringify(apiFavs));
              favsLoaded = true;
            }
          } catch (e) {
            console.warn('[MisPedidos] Error al cargar favoritos de API:', e?.message);
          }
        }
        if (!favsLoaded) {
          const savedFavs = localStorage.getItem('campusventa_favoritos');
          setFavoritesIds(savedFavs ? JSON.parse(savedFavs).map(Number) : []);
        }

        // 3. Cargar Pedidos (de API PostgreSQL si autenticado, con fallback a localStorage)
        let pedidosCargados = false;
        if (user) {
          try {
            const apiPedidos = await getMisPedidosApi();
            if (Array.isArray(apiPedidos)) {
              const formatted = apiPedidos.map((ped) => {
                const store = stores.find((s) => s.id === ped.emprendimientoId);
                return {
                  id: ped.codigoPedido || `ORD-${ped.id}`,
                  dbId: ped.id,
                  tiendaNombre: ped.emprendimientoNombre || store?.nombre || 'Emprendimiento UTP',
                  avatarUrl: ped.emprendimientoAvatarUrl || store?.imagenUrl,
                  producto: `${ped.cantidad}x ${ped.productoNombre}`,
                  total: ped.total,
                  torre: ped.puntoEntrega || store?.torre || 'Campus UTP',
                  piso: store?.piso || 'Entrega en campus',
                  estado: ped.estado || 'PENDIENTE',
                  fecha: ped.fechaCreacion ? new Date(ped.fechaCreacion).toLocaleDateString() : 'Reciente',
                  whatsapp: store?.whatsapp ? store.whatsapp.replace(/\D/g, '') : null,
                  vendedorNombre: store?.vendedorNombre
                };
              });
              setPedidos(formatted);
              pedidosCargados = true;
            }
          } catch (e) {
            console.warn('[MisPedidos] Error al consultar /api/pedidos/mis-pedidos:', e?.message);
          }
        }
        if (!pedidosCargados) {
          try {
            const savedPeds = localStorage.getItem('campusventa_pedidos');
            if (savedPeds) setPedidos(JSON.parse(savedPeds));
          } catch {
            // omitir
          }
        }

        // 4. Extraer reseñas reales registradas en PostgreSQL vinculadas al usuario
        let userResenas = [];
        if (user) {
          try {
            const apiRes = await getMisResenasApi();
            if (Array.isArray(apiRes) && apiRes.length > 0) {
              userResenas = apiRes.map((r) => {
                const tienda = stores.find((s) => s.id === r.emprendimientoId);
                return {
                  id: r.id,
                  emprendimientoId: r.emprendimientoId,
                  tiendaNombre: r.emprendimientoNombre || tienda?.nombre || 'Emprendimiento UTP',
                  estudianteNombre: r.estudianteNombre,
                  calificacion: r.calificacion,
                  comentario: r.comentario,
                  fecha: r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString() : 'Reciente',
                };
              });
            }
          } catch (e) {
            console.warn('[MisPedidos] Error al consultar /api/usuarios/me/resenas:', e?.message);
          }
        }

        // Si no trajo por endpoint dedicado, extraer de las tiendas
        if (userResenas.length === 0) {
          stores.forEach((emp) => {
            if (Array.isArray(emp.resenas)) {
              emp.resenas.forEach((r) => {
                if (!user?.nombre || r.estudianteNombre === user.nombre || (user?.id && r.usuarioId === user.id)) {
                  userResenas.push({
                    id: r.id,
                    emprendimientoId: emp.id,
                    tiendaNombre: emp.nombre,
                    estudianteNombre: r.estudianteNombre,
                    calificacion: r.calificacion,
                    comentario: r.comentario,
                    fecha: r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString() : 'Reciente',
                  });
                }
              });
            }
          });
        }
        setMisResenas(userResenas);
      } catch (err) {
        console.error('Error al cargar datos en MisPedidos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('campusventa_favoritos');
        if (saved) setFavoritesIds(JSON.parse(saved).map(Number));
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const toggleFavorite = async (id) => {
    const numId = Number(id);

    if (user) {
      try {
        const updated = await toggleFavoritoApi(numId);
        setFavoritesIds(updated.map(Number));
        localStorage.setItem('campusventa_favoritos', JSON.stringify(updated));
        return;
      } catch (err) {
        console.warn('[MisPedidos] Error toggleFavoritoApi, fallback local:', err?.message);
      }
    }

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
    <div className="min-h-screen flex flex-col theme-bg-canvas text-text-main font-body antialiased pb-32 sm:pb-16 selection:bg-primary/20">
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
                          {store.avatarUrl ? (
                            <img
                              src={store.avatarUrl}
                              alt={store.vendedorNombre || store.nombre}
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white font-heading font-extrabold text-lg flex items-center justify-center shadow-xs shrink-0">
                              {store.nombre ? store.nombre.charAt(0).toUpperCase() : 'T'}
                            </div>
                          )}
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
            {pedidos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pedidos.map((ped) => (
                  <div
                    key={ped.id}
                    className="liquid-glass-card rounded-3xl p-5 border border-white/80 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {ped.avatarUrl ? (
                          <img
                            src={ped.avatarUrl}
                            alt={ped.tiendaNombre}
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white font-heading font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
                            {ped.tiendaNombre ? ped.tiendaNombre.charAt(0).toUpperCase() : 'P'}
                          </div>
                        )}
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
                        S/ {Number(ped.total || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="liquid-glass p-3 rounded-2xl border border-white/60 flex items-center justify-between text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <IconLocation className="w-3.5 h-3.5 text-primary" />
                        <span>{ped.torre} · {ped.piso}</span>
                      </div>
                      <span className="text-text-muted text-[11px]">{ped.fecha}</span>
                    </div>

                    {ped.whatsapp && (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                        <a
                          href={`https://wa.me/${ped.whatsapp}?text=${encodeURIComponent(
                            `¡Hola ${ped.vendedorNombre || 'compañero'}! Quisiera coordinar un nuevo pedido en el campus.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 liquid-glass-crimson hover:brightness-110 text-white text-xs font-heading font-bold rounded-full transition-all flex items-center gap-1.5 shadow-xs text-decoration-none"
                        >
                          <IconWhatsApp className="w-3.5 h-3.5 text-white" />
                          <span>Repedir por WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="liquid-glass-card rounded-3xl p-10 border border-white/80 text-center space-y-3 max-w-md mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-text-muted mx-auto">
                  <span className="material-symbols-outlined text-2xl text-text-muted">receipt_long</span>
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  Aún no tienes pedidos registrados
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Coordina tus compras por WhatsApp desde la ficha de cada emprendimiento para realizar tus pedidos en el campus.
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-xs text-decoration-none hover:brightness-110 transition-all"
                >
                  Explorar Emprendimientos
                </Link>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: MIS RESEÑAS */}
        {activeTab === 'resenas' && (
          <section className="space-y-4">
            {misResenas.length > 0 ? (
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
            ) : (
              <div className="liquid-glass-card rounded-3xl p-10 border border-white/80 text-center space-y-3 max-w-md mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-text-muted mx-auto">
                  <span className="material-symbols-outlined text-2xl text-text-muted">reviews</span>
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  Aún no has escrito ninguna reseña
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Apoya a tus compañeros calificando sus productos y atención luego de recibir tus pedidos en el campus.
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-xs text-decoration-none hover:brightness-110 transition-all"
                >
                  Ver Tiendas en Campus
                </Link>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
