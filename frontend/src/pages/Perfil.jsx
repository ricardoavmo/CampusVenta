import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { eliminarEmprendimiento } from '../services/api';
import ProfilePreviewModal, { PLATFORMS_CONFIG } from '../components/ProfilePreviewModal';
import {
  IconStore,
  IconSchool,
  IconCheck,
  IconEdit,
  IconPhoto,
  IconVerified,
  IconSparkles,
  IconArrowBack,
  IconClose,
  IconTrash,
  IconAdd,
  IconBolt,
  IconClock
} from '../components/Icons';

const DEFAULT_MIS_PUESTOS = [
  {
    id: 1,
    nombre: 'SweetHub UTP',
    categoria: 'POSTRES',
    torre: 'Torre A',
    piso: 'Piso 2',
    referencia: 'Frente a los ascensores',
    disponible: true,
    horarioAtencion: 'Lun - Vie: 9:00 AM - 6:00 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    calificacion: 4.9,
    totalResenas: 14,
    tiempoEntrega: '2-5 min',
    descripcion: 'Brownies artesanales, galletas con chispas Hershey y frappés.',
    productosCount: 3,
  },
  {
    id: 3,
    nombre: 'Pixel UTP Merch & Stickers',
    categoria: 'ACCESORIOS',
    torre: 'Torre B',
    piso: 'Piso 1',
    referencia: 'Cerca a las bancas techadas',
    disponible: true,
    horarioAtencion: 'Lun - Sáb: 10:00 AM - 7:00 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=200',
    calificacion: 5.0,
    totalResenas: 8,
    tiempoEntrega: '~3 min',
    descripcion: 'Stickers de programación, llaveros y accesorios para laptops.',
    productosCount: 2,
  },
];

