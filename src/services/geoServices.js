/**
 * MÓDULO FRONTEND DE GEOPROCESSAMENTO E ROTAS (geoServices.js)
 * Opera em conjunto com o motor PostGIS do backend e provê fallback offline
 * para conexões móveis 3G oscilantes na Barra do Una / Reserva da Juréia.
 */

// Coordenada central padrão: Centro / Orla de Peruíbe - SP
export const PERUIBE_CENTER = {
  lat: -24.3204,
  lng: -46.9983,
};

/**
 * Calcula a distância geodésica (Fórmula de Haversine) em quilômetros
 * entre dois pares de coordenadas (lat/lng).
 */
export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raio médio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Gera os waypoints de rota costeira/serrana entre a origem do turista
 * e o Ponto de Interesse (POI) selecionado para desenhar a linha tracejada no mapa.
 */
export function buildRoutePolyline(origin, destination) {
  if (!origin || !destination) return [];

  const startLat = origin.lat;
  const startLng = origin.lng;
  const endLat = destination.lat;
  const endLng = destination.lng;

  // Ponto intermediário na subida da Serra do Guaraú se o destino for na Juréia/Guaraú
  const isJureiaBound = endLng < -47.005 || endLat < -24.345;
  const waypoints = [[startLat, startLng]];

  if (isJureiaBound) {
    // Passa pelo Portal da Juréia / Estrada do Guaraú
    waypoints.push([
      startLat + (endLat - startLat) * 0.38 - 0.004,
      startLng + (endLng - startLng) * 0.35 + 0.003,
    ]);
    waypoints.push([
      startLat + (endLat - startLat) * 0.72 + 0.003,
      startLng + (endLng - startLng) * 0.68 - 0.002,
    ]);
  } else {
    // Rota pela Av. Padre Anchieta / Orla da Praia
    waypoints.push([
      (startLat + endLat) / 2 + 0.0018,
      (startLng + endLng) / 2 - 0.0015,
    ]);
  }

  waypoints.push([endLat, endLng]);
  return waypoints;
}

/**
 * Solicita geolocalização nativa do navegador com fallback seguro para o Centro de Peruíbe.
 */
export function requestUserGeolocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({ ...PERUIBE_CENTER, isFallback: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isFallback: false,
        });
      },
      () => {
        resolve({ ...PERUIBE_CENTER, isFallback: true });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  });
}
