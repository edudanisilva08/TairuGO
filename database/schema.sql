-- ============================================================================
-- TAIRÚGO - ECOSSISTEMA TURÍSTICO E COMERCIAL DE PERUÍBE/SP
-- Camada de Persistência: PostgreSQL 15+ com Extensão Espacial PostGIS
-- ============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Tipos Enumerados (RBAC e Status de Moderação)
CREATE TYPE user_role AS ENUM ('TOURIST', 'MERCHANT', 'ADMIN');
CREATE TYPE merchant_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE poi_ownership AS ENUM ('PUBLIC', 'PRIVATE');

-- 3. Tabela de Usuários (Turistas PF, Lojistas PJ e Administradores)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50), -- 'google', 'apple', 'local'
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'TOURIST',
    
    -- Campos exclusivos para Pessoa Jurídica (MERCHANT)
    cnpj VARCHAR(18) UNIQUE,
    business_license_url TEXT, -- URL do Alvará/Comprovante no S3
    verification_status merchant_status DEFAULT 'PENDING',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Categorias (Praias, Cachoeiras, Trilhas, Mirantes, Restaurantes, Pousadas...)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(60) NOT NULL,
    is_commercial BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela Principal de Pontos de Interesse (POIs - Turísticos e Comerciais)
CREATE TABLE pois (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(280),
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    ownership poi_ownership NOT NULL DEFAULT 'PUBLIC',
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Coluna Geográfica PostGIS (SRID 4326 = WGS 84 Longitude/Latitude)
    location GEOMETRY(Point, 4326) NOT NULL,
    address VARCHAR(255),
    
    -- Informações Operacionais e Regras de Acessibilidade
    opening_hours VARCHAR(100) DEFAULT 'Livre (24h)',
    entry_fee VARCHAR(100) DEFAULT 'Gratuita',
    requires_guide BOOLEAN NOT NULL DEFAULT FALSE,
    accessibility_rules JSONB DEFAULT '{"wheelchair": false, "paved_trail": false, "pet_friendly": true, "cell_signal": "3G Oscilante"}'::jsonb,
    
    -- Dados Comerciais e Cardápio/Portfólio Digital (para PJ)
    is_open_now BOOLEAN DEFAULT TRUE,
    phone_whatsapp VARCHAR(30),
    digital_menu JSONB DEFAULT '[]'::jsonb,
    
    -- Cache de Avaliação para leitura de alta performance
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Índices Espaciais e de Performance (Crucial para buscas de raio ST_DWithin)
CREATE INDEX idx_pois_location_gist ON pois USING GIST (location);
CREATE INDEX idx_pois_category ON pois (category_id);
CREATE INDEX idx_pois_active_featured ON pois (is_active, is_featured);

-- 7. Galeria de Fotos Otimizadas (Storage Isolado S3 + Placeholder Blurhash)
CREATE TABLE poi_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poi_id UUID NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    url_webp TEXT NOT NULL,           -- Imagem comprimida via Sharp (WebP 800px)
    thumbnail_webp TEXT NOT NULL,     -- Miniatura leve para conexões 3G (WebP 300px)
    blurhash VARCHAR(100),            -- Hash para Skeleton instantâneo no React
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tabela de Avaliações e Comentários (com suporte a resposta do Lojista)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poi_id UUID NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    merchant_reply TEXT,
    merchant_replied_at TIMESTAMPTZ,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (poi_id, user_id)
);

-- 9. Tabela de Favoritos dos Turistas
CREATE TABLE user_favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poi_id UUID NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, poi_id)
);

-- 10. Tabela de Métricas de Engajamento (Para o Painel de Gestão do Lojista)
CREATE TABLE poi_metrics (
    id BIGSERIAL PRIMARY KEY,
    poi_id UUID NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    event_type VARCHAR(40) NOT NULL, -- 'PIN_CLICK', 'ROUTE_TRACE', 'WHATSAPP_CLICK', 'FAVORITE'
    user_location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_poi_metrics_poi_date ON poi_metrics (poi_id, created_at);

-- ============================================================================
-- TRIGGER AUTOMÁTICA: Atualiza média de avaliações do POI após novo Review
-- ============================================================================
CREATE OR REPLACE FUNCTION update_poi_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pois
    SET 
        rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE poi_id = COALESCE(NEW.poi_id, OLD.poi_id) AND is_approved = TRUE), 0),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE poi_id = COALESCE(NEW.poi_id, OLD.poi_id) AND is_approved = TRUE),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.poi_id, OLD.poi_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_poi_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_poi_rating_stats();

