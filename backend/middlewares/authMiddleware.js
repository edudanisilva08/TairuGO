const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tairugo-peruibe-super-secret-key-2026';

/**
 * VALIDADOR DE PERMISSÕES (RBAC com JWT)
 * Diferencia Turistas (TOURIST / PF), Lojistas (MERCHANT / PJ) e Administradores (ADMIN).
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Faça login para continuar.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email, role: 'TOURIST' | 'MERCHANT' | 'ADMIN', verificationStatus }
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Sessão expirada ou token inválido.',
      code: 'TOKEN_INVALID',
    });
  }
};

/**
 * Middleware de Controle de Acesso Baseado em Papéis (RBAC)
 * @param {Array<'TOURIST' | 'MERCHANT' | 'ADMIN'>} allowedRoles
 * @param {Object} options
 * @param {boolean} [options.requireVerifiedMerchant=false] - Exige alvará aprovado pelo Admin
 */
const authorizeRoles = (allowedRoles = [], options = { requireVerifiedMerchant: false }) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permissão negada. Perfil atual (${req.user.role}) não possui acesso a este recurso.`,
        requiredRoles: allowedRoles,
      });
    }

    // Regra de Negócio PJ: Lojistas só podem alterar portfólio público após aprovação do Alvará
    if (
      req.user.role === 'MERCHANT' &&
      options.requireVerifiedMerchant &&
      req.user.verificationStatus !== 'APPROVED'
    ) {
      return res.status(403).json({
        error: 'Seu cadastro comercial (CNPJ/Alvará) ainda está Aguardando Aprovação da moderação.',
        verificationStatus: req.user.verificationStatus || 'PENDING',
      });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
  JWT_SECRET,
};
