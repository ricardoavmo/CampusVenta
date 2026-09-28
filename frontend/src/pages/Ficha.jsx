import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmprendimientoById, crearResena } from '../services/api';
import {
  IconStore,
  IconLocation,
  IconStar,
  IconClock,
  IconQr,
  IconCheck,
  IconClose,
  IconArrowBack,
  IconArrowRight,
  IconBuilding,
  IconVerified,
  IconHeart,
  IconWhatsApp,
  IconAdd
} from '../components/Icons';
import ProfilePreviewModal from '../components/ProfilePreviewModal';
import { useAuth } from '../context/AuthContext';

export default function Ficha() {
  const { user } = useAuth();
  const { id } = useParams();
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Determinar si el usuario logueado es el vendedor dueño de este emprendimiento
  const isOwner = Boolean(
    user &&
    user.rol === 'vendedor' &&
    emprendimiento && (
      String(user.emprendimientoId) === String(emprendimiento.id) ||
      (user.tiendaNombre && user.tiendaNombre === emprendimiento.nombre) ||
      (() => {
        try {
          const saved = localStorage.getItem('campusventa_mis_puestos');
          if (saved) {
            const puestos = JSON.parse(saved);
            return puestos.some((p) => String(p.id) === String(emprendimiento.id));
          }
        } catch {}
        return false;
      })()
    )
  );

  // Diferenciación explícita: Foto/Logo de la Tienda vs Foto de Perfil del Vendedor
  const sellerAvatar =
    emprendimiento?.vendedorAvatar ||
    (emprendimiento?.avatarUrl?.includes('photo-1534528741775') ||
     emprendimiento?.avatarUrl?.includes('photo-1539571696357') ||
     emprendimiento?.avatarUrl?.includes('photo-1494790108377')
      ? emprendimiento.avatarUrl
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');

  const storeLogo =
    emprendimiento?.tiendaLogo ||
    (emprendimiento?.avatarUrl &&
     !emprendimiento?.avatarUrl?.includes('photo-1534528741775') &&
     !emprendimiento?.avatarUrl?.includes('photo-1539571696357') &&
     !emprendimiento?.avatarUrl?.includes('photo-1494790108377')
      ? emprendimiento.avatarUrl
      : emprendimiento?.imagenUrl ||
        (emprendimiento?.categoria === 'POSTRES'
          ? 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80'
          : emprendimiento?.categoria === 'COMIDA'
          ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&auto=format&fit=crop&q=80'));
  
  // Cantidades por producto (id_producto -> cantidad)
  const [quantities, setQuantities] = useState({});

  // Estado del formulario de nueva reseña
  const [formCalificacion, setFormCalificacion] = useState(5);
  const [formHoverCalificacion, setFormHoverCalificacion] = useState(0);
  const [formComentario, setFormComentario] = useState('');
  const [formFotoResena, setFormFotoResena] = useState(null);
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [mensajeResena, setMensajeResena] = useState(null);
  const [showSellerModal, setShowSellerModal] = useState(false);

  const handleReviewPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('La foto debe ser menor a 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormFotoResena(reader.result);
      showToast('Foto adjuntada a tu reseña');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReviewPhoto = () => {
    setFormFotoResena(null);
  };

  useEffect(() => {
    if (emprendimiento?.id) {
      try {
        const saved = localStorage.getItem('campusventa_favoritos');
        const ids = saved ? JSON.parse(saved) : [1, 2];
        setIsFavorite(ids.includes(Number(emprendimiento.id)));
      } catch {
        setIsFavorite(false);
      }
    }
  }, [emprendimiento]);

  const handleToggleFavorite = () => {
    if (!emprendimiento?.id) return;
    try {
      const saved = localStorage.getItem('campusventa_favoritos');
      let ids = saved ? JSON.parse(saved) : [1, 2];
      const targetId = Number(emprendimiento.id);
      if (ids.includes(targetId)) {
        ids = ids.filter((favId) => favId !== targetId);
        setIsFavorite(false);
        showToast(`Quitaste "${emprendimiento.nombre}" de tus favoritos`);
      } else {
        ids = [...ids, targetId];
        setIsFavorite(true);
        showToast(`¡"${emprendimiento.nombre}" guardado en tus favoritos!`);
      }
      localStorage.setItem('campusventa_favoritos', JSON.stringify(ids));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFicha = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      setErrorMessage('');
      const data = await getEmprendimientoById(id);
      
      // Combinar con productos agregados o editados localmente
      let mergedProducts = Array.isArray(data.productos) ? [...data.productos] : [];
      try {
        const cached = localStorage.getItem(`campusventa_products_${id}`);
        if (cached) {
          const localList = JSON.parse(cached);
          if (Array.isArray(localList)) {
            localList.forEach((lp) => {
              if (!mergedProducts.some((p) => String(p.id) === String(lp.id) || p.nombre === lp.nombre)) {
                mergedProducts.unshift(lp);
              }
            });
          }
        }
      } catch (cacheErr) {}

      const storeWithProducts = {
        ...data,
        productos: mergedProducts,
      };
      setEmprendimiento(storeWithProducts);

      // Inicializar cantidades de productos
      if (mergedProducts.length > 0) {
        const initialQtys = {};
        mergedProducts.forEach((p) => {
          initialQtys[p.id] = 1;
        });
        setQuantities(initialQtys);
      }
    } catch (err) {
      console.error('Error al cargar la ficha:', err);
      // Fallback a puestos guardados localmente
      try {
        const saved = localStorage.getItem('campusventa_mis_puestos');
        const puestos = saved ? JSON.parse(saved) : [];
        const localMatch = puestos.find((p) => String(p.id) === String(id));
        if (localMatch) {
          let fallbackProds = Array.isArray(localMatch.productos) ? [...localMatch.productos] : [];
          try {
            const cached = localStorage.getItem(`campusventa_products_${id}`);
            if (cached) {
              const localList = JSON.parse(cached);
              if (Array.isArray(localList)) {
                localList.forEach((lp) => {
                  if (!fallbackProds.some((p) => String(p.id) === String(lp.id) || p.nombre === lp.nombre)) {
                    fallbackProds.unshift(lp);
                  }
                });
              }
            }
          } catch {}

          setEmprendimiento({
            ...localMatch,
            productos: fallbackProds,
            resenas: localMatch.resenas || [],
          });
          setErrorStatus(null);
          setLoading(false);
          return;
        }
      } catch (localErr) {
        console.warn('Fallback local error:', localErr);
      }

      if (err.response) {
        setErrorStatus(err.response.status);
        setErrorMessage(
          err.response.data?.message ||
          (err.response.status === 404
            ? `No encontramos ningún emprendimiento con el código #${id}.`
            : 'Ocurrió un problema en el servidor al cargar los detalles.')
        );
      } else {
        setErrorStatus(500);
        setErrorMessage('No pudimos conectar con el servidor de CampusVenta. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFicha();
  }, [id]);

  const updateQuantity = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  // Manejo del envío de una nueva reseña de comprador (estudiante autenticado)
  const handleSubmitResena = async (e) => {
    e.preventDefault();
    if (!formComentario.trim()) {
      setMensajeResena({ tipo: 'error', texto: 'Por favor escribe tu opinión sobre tu compra en el puesto.' });
      return;
    }

    try {
      setEnviandoResena(true);
      setMensajeResena(null);

      const nuevaResenaPayload = {
        estudianteNombre: 'Estudiante UTP',
        carreraCiclo: 'Pregrado Sede Piura',
        calificacion: Number(formCalificacion),
        comentario: formComentario.trim(),
        fotoUrl: formFotoResena || null,
      };

      let resenaGuardada;
      try {
        resenaGuardada = await crearResena(id, nuevaResenaPayload);
        if (formFotoResena && !resenaGuardada.fotoUrl) {
          resenaGuardada.fotoUrl = formFotoResena;
        }
      } catch (apiErr) {
        // Fallback local
        resenaGuardada = {
          id: Date.now(),
          ...nuevaResenaPayload,
          verificado: true,
        };
      }

      // Actualizar estado local inmediatamente
      setEmprendimiento((prev) => {
        if (!prev) return prev;
        const resenasActualizadas = [resenaGuardada, ...(prev.resenas || [])];
        const suma = resenasActualizadas.reduce((acc, r) => acc + (r.calificacion || 5), 0);
        const nuevoPromedio = Math.round((suma / resenasActualizadas.length) * 10) / 10;

        return {
          ...prev,
          resenas: resenasActualizadas,
          calificacion: nuevoPromedio,
          totalResenas: resenasActualizadas.length,
        };
      });

      setMensajeResena({ tipo: 'success', texto: '¡Tu reseña fue publicada con éxito! Gracias por apoyar a los emprendedores de la UTP.' });
      setFormCalificacion(5);
      setFormComentario('');
      setFormFotoResena(null);
    } catch (err) {
      console.error('Error al enviar la reseña:', err);
      setMensajeResena({
        tipo: 'error',
        texto: err.response?.data?.message || 'No se pudo guardar la reseña. Inténtalo de nuevo.',
      });
    } finally {
      setEnviandoResena(false);
    }
  };

  // Enlace directo WhatsApp para la tienda general o producto específico
  const getWhatsAppOrderUrl = (producto = null) => {
    if (!emprendimiento?.whatsapp) return '#';
    let cleanNumber = emprendimiento.whatsapp.replace(/\D/g, '');
    if (cleanNumber.length === 9) {
      cleanNumber = '51' + cleanNumber;
    }

    let texto = '';
    if (producto) {
      const qty = quantities[producto.id] || 1;
      texto = `¡Hola ${emprendimiento.vendedorNombre || 'compañero'}! Vi tu tienda "${emprendimiento.nombre}" en CampusVenta UTP Piura. Deseo pedir: ${qty}x ${producto.nombre} (S/ ${(Number(producto.precio) * qty).toFixed(2)}). ¿Estás en ${emprendimiento.torre} ${emprendimiento.piso} para coordinar la entrega?`;
    } else {
      texto = `¡Hola ${emprendimiento.vendedorNombre || 'compañero'}! Vi tu tienda "${emprendimiento.nombre}" en CampusVenta UTP Piura. Estoy en el campus y quisiera consultar tu disponibilidad hoy.`;
    }

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(texto)}`;
  };

  // Generador de niveles esquemáticos según la zona UTP Piura
  const renderEsquemaNiveles = () => {
    if (!emprendimiento) return null;
    const torre = (emprendimiento.torre || '').toLowerCase();
    const piso = (emprendimiento.piso || '');

    if (torre.includes('torre a') || torre.includes('biblioteca')) {
      const isBasement = piso.includes('-1') || piso.toLowerCase().includes('biblioteca');
      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 10 · Terraza & Talleres</span>
            <span className="text-[10px]">Piso superior</span>
          </div>
          {!isBasement && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="text-primary font-heading">
                  {piso} · Aula / Zona de Estudio
                </span>
              </div>
              <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">my_location</span>
                <span>Entrega aquí</span>
              </span>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 1 · Hall Principal Torre A</span>
            <span className="text-[10px]">Acceso</span>
          </div>
          {isBasement ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="text-primary font-heading">
                  Piso -1 · Biblioteca UTP (Sótano Torre A)
                </span>
              </div>
              <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">my_location</span>
                <span>Entrega aquí</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
              <span>Piso -1 · Biblioteca UTP (Sótano)</span>
              <span className="text-[10px]">Silencio</span>
            </div>
          )}
        </div>
      );
    }

    if (torre.includes('torre b')) {
      const isBasement = piso.includes('-1');
      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 7 · Cubículos de Asesoría</span>
            <span className="text-[10px]">Piso superior</span>
          </div>
          {!isBasement && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="text-primary font-heading">
                  {piso} · Pasillo Central
                </span>
              </div>
              <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">my_location</span>
                <span>Entrega aquí</span>
              </span>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 1 · Hall Torre B</span>
            <span className="text-[10px]">Acceso</span>
          </div>
          {isBasement ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="text-primary font-heading">
                  Piso -1 · Sótano Torre B
                </span>
              </div>
              <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">my_location</span>
                <span>Entrega aquí</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
              <span>Piso -1 · Sótano Torre B</span>
              <span className="text-[10px]">Acceso</span>
            </div>
          )}
        </div>
      );
    }

    // Default Canchas u otra zona
    return (
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
            <span className="text-primary font-heading">
              {emprendimiento.torre} · {emprendimiento.piso}
            </span>
          </div>
          <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[11px]">my_location</span>
            <span>Zona de encuentro</span>
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
          <span>Área deportiva y graderías</span>
          <span className="text-[10px]">Abierto</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased">
      {/* Floating Animated Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50 liquid-glass-dark text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce-subtle border border-white/20">
          <IconHeart className="w-4 h-4 text-rose-400 shrink-0" filled />
          <span className="font-heading font-bold text-xs sm:text-sm leading-tight">
            {toastMessage}
          </span>
        </div>
      )}

      {/* 1. TOP HEADER STITCH */}
      {/* 1. TOP HEADER LIQUID GLASS */}
      <header className="sticky top-0 z-50 liquid-glass border-b border-white/60 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
            <div className="w-10 h-10 rounded-xl liquid-glass-crimson flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <IconStore className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-primary">
              Campus<span className="text-secondary">Venta</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full liquid-glass hover:bg-white/90 text-text-main text-xs font-heading font-bold border border-white/70 transition-all shadow-xs text-decoration-none"
            >
              <IconArrowBack className="w-3.5 h-3.5" />
              <span>Volver al marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 pb-32 sm:pb-16">
        {/* ESTADO: CARGANDO */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="liquid-glass-card rounded-3xl border border-white/80 p-8 shadow-xs space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 h-96 liquid-glass-card rounded-3xl border border-white/80 p-6 shadow-xs"></div>
              <div className="lg:col-span-7 h-96 liquid-glass-card rounded-3xl border border-white/80 p-6 shadow-xs"></div>
            </div>
          </div>
        )}

        {/* ESTADO: ERROR CONTROLADO (404 U OTRO) */}
        {!loading && errorStatus && (
          <div className="liquid-glass-card rounded-3xl p-10 border border-white/80 shadow-sm text-center max-w-lg mx-auto space-y-5 my-12">
            <div className="w-16 h-16 rounded-full liquid-glass text-primary mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">
                {errorStatus === 404 ? 'search_off' : 'error'}
              </span>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-main">
                {errorStatus === 404 ? 'Emprendimiento no encontrado' : 'Error al cargar'}
              </h2>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">{errorMessage}</p>
            </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full liquid-glass-dark text-white font-heading font-bold text-xs shadow-xs hover:bg-black transition-all text-decoration-none"
              >
                <IconStore className="w-4 h-4" />
                <span>Explorar marketplace</span>
              </Link>
            </div>
        )}

        {/* ESTADO: DETALLE COMPLETO */}
        {!loading && !errorStatus && emprendimiento && (
          <div className="space-y-6 sm:space-y-8 pb-36 sm:pb-20">
            {/* STORE HERO PROFILE HEADER (Airy, Sleek Liquid Glass) */}
            <section className="liquid-glass-hero rounded-3xl border border-white/80 p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* Foto de la Tienda + Foto del Vendedor */}
                  <div className="relative shrink-0 flex items-center">
                    {/* Foto Oficial de la Tienda */}
                    <img
                      src={storeLogo}
                      alt={emprendimiento.nombre}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-primary/15 shadow-sm bg-white"
                    />

                    {/* Foto del Vendedor (Al hacer clic abre el perfil directamente) */}
                    <button
                      type="button"
                      onClick={() => setShowSellerModal(true)}
                      className="relative -ml-4 mt-8 sm:mt-10 group hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
                      title={`Ver perfil de ${emprendimiento.vendedorNombre || 'Vendedor'}`}
                    >
                      <img
                        src={sellerAvatar}
                        alt={emprendimiento.vendedorNombre || 'Vendedor'}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white shadow-md group-hover:ring-[#BA122D] transition-all"
                      />
                      <span
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1.5 ring-white animate-pulse"
                      ></span>
                    </button>
                  </div>

                  {/* Name & Academic Bio */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full liquid-glass text-secondary font-heading text-[11px] font-extrabold uppercase tracking-wider border border-white/60">
                        {emprendimiento.categoria}
                      </span>
                      {emprendimiento.disponible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full liquid-glass-emerald font-heading text-[11px] font-bold shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Activo en campus
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full liquid-glass text-text-muted font-heading text-[11px] font-medium">
                          Offline
                        </span>
                      )}
                    </div>

                    <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-main mt-1 leading-tight">
                      {emprendimiento.nombre}
                    </h1>

                    <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5 font-medium flex-wrap">
                      <span>Por</span>
                      <button
                        type="button"
                        onClick={() => setShowSellerModal(true)}
                        className="font-bold text-text-main hover:text-[#BA122D] hover:underline transition-colors cursor-pointer"
                        title={`Ver perfil de ${emprendimiento.vendedorNombre || 'Vendedor'}`}
                      >
                        {emprendimiento.vendedorNombre || 'Estudiante Emprendedor'}
                      </button>
                      <span className="text-text-muted">·</span>
                      <span className="text-secondary font-bold">{emprendimiento.carreraCiclo || 'Comunidad UTP'}</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-muted">Piura</span>
                    </p>
                  </div>
                </div>

                {/* Quick Stats Pill Carousel & Favorite Action */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full liquid-glass-badge border border-amber-300/40 text-amber-700 font-heading text-xs font-bold shadow-xs">
                    <IconStar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{emprendimiento.calificacion ? Number(emprendimiento.calificacion).toFixed(1) : '5.0'}</span>
                    <span className="text-text-muted font-normal">({emprendimiento.totalResenas || emprendimiento.resenas?.length || 0})</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full liquid-glass text-text-secondary font-heading text-xs font-semibold border border-white/60 shadow-xs">
                    <IconClock className="w-3.5 h-3.5 text-primary" />
                    <span>Entrega: {emprendimiento.tiempoEntrega || '~4 min'}</span>
                  </div>

                  {/* Botón de Favorito */}
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-heading text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                      isFavorite
                        ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                        : 'liquid-glass text-text-secondary border-white/80 hover:text-rose-600 hover:bg-white'
                    }`}
                    title={isFavorite ? 'Quitar de favoritos' : 'Guardar puesto en favoritos'}
                  >
                    <IconHeart className="w-4 h-4 text-rose-500" filled={isFavorite} />
                    <span>{isFavorite ? 'En Favoritos' : 'Guardar Favorito'}</span>
                  </button>

                  {/* Botón Agregar Producto (Solo visible para el vendedor dueño del puesto) */}
                  {isOwner && (
                    <Link
                      to={`/panel?storeId=${emprendimiento.id}&action=new-product`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-crimson text-white font-heading text-xs font-bold transition-all shadow-xs active:scale-95 text-decoration-none hover:brightness-110"
                      title="Publicar nuevo producto en este puesto"
                    >
                      <IconAdd className="w-4 h-4 text-white" />
                      <span>Agregar Producto</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Description Paragraph */}
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed max-w-3xl">
                {emprendimiento.descripcion}
              </p>

              {/* Payment Methods & Schedule */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/60 text-xs flex-wrap">
                {emprendimiento.horarioAtencion && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass border border-white/70 text-text-main font-heading text-xs font-bold shadow-xs">
                    <IconClock className="w-3.5 h-3.5 text-primary" />
                    <span>Horario: {emprendimiento.horarioAtencion}</span>
                  </div>
                )}
                <span className="font-heading text-[11px] text-text-muted uppercase tracking-wider font-bold">
                  Pagos:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#832685]/10 text-[#832685] font-heading text-[11px] font-bold border border-[#832685]/20">
                  Yape
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00A9E0]/10 text-[#00A9E0] font-heading text-[11px] font-bold border border-[#00A9E0]/20">
                  Plin
                </span>
                <span className="px-2.5 py-0.5 rounded-full liquid-glass text-text-secondary font-heading text-[11px] font-semibold border border-white/60">
                  Efectivo exacto
                </span>
              </div>
            </section>

            {/* MAIN TWO COLUMN GRID: Products First on Mobile, Location Beside on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* PRODUCTS COLUMN (Order 1 on mobile: Student sees products first!) */}
              <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col gap-4">
                {/* Catalog Section Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60 flex-wrap gap-2">
                  <div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
                      <span>Catálogo de Productos</span>
                      <span className="liquid-glass text-xs font-heading font-extrabold px-2 py-0.5 rounded-full text-text-secondary border border-white/60">
                        {emprendimiento.productos?.length || 0}
                      </span>
                    </h2>
                    <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                      Pide directo en mano para entrega rápida en tu aula o piso
                    </p>
                  </div>

                  {isOwner && (
                    <Link
                      to={`/panel?storeId=${emprendimiento.id}&action=new-product`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-crimson text-white font-heading font-bold text-xs shadow-xs hover:brightness-110 text-decoration-none active:scale-95"
                    >
                      <IconAdd className="w-3.5 h-3.5 text-white" />
                      <span>Agregar Producto</span>
                    </Link>
                  )}
                </div>

                {/* PRODUCT CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {emprendimiento.productos && emprendimiento.productos.length > 0 ? (
                    emprendimiento.productos.map((prod) => {
                      const qty = quantities[prod.id] || 1;
                      return (
                        <div
                          key={prod.id}
                          className="liquid-glass-card rounded-2xl border border-white/80 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                        >
                          <div>
                            {/* Product Image */}
                            <div className="relative h-40 w-full overflow-hidden bg-surface-container">
                              <img
                                src={prod.imagenUrl || emprendimiento.imagenUrl || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80'}
                                alt={prod.nombre}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {prod.badge && (
                                <span className="absolute top-2 left-2 liquid-glass-crimson text-white font-heading text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                  {prod.badge}
                                </span>
                              )}
                              {prod.stock && (
                                <span className="absolute bottom-2 right-2 liquid-glass text-text-main font-heading text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-white/80">
                                  Quedan {prod.stock} u.
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="p-3.5 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-heading text-sm font-bold text-text-main group-hover:text-primary transition-colors leading-snug">
                                  {prod.nombre}
                                </h3>
                                <span className="font-heading text-sm font-extrabold text-primary whitespace-nowrap">
                                  S/ {Number(prod.precio).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                                {prod.descripcion}
                              </p>
                            </div>
                          </div>

                          {/* Product Order Controls */}
                          <div className="p-3.5 pt-0 space-y-2">
                            {/* Counter */}
                            <div className="flex items-center justify-between liquid-glass px-2.5 py-1 rounded-xl border border-white/60">
                              <span className="text-[11px] text-text-secondary font-medium">Cantidad:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(prod.id, -1)}
                                  className="w-5 h-5 rounded-md bg-white hover:bg-gray-100 border border-border flex items-center justify-center text-text-main font-bold text-xs transition-colors"
                                >
                                  -
                                </button>
                                <span className="font-heading text-xs font-bold text-text-main w-4 text-center">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(prod.id, 1)}
                                  className="w-5 h-5 rounded-md bg-white hover:bg-gray-100 border border-border flex items-center justify-center text-text-main font-bold text-xs transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Direct WhatsApp CTA for this product */}
                            <a
                              href={getWhatsAppOrderUrl(prod)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full liquid-glass-crimson hover:brightness-110 text-white py-2 px-3 rounded-full font-heading text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all text-decoration-none"
                            >
                              <IconWhatsApp className="w-3.5 h-3.5 text-white" />
                              <span>Pedir {qty}x por WhatsApp (S/ {(Number(prod.precio) * qty).toFixed(2)})</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 liquid-glass-card p-6 rounded-3xl border border-white/80 text-center space-y-3">
                      <p className="text-xs text-text-secondary">Este puesto aún no tiene productos listados en su catálogo.</p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {isOwner && (
                          <Link
                            to={`/panel?storeId=${emprendimiento.id}&action=new-product`}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full liquid-glass-crimson text-white font-heading text-xs font-bold shadow-xs text-decoration-none hover:brightness-110 active:scale-95"
                          >
                            <IconAdd className="w-4 h-4 text-white" />
                            <span>Publicar Primer Producto</span>
                          </Link>
                        )}
                        <a
                          href={getWhatsAppOrderUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full liquid-glass text-text-main font-heading text-xs font-bold shadow-xs text-decoration-none"
                        >
                          <IconWhatsApp className="w-4 h-4 text-emerald-600" />
                          <span>Consultar por WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LOCATION / RADAR COLUMN (Order 2 on mobile, sticky on desktop) */}
              <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
                {/* Real-Time Presence Card */}
                <div className="liquid-glass-card rounded-3xl border border-white/80 p-4 sm:p-6 space-y-3.5 relative overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-primary font-heading text-xs uppercase tracking-wider font-bold">
                      <IconLocation className="w-3.5 h-3.5 text-primary" />
                      <span>Ubicación en campus UTP</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-medium">Actualizado hoy</span>
                  </div>

                  {/* Status Highlight Card */}
                  <div className="liquid-glass rounded-2xl p-3 border border-white/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl liquid-glass-crimson text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <IconLocation className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs sm:text-sm font-bold text-text-main">
                          {emprendimiento.torre} · {emprendimiento.piso}
                        </span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-heading text-[10px] font-bold border border-primary/20">
                          Punto Activo
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-semibold mt-0.5">
                        <IconClock className="w-3 h-3 text-emerald-600" />
                        <span>Permanencia hoy: hasta las 6:30 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Floor Schematic */}
                  <div className="liquid-glass rounded-2xl p-3 border border-white/60 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading text-xs font-bold text-text-main flex items-center gap-1.5">
                        <IconBuilding className="w-3.5 h-3.5 text-primary" />
                        <span>Esquema de Niveles · {emprendimiento.torre}</span>
                      </span>
                      <span className="text-[10px] text-text-muted font-mono font-bold">Piura</span>
                    </div>

                    {renderEsquemaNiveles()}
                  </div>

                  {/* Direct WhatsApp Store CTA (desktop only, mobile has per-product buttons) */}
                  <div className="hidden lg:block space-y-2 pt-1">
                    <a
                      href={getWhatsAppOrderUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full liquid-glass-crimson hover:brightness-110 text-white py-2.5 px-4 rounded-full font-heading text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-decoration-none"
                    >
                      <IconWhatsApp className="w-3.5 h-3.5 text-white" />
                      <span>Coordinar pedido general por WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. STUDENT BUYER REVIEWS & INTERACTIVE SUBMISSION SECTION */}
            <section className="liquid-glass-card rounded-3xl border border-white/80 p-5 sm:p-7 shadow-xs space-y-5">
              {/* Reviews Header & Overall Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <IconStar className="w-5 h-5 text-amber-500" />
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-text-main">
                      Reseñas de Compradores
                    </h2>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Opiniones reales de compañeros y estudiantes de UTP Piura
                  </p>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-3 liquid-glass p-2 px-3.5 rounded-2xl border border-white/70 shadow-xs shrink-0 self-start sm:self-auto">
                  <div className="text-center">
                    <span className="font-heading text-xl font-extrabold text-text-main leading-none block">
                      {emprendimiento.calificacion ? Number(emprendimiento.calificacion).toFixed(1) : '5.0'}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 text-amber-500 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconStar key={star} className="w-2.5 h-2.5 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-border/60 pl-2.5 text-xs text-text-secondary">
                    <p className="font-heading font-bold text-text-main text-xs">
                      {emprendimiento.resenas?.length || emprendimiento.totalResenas || 0} opiniones
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                      <IconVerified className="w-3 h-3 text-emerald-600" />
                      <span>100% Estudiantes UTP</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Reviews List (Left) + Submission Form (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left: List of Reviews (7 Cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="font-heading text-xs sm:text-sm font-bold text-text-main flex items-center justify-between">
                    <span>Opiniones Recientes ({emprendimiento.resenas?.length || 0})</span>
                    <span className="text-[10px] text-text-muted font-normal">Ordenadas por fecha</span>
                  </h3>

                  {emprendimiento.resenas && emprendimiento.resenas.length > 0 ? (
                    <div className="space-y-2.5">
                      {emprendimiento.resenas.map((res) => {
                        const initial = res.estudianteNombre ? res.estudianteNombre.charAt(0).toUpperCase() : 'U';
                        return (
                          <div
                            key={res.id}
                            className="liquid-glass p-3 sm:p-3.5 rounded-2xl border border-white/60 space-y-1 hover:border-primary/40 transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-full liquid-glass-crimson text-white flex items-center justify-center font-heading font-bold text-[11px] shadow-xs shrink-0">
                                  {initial}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-heading text-xs font-bold text-text-main truncate">
                                      {res.estudianteNombre}
                                    </span>
                                    {res.verificado && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full liquid-glass-emerald text-[9px] font-bold">
                                        <IconCheck className="w-2.5 h-2.5 text-emerald-700" />
                                        <span>Comprador UTP</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-text-muted block truncate">
                                    {res.carreraCiclo || 'Estudiante UTP'}
                                  </span>
                                </div>
                              </div>

                              {/* Star Rating Badge (Compacto y Seguro para Móvil - Sin Desborde) */}
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full liquid-glass-badge border border-amber-300/40 text-amber-600 font-heading font-extrabold text-[11px] shrink-0 shadow-xs">
                                <IconStar className="w-3 h-3 text-amber-500" />
                                <span>{res.calificacion ? Number(res.calificacion).toFixed(1) : '5.0'}</span>
                              </div>
                            </div>

                            <p className="text-xs text-text-secondary leading-relaxed pt-0.5">
                              "{res.comentario}"
                            </p>

                            {res.fotoUrl && (
                              <div className="pt-1.5">
                                <img
                                  src={res.fotoUrl}
                                  alt="Foto de la reseña"
                                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-primary/20 shadow-xs hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => window.open(res.fotoUrl, '_blank')}
                                  title="Ver foto en tamaño completo"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="liquid-glass p-6 rounded-2xl border border-white/60 text-center space-y-1.5">
                      <p className="font-heading text-xs font-bold text-text-main">Aún no hay reseñas para esta tienda</p>
                      <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
                        ¿Compraste aquí? Sé el primer estudiante en contar tu experiencia en el formulario contiguo.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Interactive Review Submission Form (5 Cols) */}
                <div className="lg:col-span-5 liquid-glass p-4 sm:p-5 rounded-3xl border border-white/80 shadow-xs space-y-3.5">
                  <div className="space-y-0.5">
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-text-main flex items-center gap-1.5">
                      <IconStar className="w-4 h-4 text-primary" />
                      <span>Dejar una reseña como comprador</span>
                    </h3>
                    <p className="text-[11px] text-text-secondary">
                      Tu opinión ayuda a otros compañeros de la UTP a conocer la calidad y puntualidad del puesto.
                    </p>
                  </div>

                  {mensajeResena && (
                    <div
                      className={`p-2.5 rounded-2xl text-xs flex items-center gap-2 ${
                        mensajeResena.tipo === 'success'
                          ? 'liquid-glass-emerald border border-emerald-300'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <span className="shrink-0">
                        {mensajeResena.tipo === 'success' ? <IconCheck className="w-4 h-4 text-emerald-700" /> : <IconClose className="w-4 h-4 text-red-700" />}
                      </span>
                      <span>{mensajeResena.texto}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitResena} className="space-y-3">
                    {/* Star Rating Selector */}
                    <div>
                      <label className="block font-heading text-[11px] font-bold text-text-main mb-1">
                        Calificación del servicio:
                      </label>
                      <div className="flex items-center gap-1 liquid-glass p-2 rounded-xl border border-white/60">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= (formHoverCalificacion || formCalificacion);
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormCalificacion(star)}
                              onMouseEnter={() => setFormHoverCalificacion(star)}
                              onMouseLeave={() => setFormHoverCalificacion(0)}
                              className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                              title={`${star} estrellas`}
                            >
                              <IconStar className={`w-4 h-4 ${isFilled ? 'text-amber-500' : 'text-gray-300'}`} />
                            </button>
                          );
                        })}
                        <span className="font-heading text-[11px] font-bold text-text-secondary ml-1.5">
                          {formCalificacion === 5 && '5/5 Excelente'}
                          {formCalificacion === 4 && '4/5 Muy Bueno'}
                          {formCalificacion === 3 && '3/5 Bueno'}
                          {formCalificacion === 2 && '2/5 Regular'}
                          {formCalificacion === 1 && '1/5 Regular'}
                        </span>
                      </div>
                    </div>

                    {/* Optional Photo Attachment (Sin sección activa UTP) */}
                    <div>
                      <label className="block font-heading text-[11px] font-bold text-text-main mb-1">
                        Foto del producto o entrega (opcional):
                      </label>
                      {formFotoResena ? (
                        <div className="relative inline-block group">
                          <img
                            src={formFotoResena}
                            alt="Foto adjunta"
                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/30 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveReviewPhoto}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
                            title="Quitar foto"
                          >
                            <IconClose className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex items-center gap-2.5 p-2.5 rounded-2xl liquid-glass border border-dashed border-primary/30 hover:border-primary/60 text-text-secondary hover:text-text-main transition-all group">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center shrink-0 transition-colors">
                            <span className="material-symbols-outlined text-lg">add_a_photo</span>
                          </div>
                          <div className="text-[11px] text-left">
                            <span className="font-heading font-bold text-text-main block">
                              Adjuntar foto de tu pedido
                            </span>
                            <span className="text-[10px] text-text-muted">
                              Muestra cómo te llegó el producto en el campus
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReviewPhotoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Comment Area */}
                    <div>
                      <label className="block font-heading text-[11px] font-bold text-text-main mb-1">
                        Tu opinión sobre el producto y entrega: *
                      </label>
                      <textarea
                        value={formComentario}
                        onChange={(e) => setFormComentario(e.target.value)}
                        placeholder="¿Qué tal estuvo el pedido? ¿La entrega en tu aula o piso fue rápida?"
                        rows={2}
                        maxLength={500}
                        required
                        className="w-full liquid-glass text-xs text-text-main px-3 py-2 rounded-xl border border-white/60 outline-none focus:border-primary transition-colors resize-none placeholder:text-text-muted"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={enviandoResena}
                      className="w-full py-2.5 px-4 rounded-full liquid-glass-crimson hover:brightness-110 text-white font-heading font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                    >
                      {enviandoResena ? (
                        <span>Publicando opinión...</span>
                      ) : (
                        <>
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Publicar mi reseña en el campus</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>



      {/* Modal de Vista Previa de Perfil del Vendedor */}
      {emprendimiento && (
        <ProfilePreviewModal
          user={{
            nombre: emprendimiento.vendedorNombre || emprendimiento.nombre,
            avatar: sellerAvatar,
            rol: 'vendedor',
            carrera: emprendimiento.carreraCiclo || 'Ing. Sistemas',
            ciclo: 'Campus Piura',
            bio: emprendimiento.descripcion || 'Vendedor oficial verificado en Campus UTP Piura.',
            torreHabitual: emprendimiento.torre || 'Torre A',
            piso: emprendimiento.piso || '',
            emprendimientoId: emprendimiento.id,
            tiendaNombre: emprendimiento.nombre,
            redesSociales: [
              { id: '1', plataforma: 'whatsapp', handle: emprendimiento.whatsapp || emprendimiento.telefono || '972341311', visible: true },
              { id: '2', plataforma: 'instagram', handle: (emprendimiento.vendedorNombre || emprendimiento.nombre).toLowerCase().replace(/\s+/g, '.'), visible: true },
              { id: '3', plataforma: 'tiktok', handle: `${(emprendimiento.vendedorNombre || emprendimiento.nombre).toLowerCase().replace(/\s+/g, '_')}_utp`, visible: true },
            ],
          }}
          isOpen={showSellerModal}
          onClose={() => setShowSellerModal(false)}
        />
      )}
    </div>
  );
}
