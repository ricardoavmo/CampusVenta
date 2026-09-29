import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmprendimientos } from '../services/api';
import {
  IconBolt,
  IconVerified,
  IconStore,
  IconLocation,
  IconStar,
  IconSearch,
  IconClock,
  IconQr,
  IconHandshake,
  IconClose,
  IconArrowRight,
  IconSchool,
  IconBuilding,
  IconSparkles,
  IconAdd,
  IconCheck,
  IconFilter,
  IconSliders,
  IconCake,
  IconFastfood,
  IconBag,
  IconBook,
  IconHeart,
  IconWhatsApp
} from '../components/Icons';
import ProfilePreviewModal from '../components/ProfilePreviewModal';

const CATEGORIAS_NAV = [
  { id: 'TODOS', label: 'En Vivo en el Campus', shortLabel: 'En Vivo', Icon: IconBolt },
  { id: 'POSTRES', label: 'Dulces & Postres', shortLabel: 'Postres', Icon: IconCake },
  { id: 'COMIDA', label: 'Bajones & Snacks', shortLabel: 'Bajones', Icon: IconFastfood },
  { id: 'ACCESORIOS', label: 'Accesorios & Merch', shortLabel: 'Accesorios', Icon: IconBag },
  { id: 'SERVICIOS', label: 'Apuntes & Tutorías', shortLabel: 'Apuntes', Icon: IconBook },
];

