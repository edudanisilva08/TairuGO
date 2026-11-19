const geoServices = require('../services/geoServices');
const db = require('../config/db');

/**
 * CONTROLADOR RESTful DE PONTOS TURÍSTICOS E COMERCIAIS (POIs)
 */
class PoiController {
  /**
   * GET /api/pois
   * Busca espacial de pontos turísticos e comércios por geolocalização (lat/lng),
   * raio em km, filtro de categoria e busca textual.
   */
  async listNearby(req, res) {
    try {
      const {
        lat = -24.3200,
        lng = -46.9980,
        radius = 30,
        category = 'todos',
        search = '',
        commercial,
      } = req.query;

      const onlyCommercial =
        commercial !== undefined ? commercial === 'true' : null;

      const pois = await geoServices.findNearbyPOIs({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radiusKm: parseFloat(radius),
        categorySlug: category,
        search,
        onlyCommercial,
      });

      return res.status(200).json({
        meta: {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radiusKm: parseFloat(radius),
          category,
          count: pois.length,
        },
        data: pois,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao executar busca espacial de pontos turísticos.',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/pois/:id
   * Retorna detalhes completos do POI + avaliações aprovadas + registra métrica de clique no pin.
   */
  async getDetails(req, res) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.query;

      // Registra clique assincronamente para o Dashboard do Lojista
      geoServices
        .recordSpatialMetric({
          poiId: id,
          eventType: 'PIN_CLICK',
          userLat: lat ? parseFloat(lat) : undefined,
          userLng: lng ? parseFloat(lng) : undefined,
        })
        .catch(() => {});

      const poiQuery = `
        SELECT 
          p.*,
          c.slug AS category_slug,
          c.name AS category_name,
          ST_Y(p.location) AS lat,
          ST_X(p.location) AS lng
        FROM pois p
        INNER JOIN categories c ON c.id = p.category_id
        WHERE p.id = $1 AND p.is_active = TRUE
      `;
      const { rows } = await db.query(poiQuery, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Ponto de interesse não encontrado.' });
      }

      const reviewsQuery = `
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.merchant_reply,
          r.merchant_replied_at,
          r.created_at,
          u.name AS user_name,
          u.avatar_url AS user_avatar
        FROM reviews r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.poi_id = $1 AND r.is_approved = TRUE
        ORDER BY r.created_at DESC
        LIMIT 30
      `;
      const reviewsResult = await db.query(reviewsQuery, [id]);

      return res.status(200).json({
        ...rows[0],
        reviews: reviewsResult.rows,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao carregar detalhes do ponto turístico.',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/pois/:id/reviews
   * Turista autenticado envia avaliação + foto opcional comprimida pelo Sharp.
   */
  async createReview(req, res) {
    try {
      const { id: poiId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const insertReviewSql = `
        INSERT INTO reviews (poi_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (poi_id, user_id)
        DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
        RETURNING *;
      `;
      const { rows } = await db.query(insertReviewSql, [
        poiId,
        userId,
        Number(rating),
        comment,
      ]);

      // Se o turista anexou foto da praia/cachoeira, salva a versão WebP otimizada para 3G
      if (req.processedMedia) {
        await db.query(
          `INSERT INTO poi_photos (poi_id, uploaded_by, url_webp, thumbnail_webp, is_cover)
           VALUES ($1, $2, $3, $4, FALSE)`,
          [poiId, userId, req.processedMedia.urlWebp, req.processedMedia.thumbnailWebp]
        );
      }

      return res.status(201).json({
        message: 'Avaliação publicada com sucesso!',
        review: rows[0],
        mediaOptimization: req.processedMedia || null,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Não foi possível salvar sua avaliação.',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/merchants/register-poi
   * Fluxo de Cadastro PJ: Solicita criação/reivindicação de espaço comercial com CNPJ e Alvará.
   */
  async registerMerchantPoi(req, res) {
    try {
      const {
        businessName,
        cnpj,
        categorySlug,
        description,
        address,
        lat,
        lng,
        phoneWhatsapp,
        openingHours,
      } = req.body;

      const licenseUrl = req.processedMedia
        ? req.processedMedia.urlWebp
        : req.body.businessLicenseUrl;

      // Atualiza status do usuário PJ com CNPJ e comprovante de alvará
      await db.query(
        `UPDATE users 
         SET role = 'MERCHANT', cnpj = $1, business_license_url = $2, verification_status = 'PENDING'
         WHERE id = $3`,
        [cnpj, licenseUrl, req.user.id]
      );

      const slug = businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');

      const insertPoiSql = `
        INSERT INTO pois (
          name, slug, description, short_description, category_id,
          ownership, owner_id, location, address, opening_hours,
          phone_whatsapp, is_active
        )
        VALUES (
          $1, $2, $3, $4,
          (SELECT id FROM categories WHERE slug = $5 LIMIT 1),
          'PRIVATE', $6,
          ST_SetSRID(ST_MakePoint($7, $8), 4326),
          $9, $10, $11, FALSE
        )
        RETURNING id, name, slug;
      `;

      const { rows } = await db.query(insertPoiSql, [
        businessName,
        `${slug}-${Date.now().toString().slice(-4)}`,
        description,
        description.slice(0, 140),
        categorySlug || 'restaurantes',
        req.user.id,
        parseFloat(lng),
        parseFloat(lat),
        address,
        openingHours || '09h - 22h',
        phoneWhatsapp,
      ]);

      return res.status(201).json({
        message: 'Solicitação comercial enviada! Seu alvará está Aguardando Aprovação.',
        status: 'PENDING',
        poi: rows[0],
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao registrar estabelecimento comercial.',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/merchants/dashboard
   * Retorna métricas semanais de cliques no pin, rotas traçadas e avaliações para o Lojista (PJ).
   */
  async getMerchantDashboard(req, res) {
    try {
      const ownerId = req.user.id;

      const metricsSql = `
        SELECT 
          TO_CHAR(m.created_at, 'Dy') AS day_label,
          m.event_type,
          COUNT(*)::INT AS total
        FROM poi_metrics m
        INNER JOIN pois p ON p.id = m.poi_id
        WHERE p.owner_id = $1
          AND m.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY TO_CHAR(m.created_at, 'Dy'), m.event_type;
      `;

      const { rows: metrics } = await db.query(metricsSql, [ownerId]);
      return res.status(200).json({ metrics });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PoiController();
