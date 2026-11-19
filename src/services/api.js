/**
 * CLIENTE HTTP SEGURO (api.js)
 * Comunica-se com a Camada de Negócio (Node.js + Express + PostGIS)
 * anexando automaticamente o token JWT para RBAC (PF, PJ e Admin).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('tairugo_jwt');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errPayload = await response.json().catch(() => ({}));
    throw new Error(errPayload.error || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

export const poiApi = {
  /**
   * Busca pontos turísticos e comércios baseados em filtros e raio espacial (PostGIS)
   */
  fetchNearby: ({ lat, lng, radius = 30, category = 'todos', search = '' }) => {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: String(radius),
      category,
      search,
    });
    return apiRequest(`/pois?${params.toString()}`);
  },

  fetchDetails: (id, userCoords) => {
    const query = userCoords ? `?lat=${userCoords.lat}&lng=${userCoords.lng}` : '';
    return apiRequest(`/pois/${id}${query}`);
  },

  submitReview: (poiId, formData) =>
    apiRequest(`/pois/${poiId}/reviews`, {
      method: 'POST',
      body: formData,
    }),

  registerMerchantPoi: (formData) =>
    apiRequest('/merchants/register-poi', {
      method: 'POST',
      body: formData,
    }),
};
