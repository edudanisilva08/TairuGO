const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

// Armazenamento em memória de alta velocidade como fallback caso o PostgreSQL local esteja offline
const inMemoryUsers = [
  {
    id: 'user-pf-demo',
    name: 'Lucas Mendes',
    email: 'turista@tairugo.com.br',
    passwordHash: hashPassword('123456'),
    phone: '(11) 99876-5432',
    city: 'São Paulo - SP',
    role: 'TOURIST',
    verificationStatus: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'merchant-1',
    name: 'Roberto Caiçara',
    businessName: 'Restaurante Tempero Local Caiçara',
    email: 'lojista@tairugo.com.br',
    passwordHash: hashPassword('123456'),
    phone: '(13) 99700-1234',
    cnpj: '18.234.990/0001-42',
    role: 'MERCHANT',
    verificationStatus: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    name: 'Moderação Oficial Peruíbe',
    email: 'admin@tairugo.com.br',
    passwordHash: hashPassword('admin123'),
    role: 'ADMIN',
    verificationStatus: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(`${password}_tairugo_salt`).digest('hex');
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cnpj: user.cnpj || null,
      businessName: user.businessName || null,
      verificationStatus: user.verificationStatus || 'APPROVED',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * CONTROLADOR DE AUTENTICAÇÃO E CADASTRO DE USUÁRIOS (Turistas PF e Lojistas PJ)
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Cadastra um novo Turista (PF) ou Lojista/Empresa (PJ) com validação de dados.
   */
  async register(req, res) {
    try {
      const {
        name,
        email,
        password,
        phone,
        role = 'TOURIST', // 'TOURIST' | 'MERCHANT'
        city,
        // Campos exclusivos para Lojista (PJ)
        businessName,
        cnpj,
        categorySlug,
        address,
        lat,
        lng,
        openingHours,
        description,
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Nome, e-mail e senha são obrigatórios para criar sua conta.',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter no mínimo 6 caracteres.',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRole = role === 'MERCHANT' ? 'MERCHANT' : 'TOURIST';

      if (normalizedRole === 'MERCHANT' && (!cnpj || !businessName)) {
        return res.status(400).json({
          error: 'Para cadastro de Lojista (PJ), informe o Nome Fantasia e o CNPJ.',
        });
      }

      const passwordHash = hashPassword(password);
      const verificationStatus = normalizedRole === 'MERCHANT' ? 'PENDING' : 'APPROVED';
      const licenseUrl = req.processedMedia ? req.processedMedia.urlWebp : null;

      let createdUser = null;

      // Tenta persistir no PostgreSQL + PostGIS; caso offline, utiliza o motor em memória
      try {
        const insertUserSql = `
          INSERT INTO users (name, email, password_hash, role, cnpj, business_license_url, verification_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, name, email, role, cnpj, business_license_url, verification_status, created_at;
        `;
        const { rows } = await db.query(insertUserSql, [
          name.trim(),
          normalizedEmail,
          passwordHash,
          normalizedRole,
          cnpj || null,
          licenseUrl,
          verificationStatus,
        ]);
        createdUser = {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          role: rows[0].role,
          cnpj: rows[0].cnpj,
          businessName: businessName || null,
          verificationStatus: rows[0].verification_status,
        };
      } catch (_dbErr) {
        const existing = inMemoryUsers.find((u) => u.email === normalizedEmail);
        if (existing) {
          return res.status(409).json({
            error: 'Este e-mail já está cadastrado no TairúGo.',
          });
        }

        createdUser = {
          id: `user-${crypto.randomUUID().slice(0, 8)}`,
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          phone: phone || '',
          city: city || 'Peruíbe - SP',
          role: normalizedRole,
          businessName: businessName || null,
          cnpj: cnpj || null,
          categorySlug: categorySlug || 'restaurantes',
          address: address || 'Centro, Peruíbe - SP',
          lat: lat ? parseFloat(lat) : -24.3225,
          lng: lng ? parseFloat(lng) : -46.9975,
          openingHours: openingHours || '09h - 22h',
          description: description || '',
          businessLicenseUrl: licenseUrl,
          verificationStatus,
          createdAt: new Date().toISOString(),
        };
        inMemoryUsers.push(createdUser);
      }

      const token = generateToken(createdUser);

      return res.status(201).json({
        message:
          normalizedRole === 'MERCHANT'
            ? 'Conta PJ criada com sucesso! Seu alvará foi encaminhado para aprovação.'
            : 'Bem-vindo ao TairúGo! Cadastro de Turista concluído.',
        token,
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          phone: createdUser.phone,
          city: createdUser.city,
          businessName: createdUser.businessName,
          cnpj: createdUser.cnpj,
          verificationStatus: createdUser.verificationStatus,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao processar o cadastro de usuário.',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/auth/login
   * Autentica Turistas (PF), Lojistas (PJ) e Administradores com retorno de JWT.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Informe seu e-mail e senha.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const hashed = hashPassword(password);
      let user = null;

      try {
        const { rows } = await db.query(
          `SELECT id, name, email, password_hash, role, cnpj, verification_status
           FROM users WHERE LOWER(email) = $1 LIMIT 1`,
          [normalizedEmail]
        );
        if (rows.length > 0 && rows[0].password_hash === hashed) {
          user = {
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email,
            role: rows[0].role,
            cnpj: rows[0].cnpj,
            verificationStatus: rows[0].verification_status,
          };
        }
      } catch (_dbErr) {
        const memUser = inMemoryUsers.find(
          (u) => u.email === normalizedEmail && u.passwordHash === hashed
        );
        if (memUser) {
          user = memUser;
        }
      }

      if (!user) {
        return res.status(401).json({
          error: 'E-mail ou senha inválidos. Verifique suas credenciais.',
        });
      }

      const token = generateToken(user);
      return res.status(200).json({
        message: 'Login realizado com sucesso!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cnpj: user.cnpj,
          businessName: user.businessName,
          verificationStatus: user.verificationStatus,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Falha ao autenticar usuário.',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/auth/me
   * Retorna os dados da sessão atual baseada no token JWT.
   */
  async getMe(req, res) {
    return res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
