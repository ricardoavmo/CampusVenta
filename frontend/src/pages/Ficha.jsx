import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmprendimientoById, crearResena } from '../services/api';

export default function Ficha() {
  const { id } = useParams();
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Cantidades por producto (id_producto -> cantidad)
  const [quantities, setQuantities] = useState({});

  // Estado del formulario de nueva reseña
  const [formCalificacion, setFormCalificacion] = useState(5);
  const [formHoverCalificacion, setFormHoverCalificacion] = useState(0);
  const [formComentario, setFormComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [mensajeResena, setMensajeResena] = useState(null);

  const fetchFicha = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      setErrorMessage('');
      const data = await getEmprendimientoById(id);
      setEmprendimiento(data);

      // Inicializar cantidades de productos
      if (data.productos && data.productos.length > 0) {
        const initialQtys = {};
        data.productos.forEach((p) => {
          initialQtys[p.id] = 1;
        });
        setQuantities(initialQtys);
      }
    } catch (err) {
      console.error('Error al cargar la ficha:', err);
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
      };

      const resenaGuardada = await crearResena(id, nuevaResenaPayload);

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

    if (torre.includes('torre a')) {
      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 10 · Terraza & Talleres</span>
            <span className="text-[10px]">Piso superior</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 7 · Laboratorios Especializados</span>
            <span className="text-[10px]">Libre</span>
          </div>
          {/* NIVEL ACTIVO */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
              </span>
              <span className="text-primary font-heading">
                {emprendimiento.piso} · Aula / Zona de Estudio
              </span>
            </div>
            <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">my_location</span>
              <span>Entrega aquí</span>
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 2 · Salas de Cómputo</span>
            <span className="text-[10px]">Libre</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 1 · Hall Principal Torre A</span>
            <span className="text-[10px]">Acceso</span>
          </div>
        </div>
      );
    }

    if (torre.includes('torre b')) {
      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 7 · Cubículos de Asesoría</span>
            <span className="text-[10px]">Piso superior</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 5 · Aulas Teóricas</span>
            <span className="text-[10px]">Libre</span>
          </div>
          {/* NIVEL ACTIVO */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
              </span>
              <span className="text-primary font-heading">
                {emprendimiento.piso} · Pasillo Central
              </span>
            </div>
            <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">my_location</span>
              <span>Entrega aquí</span>
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Piso 1 · Hall Torre B</span>
            <span className="text-[10px]">Acceso</span>
          </div>
        </div>
      );
    }

    if (torre.includes('biblioteca')) {
      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Nivel 2 · Salas de Estudio Silencioso</span>
            <span className="text-[10px]">Silencio</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-primary text-text-main font-bold shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
              </span>
              <span className="text-primary font-heading">
                {emprendimiento.piso} · Módulos y Salas Grupales
              </span>
            </div>
            <span className="bg-accent text-white text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">my_location</span>
              <span>Punto de entrega</span>
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-text-muted">
            <span>Nivel 1 · Mostrador de Préstamos</span>
            <span className="text-[10px]">Ingreso</span>
          </div>
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
      {/* 1. TOP HEADER STITCH */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-brutal transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-2xl">storefront</span>
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-primary">
              Campus<span className="text-secondary">Venta</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-text-main text-xs font-heading font-bold border border-border transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Volver al marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* ESTADO: CARGANDO */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-surface rounded-2xl border border-border p-8 shadow-brutal space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 h-96 bg-surface rounded-2xl border border-border p-6 shadow-brutal"></div>
              <div className="lg:col-span-7 h-96 bg-surface rounded-2xl border border-border p-6 shadow-brutal"></div>
            </div>
          </div>
        )}

        {/* ESTADO: ERROR CONTROLADO (404 U OTRO) */}
        {!loading && errorStatus && (
          <div className="bg-surface rounded-2xl p-10 border border-border shadow-brutal text-center max-w-lg mx-auto space-y-5 my-12">
            <div className="w-16 h-16 rounded-full bg-surface-container text-primary mx-auto flex items-center justify-center">
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
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-dark text-white font-heading font-bold text-xs shadow-brutal hover:bg-text-main transition-all"
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span>Explorar marketplace</span>
              </Link>
            </div>
          </div>
        )}

        {/* ESTADO: DETALLE COMPLETO */}
        {!loading && !errorStatus && emprendimiento && (
          <div className="space-y-8">
            {/* STORE HERO PROFILE HEADER */}
            <section className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-brutal space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  {/* Seller Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={emprendimiento.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={emprendimiento.vendedorNombre || emprendimiento.nombre}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-border shadow-brutal"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full ring-2 ring-white animate-pulse"></span>
                  </div>

                  {/* Name & Academic Bio */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary font-heading text-xs font-extrabold uppercase tracking-wider border border-border">
                        {emprendimiento.categoria}
                      </span>
                      {emprendimiento.disponible ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-container text-accent font-heading text-xs font-bold border border-accent/20">
                          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                          Activo en campus
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-text-muted font-heading text-xs font-medium">
                          Offline
                        </span>
                      )}
                    </div>

                    <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-main mt-1.5 leading-tight">
                      {emprendimiento.nombre}
                    </h1>

                    <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-1.5 mt-1 font-medium">
                      <span>Por {emprendimiento.vendedorNombre || 'Estudiante Emprendedor'}</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-secondary font-bold">{emprendimiento.carreraCiclo || 'Comunidad UTP'}</span>
                      <span className="text-text-muted">·</span>
                      <span className="font-mono text-xs text-text-muted">UTP Sede Piura</span>
                    </p>
                  </div>
                </div>

                {/* Quick Stats Pill Carousel */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-accent-container text-accent px-3 py-1.5 rounded-full border border-accent/20 font-heading text-xs font-bold shadow-sm">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span>{emprendimiento.calificacion ? Number(emprendimiento.calificacion).toFixed(1) : '5.0'}</span>
                    <span className="text-text-secondary font-medium">({emprendimiento.totalResenas || emprendimiento.resenas?.length || 0} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-container text-text-main px-3 py-1.5 rounded-full border border-border font-heading text-xs font-bold shadow-sm">
                    <span className="material-symbols-outlined text-base text-primary">local_fire_department</span>
                    <span>+350 entregas</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-container text-text-main px-3 py-1.5 rounded-full border border-border font-heading text-xs font-bold shadow-sm">
                    <span className="material-symbols-outlined text-base text-secondary">schedule</span>
                    <span>Entrega: {emprendimiento.tiempoEntrega || '~4 min'}</span>
                  </div>
                </div>
              </div>

              {/* Description Paragraph */}
              <p className="text-text-secondary text-sm sm:text-base max-w-4xl leading-relaxed">
                {emprendimiento.descripcion}
              </p>

              {/* Payment Accepted Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                <span className="font-heading text-xs text-text-muted uppercase tracking-wider font-bold">
                  Pagos en campus:
                </span>
                <span className="px-3 py-1 bg-[#832685]/10 text-[#832685] rounded-full font-heading text-xs font-bold flex items-center gap-1.5 border border-[#832685]/20">
                  <span className="w-2 h-2 rounded-full bg-[#832685]"></span> Yape
                </span>
                <span className="px-3 py-1 bg-[#00A9E0]/10 text-[#00A9E0] rounded-full font-heading text-xs font-bold flex items-center gap-1.5 border border-[#00A9E0]/20">
                  <span className="w-2 h-2 rounded-full bg-[#00A9E0]"></span> Plin
                </span>
                <span className="px-3 py-1 bg-surface-container text-text-main rounded-full font-heading text-xs font-bold flex items-center gap-1.5 border border-border">
                  <span className="material-symbols-outlined text-sm text-text-secondary">payments</span>
                  <span>Efectivo exacto</span>
                </span>
                <span className="px-3 py-1 bg-[#002A8F]/10 text-[#002A8F] rounded-full font-heading text-xs font-bold flex items-center gap-1.5 border border-[#002A8F]/20">
                  <span className="material-symbols-outlined text-sm text-[#002A8F]">account_balance</span>
                  <span>BCP / Transferencia</span>
                </span>
              </div>
            </section>

            {/* 3. MAIN TWO COLUMN GRID: Live Radar Location & Product Catalog */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Real-Time Radar & Location Widget (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
                {/* Real-Time Presence Card */}
                <div className="bg-surface rounded-2xl border border-border shadow-brutal p-6 space-y-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-accent font-heading text-xs uppercase tracking-wider font-bold">
                      <span className="material-symbols-outlined text-base">radar</span>
                      <span>Ubicación en campus UTP</span>
                    </div>
                    <span className="text-[11px] text-text-muted font-medium">Actualizado hoy</span>
                  </div>

                  {/* Status Highlight Card */}
                  <div className="bg-surface-container rounded-xl p-4 border border-border flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <span className="material-symbols-outlined text-xl">person_pin_circle</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-text-main">
                          {emprendimiento.torre} · {emprendimiento.piso}
                        </span>
                        <span className="bg-primary-container text-primary px-2 py-0.5 rounded-full font-heading text-[10px] font-bold border border-primary/20">
                          Punto Activo
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        Punto de entrega coordinado en la zona asignada para entregas rápidas entre clases.
                      </p>
                      <div className="flex items-center gap-1.5 text-accent text-xs font-semibold mt-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Permanencia hoy: hasta las 6:30 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Floor Schematic */}
                  <div className="bg-surface-container rounded-xl p-4 border border-border space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading text-xs font-bold text-text-main flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">domain</span>
                        <span>Esquema de Niveles · {emprendimiento.torre}</span>
                      </span>
                      <span className="text-[10px] text-text-muted font-mono font-bold">Sede Piura</span>
                    </div>

                    {renderEsquemaNiveles()}
                  </div>

                  {/* Direct WhatsApp Store CTA */}
                  <div className="space-y-2 pt-2">
                    <a
                      href={getWhatsAppOrderUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3.5 px-5 rounded-full font-heading text-xs font-bold flex items-center justify-center gap-2.5 shadow-brutal transition-all transform hover:-translate-y-0.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">chat</span>
                      <span>Coordinar pedido con el vendedor por WhatsApp</span>
                    </a>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted pt-2 font-medium">
                      <span className="material-symbols-outlined text-sm text-accent">verified_user</span>
                      <span>Comunidad estudiantil UTP Piura · Sin comisiones</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: MULTI-PRODUCT CATALOG (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Live Daily Inventory Notice Banner */}
                <div className="bg-primary-container border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-xl">inventory_2</span>
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-text-main">Disponibilidad en Campus</p>
                      <p className="text-xs text-text-secondary">
                        Lote fresco de hoy listo para entrega inmediata en mano.
                      </p>
                    </div>
                  </div>
                  <span className="bg-surface font-heading text-xs font-extrabold px-3 py-1 rounded-full text-text-main border border-border shrink-0 shadow-sm">
                    {emprendimiento.productos?.length || 1} opciones
                  </span>
                </div>

                {/* Catalog Section Title */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-main">
                      Catálogo de Productos Disponibles
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Selecciona la cantidad que deseas y coordina tu pedido directo
                    </p>
                  </div>
                </div>

                {/* PRODUCT CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {emprendimiento.productos && emprendimiento.productos.length > 0 ? (
                    emprendimiento.productos.map((prod) => {
                      const qty = quantities[prod.id] || 1;
                      return (
                        <div
                          key={prod.id}
                          className="bg-surface rounded-2xl border border-border shadow-brutal hover:shadow-brutal-primary transition-all overflow-hidden flex flex-col justify-between group"
                        >
                          <div>
                            {/* Product Image */}
                            <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                              <img
                                src={prod.imagenUrl || emprendimiento.imagenUrl || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80'}
                                alt={prod.nombre}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {prod.badge && (
                                <span className="absolute top-2.5 left-2.5 bg-primary text-white font-heading text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">local_fire_department</span>
                                  <span>{prod.badge}</span>
                                </span>
                              )}
                              {prod.stock && (
                                <span className="absolute bottom-2.5 right-2.5 bg-surface/95 backdrop-blur-md text-text-main font-heading text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-border">
                                  Quedan {prod.stock} u.
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-heading text-base font-bold text-text-main group-hover:text-primary transition-colors leading-snug">
                                  {prod.nombre}
                                </h3>
                                <span className="font-heading text-base font-extrabold text-primary whitespace-nowrap">
                                  S/ {Number(prod.precio).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                                {prod.descripcion}
                              </p>
                            </div>
                          </div>

                          {/* Product Order Controls */}
                          <div className="p-4 pt-0 space-y-3">
                            {/* Counter */}
                            <div className="flex items-center justify-between bg-surface-container px-3 py-1.5 rounded-xl border border-border">
                              <span className="text-xs text-text-secondary font-medium">Cantidad:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(prod.id, -1)}
                                  className="w-6 h-6 rounded-md bg-surface hover:bg-surface-container-high border border-border flex items-center justify-center text-text-main font-bold text-xs transition-colors"
                                >
                                  -
                                </button>
                                <span className="font-heading text-xs font-bold text-text-main w-5 text-center">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(prod.id, 1)}
                                  className="w-6 h-6 rounded-md bg-surface hover:bg-surface-container-high border border-border flex items-center justify-center text-text-main font-bold text-xs transition-colors"
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
                              className="w-full bg-dark hover:bg-text-main text-white py-2.5 px-4 rounded-full font-heading text-xs font-bold flex items-center justify-center gap-2 shadow-brutal transition-all"
                            >
                              <span className="material-symbols-outlined text-sm text-[#25D366]">chat</span>
                              <span>Pedir {qty}x por WhatsApp (S/ {(Number(prod.precio) * qty).toFixed(2)})</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 bg-surface p-6 rounded-2xl border border-border text-center space-y-3">
                      <p className="text-xs text-text-secondary">Consulta el catálogo general directamente por WhatsApp.</p>
                      <a
                        href={getWhatsAppOrderUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#10B981] text-white font-heading font-bold text-xs shadow-brutal"
                      >
                        Contactar al vendedor
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. STUDENT BUYER REVIEWS & INTERACTIVE SUBMISSION SECTION */}
            <section className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-brutal space-y-8">
              {/* Reviews Header & Overall Score */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rating text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      reviews
                    </span>
                    <h2 className="font-heading text-2xl font-bold text-text-main">
                      Reseñas de Compradores
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Opiniones reales de compañeros y estudiantes de UTP Piura que compraron en este puesto
                  </p>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-4 bg-surface-container p-3.5 px-5 rounded-2xl border border-border shadow-sm shrink-0">
                  <div className="text-center">
                    <span className="font-heading text-3xl font-extrabold text-text-main leading-none block">
                      {emprendimiento.calificacion ? Number(emprendimiento.calificacion).toFixed(1) : '5.0'}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 text-rating mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-base"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-border pl-4 text-xs text-text-secondary">
                    <p className="font-heading font-bold text-text-main text-sm">
                      {emprendimiento.resenas?.length || emprendimiento.totalResenas || 0} opiniones
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-accent">verified</span>
                      <span>100% Estudiantes UTP</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Reviews List (Left) + Submission Form (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: List of Reviews (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-heading text-base font-bold text-text-main flex items-center justify-between">
                    <span>Opiniones Recientes ({emprendimiento.resenas?.length || 0})</span>
                    <span className="text-xs text-text-muted font-normal">Ordenadas por fecha</span>
                  </h3>

                  {emprendimiento.resenas && emprendimiento.resenas.length > 0 ? (
                    <div className="space-y-3.5">
                      {emprendimiento.resenas.map((res) => {
                        const initial = res.estudianteNombre ? res.estudianteNombre.charAt(0).toUpperCase() : 'U';
                        return (
                          <div
                            key={res.id}
                            className="bg-surface-container p-4 rounded-xl border border-border space-y-2 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-xs shadow-sm shrink-0">
                                  {initial}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-heading text-xs font-bold text-text-main">
                                      {res.estudianteNombre}
                                    </span>
                                    {res.verificado && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-accent-container text-accent text-[9px] font-bold">
                                        <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                        <span>Comprador UTP</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-text-muted">
                                    {res.carreraCiclo || 'Estudiante UTP'}
                                  </span>
                                </div>
                              </div>

                              {/* Stars */}
                              <div className="flex items-center gap-0.5 text-rating shrink-0">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <span
                                    key={s}
                                    className="material-symbols-outlined text-sm"
                                    style={{
                                      fontVariationSettings: s <= (res.calificacion || 5) ? "'FILL' 1" : "'FILL' 0",
                                      color: s <= (res.calificacion || 5) ? '#D97706' : '#CBD5E1',
                                    }}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                            </div>

                            <p className="text-xs text-text-secondary leading-relaxed pt-1">
                              "{res.comentario}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-surface-container p-8 rounded-xl border border-border text-center space-y-2">
                      <span className="material-symbols-outlined text-text-muted text-3xl">rate_review</span>
                      <p className="font-heading text-sm font-bold text-text-main">Aún no hay reseñas para esta tienda</p>
                      <p className="text-xs text-text-secondary max-w-sm mx-auto">
                        ¿Compraste aquí? Sé el primer estudiante en contar tu experiencia en el formulario contiguo.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Interactive Review Submission Form (5 Cols) */}
                <div className="lg:col-span-5 bg-surface-container p-5 sm:p-6 rounded-2xl border border-border shadow-sm space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-base font-bold text-text-main flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                      <span>Dejar una reseña como comprador</span>
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Tu opinión ayuda a otros compañeros de la UTP a conocer la calidad y puntualidad del puesto.
                    </p>
                  </div>

                  {mensajeResena && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        mensajeResena.tipo === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base shrink-0">
                        {mensajeResena.tipo === 'success' ? 'check_circle' : 'error'}
                      </span>
                      <span>{mensajeResena.texto}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitResena} className="space-y-3.5">
                    {/* Star Rating Selector */}
                    <div>
                      <label className="block font-heading text-xs font-bold text-text-main mb-1.5">
                        Calificación del servicio:
                      </label>
                      <div className="flex items-center gap-1.5 bg-surface p-2.5 rounded-xl border border-border">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= (formHoverCalificacion || formCalificacion);
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormCalificacion(star)}
                              onMouseEnter={() => setFormHoverCalificacion(star)}
                              onMouseLeave={() => setFormHoverCalificacion(0)}
                              className="focus:outline-none transition-transform hover:scale-110"
                              title={`${star} estrellas`}
                            >
                              <span
                                className="material-symbols-outlined text-2xl cursor-pointer"
                                style={{
                                  fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0",
                                  color: isFilled ? '#D97706' : '#CBD5E1',
                                }}
                              >
                                star
                              </span>
                            </button>
                          );
                        })}
                        <span className="font-heading text-xs font-bold text-text-secondary ml-2">
                          {formCalificacion === 5 && 'Excelente (5/5)'}
                          {formCalificacion === 4 && 'Muy Bueno (4/5)'}
                          {formCalificacion === 3 && 'Bueno (3/5)'}
                          {formCalificacion === 2 && 'Regular (2/5)'}
                          {formCalificacion === 1 && 'Por mejorar (1/5)'}
                        </span>
                      </div>
                    </div>

                    {/* Authenticated Student Session Indicator (No need to manually input name or career) */}
                    <div className="p-3 bg-surface rounded-xl border border-border flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-xs shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-base">verified_user</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-heading font-bold text-text-main flex items-center gap-1.5">
                          <span>Sesión activa UTP</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-accent-container text-accent text-[10px] font-bold">Verificado</span>
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Tu reseña se registrará vinculada a tu cuenta institucional
                        </span>
                      </div>
                    </div>

                    {/* Comment Area */}
                    <div>
                      <label className="block font-heading text-xs font-bold text-text-main mb-1">
                        Tu opinión sobre el producto y entrega: *
                      </label>
                      <textarea
                        value={formComentario}
                        onChange={(e) => setFormComentario(e.target.value)}
                        placeholder="¿Qué tal estuvo el pedido? ¿La entrega en tu aula o piso fue rápida?"
                        rows={3}
                        maxLength={500}
                        required
                        className="w-full bg-surface text-xs text-text-main px-3.5 py-2 rounded-xl border border-border outline-none focus:border-primary transition-colors resize-none"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={enviandoResena}
                      className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary-hover text-white font-heading font-bold text-xs shadow-brutal flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    >
                      {enviandoResena ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          <span>Publicando opinión...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send</span>
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

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© 2026 CampusVenta — Marketplace Estudiantil UTP Sede Piura</p>
          <Link to="/" className="text-primary hover:underline font-bold">
            ← Volver al Marketplace
          </Link>
        </div>
      </footer>
    </div>
  );
}