-- ============================================================================
-- DADOS INICIAIS (SEED): Categorias e Pontos Reais de Peruíbe/SP
-- ============================================================================
INSERT INTO categories (slug, name, icon_name, is_commercial) VALUES
('praias', 'Praias', 'umbrella-beach', FALSE),
('cachoeiras', 'Cachoeiras', 'droplets', FALSE),
('trilhas', 'Trilhas', 'compass', FALSE),
('mirantes', 'Mirantes', 'mountain', FALSE),
('historico', 'Histórico', 'landmark', FALSE),
('restaurantes', 'Restaurantes', 'utensils', TRUE),
('hospedagem', 'Pousadas', 'bed', TRUE),
('lojas', 'Artesanato & Lojas', 'shopping-bag', TRUE);

-- Inserção de POIs georreferenciados em Peruíbe (ST_SetSRID(ST_MakePoint(LONG, LAT), 4326))
INSERT INTO pois (name, slug, description, short_description, category_id, ownership, location, address, opening_hours, entry_fee, requires_guide, accessibility_rules, rating_avg, rating_count, is_featured)
VALUES
(
    'Praia do Guaraú',
    'praia-do-guarau',
    'Localizada aos pés da Serra da Juréia, a Praia do Guaraú é o encontro perfeito entre o mar cristalino, o rio Guaraú e a Mata Atlântica preservada. Suas águas calmas próximo à foz do rio convidam a banhos em família, passeios de caiaque e observação de ilhas costeiras.',
    'Encontro do rio com o mar aos pés da Reserva da Juréia.',
    (SELECT id FROM categories WHERE slug = 'praias'),
    'PUBLIC',
    ST_SetSRID(ST_MakePoint(-47.0186, -24.3739), 4326),
    'Av. Padre Anchieta, Guaraú - Peruíbe/SP',
    '06h - 19h',
    'Gratuita',
    FALSE,
    '{"wheelchair": true, "paved_trail": true, "pet_friendly": true, "cell_signal": "4G Estável"}'::jsonb,
    4.90, 142, TRUE
),
(
    'Cachoeira do Paraíso',
    'cachoeira-do-paraiso',
    'Situada dentro do Mosaico de Unidades de Conservação Juréia-Itatins, a Cachoeira do Paraíso possui piscinas naturais de águas translúcidas e escorregadores naturais na rocha cercados por mata nativa intocada.',
    'Queda d''água cristalina e piscinas naturais na Reserva da Juréia.',
    (SELECT id FROM categories WHERE slug = 'cachoeiras'),
    'PUBLIC',
    ST_SetSRID(ST_MakePoint(-47.0921, -24.3982), 4326),
    'Estrada do Una, Reserva da Juréia - Peruíbe/SP',
    '08h - 16h',
    'Taxa Ambiental R$ 15',
    TRUE,
    '{"wheelchair": false, "paved_trail": false, "pet_friendly": false, "cell_signal": "3G Oscilante"}'::jsonb,
    4.95, 98, FALSE
),
(
    'Mirante da Torre (Serra do Guaraú)',
    'mirante-da-torre',
    'Ponto panorâmico no alto da Serra do Guaraú com vista espetacular de toda a orla de Peruíbe, Ilha do Guaraú e a imensidão verde da Mata Atlântica.',
    'Vista incrível de toda a orla de Peruíbe e ilhas costeiras.',
    (SELECT id FROM categories WHERE slug = 'mirantes'),
    'PUBLIC',
    ST_SetSRID(ST_MakePoint(-47.0112, -24.3545), 4326),
    'Estrada do Guaraú, Km 4 - Peruíbe/SP',
    'Livre (24h)',
    'Gratuita',
    FALSE,
    '{"wheelchair": true, "paved_trail": true, "pet_friendly": true, "cell_signal": "4G Estável"}'::jsonb,
    4.85, 76, TRUE
),
(
    'Ruínas do Abarebebê',
    'ruinas-do-abarebebe',
    'Marco histórico nacional do século XVI, considerada uma das primeiras igrejas do Brasil onde o Padre Leonardo Nunes (o Abarebebê, "padre voador" em tupi) catequizou os indígenas da região.',
    'Patrimônio histórico do século XVI com visitação cultural guiada.',
    (SELECT id FROM categories WHERE slug = 'historico'),
    'PUBLIC',
    ST_SetSRID(ST_MakePoint(-46.9531, -24.2874), 4326),
    'Av. Domingos da Costa Grimaldi, Parque Turístico - Peruíbe/SP',
    '09h - 17h (Ter a Dom)',
    'R$ 10 (Meia R$ 5)',
    FALSE,
    '{"wheelchair": true, "paved_trail": true, "pet_friendly": false, "cell_signal": "5G/4G"}'::jsonb,
    4.75, 64, FALSE
);
