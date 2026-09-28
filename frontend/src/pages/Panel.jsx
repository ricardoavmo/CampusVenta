import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getEmprendimientos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarEmprendimiento,
  eliminarEmprendimiento
} from '../services/api';
import {
  IconBolt,
  IconVerified,
  IconStore,
  IconStar,
  IconCheck,
  IconClose,
  IconAdd,
  IconClock,
  IconChat,
  IconEdit,
  IconTrash,
  IconPhoto,
  IconWhatsApp
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
    avatarUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=200',
    calificacion: 5.0,
    totalResenas: 8,
    tiempoEntrega: '~3 min',
    descripcion: 'Stickers de programación, llaveros y accesorios para laptops.',
    productosCount: 2,
  },
];

const STORE_PRODUCTS = {
  1: [
    {
      id: 1,
      nombre: 'Brownie Melcochudo Clásico',
      precio: 4.50,
      descripcion: 'Con centro suave de chocolate al 60% y nueces picadas.',
      disponible: true,
      stock: 6,
      badge: 'Más vendido',
      imagenUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      nombre: 'Cookie con Chispas Hershey',
      precio: 3.50,
      descripcion: 'Galleta artesanal horneada hoy mismo con mantequilla pura.',
      disponible: true,
      stock: 4,
      badge: 'Recién horneada',
      imagenUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      nombre: 'Frappé de Moka Helado',
      precio: 6.00,
      descripcion: 'Café expreso con chocolate y leche bien helada.',
      disponible: false,
      stock: 0,
      badge: null,
      imagenUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80'
    },
  ],
  21: [
    {
      id: 211,
      nombre: 'Pack 5 Stickers Dev & Linux',
      precio: 5.00,
      descripcion: 'Stickers de vinil resistentes al agua para laptops y termos.',
      disponible: true,
      stock: 12,
      badge: 'Más vendido',
      imagenUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 212,
      nombre: 'Llavero Acrílico Python UTP',
      precio: 6.50,
      descripcion: 'Llavero corte láser con acabado brillante de alta duración.',
      disponible: true,
      stock: 8,
      badge: 'Top Ventas',
      imagenUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
    },
  ]
};

const ZONAS_CAMPUS = [
  {
    id: 'Torre A',
    label: 'Torre A',
    icon: 'domain',
    floors: [
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
    ]
  },
  {
    id: 'Torre B',
    label: 'Torre B',
    icon: 'storefront',
    floors: [
      'Piso -1',
      'Piso 1',
      'Piso 2',
      'Piso 3',
      'Piso 4',
      'Piso 5',
      'Piso 6',
      'Piso 7'
    ]
  },
  {
    id: 'Canchas',
    label: 'Canchas',
    icon: 'park',
    floors: [
      'Nivel Exterior / Patios'
    ]
  },
];

