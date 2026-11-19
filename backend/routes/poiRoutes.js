const express = require('express');
const router = express.Router();
const poiController = require('../controllers/poiController');
const authController = require('../controllers/authController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');
const { upload, compressAndUploadImage } = require('../middlewares/uploadMiddleware');

// ============================================================================
// ROTAS DE AUTENTICAÇÃO E CADASTRO (Turistas PF e Lojistas PJ)
// ============================================================================

// Cadastro de Novo Usuário (Turista PF ou Lojista PJ com upload opcional de Alvará)
router.post(
  '/auth/register',
  (req, _res, next) => {
    req.uploadFolder = 'licenses';
    next();
  },
  upload.single('businessLicense'),
  compressAndUploadImage,
  authController.register
);

// Login com E-mail e Senha (JWT)
router.post('/auth/login', authController.login);

// Validação de Sessão Atual
router.get('/auth/me', authenticateJWT, authController.getMe);

// ============================================================================
// ROTAS PÚBLICAS (Módulo do Turista - Geoprocessamento PostGIS)
// ============================================================================

// Busca espacial por coordenadas (lat/lng), raio em km, categoria e termo de pesquisa
router.get('/pois', poiController.listNearby);

// Detalhes do POI + Avaliações + Registro de clique espacial no pin
router.get('/pois/:id', poiController.getDetails);

// ============================================================================
// ROTAS AUTENTICADAS - TURISTA (PF)
// ============================================================================

// Enviar avaliação com foto otimizada automaticamente para redes 3G (Sharp WebP)
router.post(
  '/pois/:id/reviews',
  authenticateJWT,
  authorizeRoles(['TOURIST', 'MERCHANT', 'ADMIN']),
  (req, _res, next) => {
    req.uploadFolder = 'reviews';
    next();
  },
  upload.single('photo'),
  compressAndUploadImage,
  poiController.createReview
);

// ============================================================================
// ROTAS AUTENTICADAS - EMPRESA / LOJISTA (PJ)
// ============================================================================

// Cadastro de Comércio com upload de Comprovante de Alvará e CNPJ
router.post(
  '/merchants/register-poi',
  authenticateJWT,
  (req, _res, next) => {
    req.uploadFolder = 'licenses';
    next();
  },
  upload.single('businessLicense'),
  compressAndUploadImage,
  poiController.registerMerchantPoi
);

// Painel de Gestão (MerchantDashboard) - apenas Lojistas com CNPJ aprovado ou Admin
router.get(
  '/merchants/dashboard',
  authenticateJWT,
  authorizeRoles(['MERCHANT', 'ADMIN'], { requireVerifiedMerchant: true }),
  poiController.getMerchantDashboard
);

module.exports = router;
