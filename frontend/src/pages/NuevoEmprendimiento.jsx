import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { crearEmprendimiento } from '../services/api';

const CATEGORIAS = [
  { id: 'POSTRES', label: 'Dulces & Postres', icon: 'bakery_dining' },
  { id: 'COMIDA', label: 'Bajones & Snacks', icon: 'lunch_dining' },
  { id: 'ACCESORIOS', label: 'Accesorios & Merch', icon: 'shopping_bag' },
  { id: 'SERVICIOS', label: 'Apuntes & Tutorías', icon: 'menu_book' },
  { id: 'TECNOLOGIA', label: 'Cables & Gadgets', icon: 'devices' },
];

const PISOS_POR_TORRE = {
  'Torre A': [
    'Piso -1',
    'Piso 1',
    'Piso 2',
    'Piso 3',
    'Piso 4',
    'Piso 5',
    'Piso 6',
    'Piso 7',
    'Piso 8',
    'Piso 9',
    'Piso 10'
  ],
  'Torre B': [
    'Piso -1',
    'Piso 1',
    'Piso 2',
    'Piso 3',
    'Piso 4',
    'Piso 5',
    'Piso 6',
    'Piso 7'
  ],
  'Canchas': [
    'Nivel Exterior / Patios'
  ]
};

