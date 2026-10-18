import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para inyectar token JWT automáticamente en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusventa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejar expiración de token o errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si la ruta no es de auth y recibe 401, desautentica
      const isAuthRoute = error.config?.url?.includes('/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('campusventa_token');
        localStorage.removeItem('campusventa_user');
      }
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   AUTENTICACIÓN & USUARIOS
   ============================================================ */

export const loginApi = async (identificador, password) => {
  const response = await api.post('/auth/login', { identificador, password });
  return response.data;
};

export const loginAdminApi = async (identificador, password) => {
  const response = await api.post('/auth/admin/login', { identificador, password });
  return response.data;
};

export const registroApi = async (datosRegistro) => {
  const response = await api.post('/auth/registro', datosRegistro);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updatePerfilApi = async (datosPerfil) => {
  const response = await api.put('/usuarios/me', datosPerfil);
  return response.data;
};

export const desactivarMiCuentaApi = async () => {
  const response = await api.delete('/usuarios/me');
  return response.data;
};

export const getMisResenasApi = async () => {
  const response = await api.get('/usuarios/me/resenas');
  return response.data;
};

/* ============================================================
   EMPRENDIMIENTOS & PUESTOS
   ============================================================ */

export const getEmprendimientos = async (params = {}) => {
  const cleanParams = {};
  if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
  if (params.categoria && params.categoria !== 'TODOS') cleanParams.categoria = params.categoria;
  if (params.disponible !== undefined && params.disponible !== null) cleanParams.disponible = params.disponible;

  const response = await api.get('/emprendimientos', { params: cleanParams });
  return response.data;
};

export const getMisEmprendimientosApi = async () => {
  const response = await api.get('/emprendimientos/mis-emprendimientos');
  return response.data;
};

export const getEmprendimientoById = async (id) => {
  const response = await api.get(`/emprendimientos/${id}`);
  return response.data;
};

export const crearResena = async (emprendimientoId, resenaData) => {
  const response = await api.post(`/emprendimientos/${emprendimientoId}/resenas`, resenaData);
  return response.data;
};

export const crearEmprendimiento = async (emprendimientoData) => {
  const response = await api.post('/emprendimientos', emprendimientoData);
  return response.data;
};

export const actualizarEmprendimiento = async (id, datosParciales) => {
  const response = await api.patch(`/emprendimientos/${id}`, datosParciales);
  return response.data;
};

export const eliminarEmprendimiento = async (id) => {
  const response = await api.delete(`/emprendimientos/${id}`);
  return response.data;
};

/* ============================================================
   PRODUCTOS
   ============================================================ */

export const crearProducto = async (emprendimientoId, productoData) => {
  const response = await api.post(`/emprendimientos/${emprendimientoId}/productos`, productoData);
  return response.data;
};

export const actualizarProducto = async (emprendimientoId, productoId, productoData) => {
  const response = await api.put(`/emprendimientos/${emprendimientoId}/productos/${productoId}`, productoData);
  return response.data;
};

export const eliminarProducto = async (emprendimientoId, productoId) => {
  const response = await api.delete(`/emprendimientos/${emprendimientoId}/productos/${productoId}`);
  return response.data;
};

// ==========================================
// ENDPOINTS DE ADMINISTRACIÓN (SOLO ADMIN)
// ==========================================

export const getAdminMetricasApi = async () => {
  const response = await api.get('/admin/metricas');
  return response.data;
};

export const getAdminUsuariosApi = async () => {
  const response = await api.get('/admin/usuarios');
  return response.data;
};

export const updateAdminUsuarioRolApi = async (id, rol) => {
  const response = await api.patch(`/admin/usuarios/${id}/rol`, { rol });
  return response.data;
};

export const updateAdminUsuarioEstadoApi = async (id, activo) => {
  const response = await api.patch(`/admin/usuarios/${id}/estado`, { activo });
  return response.data;
};

export const getAdminEmprendimientosApi = async () => {
  const response = await api.get('/admin/emprendimientos');
  return response.data;
};

export const updateAdminEmprendimientoDisponibilidadApi = async (id, disponible) => {
  const response = await api.patch(`/admin/emprendimientos/${id}/disponibilidad`, { disponible });
  return response.data;
};

export const updateAdminEmprendimientoEstadoApi = async (id, activo) => {
  const response = await api.patch(`/admin/emprendimientos/${id}/estado`, { activo });
  return response.data;
};

export const deleteAdminEmprendimientoApi = async (id) => {
  const response = await api.delete(`/admin/emprendimientos/${id}`);
  return response.data;
};

/* ============================================================
   PEDIDOS (MÓDULO DE PEDIDOS)
   ============================================================ */

export const crearPedidoApi = async (pedidoData) => {
  const response = await api.post('/pedidos', pedidoData);
  return response.data;
};

export const getMisPedidosApi = async () => {
  const response = await api.get('/pedidos/mis-pedidos');
  return response.data;
};

export const getPedidosVendedorApi = async (emprendimientoId) => {
  const response = await api.get(`/pedidos/vendedor/${emprendimientoId}`);
  return response.data;
};

export const actualizarEstadoPedidoApi = async (pedidoId, estado) => {
  const response = await api.patch(`/pedidos/${pedidoId}/estado`, { estado });
  return response.data;
};

/* ============================================================
   FAVORITOS EN BASE DE DATOS
   ============================================================ */

export const getMisFavoritosApi = async () => {
  const response = await api.get('/usuarios/me/favoritos');
  return response.data;
};

export const toggleFavoritoApi = async (emprendimientoId) => {
  const response = await api.post(`/usuarios/me/favoritos/${emprendimientoId}`);
  return response.data;
};

export default api;