export default function Perfil() {
  const { user, isSeller, login, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRegisterStoreModal, setShowRegisterStoreModal] = useState(false);

  // Lista de puestos del usuario
  const [misPuestos, setMisPuestos] = useState(() => {
    try {
      const saved = localStorage.getItem('campusventa_mis_puestos');
      return saved ? JSON.parse(saved) : DEFAULT_MIS_PUESTOS;
    } catch {
      return DEFAULT_MIS_PUESTOS;
    }
  });

  const [activeStoreId, setActiveStoreId] = useState(() => {
    const saved = localStorage.getItem('campusventa_active_store_id');
    return saved ? Number(saved) : 1;
  });

  // Modal de confirmación para eliminar puesto
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [deletingStore, setDeletingStore] = useState(false);

  // Form State para creación rápida de tienda dentro del perfil
  const [storeFormData, setStoreFormData] = useState({
    nombre: '',
    categoria: 'POSTRES',
    torre: 'Torre A',
    piso: 'Piso 4',
    telefono: user?.telefono || '972341311',
    tiempoEntrega: 'Entrega en ~3 min',
    horarioAtencion: 'Lun - Vie: 9:00 AM - 6:00 PM',
    descripcion: '',
    avatarUrl: '', // Foto o logo oficial de la tienda
  });

  const handleStoreFormAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('La foto de la tienda no debe superar los 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setStoreFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
      showToast('Foto/Logo de la tienda cargado con éxito.');
    };
    reader.readAsDataURL(file);
  };

  const handleInstantBecomeSeller = () => {
    loginAsDemo('vendedor');
    showToast('¡Ahora eres vendedor oficial de CampusVenta!');
  };

  const handleSelectStore = (storeId) => {
    setActiveStoreId(storeId);
    localStorage.setItem('campusventa_active_store_id', String(storeId));
    const target = misPuestos.find((s) => s.id === storeId);
    if (target) {
      const updatedUser = {
        ...user,
        rol: 'vendedor',
        tiendaNombre: target.nombre,
        emprendimientoId: target.id,
      };
      login(updatedUser);
    }
    navigate(`/panel?storeId=${storeId}`);
  };

  const handleConfirmDeleteStore = async () => {
    if (!storeToDelete) return;
    const targetId = storeToDelete.id;
    setDeletingStore(true);
    try {
      try {
        await eliminarEmprendimiento(targetId);
      } catch (err) {
        console.warn('Backend delete store error (falling back to local):', err);
      }
      const updated = misPuestos.filter((s) => s.id !== targetId);
      setMisPuestos(updated);
      localStorage.setItem('campusventa_mis_puestos', JSON.stringify(updated));

      if (activeStoreId === targetId) {
        const nextId = updated.length > 0 ? updated[0].id : 1;
        setActiveStoreId(nextId);
        localStorage.setItem('campusventa_active_store_id', String(nextId));
      }
      showToast(`Puesto "${storeToDelete.nombre}" eliminado correctamente.`);
      setStoreToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Error al eliminar el puesto.');
    } finally {
      setDeletingStore(false);
    }
  };

  const handleCreateStoreSubmit = (e) => {
    e.preventDefault();
    if (!storeFormData.nombre.trim()) {
      showToast('Por favor ingresa el nombre de tu emprendimiento.');
      return;
    }

    const defaultStoreImages = {
      POSTRES: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80',
      COMIDA: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
      ACCESORIOS: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
      SERVICIOS: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80',
    };

    // La foto de la tienda es independiente de la foto de perfil del vendedor
    const storeAvatar = storeFormData.avatarUrl || defaultStoreImages[storeFormData.categoria] || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300';

    const newStore = {
      id: Date.now(),
      nombre: storeFormData.nombre.trim(),
      categoria: storeFormData.categoria || 'POSTRES',
      torre: storeFormData.torre,
      piso: storeFormData.piso,
      referencia: 'Campus UTP',
      disponible: true,
      avatarUrl: storeAvatar, // Foto o Logo Oficial de la Tienda
      vendedorNombre: formData.nombre || user?.nombre || 'Estudiante UTP',
      vendedorAvatar: formData.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      calificacion: 5.0,
      totalResenas: 1,
      tiempoEntrega: storeFormData.tiempoEntrega || '~3 min',
      horarioAtencion: storeFormData.horarioAtencion.trim() || 'Lun - Vie: 9:00 AM - 6:00 PM',
      descripcion: storeFormData.descripcion || 'Puesto oficial en campus UTP.',
      productosCount: 0,
    };

    const updatedStores = [...misPuestos, newStore];
    setMisPuestos(updatedStores);
    setActiveStoreId(newStore.id);
    localStorage.setItem('campusventa_mis_puestos', JSON.stringify(updatedStores));
    localStorage.setItem('campusventa_active_store_id', String(newStore.id));

    const updatedUser = {
      ...user,
      ...formData,
      rol: 'vendedor',
      tiendaNombre: newStore.nombre,
      emprendimientoId: newStore.id,
      torreHabitual: `${newStore.torre} - ${newStore.piso}`,
    };
    login(updatedUser);
    setShowRegisterStoreModal(false);
    setStoreFormData({
      nombre: '',
      categoria: 'POSTRES',
      torre: 'Torre A',
      piso: 'Piso 4',
      telefono: user?.telefono || '972341311',
      tiempoEntrega: 'Entrega en ~3 min',
      horarioAtencion: 'Lun - Vie: 9:00 AM - 6:00 PM',
      descripcion: '',
      avatarUrl: '',
    });
    showToast(`¡Puesto "${newStore.nombre}" creado con éxito!`);
  };

  // Estados de configuración de preferencias
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('campusventa_theme') || 'claro';
  });
  const [notifBajones, setNotifBajones] = useState(true);
  const [sonidoHaptico, setSonidoHaptico] = useState(true);
  const [ahorroDatos, setAhorroDatos] = useState(false);
  const [zonaFrecuente, setZonaFrecuente] = useState('Torre A');

  // Form State dinámico
  const [formData, setFormData] = useState(() => {
    const defaultRedes = isSeller
      ? [
          { id: '1', plataforma: 'whatsapp', handle: user?.telefono || '972341311', visible: true },
          { id: '2', plataforma: 'instagram', handle: 'valeria.utp', visible: true },
          { id: '3', plataforma: 'tiktok', handle: 'valeria_bakes', visible: true },
        ]
      : [
          { id: '1', plataforma: 'instagram', handle: 'carlos.utp', visible: true },
          { id: '2', plataforma: 'whatsapp', handle: user?.telefono || '951234567', visible: false },
        ];

    return {
      nombre: user?.nombre || (isSeller ? 'Valeria Mendoza' : 'Carlos Morales'),
      email: user?.email || (isSeller ? 'u20210045@utp.edu.pe' : 'u20220199@utp.edu.pe'),
      codigo: user?.codigo || (isSeller ? 'U20210045' : 'U20220199'),
      carrera: user?.carrera || (isSeller ? 'Ing. Sistemas' : 'Ing. Industrial'),
      ciclo: user?.ciclo || (isSeller ? '6to Ciclo' : '4to Ciclo'),
      telefono: user?.telefono || (isSeller ? '972341311' : '951234567'),
      bio: user?.bio || (isSeller
        ? 'Estudiante UTP Piura. Venta y entrega de postres caseros entre clases en Torre A y Torre B.'
        : 'Estudiante explorador de bajones y dulces en el campus.'),
      avatar: user?.avatar || null,
      torreHabitual: user?.torreHabitual || 'Torre A',
      redesSociales: Array.isArray(user?.redesSociales) && user.redesSociales.length > 0
        ? user.redesSociales
        : defaultRedes,
    };
  });

  const getInitials = (name) => {
    if (!name) return 'UTP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const aplicarTema = (nuevoTema) => {
    setTema(nuevoTema);
    localStorage.setItem('campusventa_theme', nuevoTema);

    if (nuevoTema === 'oscuro') {
      document.documentElement.classList.add('dark');
    } else if (nuevoTema === 'claro') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    showToast(`Tema cambiado a: ${nuevoTema === 'oscuro' ? 'Oscuro OLED' : nuevoTema === 'claro' ? 'Claro Cristal' : 'Automático'}`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manejo directo de carga de foto (sin presets fijos)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('La imagen supera el límite de 3MB. Selecciona una más ligera.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target.result;
      setFormData((prev) => ({ ...prev, avatar: base64 }));
      showToast('Nueva foto cargada. Guarda los cambios para aplicarla.');
    };
    reader.readAsDataURL(file);
  };

  // Eliminar foto de perfil
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    showToast('Foto de perfil eliminada.');
  };

  // Sincronizar formData cuando user cambia en AuthContext
  useEffect(() => {
    if (user?.redesSociales && Array.isArray(user.redesSociales)) {
      setFormData((prev) => ({
        ...prev,
        redesSociales: user.redesSociales,
      }));
    }
  }, [user]);

  // Redes sociales dinámicas en el formulario general: agregar siempre ARRIBA
  const handleAddSocial = () => {
    const newId = Date.now().toString();
    setFormData((prev) => ({
      ...prev,
      redesSociales: [
        { id: newId, plataforma: 'instagram', handle: '', visible: true },
        ...prev.redesSociales,
      ],
    }));
    showToast('Nueva red agregada arriba para configurarla.');
  };

  const handleUpdateSocial = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      redesSociales: prev.redesSociales.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Estado para formulario de nueva red que aparece ARRIBA de la lista
  const [isAddingSocialTop, setIsAddingSocialTop] = useState(false);
  const [newSocialData, setNewSocialData] = useState({
    plataforma: 'instagram',
    handle: '',
    visible: true,
  });

  const handleOpenAddSocialTop = () => {
    setEditingSocialId(null);
    setNewSocialData({
      plataforma: 'instagram',
      handle: '',
      visible: true,
    });
    setIsAddingSocialTop(true);
  };

  const handleCancelNewSocialTop = () => {
    setIsAddingSocialTop(false);
    setNewSocialData({ plataforma: 'instagram', handle: '', visible: true });
  };

  const handleSaveNewSocialTop = (e) => {
    if (e) e.preventDefault();
    if (!newSocialData.handle || !newSocialData.handle.trim()) {
      showToast('Por favor escribe el usuario, número o enlace.');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      plataforma: newSocialData.plataforma,
      handle: newSocialData.handle.trim(),
      visible: newSocialData.visible !== false,
    };

    // Agregar al INICIO (ARRIBA) de la lista
    const updatedRedes = [newItem, ...formData.redesSociales];
    const updatedUser = {
      ...user,
      ...formData,
      redesSociales: updatedRedes,
    };

    setFormData((prev) => ({
      ...prev,
      redesSociales: updatedRedes,
    }));
    login(updatedUser);
    setIsAddingSocialTop(false);
    setNewSocialData({ plataforma: 'instagram', handle: '', visible: true });

    const conf = PLATFORMS_CONFIG[newItem.plataforma] || PLATFORMS_CONFIG.instagram;
    showToast(`¡${conf.label} agregada al inicio de tus redes!`);
  };

  // Estado y funciones para edición inline de enlaces de redes ya agregadas
  const [editingSocialId, setEditingSocialId] = useState(null);
  const [tempSocialData, setTempSocialData] = useState({ plataforma: 'instagram', handle: '', visible: true });

  const handleStartEditSocial = (item) => {
    setIsAddingSocialTop(false);
    setEditingSocialId(item.id);
    setTempSocialData({
      plataforma: item.plataforma,
      handle: item.handle,
      visible: item.visible !== false,
    });
  };

  const handleSaveInlineSocial = (id) => {
    if (!tempSocialData.handle || !tempSocialData.handle.trim()) {
      showToast('Por favor escribe el usuario o enlace.');
      return;
    }
    const updatedRedes = formData.redesSociales.map((r) =>
      r.id === id ? { ...r, ...tempSocialData, handle: tempSocialData.handle.trim() } : r
    );
    const updatedUser = {
      ...user,
      ...formData,
      redesSociales: updatedRedes,
    };
    setFormData((prev) => ({ ...prev, redesSociales: updatedRedes }));
    login(updatedUser);
    setEditingSocialId(null);
    showToast('Enlace de red social actualizado con éxito.');
  };

  const handleCancelInlineSocial = () => {
    setEditingSocialId(null);
  };

  const handleRemoveSocial = (id) => {
    const updatedRedes = formData.redesSociales.filter((item) => item.id !== id);
    const updatedUser = {
      ...user,
      ...formData,
      redesSociales: updatedRedes,
    };
    setFormData((prev) => ({
      ...prev,
      redesSociales: updatedRedes,
    }));
    login(updatedUser);
    if (editingSocialId === id) {
      setEditingSocialId(null);
    }
    showToast('Canal eliminado.');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      ...formData,
      redesSociales: formData.redesSociales.filter((r) => r.handle && r.handle.trim()),
    };
    login(updatedUser);
    setEditing(false);
    showToast('¡Perfil actualizado con éxito!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleRole = () => {
    const newRole = isSeller ? 'comprador' : 'vendedor';
    const switchedUser = loginAsDemo(newRole);
    setFormData({
      nombre: switchedUser.nombre,
      email: switchedUser.email,
      codigo: switchedUser.codigo,
      carrera: switchedUser.carrera,
      ciclo: switchedUser.ciclo,
      telefono: newRole === 'vendedor' ? '972341311' : '951234567',
      bio: newRole === 'vendedor'
        ? 'Vendedora de SweetHub en campus UTP Piura.'
        : 'Estudiante explorador de bajones y dulces en el campus.',
      avatar: switchedUser.avatar,
      torreHabitual: newRole === 'vendedor' ? 'Torre A' : 'Torre B',
      redesSociales: newRole === 'vendedor'
        ? [
            { id: '1', plataforma: 'whatsapp', handle: '972341311', visible: true },
            { id: '2', plataforma: 'instagram', handle: 'valeria.utp', visible: true },
            { id: '3', plataforma: 'tiktok', handle: 'valeria_bakes', visible: true },
          ]
        : [
            { id: '1', plataforma: 'instagram', handle: 'carlos.utp', visible: true },
            { id: '2', plataforma: 'whatsapp', handle: '951234567', visible: false },
          ],
    });
    showToast(`Cambiaste a Modo ${newRole === 'vendedor' ? 'Vendedor' : 'Comprador'}`);
  };

  const visibleRedes = formData.redesSociales.filter(
    (r) => r.visible !== false && r.handle && r.handle.trim()
  );

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

      {/* Modal de Vista Previa Pública del Perfil */}
      <ProfilePreviewModal
        user={{
          ...formData,
          rol: isSeller ? 'vendedor' : 'comprador',
          emprendimientoId: isSeller ? 1 : null,
        }}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        isOwner={true}
        onEditClick={() => setEditing(true)}
      />

      <main className="max-w-[840px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-text-secondary hover:text-text-main transition-colors text-decoration-none"
          >
            <IconArrowBack className="w-4 h-4" />
            <span>Volver a Explorar</span>
          </Link>
        </div>

        {/* 1. HERO IDENTITY CARD */}
        <section className="relative overflow-hidden liquid-glass-hero rounded-3xl p-6 sm:p-8 shadow-sm border border-white/80">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
            {/* Avatar con subida directa y eliminación */}
            <div className="relative group shrink-0">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.nombre}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-primary/20 shadow-md transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl liquid-glass-crimson text-white flex items-center justify-center font-heading font-extrabold text-3xl ring-4 ring-primary/20 shadow-md">
                  {getInitials(formData.nombre)}
                </div>
              )}

              {/* Input file oculto para subida directa */}
              <input
                id="hero-avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {/* Botón flotante para subir foto directamente */}
              <label
                htmlFor="hero-avatar-file-input"
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl liquid-glass-crimson text-white flex items-center justify-center cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all border border-white"
                title="Subir foto de perfil"
              >
                <IconPhoto className="w-4 h-4" />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main">
                  {formData.nombre}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full liquid-glass-crimson text-white font-heading font-bold text-[10px] shadow-2xs">
                  <IconVerified className="w-3 h-3 text-white" />
                  <span>{isSeller ? 'Vendedor Oficial' : 'Alumno UTP'}</span>
                </span>
              </div>

              <p className="text-xs font-heading font-semibold text-text-secondary">
                {formData.carrera} · {formData.ciclo} · Sede Piura
              </p>

              <p className="text-xs text-text-muted">
                Código: <b className="text-text-main">{formData.codigo}</b> · Correo: <span className="text-primary">{formData.email}</span>
              </p>

              {/* Bio / Ubicación */}
              {formData.bio && (
                <p className="text-xs text-text-main leading-relaxed mt-2 p-3 rounded-2xl liquid-glass border border-white/60">
                  "{formData.bio}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setEditing(!editing)}
                  className={`px-4 py-2 rounded-full text-xs font-heading font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                    editing
                      ? 'liquid-glass text-text-secondary border border-border'
                      : 'liquid-glass-crimson text-white shadow-sm hover:brightness-110'
                  }`}
                >
                  <IconEdit className="w-3.5 h-3.5" />
                  <span>{editing ? 'Cerrar Edición' : 'Editar Perfil'}</span>
                </button>

                {/* Botón Ver Vista Previa Pública */}
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-xs text-xs font-heading font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm text-primary">visibility</span>
                  <span>Vista Previa Pública</span>
                </button>

                {isSeller && (
                  <Link
                    to="/panel"
                    className="px-4 py-2 rounded-full liquid-glass border border-primary/30 text-primary font-heading font-bold text-xs hover:bg-white text-decoration-none shadow-2xs flex items-center gap-1.5"
                  >
                    <IconStore className="w-3.5 h-3.5" />
                    <span>Mi Panel</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. FORMULARIO DE EDICIÓN (Cuando editing es true) */}
        {editing && (
          <section className="liquid-glass-card rounded-3xl p-6 shadow-sm border border-white/80 animate-slide-up flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
                <IconEdit className="w-4 h-4 text-primary" />
                <span>Editar Información del Perfil</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="w-7 h-7 rounded-full liquid-glass text-text-muted hover:text-text-main flex items-center justify-center"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              {/* Sección de Foto de Perfil: Subir directamente o Eliminar */}
              <div className="p-4 rounded-2xl liquid-glass border border-white/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Preview"
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl liquid-glass-crimson text-white flex items-center justify-center font-heading font-bold text-lg ring-2 ring-primary/20 shadow-xs">
                        {getInitials(formData.nombre)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-xs text-text-main block">
                      Foto de Perfil
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {formData.avatar ? 'Foto personalizada cargada' : 'Sin foto (se muestran tus iniciales)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="edit-avatar-file-input"
                    className="px-4 py-2 rounded-full liquid-glass border border-primary/30 text-primary text-xs font-heading font-bold hover:bg-white transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                  >
                    <IconPhoto className="w-3.5 h-3.5" />
                    <span>{formData.avatar ? 'Cambiar Foto' : 'Subir Foto'}</span>
                    <input
                      id="edit-avatar-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3.5 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-heading font-bold transition-all active:scale-95 flex items-center gap-1"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Datos Personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-text-secondary">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-text-secondary">Carrera Profesional</label>
                  <input
                    type="text"
                    value={formData.carrera}
                    onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-text-secondary">Ciclo Actual</label>
                  <input
                    type="text"
                    value={formData.ciclo}
                    onChange={(e) => setFormData({ ...formData, ciclo: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-text-secondary">Torre habitual en Campus</label>
                  <input
                    type="text"
                    value={formData.torreHabitual}
                    onChange={(e) => setFormData({ ...formData, torreHabitual: e.target.value })}
                    placeholder="Ej: Torre A - Piso 4"
                    className="px-3.5 py-2.5 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Biografía */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-text-secondary">
                  Biografía / Dónde te ubican en Campus UTP
                </label>
                <textarea
                  rows="2"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Ej: Suelo estar en Torre A piso 4 durante el receso de 11:00 am a 12:30 pm..."
                  className="px-3.5 py-2.5 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none resize-none"
                />
              </div>

              {/* Redes Sociales Dinámicas (Agregar de uno en uno) */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-heading font-bold text-text-main block">
                      Redes Sociales y Canales de Contacto
                    </label>
                    <span className="text-[11px] text-text-secondary">
                      Agrégalas de una en una y activa si deseas que los demás alumnos las vean
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="px-3 py-1.5 rounded-full liquid-glass border border-primary/30 text-primary text-xs font-heading font-bold hover:bg-white transition-all flex items-center gap-1 shadow-2xs active:scale-95"
                  >
                    <IconAdd className="w-3.5 h-3.5" />
                    <span>Agregar Red</span>
                  </button>
                </div>

                {formData.redesSociales.length === 0 ? (
                  <div className="p-4 rounded-2xl liquid-glass border border-dashed border-border text-center text-xs text-text-muted">
                    No tienes redes sociales agregadas. Haz clic en <b>"+ Agregar Red"</b> para vincular WhatsApp, Instagram, etc.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {formData.redesSociales.map((item) => {
                      const platform = PLATFORMS_CONFIG[item.plataforma] || PLATFORMS_CONFIG.instagram;
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl liquid-glass border border-white/80 flex flex-col sm:flex-row items-center gap-2.5"
                        >
                          {/* Selector de Plataforma */}
                          <div className="w-full sm:w-40 shrink-0">
                            <select
                              value={item.plataforma}
                              onChange={(e) => handleUpdateSocial(item.id, 'plataforma', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl liquid-glass text-xs font-heading font-bold text-text-main border border-border focus:border-primary outline-none"
                            >
                              <option value="instagram">Instagram</option>
                              <option value="whatsapp">WhatsApp</option>
                              <option value="tiktok">TikTok</option>
                              <option value="facebook">Facebook</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="x">X (Twitter)</option>
                              <option value="telegram">Telegram</option>
                            </select>
                          </div>

                          {/* Campo Handle / Usuario o Enlace Completo */}
                          <div className="w-full flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.handle}
                              onChange={(e) => handleUpdateSocial(item.id, 'handle', e.target.value)}
                              placeholder={`Usuario (@ejemplo) o enlace https://...`}
                              className="w-full px-3.5 py-2 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none"
                            />
                            {item.handle && item.handle.trim() && (
                              <span className="text-[10px] text-primary truncate block mt-0.5 font-medium">
                                🔗 Redirige a: {platform.formatUrl(item.handle)}
                              </span>
                            )}
                          </div>

                          {/* Toggle Visibilidad */}
                          <label className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-xl liquid-glass border border-white/60 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.visible !== false}
                              onChange={(e) => handleUpdateSocial(item.id, 'visible', e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
                            />
                            <span className="text-[11px] font-heading font-bold text-text-secondary">
                              Pública
                            </span>
                          </label>

                          {/* Botón Eliminar Fila */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSocial(item.id)}
                            className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            title="Eliminar red social"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón Guardar y Cancelar (estilo píldora blanca) */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-5 py-2.5 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-xs text-xs font-heading font-bold transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <IconCheck className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SECCIÓN CREAR PUESTO / REGISTRARSE COMO VENDEDOR DENTRO DE PERFIL */}
        {!isSeller ? (
          <section className="relative overflow-hidden liquid-glass rounded-3xl p-5 sm:p-7 shadow-xs border border-primary/30 flex flex-col gap-4 bg-gradient-to-r from-primary/5 via-surface-card to-amber-500/5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl liquid-glass-crimson text-white flex items-center justify-center shrink-0 shadow-md">
                <IconStore className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main flex items-center gap-1.5">
                    <span>¿Quieres crear un puesto y vender en el campus?</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full liquid-glass-crimson text-white text-[10px] font-heading font-bold shadow-2xs">
                    Comunidad UTP
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Publica tu catálogo de productos o snacks y recibe pedidos directos por WhatsApp de alumnos de Torre A, Torre B y Canchas.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowRegisterStoreModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <IconAdd className="w-4 h-4" />
                <span>Crear mi Puesto</span>
              </button>
              <button
                type="button"
                onClick={handleInstantBecomeSeller}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-xs text-xs font-heading font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <IconBolt className="w-4 h-4 text-amber-500" />
                <span>Activar Modo Vendedor</span>
              </button>
            </div>
          </section>
        ) : (
          /* SECCIÓN DE MÚLTIPLES PUESTOS DEL VENDEDOR */
          <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-xs border border-emerald-500/30 space-y-4 bg-gradient-to-br from-emerald-500/5 via-surface-card to-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <IconStore className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-base text-text-main">
                      Mis Puestos en el Campus
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-heading font-extrabold">
                      {misPuestos.length} {misPuestos.length === 1 ? 'puesto' : 'puestos'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Administra tus emprendimientos, cambia de puesto activo o añade uno nuevo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRegisterStoreModal(true)}
                className="self-center sm:self-auto w-full sm:w-auto py-2.5 px-5 rounded-full bg-white hover:bg-slate-50 text-text-main border border-slate-200 shadow-xs font-heading font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
              >
                <IconAdd className="w-4 h-4 text-primary" />
                <span>Registrar Otro Puesto</span>
              </button>
            </div>

            {/* Grid / Lista de puestos registrados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {misPuestos.map((puesto) => {
                const isActive = activeStoreId === puesto.id;
                return (
                  <div
                    key={puesto.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                      isActive
                        ? 'bg-white shadow-md border-emerald-500/60 ring-2 ring-emerald-500/20'
                        : 'bg-white/60 hover:bg-white border-border/80 hover:border-emerald-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={puesto.avatarUrl}
                        alt={puesto.nombre}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-border shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-heading font-bold text-sm text-text-main truncate">
                            {puesto.nombre}
                          </h4>
                          {isActive && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-heading font-bold border border-emerald-200">
                              Activo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted flex-wrap">
                          <span className="font-heading font-semibold text-primary">
                            {puesto.categoria}
                          </span>
                          <span>·</span>
                          <span>📍 {puesto.torre} · {puesto.piso}</span>
                        </div>
                        {puesto.horarioAtencion && (
                          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-1">
                            <IconClock className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{puesto.horarioAtencion}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleSelectStore(puesto.id)}
                        className={`flex-1 h-9 px-3 rounded-full font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                          isActive
                            ? 'bg-[#BA122D] text-white shadow-xs hover:bg-[#990F24]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">dashboard</span>
                        <span>{isActive ? 'Panel Activo' : 'Administrar'}</span>
                      </button>

                      <Link
                        to={`/emprendimiento/${puesto.id}`}
                        className="flex-1 h-9 px-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-heading font-bold text-xs border border-slate-200 transition-all text-decoration-none text-center flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-sm text-[#BA122D]">visibility</span>
                        <span>Catálogo</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setStoreToDelete(puesto)}
                        className="w-9 h-9 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-all flex items-center justify-center shrink-0 active:scale-95"
                        title="Eliminar este puesto"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. SECCIÓN REDES SOCIALES Y CONTACTO ESTILO RED SOCIAL */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-xs border border-white/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h2 className="font-heading font-bold text-base text-text-main flex items-center justify-center sm:justify-start gap-2">
                <span className="material-symbols-outlined text-primary text-xl">share</span>
                <span>Canales de Contacto y Redes Sociales</span>
              </h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Puedes editar cualquier enlace, cambiar plataforma o agregar nuevos canales arriba
              </p>
            </div>
            <div className="flex items-center justify-center shrink-0">
              <button
                type="button"
                onClick={handleOpenAddSocialTop}
                className="px-4 py-2 rounded-full liquid-glass border border-primary/30 text-primary hover:bg-white text-xs font-heading font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <IconAdd className="w-4 h-4" />
                <span>Agregar Red</span>
              </button>
            </div>
          </div>

          {/* FORMULARIO PARA AGREGAR NUEVA RED SOCIAL ARRIBA (APARECE ARRIBA Y NO ABAJO) */}
          {isAddingSocialTop && (
            <div className="p-4 sm:p-5 rounded-2xl liquid-glass border-2 border-primary/40 shadow-sm flex flex-col gap-3.5 bg-gradient-to-br from-primary/5 via-white/90 to-surface-card animate-scale-up">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl liquid-glass-crimson text-white flex items-center justify-center shadow-xs">
                    <IconAdd className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-heading font-extrabold text-text-main block">
                      Agregar Nueva Red Social
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      Aparecerá arriba en tu lista y en tu perfil público
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelNewSocialTop}
                  className="w-7 h-7 rounded-full liquid-glass text-text-muted hover:text-text-main flex items-center justify-center transition-colors"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Selector de plataforma */}
                <div>
                  <label className="text-[11px] font-heading font-bold text-text-secondary block mb-1">
                    Plataforma
                  </label>
                  <select
                    value={newSocialData.plataforma}
                    onChange={(e) => setNewSocialData({ ...newSocialData, plataforma: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl liquid-glass text-xs font-heading font-bold text-text-main border border-border focus:border-primary outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X (Twitter)</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>

                {/* Input de handle / enlace */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-heading font-bold text-text-secondary block mb-1">
                    Usuario (@ejemplo) o Enlace Directo (https://...)
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newSocialData.handle}
                    onChange={(e) => setNewSocialData({ ...newSocialData, handle: e.target.value })}
                    placeholder={PLATFORMS_CONFIG[newSocialData.plataforma]?.placeholder || '@usuario o https://...'}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewSocialTop();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Vista previa en tiempo real de redirección */}
              {newSocialData.handle && newSocialData.handle.trim() && (
                <div className="p-2.5 rounded-xl bg-surface-container/60 border border-border/80 text-[11px] text-text-secondary flex items-center justify-between gap-2">
                  <span className="truncate">
                    🔗 Redirige a: <b className="text-primary">{PLATFORMS_CONFIG[newSocialData.plataforma]?.formatUrl(newSocialData.handle)}</b>
                  </span>
                  <a
                    href={PLATFORMS_CONFIG[newSocialData.plataforma]?.formatUrl(newSocialData.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold shrink-0 flex items-center gap-0.5"
                  >
                    <span>Probar enlace</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              )}

              {/* Toggle y Botones centrados / uno al costado del otro */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-border/60 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSocialData.visible !== false}
                    onChange={(e) => setNewSocialData({ ...newSocialData, visible: e.target.checked })}
                    className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-heading font-bold text-text-secondary">
                    Visible en mi perfil público
                  </span>
                </label>

                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelNewSocialTop}
                    className="px-4 py-2 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-xs text-xs font-heading font-bold transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewSocialTop}
                    className="px-5 py-2 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Guardar y Agregar Arriba</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {formData.redesSociales.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.redesSociales.map((item) => {
                const conf = PLATFORMS_CONFIG[item.plataforma] || PLATFORMS_CONFIG.instagram;
                const linkUrl = conf.formatUrl(item.handle);
                const displayText = conf.getDisplayText(item.handle);
                const IconSvg = conf.IconComponent || IconStore;
                const isEditingThis = editingSocialId === item.id;

                // MODO EDICIÓN DIRECTA DEL ENLACE DE LA RED SOCIAL
                if (isEditingThis) {
                  const currentConf = PLATFORMS_CONFIG[tempSocialData.plataforma] || PLATFORMS_CONFIG.instagram;
                  const currentPreviewUrl = currentConf.formatUrl(tempSocialData.handle);

                  return (
                    <div
                      key={item.id}
                      className="sm:col-span-2 p-4 rounded-2xl liquid-glass border border-primary/40 shadow-sm flex flex-col gap-3 animate-scale-up bg-white/80"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <span className="text-xs font-heading font-bold text-text-main flex items-center gap-1.5">
                          <IconEdit className="w-3.5 h-3.5 text-primary" />
                          <span>Configurar Enlace de Red Social</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCancelInlineSocial(item.id)}
                          className="w-6 h-6 rounded-full liquid-glass text-text-muted hover:text-text-main flex items-center justify-center"
                        >
                          <IconClose className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Selector de plataforma */}
                        <div>
                          <label className="text-[11px] font-heading font-bold text-text-secondary block mb-1">
                            Plataforma
                          </label>
                          <select
                            value={tempSocialData.plataforma}
                            onChange={(e) => setTempSocialData({ ...tempSocialData, plataforma: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl liquid-glass text-xs font-heading font-bold text-text-main border border-border focus:border-primary outline-none"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="tiktok">TikTok</option>
                            <option value="facebook">Facebook</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="x">X (Twitter)</option>
                            <option value="telegram">Telegram</option>
                          </select>
                        </div>

                        {/* Input de usuario o enlace completo */}
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-heading font-bold text-text-secondary block mb-1">
                            Usuario (@ejemplo) o Enlace Completo (https://...)
                          </label>
                          <input
                            type="text"
                            autoFocus
                            value={tempSocialData.handle}
                            onChange={(e) => setTempSocialData({ ...tempSocialData, handle: e.target.value })}
                            placeholder={currentConf.placeholder}
                            className="w-full px-3.5 py-2 rounded-xl liquid-glass text-xs font-body text-text-main border border-border focus:border-primary outline-none"
                          />
                        </div>
                      </div>

                      {/* Vista previa en tiempo real de redirección */}
                      {tempSocialData.handle && tempSocialData.handle.trim() && (
                        <div className="p-2.5 rounded-xl bg-surface-container/60 border border-border/80 text-[11px] text-text-secondary flex items-center justify-between gap-2">
                          <span className="truncate">
                            🔗 Redirige a: <b className="text-primary">{currentPreviewUrl}</b>
                          </span>
                          <a
                            href={currentPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-bold shrink-0 flex items-center gap-0.5"
                          >
                            <span>Probar enlace</span>
                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                          </a>
                        </div>
                      )}

                      {/* Botones de acción centrados / uno al costado del otro */}
                      <div className="flex flex-col sm:flex-row items-center justify-between pt-1 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempSocialData.visible !== false}
                            onChange={(e) => setTempSocialData({ ...tempSocialData, visible: e.target.checked })}
                            className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
                          />
                          <span className="text-[11px] font-heading font-bold text-text-secondary">
                            Visible en mi perfil público
                          </span>
                        </label>

                        <div className="flex items-center justify-center sm:justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCancelInlineSocial(item.id)}
                            className="px-4 py-2 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-xs text-xs font-heading font-bold transition-all active:scale-95"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineSocial(item.id)}
                            className="px-5 py-2 rounded-full liquid-glass-crimson text-white text-xs font-heading font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1"
                          >
                            <IconCheck className="w-3.5 h-3.5" />
                            <span>Guardar Enlace</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // MODO VISTA DE LA TARJETA: UNO AL COSTADO DEL OTRO (FLEX ROW LIMPIO EN MÓVIL Y DESKTOP)
                return (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all shadow-xs flex flex-row items-center justify-between gap-2.5 group ${conf.bgColor}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr ${conf.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconSvg className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider block leading-tight">
                            {conf.label}
                          </span>
                          {item.visible === false && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">
                              Oculto
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-heading font-extrabold truncate block text-text-main mt-0.5">
                          {displayText || 'Sin configurar'}
                        </span>
                        {item.handle && (
                          <span className="text-[10px] text-text-muted truncate block">
                            {linkUrl}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      {/* Botón Editar enlace */}
                      <button
                        type="button"
                        onClick={() => handleStartEditSocial(item)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-2xs text-[11px] sm:text-xs font-heading font-bold transition-all active:scale-95 flex items-center gap-1"
                        title="Modificar enlace o usuario"
                      >
                        <IconEdit className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        <span>Editar</span>
                      </button>

                      {/* Botón Visitar perfil */}
                      {item.handle && (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 sm:px-3 py-1.5 rounded-full liquid-glass-crimson text-white shadow-2xs text-[11px] sm:text-xs font-heading font-bold hover:brightness-110 transition-all flex items-center gap-1 text-decoration-none"
                        >
                          <span>Visitar</span>
                          <span className="material-symbols-outlined text-[11px] sm:text-xs">open_in_new</span>
                        </a>
                      )}

                      {/* Botón Eliminar red */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSocial(item.id)}
                        className="p-1.5 rounded-full text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar esta red"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 rounded-2xl liquid-glass border border-dashed border-border text-center space-y-2">
              <p className="text-xs text-text-muted">
                No tienes canales de contacto configurados.
              </p>
              <button
                type="button"
                onClick={handleOpenAddSocialTop}
                className="px-4 py-2 rounded-full liquid-glass border border-primary/30 text-primary font-heading font-bold text-xs shadow-2xs hover:bg-white inline-flex items-center gap-1.5"
              >
                <IconAdd className="w-3.5 h-3.5" />
                <span>Agregar mi primera red social</span>
              </button>
            </div>
          )}
        </section>

        {/* 4. PREFERENCIAS Y UBICACIÓN INSTITUCIONAL */}
        <section className="liquid-glass rounded-3xl p-6 shadow-xs border border-white/80 space-y-3">
          <h2 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
            <IconSchool className="w-5 h-5 text-primary" />
            <span>Datos Institucionales UTP</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl liquid-glass border border-white/60 space-y-1">
              <span className="text-text-muted text-[11px] block font-heading font-semibold">Sede Universitaria</span>
              <span className="font-heading font-bold text-text-main">UTP Sede Piura</span>
              <p className="text-[11px] text-text-secondary">Av. Vice con Sánchez Cerro, Piura</p>
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass border border-white/60 space-y-1">
              <span className="text-text-muted text-[11px] block font-heading font-semibold">Cuenta Verificada</span>
              <span className="font-heading font-bold text-emerald-600 flex items-center gap-1">
                <IconVerified className="w-4 h-4 text-emerald-600" />
                <span>Estudiante Activo UTP</span>
              </span>
              <p className="text-[11px] text-text-secondary">Comunidad Oficial de Emprendimiento</p>
            </div>
          </div>
        </section>

      </main>

      {/* MODAL: REGISTRAR PUESTO / HACERME VENDEDOR DIRECTAMENTE DESDE PERFIL */}
      {showRegisterStoreModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#BA122D] flex items-center justify-center border border-rose-100 shadow-xs">
                  <IconStore className="w-5 h-5 text-[#BA122D]" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 leading-tight">
                    Crear mi Puesto en Campus
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comienza a vender a la comunidad UTP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterStoreModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStoreSubmit} className="flex flex-col gap-3.5 text-xs">
              {/* Foto o Logo de la Tienda (Independiente del vendedor) */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative shrink-0">
                  {storeFormData.avatarUrl ? (
                    <img
                      src={storeFormData.avatarUrl}
                      alt="Logo de la tienda"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#BA122D]/30 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-2xs">
                      <IconStore className="w-6 h-6 text-[#BA122D]" />
                      <span className="text-[9px] font-heading font-bold text-slate-500 mt-0.5">Tienda</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <label className="font-heading font-bold text-xs text-slate-800 block">
                      Foto o Logo de la Tienda
                    </label>
                    <span className="text-[10px] font-heading font-bold text-[#BA122D] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight my-1">
                    Esta imagen identificará a tu puesto en el catálogo (tu foto de perfil personal como estudiante se mantiene separada).
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-heading font-bold text-slate-700 shadow-2xs active:scale-95 transition-all">
                    <IconPhoto className="w-3.5 h-3.5 text-[#BA122D]" />
                    <span>{storeFormData.avatarUrl ? 'Cambiar Foto de Tienda' : 'Subir Foto de Tienda'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStoreFormAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-heading font-bold text-slate-700">Nombre del Emprendimiento / Puesto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: SweetHub, Bajones UTP, etc."
                  value={storeFormData.nombre}
                  onChange={(e) => setStoreFormData({ ...storeFormData, nombre: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="font-heading font-bold text-slate-700">Categoría</label>
                  <select
                    value={storeFormData.categoria}
                    onChange={(e) => setStoreFormData({ ...storeFormData, categoria: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 text-xs font-heading font-bold text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-all"
                  >
                    <option value="POSTRES">Dulces & Postres</option>
                    <option value="COMIDA">Bajones & Comida</option>
                    <option value="ACCESORIOS">Accesorios & Merch</option>
                    <option value="SERVICIOS">Apuntes & Tutorías</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-heading font-bold text-slate-700">WhatsApp de Pedidos</label>
                  <input
                    type="text"
                    required
                    placeholder="972341311"
                    value={storeFormData.telefono}
                    onChange={(e) => setStoreFormData({ ...storeFormData, telefono: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="font-heading font-bold text-slate-700">Torre Habitual</label>
                  <select
                    value={storeFormData.torre}
                    onChange={(e) => setStoreFormData({ ...storeFormData, torre: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 text-xs font-heading font-bold text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-all"
                  >
                    <option value="Torre A">Torre A</option>
                    <option value="Torre B">Torre B</option>
                    <option value="Canchas">Canchas</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-heading font-bold text-slate-700">Piso / Zona</label>
                  <input
                    type="text"
                    placeholder="Piso 4, Patio, etc."
                    value={storeFormData.piso}
                    onChange={(e) => setStoreFormData({ ...storeFormData, piso: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-heading font-bold text-slate-700 flex items-center justify-between">
                  <span>Horario de Atención</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tus horas de entrega en campus</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lun - Vie: 9:00 AM - 6:00 PM"
                  value={storeFormData.horarioAtencion}
                  onChange={(e) => setStoreFormData({ ...storeFormData, horarioAtencion: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none transition-all placeholder:text-slate-400"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                  {[
                    'Lun - Vie: 9:00 AM - 6:00 PM',
                    'Recesos: 10:30 AM - 1:00 PM',
                    'Tardes: 3:00 PM - 8:00 PM',
                    'Sábados: 8:00 AM - 1:00 PM'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStoreFormData({ ...storeFormData, horarioAtencion: preset })}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-heading font-semibold text-slate-600 hover:text-slate-900 shrink-0 border border-slate-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-heading font-bold text-slate-700">Breve descripción de lo que vendes</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Vendo alfajores, brownies y galletas artesanales durante recesos..."
                  value={storeFormData.descripcion}
                  onChange={(e) => setStoreFormData({ ...storeFormData, descripcion: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-body text-slate-900 border border-slate-200 focus:bg-white focus:border-[#BA122D] outline-none resize-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Botones de acción simétricos 50/50 y misma altura h-11 */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterStoreModal(false)}
                  className="w-full h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs transition-all active:scale-95 flex items-center justify-center text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#BA122D] hover:bg-[#990F24] text-white font-heading font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 text-center"
                >
                  <IconCheck className="w-4 h-4 text-white" />
                  <span>Publicar Puesto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar puesto */}
      {storeToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
              <IconTrash className="w-6 h-6 text-red-600" />
            </div>

            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                ¿Eliminar puesto "{storeToDelete.nombre}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Esta acción dará de baja tu puesto y los productos que registraste en él. Los datos ya no serán visibles para otros estudiantes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={deletingStore}
                onClick={() => setStoreToDelete(null)}
                className="w-full h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs transition-all active:scale-95 flex items-center justify-center text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingStore}
                onClick={handleConfirmDeleteStore}
                className="w-full h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1.5 text-center"
              >
                {deletingStore ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4 text-white" />
                    <span>Sí, Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