export default function Panel() {
  const { user, isSeller, isAuthenticated, loginAsDemo, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStoreId = searchParams.get('storeId');
  const urlAction = searchParams.get('action');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/panel' } });
    }
  }, [isAuthenticated, navigate]);

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
    if (urlStoreId) return Number(urlStoreId);
    const saved = localStorage.getItem('campusventa_active_store_id');
    return saved ? Number(saved) : 1;
  });

  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('live'); // 'live' | 'paused' | 'closed'
  const [torre, setTorre] = useState('Torre A');
  const [piso, setPiso] = useState('Piso 1');
  const [referencia, setReferencia] = useState('Frente a los ascensores');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal para agregar / editar producto
  const [showProductModal, setShowProductModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [prodForm, setProdForm] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    stock: 5,
    badge: '',
    imagenUrl: '',
    disponible: true,
  });
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  // Modal para editar datos generales del puesto (foto, nombre, descripción, whatsapp, etc.)
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [storeEditForm, setStoreEditForm] = useState({
    nombre: '',
    categoria: 'POSTRES',
    descripcion: '',
    whatsapp: '',
    tiempoEntrega: '2-5 min',
    horarioAtencion: 'Lun - Vie: 9:00 AM - 6:00 PM',
    avatarUrl: '',
  });

  const [showDeleteStoreModal, setShowDeleteStoreModal] = useState(false);
  const [deletingStore, setDeletingStore] = useState(false);

  const handleOpenEditStore = () => {
    setStoreEditForm({
      nombre: emprendimiento?.nombre || '',
      categoria: emprendimiento?.categoria || 'POSTRES',
      descripcion: emprendimiento?.descripcion || 'Brownies artesanales, galletas con chispas Hershey y frappés.',
      whatsapp: emprendimiento?.whatsapp || '972341311',
      tiempoEntrega: emprendimiento?.tiempoEntrega || '2-5 min',
      horarioAtencion: emprendimiento?.horarioAtencion || 'Lun - Vie: 9:00 AM - 6:00 PM',
      avatarUrl: emprendimiento?.avatarUrl || '',
    });
    setShowEditStoreModal(true);
  };

  const handleStoreAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('La imagen no debe superar los 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setStoreEditForm((prev) => ({ ...prev, avatarUrl: reader.result }));
      showToast('Nueva foto del puesto cargada. Guarda para aplicarla.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStoreData = async (e) => {
    e.preventDefault();
    if (!storeEditForm.nombre.trim()) {
      showToast('El nombre del puesto es obligatorio.');
      return;
    }

    const currentId = emprendimiento?.id || activeStoreId;
    const updatedStore = {
      ...emprendimiento,
      nombre: storeEditForm.nombre.trim(),
      categoria: storeEditForm.categoria,
      descripcion: storeEditForm.descripcion.trim(),
      whatsapp: storeEditForm.whatsapp.trim(),
      tiempoEntrega: storeEditForm.tiempoEntrega.trim(),
      horarioAtencion: storeEditForm.horarioAtencion.trim(),
      avatarUrl: storeEditForm.avatarUrl || emprendimiento?.avatarUrl,
    };

    setEmprendimiento(updatedStore);

    const updatedList = misPuestos.map((s) => (s.id === currentId ? { ...s, ...updatedStore } : s));
    setMisPuestos(updatedList);
    localStorage.setItem('campusventa_mis_puestos', JSON.stringify(updatedList));

    if (user && (user.emprendimientoId === currentId || !user.emprendimientoId)) {
      login({
        ...user,
        tiendaNombre: updatedStore.nombre,
      });
    }

    try {
      if (currentId) {
        await actualizarEmprendimiento(currentId, {
          nombre: updatedStore.nombre,
          categoria: updatedStore.categoria,
          descripcion: updatedStore.descripcion,
          whatsapp: updatedStore.whatsapp,
          tiempoEntrega: updatedStore.tiempoEntrega,
          horarioAtencion: updatedStore.horarioAtencion,
          avatarUrl: updatedStore.avatarUrl,
        });
      }
    } catch (err) {
      console.warn('Backend update error (operating in demo mode):', err);
    }

    setShowEditStoreModal(false);
    showToast(`¡Datos del puesto "${updatedStore.nombre}" actualizados con éxito!`);
  };

  const handleDeleteStore = async () => {
    const currentId = emprendimiento?.id || activeStoreId;
    if (!currentId) return;

    setDeletingStore(true);
    try {
      try {
        await eliminarEmprendimiento(currentId);
      } catch (err) {
        console.warn('Backend delete store error (falling back to local):', err);
      }

      const remainingStores = misPuestos.filter((s) => s.id !== currentId);
      setMisPuestos(remainingStores);
      localStorage.setItem('campusventa_mis_puestos', JSON.stringify(remainingStores));

      showToast(`Puesto "${emprendimiento?.nombre || ''}" eliminado correctamente.`);
      setShowDeleteStoreModal(false);
      setShowEditStoreModal(false);

      if (remainingStores.length > 0) {
        const nextStore = remainingStores[0];
        setActiveStoreId(nextStore.id);
        navigate(`/panel?storeId=${nextStore.id}`);
      } else {
        navigate('/perfil');
      }
    } catch (err) {
      console.error('Error al eliminar puesto:', err);
      showToast('Error al eliminar el puesto.');
    } finally {
      setDeletingStore(false);
    }
  };

  // Productos locales del vendedor
  const [productos, setProductos] = useState(() => {
    return STORE_PRODUCTS[activeStoreId] || STORE_PRODUCTS[1] || [];
  });

  const switchStore = (storeId) => {
    setActiveStoreId(storeId);
    localStorage.setItem('campusventa_active_store_id', String(storeId));
    setSearchParams({ storeId: String(storeId) });
    setShowStoreSwitcher(false);

    const targetStore = misPuestos.find((s) => s.id === storeId) || misPuestos[0];
    if (targetStore) {
      setEmprendimiento({
        id: targetStore.id,
        nombre: targetStore.nombre,
        categoria: targetStore.categoria || 'POSTRES',
        vendedorNombre: user?.nombre || 'Valeria Mendoza',
        carreraCiclo: user?.carrera ? `${user.carrera} (${user.ciclo || 'Campus'})` : 'Ing. Sistemas (6to Ciclo)',
        whatsapp: user?.telefono || '972341311',
        calificacion: targetStore.calificacion || 5.0,
        totalResenas: targetStore.totalResenas || 5,
        tiempoEntrega: targetStore.tiempoEntrega || '~3 min',
        avatarUrl: targetStore.avatarUrl,
        torre: targetStore.torre,
        piso: targetStore.piso,
        descripcion: targetStore.descripcion,
        horarioAtencion: targetStore.horarioAtencion || 'Lun - Vie: 9:00 AM - 6:00 PM',
      });
      setTorre(targetStore.torre || 'Torre A');
      setPiso(targetStore.piso || 'Piso 1');
      if (targetStore.referencia) setReferencia(targetStore.referencia);
      
      let storeProds = [];
      try {
        const cached = localStorage.getItem(`campusventa_products_${targetStore.id}`);
        if (cached) {
          storeProds = JSON.parse(cached);
        }
      } catch {}
      if (!Array.isArray(storeProds) || storeProds.length === 0) {
        storeProds = STORE_PRODUCTS[targetStore.id] || [];
      }
      setProductos(storeProds);
      showToast(`Puesto activo: ${targetStore.nombre}`);
    }
  };

  useEffect(() => {
    if (urlAction === 'new-product') {
      openNewProductModal();
    }
  }, [urlAction]);

  useEffect(() => {
    async function fetchVendorInfo() {
      try {
        setLoading(true);
        const list = await getEmprendimientos();
        const currentId = urlStoreId ? Number(urlStoreId) : activeStoreId;
        const targetFromPuestos = misPuestos.find((s) => s.id === currentId);
        const backendStore = Array.isArray(list) ? list.find((s) => s.id === currentId) : null;

        if (targetFromPuestos) {
          setEmprendimiento({
            id: targetFromPuestos.id,
            nombre: backendStore?.nombre || targetFromPuestos.nombre,
            categoria: backendStore?.categoria || targetFromPuestos.categoria,
            vendedorNombre: backendStore?.vendedorNombre || user?.nombre || 'Valeria Mendoza',
            carreraCiclo: backendStore?.carreraCiclo || (user?.carrera ? `${user.carrera} (${user.ciclo || 'Campus'})` : 'Ing. Sistemas (6to Ciclo)'),
            whatsapp: backendStore?.whatsapp || user?.telefono || '972341311',
            calificacion: backendStore?.calificacion || targetFromPuestos.calificacion || 4.9,
            totalResenas: backendStore?.totalResenas || targetFromPuestos.totalResenas || 14,
            tiempoEntrega: backendStore?.tiempoEntrega || targetFromPuestos.tiempoEntrega || '2-5 min',
            avatarUrl: backendStore?.avatarUrl || targetFromPuestos.avatarUrl,
            torre: backendStore?.torre || targetFromPuestos.torre,
            piso: backendStore?.piso || targetFromPuestos.piso,
            descripcion: backendStore?.descripcion || targetFromPuestos.descripcion,
            horarioAtencion: backendStore?.horarioAtencion || targetFromPuestos.horarioAtencion || 'Lun - Vie: 9:00 AM - 6:00 PM',
          });
          if (backendStore?.torre || targetFromPuestos.torre) setTorre(backendStore?.torre || targetFromPuestos.torre);
          if (backendStore?.piso || targetFromPuestos.piso) setPiso(backendStore?.piso || targetFromPuestos.piso);
        } else if (backendStore) {
          setEmprendimiento(backendStore);
          if (backendStore.torre) setTorre(backendStore.torre);
          if (backendStore.piso) setPiso(backendStore.piso);
        } else if (Array.isArray(list) && list.length > 0) {
          const seller = list[0];
          setEmprendimiento(seller);
          if (seller.torre) setTorre(seller.torre);
          if (seller.piso) setPiso(seller.piso);
        }

        // Cargar productos: Base de datos real + Cache local de este puesto combinados
        let prodsList = [];
        if (backendStore && Array.isArray(backendStore.productos) && backendStore.productos.length > 0) {
          prodsList = [...backendStore.productos];
        }
        try {
          const cached = localStorage.getItem(`campusventa_products_${currentId}`);
          if (cached) {
            const localList = JSON.parse(cached);
            if (Array.isArray(localList)) {
              localList.forEach((lp) => {
                if (!prodsList.some((p) => String(p.id) === String(lp.id) || p.nombre === lp.nombre)) {
                  prodsList.unshift(lp);
                }
              });
            }
          }
        } catch {}

        if (prodsList.length === 0) {
          prodsList = STORE_PRODUCTS[currentId] || STORE_PRODUCTS[1] || [];
        }
        setProductos(prodsList);
      } catch (err) {
        console.error('Error al cargar panel:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendorInfo();
  }, [activeStoreId, urlStoreId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    showToast(`¡Punto guardado en ${torre} (${piso})! Visible para todo el campus.`);
    if (emprendimiento?.id) {
      try {
        await actualizarEmprendimiento(emprendimiento.id, {
          torre,
          piso,
          disponible: status === 'live',
        });
      } catch (err) {
        console.warn('No se pudo guardar la ubicación en el backend:', err);
      }
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('La foto debe ser menor a 4MB.');
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProdForm((prev) => ({ ...prev, imagenUrl: reader.result }));
      setImageUploadLoading(false);
      showToast('Foto cargada correctamente.');
    };
    reader.readAsDataURL(file);
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdForm({
      nombre: '',
      precio: '',
      descripcion: '',
      stock: 5,
      badge: '',
      imagenUrl: '',
      disponible: true,
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProdForm({
      nombre: prod.nombre || '',
      precio: prod.precio !== undefined ? prod.precio : '',
      descripcion: prod.descripcion || '',
      stock: prod.stock !== undefined ? prod.stock : 5,
      badge: prod.badge || '',
      imagenUrl: prod.imagenUrl || '',
      disponible: prod.disponible !== undefined ? prod.disponible : true,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.nombre.trim() || prodForm.precio === '') {
      showToast('Por favor completa el nombre y precio.');
      return;
    }

    const payload = {
      nombre: prodForm.nombre.trim(),
      precio: parseFloat(prodForm.precio),
      descripcion: prodForm.descripcion ? prodForm.descripcion.trim() : '',
      stock: parseInt(prodForm.stock) || 0,
      badge: prodForm.badge ? prodForm.badge.trim() : null,
      imagenUrl: prodForm.imagenUrl ? prodForm.imagenUrl.trim() : null,
      disponible: prodForm.disponible,
    };

    setSavingProduct(true);
    try {
      if (editingProduct) {
        // Actualizar producto existente
        let updated = null;
        if (emprendimiento?.id) {
          try {
            updated = await actualizarProducto(emprendimiento.id, editingProduct.id, payload);
          } catch (apiErr) {
            console.warn('API update failed, guardando localmente:', apiErr);
          }
        }
        const finalProd = updated || { ...editingProduct, ...payload };
        const nextList = productos.map((p) => (p.id === editingProduct.id ? finalProd : p));
        setProductos(nextList);
        try {
          localStorage.setItem(`campusventa_products_${emprendimiento?.id || activeStoreId || 1}`, JSON.stringify(nextList));
        } catch {}
        showToast(`Producto "${finalProd.nombre}" actualizado con éxito.`);
      } else {
        // Crear nuevo producto
        let created = null;
        if (emprendimiento?.id) {
          try {
            created = await crearProducto(emprendimiento.id, payload);
          } catch (apiErr) {
            console.warn('API create failed, guardando localmente:', apiErr);
          }
        }
        const finalProd = created || { id: Date.now(), ...payload };
        const nextList = [finalProd, ...productos];
        setProductos(nextList);
        try {
          localStorage.setItem(`campusventa_products_${emprendimiento?.id || activeStoreId || 1}`, JSON.stringify(nextList));
        } catch {}
        showToast(`Producto "${finalProd.nombre}" publicado en tu catálogo.`);
      }
      setShowProductModal(false);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      showToast('Ocurrió un error al guardar el producto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const prod = productToDelete;
    const productId = prod.id;

    setDeletingProduct(true);
    try {
      if (emprendimiento?.id) {
        try {
          await eliminarProducto(emprendimiento.id, productId);
        } catch (apiErr) {
          console.warn('API delete failed, eliminando localmente:', apiErr);
        }
      }
      const nextList = productos.filter((p) => p.id !== productId);
      setProductos(nextList);
      try {
        localStorage.setItem(`campusventa_products_${emprendimiento?.id || activeStoreId || 1}`, JSON.stringify(nextList));
      } catch {}
      showToast(`Producto "${prod?.nombre || ''}" eliminado.`);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      showToast('Error al eliminar producto.');
    } finally {
      setDeletingProduct(false);
    }
  };

  const toggleProductStock = async (id) => {
    const target = productos.find((p) => p.id === id);
    if (!target) return;
    const nextState = !target.disponible;

    const nextList = productos.map((p) => (p.id === id ? { ...p, disponible: nextState } : p));
    setProductos(nextList);
    try {
      localStorage.setItem(`campusventa_products_${emprendimiento?.id || activeStoreId || 1}`, JSON.stringify(nextList));
    } catch {}

    showToast(nextState ? `"${target.nombre}" marcado disponible` : `"${target.nombre}" marcado agotado`);

    if (emprendimiento?.id) {
      try {
        await actualizarProducto(emprendimiento.id, id, {
          ...target,
          disponible: nextState,
        });
      } catch (err) {
        console.warn('No se pudo sincronizar el stock en el backend:', err);
      }
    }
  };

  const selectedZonaConfig = ZONAS_CAMPUS.find((z) => z.id === torre) || ZONAS_CAMPUS[0];
  const floorsList = selectedZonaConfig.floors;

  const storeId = emprendimiento?.id || 1;

  // Si el usuario autenticado está en Modo Comprador y NO tiene ningún puesto, mostrar su panel personalizado de alumno
  const hasRegisteredStores = Array.isArray(misPuestos) && misPuestos.length > 0;
  if (isAuthenticated && !isSeller && !hasRegisteredStores) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased pb-32 sm:pb-16 selection:bg-primary/20">
        <Navbar />

        <main className="max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          {/* Header Card del Alumno Comprador */}
          <div className="liquid-glass-hero rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 border border-white/80">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'}
                alt={user?.nombre}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary/20 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main">
                    {user?.nombre || 'Alumno UTP'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-heading font-extrabold text-[11px]">
                    Modo Comprador
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {user?.carrera || 'Estudiante UTP'} · {user?.codigo || 'Código UTP'} · Sede Piura
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => loginAsDemo('vendedor')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl liquid-glass-crimson text-white font-heading font-bold text-xs shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <IconStore className="w-4 h-4" />
                <span>Activar Modo Vendedor (Demo)</span>
              </button>
            </div>
          </div>

          {/* Cards de Opciones para Compradores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="liquid-glass rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 border border-white/70">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">storefront</span>
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  Explorar Puestos y Bajones
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Descubre qué compañeros están vendiendo ahora mismo en Torre A, Torre B y Canchas de la UTP.
                </p>
              </div>
              <Link
                to="/"
                className="w-full py-2.5 rounded-xl liquid-glass border border-primary/30 text-primary font-heading font-bold text-xs text-center text-decoration-none hover:bg-white shadow-2xs"
              >
                Ver Puestos en Campus
              </Link>
            </div>

            <div className="liquid-glass rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 border border-white/70">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <IconAdd className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  ¿Quieres vender en el Campus?
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Registra tu puesto estudiantil gratis: postres, bajones, café, accesorios o apuntes.
                </p>
              </div>
              <Link
                to="/nuevo-emprendimiento"
                className="w-full py-2.5 rounded-xl liquid-glass-crimson text-white font-heading font-bold text-xs text-center text-decoration-none shadow-sm hover:brightness-110"
              >
                Registrar Mi Tienda
              </Link>
            </div>
          </div>

          {/* Pedidos recientes */}
          <div className="liquid-glass rounded-3xl p-6 shadow-xs border border-white/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">favorite</span>
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-text-main">
                  Tus pedidos y favoritos
                </h4>
                <p className="text-xs text-text-secondary">
                  Revisa tu historial de pedidos coordinados por WhatsApp.
                </p>
              </div>
            </div>
            <Link
              to="/pedidos"
              className="px-4 py-2 rounded-xl liquid-glass text-xs font-heading font-bold text-text-main hover:bg-white text-decoration-none"
            >
              Ver Pedidos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main font-body antialiased pb-32 sm:pb-16 selection:bg-primary/20">
      <Navbar />

      {/* Floating Animated Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50 liquid-glass-dark text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce-subtle border border-white/20">
          <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-heading font-bold text-xs sm:text-sm leading-tight">{toastMessage}</span>
        </div>
      )}

      {/* Top Identity Hero Banner with Liquid Glass */}
      <section className="relative z-30 liquid-glass border-b border-white/60 pt-6 pb-7 px-4 sm:px-6 lg:px-8 shadow-sm">
        {/* Ambient background glows constrained safely without clipping the section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          {/* Identity Left */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative shrink-0 group">
              <img
                src={
                  emprendimiento?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                }
                alt="Avatar"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-primary/20 shadow-md group-hover:brightness-90 transition-all"
              />
              <button
                type="button"
                onClick={handleOpenEditStore}
                title="Cambiar foto o datos del puesto"
                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
                <span className="text-[9px] font-heading font-bold">Editar</span>
              </button>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white text-[10px] shadow-sm">
                <IconCheck className="w-3 h-3 text-white" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Store Switcher Trigger */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowStoreSwitcher(!showStoreSwitcher)}
                    className="group flex items-center gap-1.5 text-left hover:opacity-90 transition-opacity"
                    title="Haz clic para cambiar entre tus puestos"
                  >
                    <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-[340px]">
                      {emprendimiento?.nombre || 'SweetHub UTP'}
                    </h1>
                    <span className="material-symbols-outlined text-xl text-text-muted group-hover:text-primary transition-transform">
                      {showStoreSwitcher ? 'arrow_drop_up' : 'arrow_drop_down'}
                    </span>
                  </button>

                  {/* Dropdown Menu para cambiar de puesto */}
                  {showStoreSwitcher && (
                    <>
                      {/* Backdrop para cerrar al hacer clic afuera */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowStoreSwitcher(false)}
                      />
                      <div className="fixed inset-x-4 top-28 sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:translate-x-0 w-auto max-w-[340px] sm:w-80 mx-auto sm:mx-0 liquid-glass-card bg-white/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl border border-white/80 z-50 animate-scale-up">
                        <div className="px-3 py-1.5 flex items-center justify-between border-b border-border/40 mb-1">
                          <span className="text-[11px] font-heading font-extrabold text-text-muted uppercase tracking-wider">
                            Mis Puestos Registrados ({misPuestos.length})
                          </span>
                        </div>

                      <div className="max-h-56 overflow-y-auto space-y-1">
                        {misPuestos.map((puesto) => {
                          const isCurrent = (emprendimiento?.id || activeStoreId) === puesto.id;
                          return (
                            <button
                              key={puesto.id}
                              type="button"
                              onClick={() => switchStore(puesto.id)}
                              className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-all ${
                                isCurrent
                                  ? 'bg-primary/10 border border-primary/20 text-primary'
                                  : 'hover:bg-surface-bg text-text-main'
                              }`}
                            >
                              <img
                                src={puesto.avatarUrl}
                                alt={puesto.nombre}
                                className="w-9 h-9 rounded-lg object-cover shrink-0 ring-1 ring-border"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-heading font-bold text-xs truncate">
                                  {puesto.nombre}
                                </div>
                                <div className="text-[10px] text-text-muted truncate">
                                  📍 {puesto.torre} · {puesto.piso}
                                </div>
                              </div>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-heading font-bold shrink-0">
                                  Activo
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2.5 mt-1 border-t border-border/40 flex justify-center">
                        <Link
                          to="/perfil"
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-text-secondary hover:text-text-main font-heading font-bold text-xs flex items-center justify-center text-center gap-1.5 transition-colors text-decoration-none border border-border/60 shadow-2xs"
                        >
                          <IconAdd className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-center">Registrar nuevo puesto en Perfil</span>
                        </Link>
                      </div>
                    </div>
                  </>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full liquid-glass-badge text-primary font-heading font-bold text-[10px] uppercase border border-primary/20 shrink-0">
                  <IconVerified className="w-3 h-3 text-primary" />
                  <span>Verificado</span>
                </span>
                <span className="font-heading font-bold text-xs text-amber-600 flex items-center gap-1 shrink-0">
                  <IconStar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{emprendimiento?.calificacion || '4.9'} ({emprendimiento?.totalResenas || 14})</span>
                </span>
              </div>

              <p className="text-xs text-text-secondary mt-0.5 truncate">
                {emprendimiento?.vendedorNombre || 'Valeria Mendoza'} · {emprendimiento?.carreraCiclo || 'Ing. Sistemas'}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <IconWhatsApp className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span>{emprendimiento?.whatsapp || '972 341 311'}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <IconBolt className="w-3 h-3 text-primary" />
                  <span>{emprendimiento?.tiempoEntrega || '2-5 min'}</span>
                </span>
                {emprendimiento?.horarioAtencion && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-text-secondary font-medium">
                      <IconClock className="w-3.5 h-3.5 text-primary" />
                      <span>{emprendimiento.horarioAtencion}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Right (Prominent "Editar Puesto", "Ver Catálogo", "Nuevo Producto") */}
          <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0 flex-wrap">
            <button
              type="button"
              onClick={handleOpenEditStore}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl liquid-glass border border-slate-300/80 hover:border-primary/50 text-text-main font-heading font-bold text-xs shadow-2xs hover:shadow transition-all active:scale-95"
            >
              <IconEdit className="w-3.5 h-3.5 text-primary" />
              <span>Editar Puesto</span>
            </button>

            <Link
              to={`/emprendimiento/${emprendimiento?.id || activeStoreId || 1}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl liquid-glass border border-primary/30 hover:border-primary text-text-main font-heading font-bold text-xs shadow-2xs hover:shadow transition-all active:scale-95 text-decoration-none"
            >
              <span className="material-symbols-outlined text-base text-primary">visibility</span>
              <span>Ver Catálogo</span>
            </Link>

            <button
              type="button"
              onClick={openNewProductModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl liquid-glass-crimson text-white font-heading font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <IconAdd className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* 1. SECCIÓN DE DISPONIBILIDAD (Segmented Control Liquid Glass) */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">sensors</span>
                <span>Estado de Disponibilidad en Campus</span>
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Controla al instante si los alumnos te encuentran en el receso.
              </p>
            </div>

            {status === 'live' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-heading font-bold text-xs border border-emerald-200 shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                TRANSMITIENDO EN VIVO
              </span>
            )}
          </div>

          {/* Segmented Control Buttons */}
          <div className="grid grid-cols-3 gap-2 p-1.5 liquid-glass rounded-2xl border border-white/60">
            <button
              type="button"
              onClick={() => {
                setStatus('live');
                showToast('¡Puesto en vivo! Tu tienda ya aparece activa en el campus.');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-heading font-bold text-xs transition-all duration-200 active:scale-95 ${status === 'live'
                  ? 'liquid-glass-crimson text-white shadow-md'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface'
                }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${status === 'live' ? 'bg-white' : 'bg-emerald-500'}`}></span>
              <span className="leading-tight text-center">En Vivo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatus('paused');
                showToast('Modo pausa activado: estás en clase.');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-heading font-bold text-xs transition-all duration-200 active:scale-95 ${status === 'paused'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface'
                }`}
            >
              <span className="material-symbols-outlined text-sm shrink-0">menu_book</span>
              <span className="leading-tight text-center">En Clase</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatus('closed');
                showToast('Puesto cerrado por hoy.');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-heading font-bold text-xs transition-all duration-200 active:scale-95 ${status === 'closed'
                  ? 'bg-dark text-white shadow-md'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface'
                }`}
            >
              <span className="material-symbols-outlined text-sm shrink-0">cancel</span>
              <span className="leading-tight text-center">Cerrado</span>
            </button>
          </div>
        </section>

        {/* 2. SECCIÓN DE UBICACIÓN TÁCTIL (SIN DROPDOWNS AZULES FEOS) */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl liquid-glass-crimson text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">pin_drop</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-text-main">
                Punto Actual en UTP Sede Piura
              </h2>
              <p className="text-xs text-text-secondary">
                Toca tu torre y piso con un solo clic sin menús desplegables.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateLocation} className="flex flex-col gap-4">
            {/* Selector de Torre / Zona (Pills Táctiles con Iconos) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider">
                1. Selecciona tu Torre o Zona
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {ZONAS_CAMPUS.map((zona) => {
                  const isSelected = torre === zona.id;
                  return (
                    <button
                      key={zona.id}
                      type="button"
                      onClick={() => {
                        setTorre(zona.id);
                        if (!zona.floors.includes(piso)) {
                          setPiso(zona.floors.includes('Piso 1') ? 'Piso 1' : zona.floors[0]);
                        }
                      }}
                      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 py-2.5 sm:px-3 sm:py-3 rounded-2xl font-heading text-xs font-bold transition-all duration-200 active:scale-95 ${isSelected
                          ? 'liquid-glass-crimson text-white shadow-sm ring-2 ring-primary/40'
                          : 'liquid-glass hover:bg-surface-container text-text-main'
                        }`}
                    >
                      <span className="material-symbols-outlined text-lg sm:text-base shrink-0">
                        {zona.icon}
                      </span>
                      <span className="whitespace-nowrap text-center sm:text-left">{zona.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Piso (Carrusel de Chips Horizontales) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider">
                  2. Selecciona tu Piso
                </label>
                <span className="text-[11px] font-heading font-bold text-primary">
                  Seleccionado: {piso}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {floorsList.map((f) => {
                  const isFloorActive = piso === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPiso(f)}
                      className={`px-4 py-2 rounded-2xl text-xs font-heading font-bold whitespace-nowrap transition-all duration-200 shrink-0 active:scale-95 ${isFloorActive
                          ? 'bg-dark text-white shadow-sm ring-2 ring-dark/30'
                          : 'liquid-glass text-text-secondary hover:text-text-main hover:bg-surface-container'
                        }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Referencia Rápida */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider">
                3. Referencia Rápida para el Alumno
              </label>
              <div className="flex items-center bg-surface/90 rounded-2xl px-3.5 py-2.5 border border-border shadow-inner focus-within:border-primary transition-colors">
                <span className="material-symbols-outlined text-text-muted text-lg mr-2">near_me</span>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: Frente a los ascensores, bancas del medio..."
                  className="w-full bg-transparent border-none outline-none font-body text-xs text-text-main placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Botón de Actualizar sin texto cortado */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl liquid-glass-crimson text-white font-heading font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <IconBolt className="w-4 h-4 text-white" />
              <span>Guardar y Notificar en Campus</span>
            </button>
          </form>
        </section>

        {/* 3. GESTIÓN DEL CATÁLOGO DE PRODUCTOS (Con Imagen, Edición Completa y Stock) */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
                <IconStore className="w-5 h-5 text-primary" />
                <span>Catálogo de Productos ({productos.length})</span>
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Sube fotos de tus productos, edita precios, existencias y actívalos al instante.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewProductModal}
              className="px-4 py-2 liquid-glass-crimson text-white font-heading font-bold text-xs rounded-full hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <IconAdd className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl liquid-glass border border-white/80 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex gap-3.5 items-start">
                  {/* Product Image Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 bg-surface-container border border-white/60">
                    {prod.imagenUrl ? (
                      <img
                        src={prod.imagenUrl}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-1">
                        <IconPhoto className="w-6 h-6 text-text-muted" />
                        <span className="text-[9px]">Sin foto</span>
                      </div>
                    )}
                    {prod.badge && (
                      <span className="absolute top-1 left-1 liquid-glass-crimson text-white font-heading text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-heading font-bold text-sm text-text-main leading-snug line-clamp-2">
                        {prod.nombre}
                      </h3>
                    </div>
                    <span className="font-heading font-extrabold text-sm text-primary block mt-0.5">
                      S/ {Number(prod.precio).toFixed(2)}
                    </span>
                    <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {prod.descripcion || 'Sin descripción detallada.'}
                    </p>
                    <span className="text-[10px] text-text-muted block mt-1 font-medium">
                      Stock: <b className="text-text-main">{prod.stock !== undefined ? prod.stock : 5} u.</b>
                    </span>
                  </div>
                </div>

                {/* Status & Action Buttons (Editar, Eliminar, Toggle) */}
                <div className="flex items-center justify-between pt-2.5 border-t border-border/60 gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full ${prod.disponible
                        ? 'liquid-glass-emerald border border-emerald-300'
                        : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                  >
                    {prod.disponible ? '● Disponible' : '○ Agotado'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Stock */}
                    <button
                      type="button"
                      onClick={() => toggleProductStock(prod.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-heading font-bold transition-all ${prod.disponible
                          ? 'liquid-glass text-text-secondary hover:text-red-600 border border-white/60'
                          : 'liquid-glass-emerald border border-emerald-300 font-bold'
                        }`}
                      title={prod.disponible ? 'Marcar como agotado' : 'Marcar como disponible'}
                    >
                      {prod.disponible ? 'Agotar' : 'Activar'}
                    </button>

                    {/* Editar Todo */}
                    <button
                      type="button"
                      onClick={() => openEditProductModal(prod)}
                      className="px-2.5 py-1 rounded-xl liquid-glass text-primary hover:bg-primary hover:text-white border border-primary/30 text-[11px] font-heading font-bold flex items-center gap-1 transition-all"
                      title="Editar todos los campos del producto"
                    >
                      <IconEdit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => setProductToDelete(prod)}
                      className="p-1.5 rounded-xl liquid-glass text-text-muted hover:text-red-600 hover:bg-red-50 border border-white/60 transition-all active:scale-95"
                      title="Eliminar producto de tu catálogo"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Modal: Subir / Editar Producto Completo (Siempre blanco, nítido y con botones proporcionales) */}
      {showProductModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-5 sm:p-6 pb-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto z-10 my-auto flex flex-col gap-4 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#BA122D] flex items-center justify-center border border-rose-100 shadow-xs">
                  <IconStore className="w-5 h-5 text-[#BA122D]" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    {editingProduct ? 'Editar Producto del Catálogo' : 'Nuevo Producto en Mochila'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingProduct
                      ? 'Modifica foto, precio, descripción, etiqueta y disponibilidad'
                      : 'Añade un producto para que los estudiantes de la UTP puedan pedirlo'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-3.5">
              {/* 1. SECCIÓN DE FOTO DEL PRODUCTO */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-slate-800 flex items-center justify-between">
                  <span>Foto del producto:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Galería, cámara o enlace</span>
                </label>

                {/* Preview Box & Upload Trigger */}
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {prodForm.imagenUrl ? (
                      <img
                        src={prodForm.imagenUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2 text-center">
                        <IconPhoto className="w-6 h-6 text-slate-400" />
                        <span className="text-[9px] font-bold">Sin foto</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* File Upload Button */}
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-heading font-bold cursor-pointer transition-all shadow-xs">
                      <IconPhoto className="w-3.5 h-3.5 text-[#BA122D]" />
                      <span>{prodForm.imagenUrl ? 'Cambiar foto de dispositivo' : 'Subir foto (celular / PC)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    {prodForm.imagenUrl && (
                      <button
                        type="button"
                        onClick={() => setProdForm((prev) => ({ ...prev, imagenUrl: '' }))}
                        className="text-[11px] text-red-600 hover:underline block font-heading font-semibold"
                      >
                        Quitar foto
                      </button>
                    )}

                    {/* Direct URL Input */}
                    <input
                      type="url"
                      value={prodForm.imagenUrl && typeof prodForm.imagenUrl === 'string' && prodForm.imagenUrl.startsWith('data:') ? '' : (prodForm.imagenUrl || '')}
                      onChange={(e) => setProdForm({ ...prodForm, imagenUrl: e.target.value })}
                      placeholder="O pega enlace de foto (https://...)"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. DATOS PRINCIPALES: Nombre y Precio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Nombre del producto *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.nombre}
                    onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })}
                    placeholder="Ej: Brownie Fudge Extra Choc"
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Precio en Soles (S/) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={prodForm.precio}
                    onChange={(e) => setProdForm({ ...prodForm, precio: e.target.value })}
                    placeholder="Ej: 5.00"
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* 3. STOCK Y ETIQUETA / BADGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Stock disponible (unidades)</label>
                  <input
                    type="number"
                    min="0"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    placeholder="Ej: 6"
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Etiqueta destacada (opcional)</label>
                  <input
                    type="text"
                    value={prodForm.badge}
                    onChange={(e) => setProdForm({ ...prodForm, badge: e.target.value })}
                    placeholder="Ej: Más vendido, Recién salido"
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* 4. DESCRIPCIÓN */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-bold text-slate-700">Descripción para el comprador</label>
                <textarea
                  rows="2"
                  value={prodForm.descripcion}
                  onChange={(e) => setProdForm({ ...prodForm, descripcion: e.target.value })}
                  placeholder="Sabores, presentación, tamaño, si es tibio o frío..."
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 resize-none transition-all"
                />
              </div>

              {/* 5. TOGGLE DISPONIBILIDAD */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="text-xs font-heading font-bold text-slate-800 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${prodForm.disponible ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span>Visible con entrega inmediata en campus</span>
                </span>
                <input
                  type="checkbox"
                  checked={prodForm.disponible}
                  onChange={(e) => setProdForm({ ...prodForm, disponible: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
              </label>

              {/* MODAL ACTIONS: Botones simétricos del mismo tamaño y proporción */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="w-full h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs transition-all active:scale-95 flex items-center justify-center text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || imageUploadLoading}
                  className="w-full h-11 rounded-full bg-[#BA122D] hover:bg-[#990F24] text-white font-heading font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60 text-center"
                >
                  {savingProduct ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <IconCheck className="w-4 h-4 text-white" />
                      <span>{editingProduct ? 'Guardar Cambios' : 'Publicar Producto'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación de Producto */}
      {productToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-xs">
                <IconTrash className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-extrabold text-base text-slate-900 leading-tight">
                  ¿Eliminar producto?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            {/* Product Card preview */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                {productToDelete.imagenUrl ? (
                  <img
                    src={productToDelete.imagenUrl}
                    alt={productToDelete.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconPhoto className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-xs text-slate-900 truncate">
                  {productToDelete.nombre}
                </p>
                <p className="font-heading font-extrabold text-xs text-[#BA122D] mt-0.5">
                  S/ {Number(productToDelete.precio || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              El producto será retirado inmediatamente de tu catálogo y ningún alumno podrá solicitarlo en el campus.
            </p>

            {/* Action buttons simétricos 50/50 y misma altura h-11 */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={deletingProduct}
                onClick={() => setProductToDelete(null)}
                className="w-full h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingProduct}
                onClick={confirmDeleteProduct}
                className="w-full h-11 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 text-center"
              >
                {deletingProduct ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4" />
                    <span>Sí, eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DATOS DEL PUESTO / TIENDA (Siempre blanco, nítido y con botones proporcionales) */}
      {showEditStoreModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-5 sm:p-6 pb-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto my-auto flex flex-col gap-4 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#BA122D] flex items-center justify-center border border-rose-100 shadow-xs">
                  <IconStore className="w-5 h-5 text-[#BA122D]" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    Editar Datos de la Tienda
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actualiza la foto, nombre, descripción y datos de contacto de tu puesto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditStoreModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStoreData} className="flex flex-col gap-4 text-xs">
              {/* Foto / Avatar del Puesto */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative shrink-0">
                  <img
                    src={storeEditForm.avatarUrl || emprendimiento?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt="Puesto"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 shadow-sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="font-heading font-bold text-xs text-slate-800 block">
                    Foto o Logo del Puesto
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Formatos JPG, PNG o WebP hasta 4MB.
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-heading font-bold text-slate-800 shadow-2xs active:scale-95 transition-all">
                    <IconPhoto className="w-3.5 h-3.5 text-[#BA122D]" />
                    <span>Subir Nueva Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStoreAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Nombre del Puesto */}
              <div className="flex flex-col gap-1">
                <label className="font-heading font-bold text-slate-700">
                  Nombre del Emprendimiento / Puesto *
                </label>
                <input
                  type="text"
                  required
                  value={storeEditForm.nombre}
                  onChange={(e) => setStoreEditForm({ ...storeEditForm, nombre: e.target.value })}
                  placeholder="Ej: SweetHub UTP"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Categoría y Tiempo de Entrega */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-heading font-bold text-slate-700">Categoría</label>
                  <select
                    value={storeEditForm.categoria}
                    onChange={(e) => setStoreEditForm({ ...storeEditForm, categoria: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs font-heading font-bold text-slate-800 rounded-xl outline-none transition-all"
                  >
                    <option value="POSTRES">Dulces & Postres</option>
                    <option value="COMIDA">Bajones & Comida</option>
                    <option value="ACCESORIOS">Accesorios & Merch</option>
                    <option value="SERVICIOS">Apuntes & Tutorías</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-heading font-bold text-slate-700">Tiempo de Entrega</label>
                  <input
                    type="text"
                    value={storeEditForm.tiempoEntrega}
                    onChange={(e) => setStoreEditForm({ ...storeEditForm, tiempoEntrega: e.target.value })}
                    placeholder="Ej: ~3 min, 2-5 min"
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp de Pedidos */}
              <div className="flex flex-col gap-1">
                <label className="font-heading font-bold text-slate-700 flex items-center gap-1.5">
                  <IconWhatsApp className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp de Pedidos</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeEditForm.whatsapp}
                  onChange={(e) => setStoreEditForm({ ...storeEditForm, whatsapp: e.target.value })}
                  placeholder="972341311"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Horario de Atención */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-heading font-bold text-slate-700 flex items-center gap-1.5">
                    <IconClock className="w-3.5 h-3.5 text-[#BA122D]" />
                    <span>Horario de Atención en Campus</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Visible en tu ficha</span>
                </div>
                <input
                  type="text"
                  value={storeEditForm.horarioAtencion}
                  onChange={(e) => setStoreEditForm({ ...storeEditForm, horarioAtencion: e.target.value })}
                  placeholder="Ej: Lun a Vie: 9:00 AM - 6:00 PM o Recesos UTP"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 transition-all"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                  {['Lun a Vie: 9am - 6pm', 'Recesos: 10:30am - 1pm', 'Tardes: 3pm - 8pm', 'Previa reserva'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStoreEditForm({ ...storeEditForm, horarioAtencion: preset })}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-heading font-semibold text-slate-700 border border-slate-200 shrink-0 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-1">
                <label className="font-heading font-bold text-slate-700">
                  Descripción del Emprendimiento
                </label>
                <textarea
                  rows={3}
                  value={storeEditForm.descripcion}
                  onChange={(e) => setStoreEditForm({ ...storeEditForm, descripcion: e.target.value })}
                  placeholder="Describe lo que ofreces, promociones especiales, combos entre clases..."
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#BA122D] text-xs text-slate-800 rounded-xl outline-none placeholder:text-slate-400 resize-none transition-all"
                />
              </div>

              {/* MODAL ACTIONS: Botones simétricos del mismo tamaño y proporción */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditStoreModal(false)}
                  className="w-full h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs transition-all active:scale-95 flex items-center justify-center text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#BA122D] hover:bg-[#990F24] text-white font-heading font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 text-center"
                >
                  <IconCheck className="w-4 h-4 text-white" />
                  <span>Guardar Cambios</span>
                </button>
              </div>

              {/* Opción discreta y elegante para eliminar puesto */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowDeleteStoreModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-heading font-semibold hover:underline py-1.5 px-3 rounded-lg transition-colors"
                >
                  <IconTrash className="w-3.5 h-3.5 text-red-600" />
                  <span>Eliminar este puesto permanentemente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación del Puesto */}
      {showDeleteStoreModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
              <IconTrash className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                ¿Eliminar este puesto?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Se eliminará el puesto <strong>"{emprendimiento?.nombre}"</strong> y todos sus productos de la plataforma. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteStoreModal(false)}
                className="w-full h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs transition-all active:scale-95 flex items-center justify-center text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteStore}
                disabled={deletingStore}
                className="w-full h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 text-center"
              >
                {deletingStore ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4 text-white" />
                    <span>Sí, eliminar</span>
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
