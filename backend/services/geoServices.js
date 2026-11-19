const db = require('../config/db');

/**
 * MOTOR DE BUSCA ESPACIAL (PostGIS GeoServices)
 * Responsável pelo cálculo geodésico de distâncias em km, filtro por raio (ST_DWithin)
 * e serialização de coordenadas geográficas para o Mapa Interativo.
 */
class GeoServices {
  /**
   * Lista POIs ativos dentro de um raio em quilômetros a partir da geolocalização do usuário,
   * ordenados pela menor distância real na superfície terrestre.
   *
   * @param {Object} params
   * @param {number} params.lat - Latitude do usuário (ex: -24.3200 em Peruíbe)
   * @param {number} params.lng - Longitude do usuário (ex: -46.9980 em Peruíbe)
   * @param {number} [params.radiusKm=25] - Raio máximo de busca em quilômetros
   * @param {string} [params.categorySlug] - Filtro opcional por slug de categoria ('praias', 'cachoeiras', etc.)
   * @param {string} [params.search] - Termo de busca textual (nome ou descrição)
   * @param {boolean} [params.onlyCommercial] - Se true, filtra apenas estabelecimentos comerciais
   */
  async findNearbyPOIs({
    lat = -24.3200,
    lng = -46.9980,
    radiusKm = 30,
    categorySlug = null,
    search = null,
    onlyCommercial = null,
  }) {
    const radiusMeters = Number(radiusKm) * 1000;
    const values = [Number(lng), Number(lat), radiusMeters];
    let paramIndex = 4;

    let dynamicFilters = '';

    if (categorySlug && categorySlug !== 'todos') {
      dynamicFilters += ` AND c.slug = $${paramIndex++}`;
      values.push(categorySlug);
    }

    if (onlyCommercial !== null) {
      dynamicFilters += ` AND c.is_commercial = $${paramIndex++}`;
      values.push(Boolean(onlyCommercial));
    }

    if (search && search.trim() !== '') {
      dynamicFilters += ` AND (p.name ILIKE $${paramIndex} OR p.short_description ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex})`;
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const sql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.ownership,
        p.address,
        p.opening_hours,
        p.entry_fee,
        p.requires_guide,
        p.accessibility_rules,
        p.is_open_now,
        p.phone_whatsapp,
        p.digital_menu,
        p.rating_avg::FLOAT AS rating_avg,
        p.rating_count,
        p.is_featured,
        c.slug AS category_slug,
        c.name AS category_name,
        c.icon_name AS category_icon,
        c.is_commercial,
        ST_Y(p.location) AS lat,
        ST_X(p.location) AS lng,
        ROUND(
          (ST_DistanceSphere(
            p.location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)
          ) / 1000.0)::numeric,
          2
        )::FLOAT AS distance_km,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ph.id,
                'url_webp', ph.url_webp,
                'thumbnail_webp', ph.thumbnail_webp,
                'blurhash', ph.blurhash,
                'is_cover', ph.is_cover
              )
            )
            FROM poi_photos ph
            WHERE ph.poi_id = p.id
          ),
          '[]'::json
        ) AS photos
      FROM pois p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = TRUE
        AND ST_DWithin(
          p.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        ${dynamicFilters}
      ORDER BY distance_km ASC, p.rating_avg DESC;
    `;

    const { rows } = await db.query(sql, values);
    return rows;
  }

  /**
   * Registra um evento espacial de engajamento (ex: clique no pin ou traçado de rota)
   * para alimentar o gráfico do Painel de Gestão do Lojista (MerchantDashboard).
   */
  async recordSpatialMetric({ poiId, eventType, userLat, userLng }) {
    const hasCoords = typeof userLat === 'number' && typeof userLng === 'number';
    const sql = hasCoords
      ? `INSERT INTO poi_metrics (poi_id, event_type, user_location)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))`
      : `INSERT INTO poi_metrics (poi_id, event_type) VALUES ($1, $2)`;

    const params = hasCoords ? [poiId, eventType, userLng, userLat] : [poiId, eventType];
    await db.query(sql, params);
  }
}

module.exports = new GeoServices();
