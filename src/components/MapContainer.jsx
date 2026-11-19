import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer as FallbackEngineMap,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Route,
  X,
  LocateFixed,
  KeyRound,
  ExternalLink,
  Layers,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { buildRoutePolyline, requestUserGeolocation } from '../services/geoServices';
import SearchBar from './SearchBar';
import FilterPills from './FilterPills';

/**
 * ESTILO NOTURNO OCEÂNICO OFICIAL DO GOOGLE MAPS JAVASCRIPT API
 */
const GOOGLE_MAPS_DARK_OCEAN_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0b172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#060e1e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00c2ff' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#082230' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#112239' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1a3150' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#040b16' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00c2ff' }],
  },
];

function createGoogleMarkerSvgUrl(categorySlug, isSelected) {
  const glyphMap = {
    praias: '🏖️',
    cachoeiras: '💧',
    trilhas: '🥾',
    mirantes: '🔭',
    historico: '🏛️',
    restaurantes: '🍽️',
    hospedagem: '🏨',
    lojas: '🛍️',
  };
  const glyph = glyphMap[categorySlug] || '📍';
  const fill = isSelected ? '#00C2FF' : '#0B172A';
  const stroke = '#00C2FF';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00C2FF" flood-opacity="0.7"/>
        </filter>
      </defs>
      <path filter="url(#glow)" d="M24 2C12.95 2 4 10.95 4 22c0 14.5 20 31 20 31s20-16.5 20-31C44 10.95 35.05 2 24 2z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
      <text x="24" y="27" font-size="16" text-anchor="middle">${glyph}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Componente Nativo Google Maps JavaScript SDK (Map + DirectionsService + Markers)
 */
function NativeGoogleMapCanvas({
  apiKey,
  center,
  zoom,
  userLocation,
  pois,
  selectedPoiId,
  onSelectPoi,
  activeRoutePoi,
  mapStyleMode,
  onAuthError,
}) {
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!apiKey) return;

    window.gm_authFailure = () => {
      onAuthError();
    };

    if (window.google && window.google.maps) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-sdk-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'google-maps-sdk-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&language=pt-BR&region=BR`;
    script.async = true;
    script.defer = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => onAuthError();
    document.head.appendChild(script);
  }, [apiKey, onAuthError]);

  useEffect(() => {
    if (!sdkReady || !mapRef.current || !window.google?.maps) return;

    if (!googleMapInstance.current) {
      googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom: zoom || 13,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeId: mapStyleMode === 'satellite' ? 'hybrid' : 'roadmap',
        styles: mapStyleMode === 'dark' ? GOOGLE_MAPS_DARK_OCEAN_STYLE : [],
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: googleMapInstance.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#00C2FF',
          strokeOpacity: 0.95,
          strokeWeight: 5,
        },
      });
    }
  }, [sdkReady, center, zoom, mapStyleMode]);

  useEffect(() => {
    if (!googleMapInstance.current || !window.google?.maps) return;
    googleMapInstance.current.setMapTypeId(
      mapStyleMode === 'satellite' ? 'hybrid' : 'roadmap'
    );
    googleMapInstance.current.setOptions({
      styles: mapStyleMode === 'dark' ? GOOGLE_MAPS_DARK_OCEAN_STYLE : [],
    });
  }, [mapStyleMode]);

  useEffect(() => {
    if (!googleMapInstance.current || !center) return;
    googleMapInstance.current.panTo({ lat: center[0], lng: center[1] });
  }, [center, zoom]);

  useEffect(() => {
    if (!sdkReady || !googleMapInstance.current || !window.google?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const userMarker = new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: googleMapInstance.current,
      title: 'Sua localização em Peruíbe',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#00C2FF',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2.5,
      },
    });
    markersRef.current.push(userMarker);

    pois.forEach((poi) => {
      const isSelected = poi.id === selectedPoiId;
      const marker = new window.google.maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map: googleMapInstance.current,
        title: `${poi.name} (${poi.distance_km} km)`,
        icon: {
          url: createGoogleMarkerSvgUrl(poi.category_slug, isSelected),
          scaledSize: new window.google.maps.Size(
            isSelected ? 48 : 40,
            isSelected ? 56 : 46
          ),
        },
      });
      marker.addListener('click', () => onSelectPoi(poi.id));
      markersRef.current.push(marker);
    });
  }, [sdkReady, pois, selectedPoiId, userLocation, onSelectPoi]);

  useEffect(() => {
    if (
      !sdkReady ||
      !googleMapInstance.current ||
      !directionsRendererRef.current ||
      !window.google?.maps
    ) {
      return;
    }

    if (!activeRoutePoi) {
      directionsRendererRef.current.setDirections({ routes: [] });
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: userLocation.lat, lng: userLocation.lng },
        destination: { lat: activeRoutePoi.lat, lng: activeRoutePoi.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current.setDirections(result);
        }
      }
    );
  }, [sdkReady, activeRoutePoi, userLocation]);

  return <div ref={mapRef} className="w-full h-full z-10" />;
}