const TORRES = [
  'Todas las zonas',
  'Torre A',
  'Torre B',
  'Canchas'
];

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Favoritos persistidos en localStorage
  const [favoritesIds, setFavoritesIds] = useState(() => {
    try {
      const saved = localStorage.getItem('campusventa_favoritos');
      return saved ? JSON.parse(saved) : [1, 2];
    } catch {
      return [1, 2];
    }
  });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFavorite = (e, storeOrId, storeName) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const storeId = typeof storeOrId === 'object' && storeOrId !== null ? storeOrId.id : storeOrId;
    const name = storeName || (typeof storeOrId === 'object' && storeOrId !== null ? storeOrId.nombre : 'Puesto');
    let updated;
    const isFav = favoritesIds.includes(storeId);
    if (isFav) {
      updated = favoritesIds.filter((id) => id !== storeId);
      showToast(`Quitaste "${name}" de tus favoritos`);
    } else {
      updated = [...favoritesIds, storeId];
      showToast(`¡"${name}" guardado en tus favoritos!`);
    }
    setFavoritesIds(updated);
    localStorage.setItem('campusventa_favoritos', JSON.stringify(updated));
  };

  const getProductWhatsAppUrl = (prod) => {
    const rawPhone = prod.whatsapp || prod.telefono || '972341311';
    let cleanNumber = rawPhone.replace(/\D/g, '');
    if (cleanNumber.length === 9) {
      cleanNumber = '51' + cleanNumber;
    }
    const texto = `¡Hola ${prod.vendedorNombre || prod.tiendaNombre}! Vi tu producto "${prod.nombre}" en CampusVenta UTP. Deseo pedirlo (S/ ${Number(prod.precio).toFixed(2)}). ¿Estás en ${prod.torre} ${prod.piso} para coordinar la entrega?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(texto)}`;
  };

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('TODOS');
  const [selectedTorre, setSelectedTorre] = useState('Todas las zonas');
  const [onlyDisponibles, setOnlyDisponibles] = useState(false);
  const [filtroRapido5Min, setFiltroRapido5Min] = useState(false);
  const [filtroMaxPrecio, setFiltroMaxPrecio] = useState(25);
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);

  // Modal de Vista Previa de Perfil del Vendedor
  const [selectedSellerProfile, setSelectedSellerProfile] = useState(null);
  const [showSellerModal, setShowSellerModal] = useState(false);

  const handleOpenSellerProfile = (e, emp) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nombre = emp.vendedorNombre || emp.nombre;
    const cleanUser = nombre.toLowerCase().replace(/\s+/g, '.');
    setSelectedSellerProfile({
      nombre: nombre,
      avatar: emp.avatarUrl,
      rol: 'vendedor',
      carrera: emp.vendedorCarrera || 'Ing. Sistemas',
      ciclo: emp.vendedorCiclo || '6to Ciclo',
      bio: emp.descripcion || `Emprendimiento oficial en campus UTP Piura. Encuéntranos en ${emp.torre} - ${emp.piso}.`,
      torreHabitual: emp.torre || 'Torre A',
      piso: emp.piso || '',
      emprendimientoId: emp.id,
      tiendaNombre: emp.nombre,
      redesSociales: [
        { id: '1', plataforma: 'whatsapp', handle: emp.telefono || '972341311', visible: true },
        { id: '2', plataforma: 'instagram', handle: cleanUser, visible: true },
        { id: '3', plataforma: 'tiktok', handle: `${cleanUser}_utp`, visible: true },
      ],
    });
    setShowSellerModal(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategoria !== 'TODOS') count++;
    if (selectedTorre !== 'Todas las zonas') count++;
    if (onlyDisponibles) count++;
    if (filtroRapido5Min) count++;
    if (filtroMaxPrecio < 25) count++;
    return count;
  }, [selectedCategoria, selectedTorre, onlyDisponibles, filtroRapido5Min, filtroMaxPrecio]);

  const fetchEmprendimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmprendimientos();
      let combined = Array.isArray(data) ? [...data] : [];

      // Sincronizar con puestos locales registrados por el usuario
      try {
        const saved = localStorage.getItem('campusventa_mis_puestos');
        if (saved) {
          const localList = JSON.parse(saved);
          if (Array.isArray(localList)) {
            localList.forEach((lp) => {
              const existingIdx = combined.findIndex((e) => String(e.id) === String(lp.id));
              if (existingIdx >= 0) {
                combined[existingIdx] = { ...combined[existingIdx], ...lp };
              } else {
                combined.unshift(lp);
              }
            });
          }
        }
      } catch {}

      setEmprendimientos(combined);
    } catch (err) {
      console.error('Error al cargar emprendimientos:', err);
      try {
        const saved = localStorage.getItem('campusventa_mis_puestos');
        if (saved) {
          setEmprendimientos(JSON.parse(saved));
          setLoading(false);
          return;
        }
      } catch {}
      setError(
        err.response?.data?.message ||
        'No pudimos conectar con el servidor de CampusVenta. Verifica que el backend esté en ejecución.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmprendimientos();
  }, [selectedCategoria, onlyDisponibles]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmprendimientos();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategoria('TODOS');
    setSelectedTorre('Todas las zonas');
    setOnlyDisponibles(false);
    setFiltroRapido5Min(false);
    setFiltroMaxPrecio(25);
  };

  // Extraer todos los productos aplanados con los datos de su respectiva tienda
  const allProducts = useMemo(() => {
    const list = [];
    emprendimientos.forEach((emp) => {
      // Combinar productos del backend con productos creados localmente
      let storeProds = Array.isArray(emp.productos) ? [...emp.productos] : [];
      try {
        const cached = localStorage.getItem(`campusventa_products_${emp.id}`);
        if (cached) {
          const localList = JSON.parse(cached);
          if (Array.isArray(localList)) {
            localList.forEach((lp) => {
              if (!storeProds.some((p) => String(p.id) === String(lp.id) || p.nombre === lp.nombre)) {
                storeProds.unshift(lp);
              }
            });
          }
        }
      } catch {}

      if (storeProds.length > 0) {
        storeProds.forEach((prod, idx) => {
          const fallbackBadge =
            idx === 0
              ? 'Más vendido'
              : idx === 1
              ? 'Top Ventas'
              : 'Favorito UTP';

          list.push({
            id: prod.id,
            nombre: prod.nombre,
            descripcion: prod.descripcion || emp.descripcion,
            precio: Number(prod.precio) || Number(emp.precioDesde) || 0,
            imagenUrl: prod.imagenUrl || emp.imagenUrl || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
            badge: prod.badge || fallbackBadge,
            stock: prod.stock,
            categoria: (prod.categoria || emp.categoria || 'COMIDA').toUpperCase(),
            // Datos de la tienda vinculada
            emprendimientoId: emp.id,
            tiendaNombre: emp.nombre,
            vendedorNombre: emp.vendedorNombre || emp.nombre,
            vendedorCarrera: emp.vendedorCarrera,
            vendedorCiclo: emp.vendedorCiclo,
            avatarUrl: emp.avatarUrl,
            torre: emp.torre || 'Campus Piura',
            piso: emp.piso || '',
            tiempoEntrega: emp.tiempoEntrega || 'Entrega ~3 min',
            disponible: prod.disponible !== undefined ? prod.disponible : emp.disponible,
            telefono: emp.telefono,
            whatsapp: emp.whatsapp,
            calificacion: emp.calificacion || '4.9',
            totalResenas: emp.totalResenas || 40,
            tiendaCompleta: emp
          });
        });
      } else {
        list.push({
          id: `emp-${emp.id}`,
          nombre: emp.nombre,
          descripcion: emp.descripcion,
          precio: Number(emp.precioDesde) || 4.5,
          imagenUrl: emp.imagenUrl || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
          badge: emp.calificacion >= 4.8 ? 'Más vendido' : 'Top Ventas',
          stock: null,
          categoria: (emp.categoria || 'COMIDA').toUpperCase(),
          emprendimientoId: emp.id,
          tiendaNombre: emp.nombre,
          vendedorNombre: emp.vendedorNombre || emp.nombre,
          vendedorCarrera: emp.vendedorCarrera,
          vendedorCiclo: emp.vendedorCiclo,
          avatarUrl: emp.avatarUrl,
          torre: emp.torre || 'Campus Piura',
          piso: emp.piso || '',
          tiempoEntrega: emp.tiempoEntrega || 'Entrega ~3 min',
          disponible: emp.disponible,
          telefono: emp.telefono,
          whatsapp: emp.whatsapp,
          calificacion: emp.calificacion || '4.9',
          totalResenas: emp.totalResenas || 40,
          tiendaCompleta: emp
        });
      }
    });
    return list;
  }, [emprendimientos]);

  // Filtrado de productos individuales por categoría, zona, precio, entrega y búsqueda
  const filteredProducts = useMemo(() => {
    return allProducts.filter((prod) => {
      // 1. Filtro de Categoría
      if (selectedCategoria !== 'TODOS') {
        const catNorm = (prod.categoria || '').toUpperCase();
        const selCat = selectedCategoria.toUpperCase();
        const matchCat =
          catNorm === selCat ||
          (selCat === 'POSTRES' && (catNorm.includes('POSTRE') || catNorm.includes('DULCE'))) ||
          (selCat === 'COMIDA' && (catNorm.includes('COMIDA') || catNorm.includes('SNACK') || catNorm.includes('BAJON'))) ||
          (selCat === 'ACCESORIOS' && (catNorm.includes('ACCESORIO') || catNorm.includes('MERCH'))) ||
          (selCat === 'SERVICIOS' && (catNorm.includes('SERVICIO') || catNorm.includes('APUNTE') || catNorm.includes('TUTOR')));
        if (!matchCat) return false;
      }

      // 2. Filtro de Torre / Zona
      if (selectedTorre !== 'Todas las zonas') {
        const torreNorm = (prod.torre || '').toLowerCase();
        const pisoNorm = (prod.piso || '').toLowerCase();
        const selNorm = selectedTorre.toLowerCase();
        const match =
          (selNorm.includes('torre a') && (torreNorm.includes('torre a') || torreNorm.includes('biblioteca') || pisoNorm.includes('biblioteca'))) ||
          (selNorm.includes('torre b') && torreNorm.includes('torre b')) ||
          (selNorm.includes('cancha') && (torreNorm.includes('cancha') || pisoNorm.includes('cancha'))) ||
          torreNorm === selNorm;
        if (!match) return false;
      }

      // 3. Filtro Presupuesto Máximo
      if (filtroMaxPrecio && prod.precio > filtroMaxPrecio) {
        return false;
      }

      // 4. Filtro Rápido < 5 min
      if (filtroRapido5Min && prod.tiempoEntrega && !prod.tiempoEntrega.includes('2') && !prod.tiempoEntrega.includes('3') && !prod.tiempoEntrega.includes('5')) {
        return false;
      }

      // 5. Filtro Disponibles en campus
      if (onlyDisponibles && !prod.disponible) {
        return false;
      }

      // 6. Filtro Búsqueda
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesProd = (prod.nombre || '').toLowerCase().includes(query);
        const matchesDesc = (prod.descripcion || '').toLowerCase().includes(query);
        const matchesStore = (prod.tiendaNombre || '').toLowerCase().includes(query);
        const matchesVendor = (prod.vendedorNombre || '').toLowerCase().includes(query);
        const matchesCat = (prod.categoria || '').toLowerCase().includes(query);
        if (!matchesProd && !matchesDesc && !matchesStore && !matchesVendor && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [allProducts, selectedCategoria, selectedTorre, filtroMaxPrecio, filtroRapido5Min, onlyDisponibles, searchTerm]);

  const totalActivos = useMemo(() => {
    return allProducts.filter((p) => p.disponible).length;
  }, [allProducts]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategoria !== 'TODOS' ||
    selectedTorre !== 'Todas las zonas' ||
    onlyDisponibles ||
    filtroRapido5Min ||
    filtroMaxPrecio < 25;

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased selection:bg-primary/20">
      {/* Floating Animated Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50 liquid-glass-dark text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce-subtle border border-white/20">
          <IconHeart className="w-4 h-4 text-rose-400 shrink-0" filled />
          <span className="font-heading font-bold text-xs sm:text-sm leading-tight">
            {toastMessage}
          </span>
        </div>
      )}

      {/* 1. TOP HEADER LIQUID GLASS */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/60 shadow-sm transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Brand Logo & Campus Tag */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/" className="flex items-center gap-2 text-decoration-none group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl liquid-glass-crimson flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
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

          {/* Center Search Bar & Separated Location Dropdown */}
          <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4 gap-2.5">
            {/* Standalone Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center liquid-glass rounded-full px-4 py-2 border border-white/80 shadow-xs transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <IconSearch className="w-4 h-4 text-text-muted mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="¿Qué se te antoja o necesitas hoy en campus?"
                className="w-full bg-transparent border-none outline-none font-body text-xs sm:text-sm text-text-main placeholder:text-text-muted"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); fetchEmprendimientos(); }}
                  className="p-0.5 text-text-muted hover:text-text-main"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Standalone Location Filter Pill */}
            <div className="shrink-0 flex items-center gap-1.5 liquid-glass rounded-full px-3.5 py-2 border border-white/80 shadow-xs hover:bg-white/90 transition-all">
              <IconLocation className="w-3.5 h-3.5 text-primary shrink-0" />
              <select
                value={selectedTorre}
                onChange={(e) => setSelectedTorre(e.target.value)}
                className="bg-transparent text-xs font-heading font-bold text-text-main border-none outline-none cursor-pointer pr-1"
              >
                {TORRES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 liquid-glass p-1 rounded-full border border-white/70 shadow-xs">
            <Link to="/" className="px-4 py-1.5 rounded-full text-xs font-heading font-bold liquid-glass-dark text-white text-decoration-none shadow-xs">
              Explorar
            </Link>
            <Link to="/pedidos" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-heading font-bold text-text-secondary hover:text-text-main hover:bg-white/60 transition-colors text-decoration-none">
              <span className="material-symbols-outlined text-sm text-primary">favorite</span>
              <span>Mis Pedidos</span>
            </Link>
            {user?.rol === 'vendedor' && (
              <Link to="/panel" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-heading font-bold text-text-secondary hover:text-text-main hover:bg-white/60 transition-colors text-decoration-none">
                <IconStore className="w-3.5 h-3.5 text-primary" />
                <span>Mi Panel</span>
              </Link>
            )}
            <Link to="/perfil" className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold text-text-secondary hover:text-text-main hover:bg-white/60 transition-colors text-decoration-none">
              Perfil
            </Link>
          </nav>

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

        {/* Mobile Search Bar */}
        <div className="lg:hidden px-4 pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="w-full flex items-center liquid-glass rounded-2xl px-3.5 py-2 border border-white/80 shadow-xs">
            <IconSearch className="w-4 h-4 text-text-muted mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar brownies, empanadas, accesorios..."
              className="w-full bg-transparent border-none outline-none font-body text-xs text-text-main placeholder:text-text-muted"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); fetchEmprendimientos(); }}
                className="p-1 text-text-muted hover:text-text-main"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </header>

      {/* 2. AIRY, ELEGANT LIQUID GLASS HERO SECTION (Limpio, Espacioso y Sin Abrumar) */}
      <section className="w-full relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        {/* Soft Ambient Floating Glow */}
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-primary/10 via-rose-500/10 to-amber-300/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-[1280px] mx-auto">
          {/* Main Hero Card Canvas */}
          <div className="liquid-glass-hero rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden flex flex-col gap-3 transition-all duration-300">
            {/* Single Compact Live Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-badge text-xs font-heading font-bold text-text-main shadow-xs">
                <IconSchool className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-bold">UTP Sede Piura</span>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-text-muted">
                <IconVerified className="w-3.5 h-3.5 text-emerald-600" />
                <span>0% comisiones</span>
              </span>
            </div>

            {/* Main Headline & Short Subtitle */}
            <div className="space-y-1.5">
              <h1 className="font-heading text-xl sm:text-3xl lg:text-4xl font-extrabold text-text-main leading-tight tracking-tight">
                ¿Qué se te antoja <span className="text-gradient-crimson">hoy en el campus?</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                Postres caseros, bajones calientes y apuntes entregados directamente en mano entre clases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AUTO-SLIDING CAROUSEL: ACTIVOS AHORA EN CAMPUS */}
      <section className="w-full py-4 overflow-hidden relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="font-heading text-sm sm:text-base font-bold text-text-main">
                Activos Ahora en Campus · Más Vendidos
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full liquid-glass-emerald text-xs font-heading font-bold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>En vivo</span>
              </span>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-xs text-text-muted font-medium">
              <span>Pausa al pasar el cursor</span>
            </span>
          </div>
        </div>

        {/* Continuous Auto-Scrolling Track */}
        <div className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-surface-bg to-transparent z-10"></div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-surface-bg to-transparent z-10"></div>

          <div className="flex animate-marquee gap-3 py-2 px-4">
            {[...(allProducts.length > 0 ? allProducts.slice(0, 10) : []), ...(allProducts.length > 0 ? allProducts.slice(0, 10) : [])].map((prod, idx) => (
              <Link
                key={`${prod.id}-${idx}`}
                to={`/emprendimiento/${prod.emprendimientoId}`}
                className="shrink-0 w-72 liquid-glass-card rounded-2xl p-3 border border-white/80 shadow-xs flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 text-decoration-none"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img
                      src={prod.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={prod.tiendaNombre}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-primary/20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-xs font-bold text-text-main truncate group-hover:text-primary transition-colors">
                        {prod.tiendaNombre}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                        <IconBolt className="w-2.5 h-2.5 text-primary shrink-0" />
                        <span>{prod.tiempoEntrega}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-heading font-extrabold text-xs text-primary px-2 py-0.5 rounded-full liquid-glass border border-white/70">
                    S/ {Number(prod.precio).toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2.5 bg-white/50 p-2 rounded-xl border border-white/60">
                  <img
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-xs font-bold text-text-main truncate">
                      {prod.nombre}
                    </p>
                    <p className="text-[10px] text-text-secondary truncate mt-0.5 flex items-center gap-1">
                      <IconLocation className="w-2.5 h-2.5 text-primary shrink-0" />
                      <span>{prod.torre} · {prod.piso}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CAMPUS LOCATION FILTER BAR (Liquid Glass) */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 liquid-glass rounded-2xl border border-white/80 shadow-xs">
          <div className="flex items-center gap-2 px-2 text-text-main font-heading text-xs font-bold uppercase tracking-wider">
            <IconBuilding className="w-4 h-4 text-primary" />
            <span>Filtrar por zona del campus:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {TORRES.map((torre) => {
              const isSelected = selectedTorre === torre;
              return (
                <button
                  key={torre}
                  type="button"
                  onClick={() => setSelectedTorre(torre)}
                  className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full font-heading text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? 'liquid-glass-crimson text-white shadow-xs scale-[1.02]'
                      : 'liquid-glass-badge text-text-secondary hover:text-text-main hover:bg-white/80 border border-white/60'
                  }`}
                >
                  <IconLocation className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-primary'}`} />
                  <span>{torre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MAIN CONTENT FEED (SIDEBAR FILTERS + PRODUCT CARDS) */}
      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 pb-36 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SIDEBAR FILTERS (DESKTOP) */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-24">
            <div className="liquid-glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="font-heading font-extrabold text-sm text-text-main">Filtros Activos</span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-heading font-bold text-primary hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Categories Navigation */}
              <div className="space-y-2">
                <span className="font-heading text-[11px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Categorías
                </span>
                <div className="flex flex-col gap-1.5">
                  {CATEGORIAS_NAV.map((cat) => {
                    const isActive = selectedCategoria === cat.id;
                    const CatIcon = cat.Icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoria(cat.id)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-heading text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'liquid-glass-crimson text-white shadow-xs'
                            : 'liquid-glass text-text-secondary hover:text-text-main hover:bg-white/90 border border-white/60'
                        }`}
                      >
                        <CatIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Switches */}
              <div className="pt-4 border-t border-border/60 space-y-2 text-xs">
                <span className="font-heading text-[11px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Disponibilidad
                </span>
                <label className="flex items-center justify-between p-2 rounded-xl liquid-glass cursor-pointer transition-colors border border-white/60">
                  <span className="font-medium text-text-main flex items-center gap-2">
                    <IconClock className="w-4 h-4 text-primary" />
                    <span>Entregas en menos de 5 min</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={filtroRapido5Min}
                    onChange={(e) => setFiltroRapido5Min(e.target.checked)}
                    className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl liquid-glass cursor-pointer transition-colors border border-white/60">
                  <span className="font-medium text-text-main flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Disponibles ahora en campus</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyDisponibles}
                    onChange={(e) => setOnlyDisponibles(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Budget slider */}
              <div className="pt-4 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between font-heading text-xs">
                  <span className="text-text-secondary">Presupuesto Max</span>
                  <span className="font-bold text-primary">S/ {filtroMaxPrecio}.00</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={filtroMaxPrecio}
                  onChange={(e) => setFiltroMaxPrecio(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-text-muted text-[11px]">
                  <span>S/ 2</span>
                  <span>S/ 30+</span>
                </div>
              </div>
            </div>

            {/* Campus Testimonial Widget */}
            <div className="liquid-glass-card rounded-3xl p-4 border border-white/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 font-heading text-xs font-bold text-text-main">
                <IconSparkles className="w-4 h-4 text-amber-500" />
                <span>Experiencias en Campus Piura</span>
              </div>
              <div className="liquid-glass p-3 rounded-xl border border-white/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-text-main">Carlos M. (Ing. Sistemas)</span>
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <IconStar className="w-3 h-3 text-amber-500" />
                    <span>5.0</span>
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  "Los brownies me salvaron durante el parcial de Cálculo en Torre B. Entregaron al aula en 3 min."
                </p>
              </div>
            </div>
          </aside>

          {/* MAIN LISTING FEED */}
          <div className="lg:col-span-9 space-y-5">
            {/* Mobile Quick Filter & Category Bar */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {/* Open Full Filter Drawer Button */}
              <button
                type="button"
                onClick={() => setShowMobileFilterModal(true)}
                className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full font-heading text-xs font-bold transition-all shadow-xs ${
                  activeFiltersCount > 0
                    ? 'liquid-glass-crimson text-white scale-[1.02]'
                    : 'liquid-glass text-text-main border border-white/80'
                }`}
              >
                <IconSliders className="w-3.5 h-3.5" />
                <span>Filtros{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}</span>
              </button>

              {/* Quick 5 Min Delivery Toggle */}
              <button
                type="button"
                onClick={() => setFiltroRapido5Min(!filtroRapido5Min)}
                className={`flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-full font-heading text-xs font-bold transition-all border ${
                  filtroRapido5Min
                    ? 'liquid-glass-crimson text-white border-transparent shadow-xs'
                    : 'liquid-glass text-text-secondary border-white/60'
                }`}
              >
                <IconClock className="w-3 h-3" />
                <span>&lt; 5 min</span>
              </button>

              {/* Quick In Campus Toggle */}
              <button
                type="button"
                onClick={() => setOnlyDisponibles(!onlyDisponibles)}
                className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full font-heading text-xs font-bold transition-all border ${
                  onlyDisponibles
                    ? 'liquid-glass-emerald border-emerald-300 font-bold shadow-xs'
                    : 'liquid-glass text-text-secondary border-white/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>En campus</span>
              </button>

              <div className="h-4 w-px bg-border/60 shrink-0 mx-0.5"></div>

              {/* Categories Horizontal Carousel */}
              {CATEGORIAS_NAV.map((cat) => {
                const isActive = selectedCategoria === cat.id;
                const CatIcon = cat.Icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoria(cat.id)}
                    className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full font-heading text-xs font-bold transition-all border ${
                      isActive
                        ? 'liquid-glass-crimson text-white border-transparent shadow-xs'
                        : 'liquid-glass text-text-secondary border-white/60'
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.shortLabel || cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feed Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-main">
                  Productos y Bajones en el campus
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Toca cualquier producto para ver su puesto o pulsa "Ver catálogo completo" para explorar todo lo que ofrece la tienda.
                </p>
              </div>
              <span className="text-xs text-text-muted font-bold font-heading">
                {filteredProducts.length} productos disponibles
              </span>
            </div>

            {/* ESTADO 1: CARGANDO */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="liquid-glass-card rounded-3xl border border-white/80 p-4 space-y-3 animate-pulse">
                    <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ESTADO 2: ERROR */}
            {!loading && error && (
              <div className="liquid-glass-card rounded-3xl p-8 border border-red-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-50 text-primary mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">cloud_off</span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-main">
                  Error al conectar con CampusVenta
                </h3>
                <p className="text-xs text-text-secondary">{error}</p>
                <button
                  onClick={fetchEmprendimientos}
                  className="px-6 py-2.5 rounded-full liquid-glass-crimson text-white font-heading font-bold text-xs shadow-sm hover:brightness-110 transition-all"
                >
                  Reintentar conexión
                </button>
              </div>
            )}

            {/* ESTADO 3: VACÍO */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="liquid-glass-card rounded-3xl p-10 border border-white/80 shadow-sm text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full liquid-glass text-text-muted mx-auto flex items-center justify-center">
                  <IconFastfood className="w-7 h-7 text-primary" />
                </div>
                {hasActiveFilters ? (
                  <>
                    <h3 className="font-heading text-lg font-bold text-text-main">
                      No hay productos con esos filtros
                    </h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Intenta buscar con otros términos, ajusta el presupuesto o cambia la zona seleccionada.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-5 py-2 rounded-full liquid-glass-dark text-white font-heading font-bold text-xs shadow-xs"
                    >
                      Restablecer filtros
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-heading text-lg font-bold text-text-main">
                      Aún no hay productos registrados
                    </h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Sé el primero en registrar tu tienda y publicar tus productos en el campus.
                    </p>
                    <Link
                      to="/nuevo-emprendimiento"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full liquid-glass-crimson text-white font-heading font-bold text-xs shadow-xs text-decoration-none"
                    >
                      <IconAdd className="w-3.5 h-3.5" />
                      <span>Registrar mi tienda</span>
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* PRODUCT CARDS GRID (LIQUID GLASS EN CADA PRODUCTO) */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((prod) => {
                  const isFav = favoritesIds.includes(prod.emprendimientoId);

                  return (
                    <article
                      key={`${prod.emprendimientoId}-${prod.id}`}
                      className="liquid-glass-card rounded-3xl overflow-hidden border border-white/80 shadow-xs hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Card Image Cover with Overlays */}
                        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
                          <img
                            src={prod.imagenUrl}
                            alt={prod.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Top Left: Badge Más Vendido / Top Ventas / etc. (En reemplazo del precio) */}
                          <div className="absolute top-2.5 left-2.5 z-20">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full liquid-glass-crimson text-white font-heading text-[11px] font-extrabold shadow-sm tracking-wide border border-white/30 backdrop-blur-md">
                              <IconSparkles className="w-3 h-3 text-amber-300 shrink-0" />
                              <span>{prod.badge || 'Más vendido'}</span>
                            </span>
                          </div>

                          {/* Top Right Controls: Solo botón de favoritos para no tapar la foto del producto */}
                          <div className="absolute top-2.5 right-2.5 z-20">
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(e, prod.emprendimientoId, prod.tiendaNombre)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-xs active:scale-90 border ${
                                isFav
                                  ? 'bg-white text-rose-500 border-rose-200 shadow-sm scale-105'
                                  : 'liquid-glass bg-white/85 text-text-muted hover:text-rose-500 hover:bg-white border-white/80'
                              }`}
                              title={isFav ? 'Quitar de favoritos' : 'Guardar puesto en favoritos'}
                            >
                              <IconHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" filled={isFav} />
                            </button>
                          </div>

                          {/* Bottom Left Floating Tags on Image: Tiempo de entrega y Stock como etiquetas */}
                          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-20">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full liquid-glass bg-white/90 text-emerald-800 font-heading text-[10px] font-bold shadow-xs border border-white/80 backdrop-blur-md">
                              <IconBolt className="w-3 h-3 text-primary shrink-0" />
                              <span>{prod.tiempoEntrega}</span>
                            </span>
                            {prod.stock && (
                              <span className="px-2.5 py-1 rounded-full liquid-glass bg-white/90 text-text-main font-heading text-[10px] font-bold shadow-xs border border-white/80 backdrop-blur-md">
                                Quedan {prod.stock} u.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body Info */}
                        <div className="p-4 space-y-2">
                          {/* Fila 1: Ubicación en campus y calificación */}
                          <div className="flex items-center justify-between text-xs text-text-secondary">
                            <div className="flex items-center gap-1.5 font-medium truncate min-w-0 pr-1">
                              <IconLocation className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate font-heading text-xs font-bold text-text-main">
                                {prod.torre} · {prod.piso}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-amber-500 font-heading font-bold shrink-0">
                              <IconStar className="w-3 h-3 text-amber-500" />
                              <span>{prod.calificacion || '5.0'}</span>
                            </div>
                          </div>

                          <h3 className="font-heading text-base font-bold text-text-main group-hover:text-primary transition-colors leading-snug line-clamp-1">
                            {prod.nombre}
                          </h3>

                          <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">
                            {prod.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom Actions: Compra directa por WhatsApp y Ver catálogo completo */}
                      <div className="p-4 pt-0 space-y-2">
                        <a
                          href={getProductWhatsAppUrl(prod)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full liquid-glass-crimson hover:brightness-110 text-white font-heading font-bold text-xs shadow-xs transition-all text-decoration-none group/buy"
                        >
                          <IconWhatsApp className="w-4 h-4 text-white shrink-0 group-hover/buy:scale-110 transition-transform" />
                          <span>Pedir por WhatsApp · S/ {Number(prod.precio).toFixed(2)}</span>
                        </a>

                        <Link
                          to={`/emprendimiento/${prod.emprendimientoId}`}
                          className="w-full flex items-center justify-center gap-1 text-[11px] font-heading font-bold text-text-muted hover:text-primary transition-colors py-0.5 text-decoration-none"
                        >
                          <span>Ver catálogo completo de {prod.tiendaNombre}</span>
                          <IconArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>



      {/* MOBILE FULL FILTER DRAWER / BOTTOM SHEET MODAL */}
      {showMobileFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileFilterModal(false)}
          ></div>

          {/* Drawer Card */}
          <div className="relative w-full max-w-lg liquid-glass-card bg-white/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl border border-white/80 p-5 sm:p-6 pb-8 sm:pb-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-4 animate-slide-up">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <IconSliders className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-extrabold text-base text-text-main">
                  Filtros del Campus
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full liquid-glass-crimson text-white text-[10px] font-bold">
                    {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-heading font-bold text-primary hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMobileFilterModal(false)}
                  className="w-7 h-7 rounded-full liquid-glass text-text-muted hover:text-text-main flex items-center justify-center border border-white/60"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Categorías */}
            <div className="space-y-2">
              <span className="font-heading text-xs font-extrabold text-text-muted uppercase tracking-wider block">
                Categoría
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIAS_NAV.map((cat) => {
                  const isActive = selectedCategoria === cat.id;
                  const CatIcon = cat.Icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoria(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl font-heading text-xs font-bold transition-all text-left border ${
                        isActive
                          ? 'liquid-glass-crimson text-white border-transparent shadow-xs'
                          : 'liquid-glass text-text-secondary border-white/60 hover:bg-white/80'
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{cat.shortLabel || cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zona del campus (Torres) */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="font-heading text-xs font-extrabold text-text-muted uppercase tracking-wider block">
                Zona en Campus UTP
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TORRES.map((torre) => {
                  const isSelected = selectedTorre === torre;
                  return (
                    <button
                      key={torre}
                      type="button"
                      onClick={() => setSelectedTorre(torre)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-heading text-xs font-bold transition-all border ${
                        isSelected
                          ? 'liquid-glass-crimson text-white border-transparent shadow-xs'
                          : 'liquid-glass text-text-secondary border-white/60'
                      }`}
                    >
                      <IconLocation className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-primary'}`} />
                      <span>{torre}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
              <span className="font-heading text-xs font-extrabold text-text-muted uppercase tracking-wider block">
                Disponibilidad
              </span>
              <label className="flex items-center justify-between p-2.5 rounded-xl liquid-glass cursor-pointer border border-white/60">
                <span className="font-medium text-text-main flex items-center gap-2">
                  <IconClock className="w-4 h-4 text-primary" />
                  <span>Entregas en menos de 5 min</span>
                </span>
                <input
                  type="checkbox"
                  checked={filtroRapido5Min}
                  onChange={(e) => setFiltroRapido5Min(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl liquid-glass cursor-pointer border border-white/60">
                <span className="font-medium text-text-main flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Disponibles ahora en campus</span>
                </span>
                <input
                  type="checkbox"
                  checked={onlyDisponibles}
                  onChange={(e) => setOnlyDisponibles(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
              </label>
            </div>

            {/* Presupuesto Max Slider */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between font-heading text-xs">
                <span className="font-bold text-text-main">Presupuesto Máximo</span>
                <span className="font-extrabold text-primary">S/ {filtroMaxPrecio}.00</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={filtroMaxPrecio}
                onChange={(e) => setFiltroMaxPrecio(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-text-muted text-[11px]">
                <span>S/ 2</span>
                <span>S/ 30+</span>
              </div>
            </div>

            {/* Botón Aplicar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMobileFilterModal(false)}
                className="w-full py-3 rounded-full liquid-glass-crimson text-white font-heading font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <IconCheck className="w-4 h-4" />
                <span>Ver {filteredProducts.length} productos disponibles</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa de Perfil del Vendedor */}
      <ProfilePreviewModal
        user={selectedSellerProfile}
        isOpen={showSellerModal}
        onClose={() => setShowSellerModal(false)}
      />
    </div>
  );
}
