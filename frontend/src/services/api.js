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

export default api;