function MapViewportController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom || map.getZoom(), {
        animate: true,
        duration: 0.75,
      });
    }
  }, [center, zoom, map]);
  return null;
}

function createCustomPoiIcon(categorySlug, isSelected, isCommercial) {
  const glyphMap = {
    praias: '🏖️',
    cachoeiras: '💧',
    trilhas: '🥾',
    mirantes: '🔭',
    historico: '🏛️',
    restaurantes: '🍽️',
    hospedagem: '🏨',
    lojas: '🛍️',
  };

  const glyph = glyphMap[categorySlug] || '📍';
  const size = isSelected ? 48 : 38;
  const ringColor = isSelected
    ? '#00C2FF'
    : isCommercial
    ? '#38BDF8'
    : '#06B6D4';

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(-4px);
    ">
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 9999px 9999px 9999px 4px;
        transform: rotate(-45deg);
        background: radial-gradient(circle at 30% 30%, ${ringColor}, #072A47);
        border: 2px solid #A5F3FC;
        box-shadow: 0 0 ${isSelected ? '22px' : '12px'} rgba(0, 194, 255, ${
    isSelected ? '0.95' : '0.6'
  });
      "></div>
      <span style="position: relative; z-index: 2; font-size: ${
        isSelected ? '18px' : '14px'
      };">${glyph}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'tairugo-custom-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

/**
 * COMPONENTE CORAÇÃO DO SISTEMA: MapContainer (Google Maps API + Enquadramento Responsivo 100%)
 */
export default function MapContainer({ showNearbyDrawer = true }) {
  const mapCenter = useAppStore((s) => s.mapCenter);
  const mapZoom = useAppStore((s) => s.mapZoom);
  const userLocation = useAppStore((s) => s.userLocation);
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const setMapViewport = useAppStore((s) => s.setMapViewport);
  const selectedPoiId = useAppStore((s) => s.selectedPoiId);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const activeRoutePoiId = useAppStore((s) => s.activeRoutePoiId);
  const clearActiveRoute = useAppStore((s) => s.clearActiveRoute);
  const getFilteredPois = useAppStore((s) => s.getFilteredPois);
  const activeCategory = useAppStore((s) => s.activeCategory);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const radiusKm = useAppStore((s) => s.radiusKm);
  const onlyFavoritesFilter = useAppStore((s) => s.onlyFavoritesFilter);
  const favorites = useAppStore((s) => s.favorites);
  const googleMapsApiKey = useAppStore((s) => s.googleMapsApiKey);
  const setGoogleMapsApiKey = useAppStore((s) => s.setGoogleMapsApiKey);

  // 'dark' (Google Maps Noturno s/ marca d'água), 'google_streets' (Google Ruas), 'satellite' (Google Satélite)
  const [mapStyleMode, setMapStyleMode] = useState('dark');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(googleMapsApiKey || '');
  const [sdkAuthError, setSdkAuthError] = useState(false);
  const [nearbyCollapsed, setNearbyCollapsed] = useState(false);

  const filteredPois = useMemo(
    () => getFilteredPois(),
    [
      getFilteredPois,
      activeCategory,
      searchQuery,
      radiusKm,
      userLocation,
      onlyFavoritesFilter,
      favorites,
    ]
  );

  const activeRoutePoi = useMemo(
    () => filteredPois.find((p) => p.id === activeRoutePoiId) || null,
    [filteredPois, activeRoutePoiId]
  );

  const routePositions = useMemo(() => {
    if (!activeRoutePoi) return [];
    return buildRoutePolyline(userLocation, activeRoutePoi);
  }, [userLocation, activeRoutePoi]);

  const handleLocateUser = async () => {
    const coords = await requestUserGeolocation();
    setUserLocation(coords);
    setMapViewport([coords.lat, coords.lng], 14);
  };

  // Usa servidores oficiais do Google Maps (mt1.google.com) em todos os modos (Zero marca d'água!)
  const tileLayerUrl = useMemo(() => {
    if (mapStyleMode === 'satellite') {
      return 'https://mt1.google.com/vt/lyrs=y&hl=pt-BR&x={x}&y={y}&z={z}';
    }
    return 'https://mt1.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}';
  }, [mapStyleMode]);

  const useNativeGoogleJsSdk = Boolean(googleMapsApiKey) && !sdkAuthError;

  const googleMapsExternalDirectionsUrl = activeRoutePoi
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${activeRoutePoi.lat},${activeRoutePoi.lng}&travelmode=driving`
    : null;

  return (
    <div className="relative w-full h-full bg-[#060E1E] overflow-hidden select-none">
      {/* Barra Superior Flutuante: SearchBar + FilterPills perfeitamente centralizadas e enquadradas */}
      <div className="absolute top-3 left-3 right-3 z-[500] max-w-3xl mx-auto space-y-2 pointer-events-auto">
        <SearchBar
          placeholder="Procurar no Google Maps de Peruíbe..."
          showRadiusControl
        />
        <FilterPills mode="all" />
      </div>

      {/* Banner de Rota Ativa ("Como Chegar") */}
      {activeRoutePoi && (
        <div className="absolute top-28 md:top-32 left-3 right-3 z-[500] max-w-lg mx-auto bg-[#0B172A]/95 backdrop-blur-md border border-cyan-400/60 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Route className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold">
                Google Maps Rota • {activeRoutePoi.distance_km} km
              </p>
              <p className="text-xs font-bold text-white truncate">
                {activeRoutePoi.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={googleMapsExternalDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow"
              title="Iniciar navegação GPS passo a passo no Google Maps"
            >
              <span>GPS Google</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={clearActiveRoute}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white"
              title="Encerrar rota"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Controles Flutuantes Inferiores Direitos: 100% Enquadrados Acima da Barra Inferior */}
      <div className="absolute right-3 bottom-4 z-[500] flex flex-col items-end gap-2 pointer-events-auto">
        {/* Seletor de Camadas do Google Maps (Noturno / Google Mapa / Satélite) */}
        <div className="bg-[#0B172A]/95 backdrop-blur-md border border-slate-700/90 p-1 rounded-2xl shadow-2xl flex items-center gap-1 text-[11px] font-semibold">
          <Layers className="w-3.5 h-3.5 text-cyan-400 ml-2 mr-0.5 shrink-0" />
          <button
            type="button"
            onClick={() => setMapStyleMode('dark')}
            className={`px-2.5 py-1 rounded-xl transition ${
              mapStyleMode === 'dark'
                ? 'bg-[#00C2FF] text-[#060E1E] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Noturno
          </button>
          <button
            type="button"
            onClick={() => setMapStyleMode('google_streets')}
            className={`px-2.5 py-1 rounded-xl transition ${
              mapStyleMode === 'google_streets'
                ? 'bg-[#00C2FF] text-[#060E1E] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Google Mapa
          </button>
          <button
            type="button"
            onClick={() => setMapStyleMode('satellite')}
            className={`px-2.5 py-1 rounded-xl transition ${
              mapStyleMode === 'satellite'
                ? 'bg-[#00C2FF] text-[#060E1E] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Satélite
          </button>
        </div>

        {/* Botões de API Key Google Maps e Minha Posição */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setKeyInput(googleMapsApiKey || '');
              setShowApiKeyModal(true);
            }}
            className="bg-[#0B172A]/95 hover:bg-[#1A3150] text-slate-200 border border-slate-700/90 px-3 py-2 rounded-2xl shadow-2xl transition flex items-center gap-1.5 text-xs font-semibold"
            title="Configurar Chave da API do Google Maps (Opcional)"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              {useNativeGoogleJsSdk ? 'Google SDK Ativo' : 'API Key Google Maps'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLocateUser}
            className="bg-[#0B172A]/95 hover:bg-[#1A3150] text-cyan-400 border border-cyan-400/50 px-3.5 py-2 rounded-2xl shadow-2xl transition flex items-center gap-1.5 text-xs font-semibold"
            title="Centralizar na minha localização em Peruíbe"
          >
            <LocateFixed className="w-3.5 h-3.5 shrink-0" />
            <span>Minha Posição</span>
          </button>
        </div>
      </div>

      {/* Modal para Inserir/Atualizar a Google Maps API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[950] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B172A] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                Google Maps JavaScript API
              </h3>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O TairúGo já exibe os mapas oficiais do <strong>Google Maps</strong> gratuitamente nos modos Noturno, Mapa e Satélite. Se você tiver uma chave <code>AIza...</code> do Google Cloud Console, pode colar abaixo:
            </p>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Cole sua Google Maps API Key (ex: AIzaSy...)"
              className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2">
              {googleMapsApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setSdkAuthError(false);
                    setGoogleMapsApiKey('');
                    setShowApiKeyModal(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Usar Modo Google Híbrido (Sem Chave)
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSdkAuthError(false);
                  setGoogleMapsApiKey(keyInput);
                  setShowApiKeyModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#00C2FF] text-[#060E1E] font-bold text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Chave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renderização do Mapa: SDK Nativo Google Maps ou Camadas Oficiais Google Maps Híbridas */}
      {useNativeGoogleJsSdk ? (
        <NativeGoogleMapCanvas
          apiKey={googleMapsApiKey}
          center={mapCenter}
          zoom={mapZoom}
          userLocation={userLocation}
          pois={filteredPois}
          selectedPoiId={selectedPoiId}
          onSelectPoi={selectPoi}
          activeRoutePoi={activeRoutePoi}
          mapStyleMode={mapStyleMode}
          onAuthError={() => setSdkAuthError(true)}
        />
      ) : (
        <FallbackEngineMap
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          className={`w-full h-full z-10 ${
            mapStyleMode === 'dark' ? 'google-night-tiles' : ''
          }`}
        >
          <TileLayer
            key={mapStyleMode}
            attribution="&copy; Google Maps"
            url={tileLayerUrl}
          />

          <MapViewportController center={mapCenter} zoom={mapZoom} />

          {/* Marcador da Localização Atual do Turista */}
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: '#00C2FF',
              fillOpacity: 1,
            }}
          />

          {/* Linha Tracejada de Rota ("Como Chegar") */}
          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#00C2FF',
                weight: 4,
                dashArray: '10, 10',
                opacity: 0.95,
              }}
            />
          )}

          {/* Pins Personalizados dos Pontos Turísticos e Comércios */}
          {filteredPois.map((poi) => (
            <Marker
              key={poi.id}
              position={[poi.lat, poi.lng]}
              icon={createCustomPoiIcon(
                poi.category_slug,
                selectedPoiId === poi.id,
                poi.is_commercial
              )}
              eventHandlers={{
                click: () => selectPoi(poi.id),
              }}
            />
          ))}
        </FallbackEngineMap>
      )}

      {/* Gaveta "Próximo de você" (100% Enquadrada no Canto Inferior Esquerdo, sem cortar na barra) */}
      {showNearbyDrawer && !selectedPoiId && (
        <div className="hidden sm:block absolute bottom-4 left-4 w-80 md:w-96 z-[450] bg-[#0B172A]/95 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Próximo de você
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-400 font-semibold">
                {filteredPois.length} locais no raio
              </span>
              <button
                type="button"
                onClick={() => setNearbyCollapsed(!nearbyCollapsed)}
                className="p-1 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white"
                title={nearbyCollapsed ? 'Expandir lista' : 'Recolher lista'}
              >
                {nearbyCollapsed ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {!nearbyCollapsed && (
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {filteredPois.slice(0, 5).map((poi) => (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() => selectPoi(poi.id)}
                  className="w-full flex items-center justify-between bg-[#112239]/90 hover:bg-[#1A3150] border border-slate-700/50 rounded-2xl p-2 text-left transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={poi.cover_image}
                      alt={poi.name}
                      loading="lazy"
                      className="w-11 h-11 rounded-xl object-cover shrink-0 bg-slate-800"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition">
                        {poi.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {poi.category_name} •{' '}
                        <span className="text-cyan-400 font-semibold">
                          {poi.distance_km} km
                        </span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
