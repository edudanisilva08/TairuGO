const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

/**
 * GERENCIADOR DE MÍDIA E OTIMIZAÇÃO PARA REDES 3G OSCILANTES (ex: Barra do Una / Juréia)
 * Intercepta uploads em memória, redimensiona e converte automaticamente para WebP de alta
 * eficiência antes de persistir no Storage isolado (AWS S3 / Cloudflare R2).
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'sa-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret-key',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'tairugo-peruibe-media';
const CDN_BASE_URL = process.env.CDN_BASE_URL || `https://${BUCKET_NAME}.s3.sa-east-1.amazonaws.com`;

// Armazenamento em buffer na RAM para processamento imediato pelo Sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // Limite de entrada: 8MB por foto bruta do celular
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado. Envie JPG, PNG, WebP ou PDF (para Alvará).'));
    }
  },
});

/**
 * Middleware que comprime imagens enviadas por turistas ou lojistas:
 * - Gera versão principal Full HD otimizada (max 1200px, WebP qualidade 78, ~70KB)
 * - Gera miniatura ultraleve (max 360px, WebP qualidade 68, ~18KB) para redes 3G
 */
const compressAndUploadImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const fileId = crypto.randomUUID();
    const folder = req.uploadFolder || 'pois';

    // 1. Compressão da imagem principal (WebP 1200px)
    const fullWebpBuffer = await sharp(req.file.buffer)
      .rotate() // Preserva orientação EXIF de fotos tiradas no celular
      .resize({ width: 1200, height: 900, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toBuffer();

    // 2. Compressão da miniatura 3G (WebP 360px)
    const thumbWebpBuffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 360, height: 270, fit: 'cover' })
      .webp({ quality: 68, effort: 4 })
      .toBuffer();

    const fullKey = `${folder}/${fileId}-full.webp`;
    const thumbKey = `${folder}/${fileId}-thumb.webp`;

    // Envia para o S3 se configurado em produção
    if (process.env.AWS_ACCESS_KEY_ID && process.env.NODE_ENV === 'production') {
      await Promise.all([
        s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fullKey,
            Body: fullWebpBuffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        ),
        s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: thumbKey,
            Body: thumbWebpBuffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        ),
      ]);
    }

    req.processedMedia = {
      urlWebp: `${CDN_BASE_URL}/${fullKey}`,
      thumbnailWebp: `${CDN_BASE_URL}/${thumbKey}`,
      originalSizeBytes: req.file.size,
      compressedSizeBytes: fullWebpBuffer.length,
      thumbSizeBytes: thumbWebpBuffer.length,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Falha ao comprimir e otimizar a imagem enviada.',
      details: error.message,
    });
  }
};

module.exports = {
  upload,
  compressAndUploadImage,
};