export default function NuevoEmprendimiento() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [vendedorNombre, setVendedorNombre] = useState('');
  const [carreraCiclo, setCarreraCiclo] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [categoria, setCategoria] = useState('POSTRES');
  const [descripcion, setDescripcion] = useState('');
  const [precioDesde, setPrecioDesde] = useState('');
  const [torre, setTorre] = useState('Torre A');
  const [piso, setPiso] = useState('Piso 3');
  const [tiempoEntrega, setTiempoEntrega] = useState('2 - 5 min');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300');
  const [imagenUrl, setImagenUrl] = useState('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600');

  const handleStorePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError('La foto de la tienda debe ser menor a 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setError('Por favor ingresa un número de WhatsApp válido (mínimo 9 dígitos).');
      return;
    }

    if (!precioDesde || Number(precioDesde) <= 0) {
      setError('Por favor indica un precio inicial mayor a 0.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      vendedorNombre: vendedorNombre.trim(),
      carreraCiclo: carreraCiclo.trim() || 'Estudiante UTP',
      whatsapp: cleanPhone,
      categoria,
      descripcion: descripcion.trim(),
      precioDesde: parseFloat(precioDesde),
      torre,
      piso,
      tiempoEntrega,
      disponible: true,
      calificacion: 5.0,
      totalResenas: 1,
      avatarUrl,
      imagenUrl,
      productos: [
        {
          nombre: `Pack Especial de ${nombre.trim()}`,
          descripcion: 'El producto estrella de nuestro puesto en campus.',
          precio: parseFloat(precioDesde),
          disponible: true,
          imagenUrl,
        }
      ],
      resenas: [
        {
          estudianteNombre: 'Comunidad UTP',
          carreraCiclo: 'Sede Piura',
          calificacion: 5,
          comentario: '¡Excelente atención y entrega rápida entre clases! 100% recomendado.',
          verificado: true,
        }
      ]
    };

    try {
      setSubmitting(true);
      const res = await crearEmprendimiento(payload);
      if (res && res.id) {
        navigate(`/emprendimiento/${res.id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error al registrar emprendimiento:', err);
      setError(
        err.response?.data?.message ||
        'Ocurrió un error al registrar tu tienda. Verifica que el backend esté conectado a PostgreSQL.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased pb-32 sm:pb-16">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Header */}
        <section className="liquid-glass rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-primary font-heading font-bold text-xs uppercase tracking-wider w-fit">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            <span>UTP Piura · Modo Emprendedor</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight">
            Crea tu Puesto en <span className="text-primary">CampusVenta</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Publica tus postres, snacks, accesorios o servicios para que tus compañeros te encuentren en el receso por torre y piso sin pagar comisiones.
          </p>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Main Registration Form */}
        <form onSubmit={handleSubmit} className="liquid-glass-card rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Section 1: Datos Personales */}
          <div>
            <h2 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-secondary text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Datos del Estudiante Emprendedor</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Tu Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={vendedorNombre}
                  onChange={(e) => setVendedorNombre(e.target.value)}
                  placeholder="Ej: Camila Salazar"
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs text-text-main outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Carrera y Ciclo</label>
                <input
                  type="text"
                  value={carreraCiclo}
                  onChange={(e) => setCarreraCiclo(e.target.value)}
                  placeholder="Ej: Ing. Sistemas · 6to Ciclo"
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs text-text-main outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Número de WhatsApp (para recibir pedidos) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 font-heading font-bold text-xs text-primary">+51</span>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="987654321"
                    className="w-full pl-14 pr-3.5 py-2.5 liquid-glass border border-white/60 rounded-xl text-xs text-text-main outline-none focus:border-primary shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Section 2: Datos de la Tienda */}
          <div>
            <h2 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Identidad del Emprendimiento</span>
            </h2>

            {/* Subir Foto / Logo Oficial de la Tienda (Independiente del vendedor) */}
            <div className="mt-3 p-4 rounded-2xl bg-surface-container/60 border border-border flex items-center gap-4">
              <img
                src={avatarUrl}
                alt="Logo Tienda"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <span className="font-heading font-bold text-xs text-text-main block">
                  Foto o Logo del Puesto
                </span>
                <p className="text-[11px] text-text-muted my-1">
                  Esta imagen identificará tu tienda en el campus. Tu foto de perfil como estudiante permanece separada.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-text-main hover:bg-slate-50 border border-border text-xs font-heading font-bold shadow-2xs active:scale-95 transition-all">
                  <span>Subir Foto del Puesto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStorePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Nombre Comercial de tu Puesto *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: SweetHub UTP, Postres Valeria..."
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs text-text-main outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Categoría del Rubro *</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs font-heading font-bold text-text-main outline-none focus:border-primary"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Descripción de tus productos o servicios *</label>
                <textarea
                  rows="3"
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe qué ofreces, sabores, presentaciones o promociones..."
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs text-text-main outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Precio Inicial / Base (S/) *</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={precioDesde}
                  onChange={(e) => setPrecioDesde(e.target.value)}
                  placeholder="Ej: 3.50"
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs text-text-main outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Tiempo Estimado de Entrega</label>
                <input
                  type="text"
                  value={tiempoEntrega}
                  onChange={(e) => setTiempoEntrega(e.target.value)}
                  placeholder="Ej: 2 - 5 min"
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs text-text-main outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Section 3: Ubicación Física en Campus */}
          <div>
            <h2 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-accent text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Ubicación Inicial en Campus (Geolocalización UTP)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Torre / Zona habitual</label>
                <select
                  value={torre}
                  onChange={(e) => {
                    const newTorre = e.target.value;
                    setTorre(newTorre);
                    const available = PISOS_POR_TORRE[newTorre] || [];
                    if (!available.includes(piso)) {
                      setPiso(available.includes('Piso 1') ? 'Piso 1' : available[0]);
                    }
                  }}
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs font-heading font-bold text-text-main outline-none focus:border-primary"
                >
                  <option value="Torre A">Torre A</option>
                  <option value="Torre B">Torre B</option>
                  <option value="Canchas">Canchas</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-bold text-text-secondary">Piso</label>
                <select
                  value={piso}
                  onChange={(e) => setPiso(e.target.value)}
                  className="px-3.5 py-2.5 bg-surface-container border border-border rounded-xl text-xs font-heading font-bold text-text-main outline-none focus:border-primary"
                >
                  {(PISOS_POR_TORRE[torre] || PISOS_POR_TORRE['Torre A']).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-full bg-white text-text-main hover:bg-slate-50 border border-slate-200/90 shadow-xs text-xs font-heading font-bold transition-all active:scale-95 text-decoration-none text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-full liquid-glass-crimson hover:brightness-110 text-white font-heading font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <span>Publicando puesto...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Publicar y Activar Puesto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
