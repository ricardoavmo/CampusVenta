import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAdminMetricasApi,
  getAdminUsuariosApi,
  updateAdminUsuarioRolApi,
  updateAdminUsuarioEstadoApi,
  getAdminEmprendimientosApi,
  updateAdminEmprendimientoDisponibilidadApi,
  updateAdminEmprendimientoEstadoApi,
  deleteAdminEmprendimientoApi
} from '../services/api';
import {
  IconStore,
  IconStar,
  IconSearch,
  IconVerified,
  IconLocation,
  IconCheck,
  IconClose,
  IconTrash,
  IconSparkles,
  IconClock
} from '../components/Icons';

export default function Admin() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('metricas'); // 'metricas' | 'emprendimientos' | 'usuarios' | 'auditoria'
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Datos del backend
  const [metricas, setMetricas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);

  // Filtros de búsqueda
  const [searchUsuario, setSearchUsuario] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [filtroEstadoUsuario, setFiltroEstadoUsuario] = useState('TODOS');

  const [searchEmp, setSearchEmp] = useState('');
  const [filtroCategoriaEmp, setFiltroCategoriaEmp] = useState('TODOS');
  const [filtroDispEmp, setFiltroDispEmp] = useState('TODOS');

  // Modales
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [deletingStore, setDeletingStore] = useState(false);
  const [userToEditRole, setUserToEditRole] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('COMPRADOR');
  const [updatingRole, setUpdatingRole] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [met, usrs, emps] = await Promise.all([
        getAdminMetricasApi(),
        getAdminUsuariosApi(),
        getAdminEmprendimientosApi(),
      ]);
      setMetricas(met);
      setUsuarios(Array.isArray(usrs) ? usrs : []);
      setEmprendimientos(Array.isArray(emps) ? emps : []);
    } catch (err) {
      console.error('Error al cargar panel de administración:', err);
      showToast('Error al conectar con los servicios de administración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }
    loadAllAdminData();
  }, [isAdmin, navigate]);

  // Actualizar rol de usuario
  const handleConfirmRoleChange = async () => {
    if (!userToEditRole) return;
    try {
      setUpdatingRole(true);
      const updated = await updateAdminUsuarioRolApi(userToEditRole.id, selectedNewRole);
      setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Rol de ${updated.nombre} actualizado a: ${updated.rol}`);
      setUserToEditRole(null);
      // Recargar métricas actualizadas
      const met = await getAdminMetricasApi();
      setMetricas(met);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'No se pudo actualizar el rol.');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Cambiar estado de usuario (activo / suspendido)
  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = !targetUser.activo;
    try {
      const updated = await updateAdminUsuarioEstadoApi(targetUser.id, nextStatus);
      setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Usuario ${updated.nombre} ${updated.activo ? 'activado' : 'suspendido'}.`);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error al cambiar estado del usuario.');
    }
  };

  // Cambiar disponibilidad de puesto
  const handleToggleStoreAvailability = async (targetStore) => {
    const nextDisp = !targetStore.disponible;
    try {
      const updated = await updateAdminEmprendimientoDisponibilidadApi(targetStore.id, nextDisp);
      setEmprendimientos((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      showToast(`Puesto "${updated.nombre}" marcado como: ${updated.disponible ? 'ACTIVO' : 'PAUSADO'}.`);
      const met = await getAdminMetricasApi();
      setMetricas(met);
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar disponibilidad del puesto.');
    }
  };

  // Reactivar o dar de baja puesto (Soft Delete / Borrado Lógico)
  const handleToggleStoreEstado = async (targetStore) => {
    const nextActivo = !targetStore.activo;
    try {
      const updated = await updateAdminEmprendimientoEstadoApi(targetStore.id, nextActivo);
      setEmprendimientos((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      showToast(nextActivo ? `Puesto "${updated.nombre}" reactivado en el campus.` : `Puesto "${updated.nombre}" dado de baja por moderación.`);
      const met = await getAdminMetricasApi();
      setMetricas(met);
    } catch (err) {
      console.error(err);
      showToast('Error al cambiar el estado del puesto.');
    }
  };

  // Eliminar puesto por moderación (Borrado Lógico)
  const handleConfirmDeleteStore = async () => {
    if (!storeToDelete) return;
    try {
      setDeletingStore(true);
      await deleteAdminEmprendimientoApi(storeToDelete.id);
      showToast(`Puesto "${storeToDelete.nombre}" dado de baja (borrado lógico conservado en base de datos).`);
      setStoreToDelete(null);
      loadAllAdminData();
    } catch (err) {
      console.error(err);
      showToast('Error al dar de baja el emprendimiento.');
    } finally {
      setDeletingStore(false);
    }
  };

  // Filtrado de usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const q = searchUsuario.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.nombre && u.nombre.toLowerCase().includes(q)) ||
        (u.codigo && u.codigo.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.carrera && u.carrera.toLowerCase().includes(q));

      const matchRol = filtroRol === 'TODOS' || u.rol === filtroRol;
      const matchEstado =
        filtroEstadoUsuario === 'TODOS' ||
        (filtroEstadoUsuario === 'ACTIVOS' && u.activo) ||
        (filtroEstadoUsuario === 'SUSPENDIDOS' && !u.activo);

      return matchSearch && matchRol && matchEstado;
    });
  }, [usuarios, searchUsuario, filtroRol, filtroEstadoUsuario]);

  // Filtrado de emprendimientos
  const filteredEmprendimientos = useMemo(() => {
    return emprendimientos.filter((e) => {
      const q = searchEmp.toLowerCase().trim();
      const matchSearch =
        !q ||
        (e.nombre && e.nombre.toLowerCase().includes(q)) ||
        (e.propietarioNombre && e.propietarioNombre.toLowerCase().includes(q)) ||
        (e.propietarioCodigo && e.propietarioCodigo.toLowerCase().includes(q)) ||
        (e.torre && e.torre.toLowerCase().includes(q));

      const matchCat = filtroCategoriaEmp === 'TODOS' || e.categoria === filtroCategoriaEmp;
      const matchDisp =
        filtroDispEmp === 'TODOS' ||
        (filtroDispEmp === 'ACTIVOS' && e.disponible) ||
        (filtroDispEmp === 'OFFLINE' && !e.disponible);

      return matchSearch && matchCat && matchDisp;
    });
  }, [emprendimientos, searchEmp, filtroCategoriaEmp, filtroDispEmp]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased pb-20 selection:bg-primary/20">
      {/* Header Ejecutivo de la Consola Administrativa Aislada */}
      <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border-card/60 sticky top-0 z-40 py-3.5 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#BA122D] to-[#D91B3A] flex items-center justify-center text-white font-heading font-black text-base shadow-md shadow-[#BA122D]/20">
              UTP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg text-text-primary tracking-tight">
                  Campus<span className="text-[#BA122D]">Venta</span>
                </span>
                <span className="text-[10px] font-heading font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#BA122D]/10 text-[#BA122D] border border-[#BA122D]/20">
                  CONSOLA AUDITORA
                </span>
              </div>
              <p className="text-[11px] font-heading font-semibold text-text-secondary hidden sm:block">
                Gestión Centralizada, Integridad & Moderación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/configuracion"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Configuración"
            >
              <span className="material-symbols-outlined text-base">settings</span>
              <span>Configuración</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/admin/login', { replace: true });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 text-slate-700 dark:text-slate-200 hover:text-red-600 border border-slate-200/80 hover:border-red-200 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50 liquid-glass-dark text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce-subtle border border-white/20">
          <span className="material-symbols-outlined text-emerald-400 text-lg">admin_panel_settings</span>
          <span className="font-heading font-bold text-xs sm:text-sm leading-tight">{toastMessage}</span>
        </div>
      )}

      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Hero Banner de Administración */}
        <section className="liquid-glass-hero p-5 sm:p-7 rounded-3xl shadow-sm border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-badge text-[#BA122D] font-heading font-bold text-xs uppercase tracking-wider border border-[#BA122D]/20 shadow-xs">
              <span className="material-symbols-outlined text-sm text-[#BA122D]">admin_panel_settings</span>
              <span>Consola Exclusiva de Administración</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight">
              Control & Auditoría <span className="text-gradient-crimson">Campus UTP</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
              Supervisión en tiempo real de estudiantes registrados, puestos activos en Torre A, Torre B y Canchas, catálogo de productos y moderación.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadAllAdminData}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl liquid-glass hover:bg-white text-text-main font-heading font-bold text-xs flex items-center gap-2 border border-white/80 shadow-xs transition-all active:scale-95"
            >
              <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>{loading ? 'Actualizando...' : 'Refrescar Datos'}</span>
            </button>
          </div>
        </section>

        {/* Tab Switcher Pills */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('metricas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === 'metricas'
                ? 'liquid-glass-crimson text-white shadow-xs'
                : 'liquid-glass hover:bg-white/90 text-text-secondary border border-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            <span>Métricas & Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('emprendimientos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === 'emprendimientos'
                ? 'liquid-glass-crimson text-white shadow-xs'
                : 'liquid-glass hover:bg-white/90 text-text-secondary border border-white/60'
            }`}
          >
            <IconStore className="w-4 h-4" />
            <span>Puestos de Venta ({emprendimientos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === 'usuarios'
                ? 'liquid-glass-crimson text-white shadow-xs'
                : 'liquid-glass hover:bg-white/90 text-text-secondary border border-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>Directorio de Estudiantes ({usuarios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === 'auditoria'
                ? 'liquid-glass-crimson text-white shadow-xs'
                : 'liquid-glass hover:bg-white/90 text-text-secondary border border-white/60'
            }`}
          >
            <IconVerified className="w-4 h-4 text-emerald-600" />
            <span>Políticas & Integridad</span>
          </button>
        </section>

        {/* ========================================================== */}
        {/* TAB 1: DASHBOARD DE MÉTRICAS */}
        {/* ========================================================== */}
        {activeTab === 'metricas' && (
          <div className="space-y-6">
            {/* 4 KPIS PRINCIPALES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* KPI 1: Usuarios */}
              <div className="liquid-glass-card rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-extrabold uppercase text-text-muted tracking-wider">
                    Estudiantes UTP
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">school</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main">
                    {metricas?.totalUsuarios || 0}
                  </span>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {metricas?.totalVendedores || 0} vendedores · {metricas?.totalCompradores || 0} compradores
                  </p>
                </div>
              </div>

              {/* KPI 2: Puestos Activos */}
              <div className="liquid-glass-card rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-extrabold uppercase text-text-muted tracking-wider">
                    Puestos en Campus
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <IconStore className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-600">
                      {metricas?.totalEmprendimientosActivos || 0}
                    </span>
                    <span className="text-xs text-text-muted font-bold">
                      / {metricas?.totalEmprendimientos || 0} total
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Actualmente vendiendo en campus
                  </p>
                </div>
              </div>

              {/* KPI 3: Productos */}
              <div className="liquid-glass-card rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-extrabold uppercase text-text-muted tracking-wider">
                    Catálogo Publicado
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main">
                    {metricas?.totalProductos || 0}
                  </span>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Productos registrados por alumnos
                  </p>
                </div>
              </div>

              {/* KPI 4: Reseñas & Calificación */}
              <div className="liquid-glass-card rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-extrabold uppercase text-text-muted tracking-wider">
                    Satisfacción
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <IconStar className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-600">
                      {metricas?.promedioCalificacionCampus ? `${metricas.promedioCalificacionCampus}★` : '—'}
                    </span>
                    <span className="text-xs text-text-muted font-bold">
                      ({metricas?.totalResenas || 0} opiniones)
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    100% verificado con carné UTP
                  </p>
                </div>
              </div>
            </div>

            {/* SEGUNDA FILA: DISTRIBUCIÓN POR ZONAS Y CATEGORÍAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card Zonas */}
              <div className="liquid-glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                    <IconLocation className="w-4 h-4 text-primary" />
                    <span>Puestos por Zonas del Campus</span>
                  </h3>
                  <span className="text-[11px] text-text-muted font-bold">UTP Piura</span>
                </div>
                <div className="space-y-2">
                  {metricas?.distribucionZonas && Object.keys(metricas.distribucionZonas).length > 0 ? (
                    Object.entries(metricas.distribucionZonas).map(([zona, cant]) => {
                      const total = metricas.totalEmprendimientos || 1;
                      const pct = Math.round((cant / total) * 100);
                      return (
                        <div key={zona} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-heading font-bold text-text-main">{zona}</span>
                            <span className="text-text-muted font-medium">{cant} puesto(s) ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-rose-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-text-muted text-center py-4">No hay puestos registrados aún.</p>
                  )}
                </div>
              </div>

              {/* Card Categorías */}
              <div className="liquid-glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">category</span>
                    <span>Distribución por Rubro Estudiantil</span>
                  </h3>
                  <span className="text-[11px] text-text-muted font-bold">Catálogo</span>
                </div>
                <div className="space-y-2">
                  {metricas?.distribucionCategorias && Object.keys(metricas.distribucionCategorias).length > 0 ? (
                    Object.entries(metricas.distribucionCategorias).map(([cat, cant]) => {
                      const total = metricas.totalEmprendimientos || 1;
                      const pct = Math.round((cant / total) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-heading font-bold text-text-main">{cat}</span>
                            <span className="text-text-muted font-medium">{cant} tienda(s) ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-text-muted text-center py-4">No hay tiendas registradas aún.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: GESTIÓN Y MODERACIÓN DE EMPRENDIMIENTOS */}
        {/* ========================================================== */}
        {activeTab === 'emprendimientos' && (
          <div className="space-y-4">
            {/* Barra de Búsqueda y Filtros */}
            <div className="liquid-glass p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <IconSearch className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchEmp}
                  onChange={(e) => setSearchEmp(e.target.value)}
                  placeholder="Buscar puesto, vendedor o código..."
                  className="w-full pl-9 pr-3 py-2 bg-white/80 border border-slate-200 text-xs rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-body"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={filtroCategoriaEmp}
                  onChange={(e) => setFiltroCategoriaEmp(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-slate-200 text-xs rounded-xl outline-none font-heading font-bold text-slate-700"
                >
                  <option value="TODOS">Todas las categorías</option>
                  <option value="POSTRES">Dulces & Postres</option>
                  <option value="COMIDA">Bajones & Comida</option>
                  <option value="ACCESORIOS">Accesorios & Merch</option>
                  <option value="SERVICIOS">Apuntes & Tutorías</option>
                </select>

                <select
                  value={filtroDispEmp}
                  onChange={(e) => setFiltroDispEmp(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-slate-200 text-xs rounded-xl outline-none font-heading font-bold text-slate-700"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="ACTIVOS">Solo Activos en Campus</option>
                  <option value="OFFLINE">Solo Offline</option>
                </select>
              </div>
            </div>

            {/* Lista / Tabla de Puestos */}
            {filteredEmprendimientos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmprendimientos.map((emp) => (
                  <div
                    key={emp.id}
                    className="liquid-glass-card rounded-3xl p-4 border border-white/80 shadow-xs flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {emp.avatarUrl ? (
                            <img
                              src={emp.avatarUrl}
                              alt={emp.nombre}
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs bg-white"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white font-heading font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
                              {emp.nombre ? emp.nombre.charAt(0).toUpperCase() : 'P'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] font-heading font-extrabold uppercase px-2 py-0.5 rounded-full liquid-glass-badge text-secondary border border-secondary/20">
                              {emp.categoria}
                            </span>
                            <h3 className="font-heading font-bold text-base text-text-main truncate mt-1">
                              {emp.nombre}
                            </h3>
                            <p className="text-xs text-text-secondary truncate">
                              Por {emp.propietarioNombre || 'Estudiante'} ({emp.propietarioCodigo || 'UTP'})
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold shrink-0 ${
                            !emp.activo
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : emp.disponible
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {!emp.activo ? 'Dado de Baja' : emp.disponible ? 'Activo en Campus' : 'Pausado'}
                        </span>
                      </div>

                      <div className="mt-3 liquid-glass p-2.5 rounded-2xl border border-white/60 text-xs space-y-1 text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-medium">
                            <IconLocation className="w-3.5 h-3.5 text-primary" />
                            <span>{emp.torre} · {emp.piso}</span>
                          </span>
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">
                            <IconStar className="w-3.5 h-3.5 text-amber-500" />
                            <span>{emp.calificacion ? Number(emp.calificacion).toFixed(1) : 'Nuevo'}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-text-muted">
                          <span>{emp.totalProductos} productos en venta</span>
                          <span>{emp.totalResenas} reseñas</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones de Moderador con Soft Delete */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                      {emp.activo ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleStoreAvailability(emp)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                              emp.disponible
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            title="Alternar disponibilidad del puesto"
                          >
                            {emp.disponible ? 'Pausar Puesto' : 'Activar Puesto'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/emprendimiento/${emp.id}`}
                              className="p-1.5 rounded-xl liquid-glass hover:bg-white text-text-main transition-colors shadow-2xs text-decoration-none"
                              title="Ver ficha pública"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setStoreToDelete(emp)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors shadow-2xs"
                              title="Dar de baja por moderación (Borrado Lógico)"
                            >
                              <IconTrash className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[11px] text-red-600 font-heading font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">block</span>
                            <span>Inactivo por moderación</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStoreEstado(emp)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-heading font-bold transition-colors"
                            title="Reactivar puesto en el campus"
                          >
                            Reactivar Puesto
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="liquid-glass-card rounded-3xl p-10 border border-white/80 text-center space-y-2 max-w-md mx-auto shadow-xs">
                <span className="material-symbols-outlined text-3xl text-text-muted">search_off</span>
                <h3 className="font-heading font-bold text-base text-text-main">No se encontraron puestos</h3>
                <p className="text-xs text-text-secondary">Prueba ajustando los términos de búsqueda o los filtros.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: DIRECTORIO DE ESTUDIANTES & CONTROL DE ROLES */}
        {/* ========================================================== */}
        {activeTab === 'usuarios' && (
          <div className="space-y-4">
            {/* Barra de Búsqueda y Filtros */}
            <div className="liquid-glass p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <IconSearch className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUsuario}
                  onChange={(e) => setSearchUsuario(e.target.value)}
                  placeholder="Buscar por nombre, código UTP o correo..."
                  className="w-full pl-9 pr-3 py-2 bg-white/80 border border-slate-200 text-xs rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-body"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-slate-200 text-xs rounded-xl outline-none font-heading font-bold text-slate-700"
                >
                  <option value="TODOS">Todos los roles</option>
                  <option value="COMPRADOR">Comprador</option>
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="ADMIN">Administrador</option>
                </select>

                <select
                  value={filtroEstadoUsuario}
                  onChange={(e) => setFiltroEstadoUsuario(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-slate-200 text-xs rounded-xl outline-none font-heading font-bold text-slate-700"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="ACTIVOS">Solo Activos</option>
                  <option value="SUSPENDIDOS">Solo Suspendidos</option>
                </select>
              </div>
            </div>

            {/* Tabla de Usuarios */}
            {filteredUsuarios.length > 0 ? (
              <div className="liquid-glass-card rounded-3xl border border-white/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface/50 text-text-muted font-heading font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="p-3.5 pl-5">Estudiante</th>
                        <th className="p-3.5">Código / Correo</th>
                        <th className="p-3.5">Carrera / Ciclo</th>
                        <th className="p-3.5 text-center">Rol Actual</th>
                        <th className="p-3.5 text-center">Estado</th>
                        <th className="p-3.5 pr-5 text-right">Acciones Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredUsuarios.map((usr) => {
                        const isSelf = user?.id === usr.id;
                        return (
                          <tr key={usr.id} className="hover:bg-white/40 transition-colors">
                            <td className="p-3.5 pl-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full liquid-glass-crimson text-white flex items-center justify-center font-heading font-bold text-xs shrink-0 shadow-2xs">
                                  {usr.nombre ? usr.nombre.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-heading font-bold text-text-main block truncate">
                                    {usr.nombre} {isSelf && <span className="text-primary text-[10px]">(Tú)</span>}
                                  </span>
                                  <span className="text-[10px] text-text-muted">
                                    {usr.totalEmprendimientos > 0 ? `${usr.totalEmprendimientos} puesto(s)` : 'Sin puestos'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="font-mono font-bold text-primary block">
                                {usr.codigo}
                              </span>
                              <span className="text-[11px] text-text-secondary truncate block">
                                {usr.email}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="text-text-main font-medium block">
                                {usr.carrera || 'No registrada'}
                              </span>
                              <span className="text-[10px] text-text-muted">
                                {usr.ciclo || 'Campus Piura'}
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold uppercase ${
                                  usr.rol === 'ADMIN'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : usr.rol === 'VENDEDOR'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {usr.rol === 'ADMIN' && <span className="material-symbols-outlined text-[11px]">shield</span>}
                                <span>{usr.rol}</span>
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-heading font-bold ${
                                  usr.activo
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {usr.activo ? 'Activo' : 'Suspendido'}
                              </span>
                            </td>

                            <td className="p-3.5 pr-5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setUserToEditRole(usr);
                                  setSelectedNewRole(usr.rol);
                                }}
                                className="px-2.5 py-1.5 rounded-xl liquid-glass hover:bg-white text-text-main font-heading font-bold text-xs border border-white/80 shadow-2xs transition-all"
                                title="Cambiar rol del usuario"
                              >
                                Cambiar Rol
                              </button>

                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(usr)}
                                  className={`px-2.5 py-1.5 rounded-xl font-heading font-bold text-xs transition-all ${
                                    usr.activo
                                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                  title={usr.activo ? 'Suspender acceso' : 'Reactivar acceso'}
                                >
                                  {usr.activo ? 'Suspender' : 'Activar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="liquid-glass-card rounded-3xl p-10 border border-white/80 text-center space-y-2 max-w-md mx-auto shadow-xs">
                <span className="material-symbols-outlined text-3xl text-text-muted">person_search</span>
                <h3 className="font-heading font-bold text-base text-text-main">No se encontraron estudiantes</h3>
                <p className="text-xs text-text-secondary">Prueba buscando con otro término o limpiando los filtros.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: AUDITORÍA & POLÍTICAS INSTITUCIONALES */}
        {/* ========================================================== */}
        {activeTab === 'auditoria' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="liquid-glass-card rounded-3xl p-6 border border-white/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <IconVerified className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-text-main">
                    Reglas Institucionales de Acceso
                  </h3>
                  <p className="text-xs text-text-secondary">Políticas vigentes aplicadas por backend</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-text-secondary leading-relaxed">
                <div className="liquid-glass p-3 rounded-2xl border border-white/60 space-y-1">
                  <span className="font-heading font-bold text-text-main flex items-center gap-1.5">
                    <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dominio Obligatorio @utp.edu.pe</span>
                  </span>
                  <p className="text-[11px] text-text-muted">
                    No se admiten registros con correos personales (Gmail, Outlook, etc.). Todo usuario es verificado institucionalmente.
                  </p>
                </div>

                <div className="liquid-glass p-3 rounded-2xl border border-white/60 space-y-1">
                  <span className="font-heading font-bold text-text-main flex items-center gap-1.5">
                    <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Código de Estudiante Estricto (U + 8 dígitos)</span>
                  </span>
                  <p className="text-[11px] text-text-muted">
                    Validado tanto por expresión regular en cliente como en la entidad JPA de PostgreSQL.
                  </p>
                </div>

                <div className="liquid-glass p-3 rounded-2xl border border-white/60 space-y-1">
                  <span className="font-heading font-bold text-text-main flex items-center gap-1.5">
                    <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seguridad Stateless JWT con BCrypt</span>
                  </span>
                  <p className="text-[11px] text-text-muted">
                    Las contraseñas no se almacenan en texto plano y los tokens tienen expiración a 24 horas.
                  </p>
                </div>
              </div>
            </div>

            <div className="liquid-glass-card rounded-3xl p-6 border border-white/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">security</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-text-main">
                    Cero Datos Simulados
                  </h3>
                  <p className="text-xs text-text-secondary">Persistencia permanente en PostgreSQL</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                El inicializador destructivo <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px]">DataInitializer.java</code> fue eliminado de la aplicación. Cualquier puesto, reseña o producto creado por los alumnos en campus se conserva permanentemente en la base de datos sin truncados automáticos al reiniciar.
              </p>

              <div className="liquid-glass p-4 rounded-2xl border border-white/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-heading font-bold text-text-main block">Estado de la Base de Datos</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">PostgreSQL 5432 · campusventa activo</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CAMBIAR ROL DE USUARIO */}
      {userToEditRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
                <h3 className="font-heading font-bold text-base text-slate-900">Cambiar Rol</h3>
              </div>
              <button
                type="button"
                onClick={() => setUserToEditRole(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>Estudiante: <strong className="text-slate-900">{userToEditRole.nombre}</strong></p>
              <p>Código: <code className="font-mono text-primary font-bold">{userToEditRole.codigo}</code></p>
            </div>

            <div className="space-y-1.5">
              <label className="font-heading font-bold text-xs text-slate-700">Seleccionar nuevo rol:</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs font-heading font-bold text-slate-800 rounded-xl outline-none focus:border-primary focus:bg-white"
              >
                <option value="COMPRADOR">COMPRADOR (Estudiante regular)</option>
                <option value="VENDEDOR">VENDEDOR (Emprendedor con puesto)</option>
                <option value="ADMIN">ADMIN (Acceso total a consola)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToEditRole(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-heading font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={updatingRole}
                className="flex-1 py-2.5 rounded-xl liquid-glass-crimson text-white text-xs font-heading font-bold shadow-xs hover:brightness-110 disabled:opacity-50"
              >
                {updatingRole ? 'Guardando...' : 'Aplicar Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ELIMINAR PUESTO (MODERACIÓN) */}
      {storeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <IconTrash className="w-6 h-6 text-red-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-heading font-bold text-base text-slate-900">
                ¿Dar de baja puesto por moderación?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Estás a punto de dar de baja a <strong>"{storeToDelete.nombre}"</strong>. Esta acción cambiará el estado del puesto a inactivo sin borrar ningún dato de la base de datos (Borrado Lógico) y podrás reactivarlo en cualquier momento.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStoreToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-heading font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStore}
                disabled={deletingStore}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold shadow-xs disabled:opacity-50"
              >
                {deletingStore ? 'Aplicando baja...' : 'Dar de Baja'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
