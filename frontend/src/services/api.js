import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getEmprendimientos = async (params = {}) => {
  const cleanParams = {};
  if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
  if (params.categoria && params.categoria !== 'TODOS') cleanParams.categoria = params.categoria;
  if (params.disponible !== undefined && params.disponible !== null) cleanParams.disponible = params.disponible;

  const response = await api.get('/emprendimientos', { params: cleanParams });
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

export default api;

