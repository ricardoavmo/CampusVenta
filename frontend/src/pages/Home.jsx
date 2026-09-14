import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getEmprendimientos } from '../services/api';

const CATEGORIAS_NAV = [
  { id: 'TODOS', label: 'En Vivo en el Campus', icon: 'sensors' },
  { id: 'POSTRES', label: 'Dulces & Postres', icon: 'bakery_dining' },
  { id: 'COMIDA', label: 'Bajones & Snacks', icon: 'lunch_dining' },
  { id: 'ACCESORIOS', label: 'Accesorios & Merch', icon: 'shopping_bag' },
  { id: 'SERVICIOS', label: 'Apuntes & Tutorías', icon: 'menu_book' },
];

const TORRES = [
  'Todas las zonas',
  'Torre A (10 pisos)',
  'Torre B (7 pisos)',
  'Biblioteca',
  'Canchas'
];

export default function Home() {
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('TODOS');
  const [selectedTorre, setSelectedTorre] = useState('Todas las zonas');
  const [onlyDisponibles, setOnlyDisponibles] = useState(false);
  const [filtroRapido5Min, setFiltroRapido5Min] = useState(false);
  const [filtroMaxPrecio, setFiltroMaxPrecio] = useState(25);

  const fetchEmprendimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategoria !== 'TODOS') params.categoria = selectedCategoria;
      if (onlyDisponibles) params.disponible = true;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await getEmprendimientos(params);
      setEmprendimientos(data);
    } catch (err) {
      console.error('Error al cargar emprendimientos:', err);
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

  // Filtrado del lado del cliente para torre real UTP y precio max
  const filteredEmprendimientos = useMemo(() => {
    return emprendimientos.filter((emp) => {
      if (selectedTorre !== 'Todas las zonas') {
        const torreNorm = (emp.torre || '').toLowerCase();
        const selNorm = selectedTorre.toLowerCase();
        const match =
          (selNorm.includes('torre a') && torreNorm.includes('torre a')) ||
          (selNorm.includes('torre b') && torreNorm.includes('torre b')) ||
          (selNorm.includes('biblioteca') && torreNorm.includes('biblioteca')) ||
          (selNorm.includes('cancha') && torreNorm.includes('cancha')) ||
          torreNorm === selNorm;
        if (!match) return false;
      }
      if (filtroMaxPrecio && emp.precioDesde && Number(emp.precioDesde) > filtroMaxPrecio) {
        return false;
      }
      return true;
    });
  }, [emprendimientos, selectedTorre, filtroMaxPrecio]);

  const totalActivos = useMemo(() => {
    return emprendimientos.filter((e) => e.disponible).length;
  }, [emprendimientos]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategoria !== 'TODOS' ||
    selectedTorre !== 'Todas las zonas' ||
    onlyDisponibles ||
    filtroMaxPrecio < 25;

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased">
      {/* 1. TOP HEADER STITCH MARKETPLACE */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Campus Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-brutal transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-2xl">storefront</span>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-primary">
                Campus<span className="text-secondary">Venta</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-primary font-heading font-bold text-xs uppercase tracking-wider border border-primary/20">
              <span className="material-symbols-outlined text-sm">school</span>
              <span>UTP Sede Piura</span>
            </span>
          </div>

          {/* Center Search Bar with Tower Dropdown */}
          <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center bg-surface-container rounded-full px-4 py-1.5 border border-border shadow-brutal">
              <span className="material-symbols-outlined text-text-muted mr-2 text-xl">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="¿Qué se te antoja o necesitas hoy en campus?"
                className="w-full bg-transparent border-none outline-none font-body text-sm text-text-main placeholder:text-text-muted"
              />
              <select
                value={selectedTorre}
                onChange={(e) => setSelectedTorre(e.target.value)}
                className="shrink-0 bg-surface text-xs font-heading font-bold text-text-main px-3 py-1 rounded-full border border-border outline-none cursor-pointer hover:bg-surface-container transition-colors"
              >
                {TORRES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </form>
          </div>

          {/* Right Header Status Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-container text-accent font-heading font-bold text-xs border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span>{totalActivos} Activos en Campus</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Perfil estudiante"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-accent/30"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-white"></span>
              </div>
              <div className="hidden md:flex flex-col">
                <span className="font-heading text-xs font-bold text-text-main leading-tight">Comunidad</span>
                <span className="text-[11px] text-text-muted leading-tight">UTP Piura</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TOP LIVE CAMPUS RADAR HERO BANNER */}
      <section className="w-full relative overflow-hidden bg-surface border-b border-border px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6 relative z-10">
          {/* Live Ticker Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-dark text-white px-5 py-2.5 rounded-full shadow-brutal-primary">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                <span className="material-symbols-outlined text-xs">bolt</span>
              </span>
              <p className="font-heading font-bold text-xs sm:text-sm tracking-wide truncate">
                <span className="text-teal-300 font-extrabold uppercase">¡Actividad en campus!</span>
                <span className="hidden sm:inline"> — Hay </span>
                <strong className="text-white">{totalActivos} estudiantes</strong> vendiendo hoy entre clases
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-300 shrink-0 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>En vivo Sede Piura</span>
            </div>
          </div>

          {/* Hero Headline (Clean, Large Typography, No Wavy Lines, No Top Delivery Box) */}
          <div className="pt-2">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary-container text-secondary font-heading text-xs uppercase tracking-wider font-extrabold border border-border">
                <span className="material-symbols-outlined text-sm text-primary">verified</span>
                <span>Marketplace Oficial Estudiantil</span>
                <span>·</span>
                <span>Cero Comisiones</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-main leading-[1.1] tracking-tight">
                ¿Qué se te antoja <span className="text-primary">hoy en el campus?</span>
              </h1>

              <p className="text-text-secondary text-sm sm:text-base max-w-2xl leading-relaxed">
                Postres caseros, bajones calientes, accesorios y apuntes que compañeros de carrera entregan en mano en Torre A, Torre B, Biblioteca y Canchas de la UTP Piura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AUTO-SLIDING CAROUSEL: ACTIVOS AHORA EN CAMPUS · MÁS VENDIDOS */}
      <section className="w-full bg-surface-container/40 border-b border-border py-6 overflow-hidden relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping"></span>
              <h2 className="font-heading text-base font-bold text-text-main">
                Activos Ahora en Campus · Más Vendidos
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-container text-accent font-heading text-[11px] font-bold border border-accent/20">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                <span>En vivo</span>
              </span>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-xs text-text-muted font-medium">
              <span>Pausa al pasar el cursor</span>
              <span className="material-symbols-outlined text-xs">motion_photos_pause</span>
            </span>
          </div>
        </div>

        {/* Continuous Auto-Scrolling Track */}
        <div className="relative w-full overflow-hidden">
          {/* Subtle Side Fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-surface-bg to-transparent z-10"></div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-surface-bg to-transparent z-10"></div>

          <div className="flex animate-marquee gap-4 py-2 px-4">
            {/* Duplicated list for seamless infinite loop */}
            {[...(emprendimientos.length > 0 ? emprendimientos : []), ...(emprendimientos.length > 0 ? emprendimientos : [])].map((emp, idx) => (
              <Link
                key={`${emp.id}-${idx}`}
                to={`/emprendimiento/${emp.id}`}
                className="shrink-0 w-72 bg-surface p-4 rounded-2xl border border-border shadow-brutal flex flex-col justify-between hover:-translate-y-1 hover:shadow-brutal-primary transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative p-0.5 rounded-full bg-primary/20 shrink-0">
                    <img
                      src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={emp.vendedorNombre || emp.nombre}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-white"></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-xs font-bold text-text-main truncate group-hover:text-primary transition-colors">
                      {emp.vendedorNombre || emp.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-accent font-bold mt-0.5">
                      <span className="material-symbols-outlined text-xs">bolt</span>
                      <span>{emp.tiempoEntrega || 'Entrega en ~3 min'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 bg-surface-container p-2.5 rounded-xl border border-border">
                  <p className="font-heading text-xs font-bold text-text-main line-clamp-1">
                    {emp.productos && emp.productos.length > 0 ? emp.productos[0].nombre : emp.nombre}
                  </p>
                  <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-border/60">
                    <div className="flex items-center gap-1 text-text-secondary min-w-0 font-medium">
                      <span className="material-symbols-outlined text-primary text-xs">location_on</span>
                      <span className="truncate">{emp.torre} · {emp.piso}</span>
                    </div>
                    <span className="font-heading font-extrabold text-primary shrink-0 ml-1">
                      S/ {emp.precioDesde ? Number(emp.precioDesde).toFixed(2) : '3.50'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CAMPUS LOCATION FILTER BAR (BELOW INFORMATION & CAROUSEL) */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 bg-surface rounded-2xl border border-border shadow-brutal">
          <div className="flex items-center gap-2 px-2 text-text-main font-heading text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-primary text-lg">near_me</span>
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
                  className={`flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full font-heading text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-brutal'
                      : 'bg-surface-container text-text-secondary hover:bg-surface-container-high border border-border'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  <span>{torre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MAIN PRODUCT FEED & SIDEBAR GRID */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT FILTER SIDEBAR */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-28">
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-brutal space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-text-main">Filtros Rápidos</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Categorías del Campus */}
              <div className="space-y-2">
                <span className="font-heading text-[11px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Categoría
                </span>
                <div className="flex flex-col gap-1.5">
                  {CATEGORIAS_NAV.map((cat) => {
                    const isActive = selectedCategoria === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoria(cat.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-heading text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-primary text-white shadow-brutal'
                            : 'bg-surface text-text-secondary hover:bg-surface-container hover:text-text-main border border-transparent hover:border-border'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base shrink-0">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Switches */}
              <div className="pt-4 border-t border-border space-y-2 text-xs">
                <span className="font-heading text-[11px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Disponibilidad
                </span>
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container cursor-pointer transition-colors border border-transparent hover:border-border">
                  <span className="font-medium text-text-main flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">schedule</span>
                    <span>Entregas en menos de 5 min</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={filtroRapido5Min}
                    onChange={(e) => setFiltroRapido5Min(e.target.checked)}
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container cursor-pointer transition-colors border border-transparent hover:border-border">
                  <span className="font-medium text-text-main flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-accent">check_circle</span>
                    <span>Disponibles ahora en campus</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyDisponibles}
                    onChange={(e) => setOnlyDisponibles(e.target.checked)}
                    className="w-4 h-4 rounded text-accent accent-accent"
                  />
                </label>
              </div>

              {/* Budget slider */}
              <div className="pt-4 border-t border-border space-y-2">
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

            {/* Campus Testimonials Widget */}
            <div className="bg-surface-container p-5 rounded-2xl border border-border space-y-3">
              <div className="flex items-center gap-2 font-heading text-xs font-bold text-text-main">
                <span className="material-symbols-outlined text-accent text-lg">thumb_up</span>
                <span>Experiencias en Campus Piura</span>
              </div>
              <div className="bg-surface p-3.5 rounded-xl border border-border space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-text-main">Carlos M. (Ing. Sistemas)</span>
                  <span className="text-rating font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
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
          <div className="lg:col-span-9 space-y-6">
            {/* Mobile Categories Bar */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIAS_NAV.map((cat) => {
                const isActive = selectedCategoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoria(cat.id)}
                    className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full font-heading text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-brutal'
                        : 'bg-surface text-text-secondary border border-border'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feed Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
              <div>
                <h2 className="font-heading text-2xl font-bold text-text-main">
                  Puestos activos en el campus
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Pide por WhatsApp, coordina tu punto de encuentro y paga con Yape o Plin al instante
                </p>
              </div>
              <span className="text-xs text-text-muted font-bold font-heading">
                {filteredEmprendimientos.length} tiendas disponibles
              </span>
            </div>

            {/* ESTADO 1: CARGANDO */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-surface rounded-2xl border border-border shadow-brutal overflow-hidden animate-pulse flex flex-col justify-between">
                    <div className="w-full aspect-[4/3] bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="h-10 bg-gray-200 rounded-full w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ESTADO 2: ERROR */}
            {!loading && error && (
              <div className="bg-surface rounded-2xl p-8 border border-red-200 shadow-brutal text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-50 text-primary mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">cloud_off</span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-main">
                  Error al conectar con CampusVenta
                </h3>
                <p className="text-xs text-text-secondary">{error}</p>
                <button
                  onClick={fetchEmprendimientos}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-heading font-bold text-xs shadow-brutal hover:bg-primary-hover transition-all"
                >
                  Reintentar conexión
                </button>
              </div>
            )}

            {/* ESTADO 3: VACÍO */}
            {!loading && !error && filteredEmprendimientos.length === 0 && (
              <div className="bg-surface rounded-2xl p-10 border border-border shadow-brutal text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-surface-container text-text-muted mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">storefront</span>
                </div>
                {hasActiveFilters ? (
                  <>
                    <h3 className="font-heading text-lg font-bold text-text-main">
                      No hay productos con esos filtros
                    </h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Intenta buscar con otros términos o cambia la zona seleccionada.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-5 py-2 rounded-full bg-dark text-white font-heading font-bold text-xs shadow-brutal"
                    >
                      Restablecer filtros
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-heading text-lg font-bold text-text-main">
                      Aún no hay emprendimientos registrados
                    </h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      La base de datos está vacía. Pronto los estudiantes publicarán sus productos.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* PRODUCT CARDS GRID */}
            {!loading && !error && filteredEmprendimientos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEmprendimientos.map((emp) => {
                  const topProduct = emp.productos && emp.productos.length > 0 ? emp.productos[0] : null;
                  const coverImage = topProduct?.imagenUrl || emp.imagenUrl || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80';

                  return (
                    <article
                      key={emp.id}
                      className="bg-surface rounded-2xl overflow-hidden border border-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-primary transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Card Image Cover with Overlays */}
                        <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
                          <img
                            src={coverImage}
                            alt={emp.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Floating Price Tag */}
                          <div className="absolute top-3 left-3 bg-surface px-2.5 py-1 rounded-full shadow-brutal flex items-center gap-1 border border-border">
                            <span className="font-heading text-xs font-extrabold text-primary">
                              Desde S/ {emp.precioDesde ? Number(emp.precioDesde).toFixed(2) : '0.00'}
                            </span>
                          </div>

                          {/* Seller Handle Overlay */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-border">
                            <span className={`w-2 h-2 rounded-full ${emp.disponible ? 'bg-accent animate-pulse' : 'bg-gray-400'}`}></span>
                            <span className="font-heading text-[11px] font-bold text-text-main">
                              {emp.vendedorNombre ? `@${emp.vendedorNombre.toLowerCase().replace(/\s+/g, '')}` : `@tienda${emp.id}`}
                            </span>
                          </div>

                          {/* Location Pill Overlay */}
                          <div className="absolute bottom-3 left-3 right-3 bg-surface/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center justify-between text-text-main shadow-sm border border-border">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="material-symbols-outlined text-primary text-base">location_on</span>
                              <span className="font-heading text-xs font-bold truncate">
                                {emp.torre} · {emp.piso}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-accent-container text-accent font-heading text-[10px] font-extrabold shrink-0">
                              {emp.disponible ? 'En campus' : 'Offline'}
                            </span>
                          </div>
                        </div>

                        {/* Body Info */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-rating font-heading font-bold">
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span>{emp.calificacion || '4.9'}</span>
                              <span className="text-text-muted font-normal">({emp.totalResenas || 80}+ pedidos)</span>
                            </div>
                            {topProduct?.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary font-heading text-[10px] font-bold">
                                {topProduct.badge}
                              </span>
                            )}
                          </div>

                          <h3 className="font-heading text-base font-bold text-text-main group-hover:text-primary transition-colors leading-snug">
                            {emp.nombre}
                          </h3>

                          <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">
                            {emp.descripcion}
                          </p>

                          {/* Store Products Carousel / Multi-Product Indicator */}
                          {emp.productos && emp.productos.length > 0 && (
                            <div className="pt-2 border-t border-border/80">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block mb-1">
                                Catálogo disponible ({emp.productos.length} productos):
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {emp.productos.slice(0, 3).map((prod) => (
                                   <span
                                    key={prod.id}
                                    className="px-2 py-0.5 rounded-md bg-surface-container text-text-main text-[11px] font-medium border border-border truncate max-w-[150px]"
                                  >
                                    {prod.nombre} · S/{Number(prod.precio).toFixed(2)}
                                  </span>
                                ))}
                                {emp.productos.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-surface-container text-text-muted text-[10px] font-bold">
                                    +{emp.productos.length - 3} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="p-4 pt-0 space-y-2">
                        <Link
                          to={`/emprendimiento/${emp.id}`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-dark hover:bg-text-main text-white font-heading font-bold text-xs shadow-brutal transition-all"
                        >
                          <span>Ver catálogo completo ({emp.productos?.length || 1} prod.)</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-text-main">CampusVenta</span>
            <span>·</span>
            <span>Marketplace Estudiantil UTP Sede Piura</span>
          </div>
          <p>© 2026 Diseñado para la comunidad universitaria UTP Piura</p>
        </div>
      </footer>
    </div>
  );
}
