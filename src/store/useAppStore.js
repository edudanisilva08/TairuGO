import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERUIBE_CENTER, calculateDistanceKm } from '../services/geoServices';

/**
 * BASE GEORREFERENCIADA INICIAL DE PERUÍBE/SP (Sincronizada com o Schema PostGIS)
 */
const INITIAL_POIS = [
  {
    id: 'poi-1',
    name: 'Praia do Guaraú (Praia do Farol)',
    slug: 'praia-do-guarau',
    category_slug: 'praias',
    category_name: 'Praias',
    is_commercial: false,
    ownership: 'PUBLIC',
    lat: -24.3739,
    lng: -47.0186,
    address: 'Av. Padre Anchieta, Guaraú - Peruíbe/SP',
    short_description: 'A praia mais famosa da reserva, com águas calmas, foz do rio e areia branca.',
    description:
      'Reconhecida como uma das joias mais reluzentes do Litoral Sul de São Paulo, na porta de entrada da Reserva da Juréia. Suas águas calmas e límpidas no encontro do rio com o mar convidam a banhos prolongados, passeios de caiaque e observação das ilhas costeiras.',
    opening_hours: '06h - 18h',
    entry_fee: 'Gratuita',
    requires_guide: false,
    is_open_now: true,
    is_featured: true,
    rating_avg: 4.9,
    rating_count: 148,
    cover_image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: true,
      paved_trail: true,
      pet_friendly: true,
      cell_signal: '4G Estável',
    },
    reviews: [
      {
        id: 'rev-1',
        user_name: 'Juliana Santos',
        rating: 5,
        comment: 'Lugar paradisíaco, maravilhoso para passar a tarde em família no encontro do rio com o mar!',
        created_at: 'Há 2 dias',
      },
      {
        id: 'rev-2',
        user_name: 'Mateus Melo',
        rating: 5,
        comment: 'Trilha curta e fácil para chegar. Água incrivelmente limpa e quiosques caiçaras excelentes.',
        created_at: 'Há 5 dias',
      },
    ],
  },
  {
    id: 'poi-2',
    name: 'Cachoeira do Paraíso (Cachoeira Alta)',
    slug: 'cachoeira-do-paraiso',
    category_slug: 'cachoeiras',
    category_name: 'Cachoeiras',
    is_commercial: false,
    ownership: 'PUBLIC',
    lat: -24.3982,
    lng: -47.0921,
    address: 'Estrada do Una, Reserva da Juréia - Peruíbe/SP',
    short_description: 'Queda d’água cristalina de 15 metros na Juréia ideal para banho refrescante.',
    description:
      'Localizada no coração do Mosaico de Unidades de Conservação Juréia-Itatins, a Cachoeira do Paraíso encanta pelas piscinas naturais cristalinas, tobogã natural na pedra e biodiversidade exuberante da Mata Atlântica primária.',
    opening_hours: '08h - 16h',
    entry_fee: 'Taxa Ambiental R$ 15',
    requires_guide: true,
    is_open_now: true,
    is_featured: true,
    rating_avg: 4.9,
    rating_count: 96,
    cover_image:
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: false,
      paved_trail: false,
      pet_friendly: false,
      cell_signal: '3G Oscilante (Modo Offline Ativo)',
    },
    reviews: [
      {
        id: 'rev-3',
        user_name: 'Camila Rocha',
        rating: 5,
        comment: 'Água geladinha e revigorante! Recomendo ir cedo e levar repelente.',
        created_at: 'Há 1 semana',
      },
    ],
  },
  {
    id: 'poi-3',
    name: 'Mirante das Ilhas (Torre do Guaraú)',
    slug: 'mirante-das-ilhas',
    category_slug: 'mirantes',
    category_name: 'Mirantes',
    is_commercial: false,
    ownership: 'PUBLIC',
    lat: -24.3545,
    lng: -47.0112,
    address: 'Serra do Guaraú, Km 4 - Peruíbe/SP',
    short_description: 'Vista incrível de todo o arquipélago costeiro e da orla de Peruíbe.',
    description:
      'No ponto mais alto da estrada serrana que liga o centro de Peruíbe à reserva do Guaraú, o Mirante oferece um pôr do sol inesquecível e vista panorâmica das ilhas Queimada Grande, Queimada Pequena e Ilha do Guaraú.',
    opening_hours: 'Livre (24h)',
    entry_fee: 'Gratuita',
    requires_guide: false,
    is_open_now: true,
    is_featured: true,
    rating_avg: 4.8,
    rating_count: 84,
    cover_image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: true,
      paved_trail: true,
      pet_friendly: true,
      cell_signal: '4G Estável',
    },
    reviews: [
      {
        id: 'rev-4',
        user_name: 'Rafael Oliveira',
        rating: 5,
        comment: 'Visual de tirar o fôlego! Parada obrigatória subindo para o Guaraú.',
        created_at: 'Há 3 dias',
      },
    ],
  },
  {
    id: 'poi-4',
    name: 'Trilha da Caveira & Costão da Prainha',
    slug: 'trilha-da-caveira',
    category_slug: 'trilhas',
    category_name: 'Trilhas',
    is_commercial: false,
    ownership: 'PUBLIC',
    lat: -24.3428,
    lng: -47.0049,
    address: 'Acesso pelo Costão da Prainha - Peruíbe/SP',
    short_description: 'Aventura pela mata fechada com vista final espetacular do costão rochoso.',
    description:
      'Trilha ecológica costeira cercada por bromélias gigantes e mirantes naturais sobre o mar batendo nas rochas. Ideal para ecoturismo e fotografia de natureza.',
    opening_hours: '07h - 17h',
    entry_fee: 'Gratuita',
    requires_guide: true,
    is_open_now: true,
    is_featured: false,
    rating_avg: 4.8,
    rating_count: 52,
    cover_image:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: false,
      paved_trail: false,
      pet_friendly: false,
      cell_signal: '3G Oscilante',
    },
    reviews: [],
  },
  {
    id: 'poi-5',
    name: 'Ruínas do Abarebebê & Centro Histórico',
    slug: 'ruinas-do-abarebebe',
    category_slug: 'historico',
    category_name: 'Histórico',
    is_commercial: false,
    ownership: 'PUBLIC',
    lat: -24.2874,
    lng: -46.9531,
    address: 'Av. Domingos da Costa Grimaldi - Peruíbe/SP',
    short_description: 'Marco histórico do século XVI e acervo arqueológico tupi-guarani.',
    description:
      'Patrimônio histórico tombado que preserva as paredes de pedra e cal de uma das primeiras igrejas do Brasil colonial, erguida no século XVI pelo Padre Leonardo Nunes.',
    opening_hours: '09h - 17h',
    entry_fee: 'R$ 10 (Meia R$ 5)',
    requires_guide: false,
    is_open_now: true,
    is_featured: false,
    rating_avg: 4.6,
    rating_count: 63,
    cover_image:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: true,
      paved_trail: true,
      pet_friendly: false,
      cell_signal: '5G/4G',
    },
    reviews: [],
  },
  {
    id: 'poi-6',
    name: 'Restaurante Tempero Local Caiçara',
    slug: 'restaurante-tempero-local',
    category_slug: 'restaurantes',
    category_name: 'Gastronomia',
    is_commercial: true,
    ownership: 'PRIVATE',
    owner_id: 'merchant-1',
    lat: -24.3245,
    lng: -46.9998,
    address: 'Av. Padre Anchieta, 1420 - Centro, Peruíbe/SP',
    short_description: 'Peixe na telha, caldeirada caiçara e frutos do mar frescos de frente para o mar.',
    description:
      'Tradicional restaurante caiçara de Peruíbe especializado em tainha assada na folha de bananeira, camarão na moranga e moqueca com ingredientes de pescadores artesanais locais.',
    opening_hours: '11h - 23h',
    entry_fee: 'Consumo no local',
    requires_guide: false,
    is_open_now: true,
    is_featured: true,
    phone_whatsapp: '5513997001234',
    rating_avg: 4.7,
    rating_count: 112,
    cover_image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: true,
      paved_trail: true,
      pet_friendly: true,
      cell_signal: '5G + Wi-Fi',
    },
    digital_menu: [
      { id: 'm1', name: 'Peixe na Telha para 2 Pessoas', price: 'R$ 138,00', tag: 'Mais Pedido' },
      { id: 'm2', name: 'Casquinha de Siri Caiçara', price: 'R$ 29,00', tag: 'Entrada' },
      { id: 'm3', name: 'Suco de Cambuci da Juréia', price: 'R$ 16,00', tag: 'Artesanal' },
    ],
    reviews: [
      {
        id: 'rev-5',
        user_name: 'Fernanda Lima',
        rating: 5,
        comment: 'Melhor peixe na telha de Peruíbe! Atendimento super ágil.',
        merchant_reply: 'Muito obrigado pelo carinho, Fernanda! Esperamos você novamente!',
        created_at: 'Ontem',
      },
    ],
  },
  {
    id: 'poi-7',
    name: 'Pousada Estrela do Mar',
    slug: 'pousada-estrela-do-mar',
    category_slug: 'hospedagem',
    category_name: 'Hospedagem',
    is_commercial: true,
    ownership: 'PRIVATE',
    owner_id: 'merchant-1',
    lat: -24.3312,
    lng: -47.0015,
    address: 'Av. Beira Mar, 450 - Praia do Costão, Peruíbe/SP',
    short_description: 'Suítes com varanda vista mar, café da manhã colonial e piscina climatizada.',
    description:
      'A apenas 50 metros da areia da praia e próxima à subida do Guaraú, a Pousada Estrela do Mar oferece conforto, estacionamento fechado e roteiros ecológicos com guias credenciados.',
    opening_hours: 'Recepção 24h',
    entry_fee: 'Diárias a partir de R$ 280',
    requires_guide: false,
    is_open_now: true,
    is_featured: false,
    phone_whatsapp: '5513997112233',
    rating_avg: 4.9,
    rating_count: 89,
    cover_image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: true,
      paved_trail: true,
      pet_friendly: true,
      cell_signal: '5G + Wi-Fi Fibra',
    },
    digital_menu: [
      { id: 'p1', name: 'Suíte Casal Vista Mar (Café incluso)', price: 'R$ 290/noite', tag: 'Disponível' },
      { id: 'p2', name: 'Chalé Família (até 4 pessoas)', price: 'R$ 420/noite', tag: 'Últimas vagas' },
    ],
    reviews: [],
  },
  {
    id: 'poi-8',
    name: 'Ateliê Barro & Arte Peruíbe',
    slug: 'atelie-barro-e-arte',
    category_slug: 'lojas',
    category_name: 'Artesanato',
    is_commercial: true,
    ownership: 'PRIVATE',
    lat: -24.3189,
    lng: -46.9942,
    address: 'Beco das Flores, 4 - Centro, Peruíbe/SP',
    short_description: 'Cerâmica artística, cosméticos com Lama Negra de Peruíbe e lembranças.',
    description:
      'Espaço cultural de artesãos locais de Peruíbe com peças em cerâmica, cestaria indígena e sabonetes certificados da famosa Lama Negra medicinal.',
    opening_hours: '10h - 19h',
    entry_fee: 'Entrada Franca',
    requires_guide: false,
    is_open_now: false,
    is_featured: false,
    phone_whatsapp: '5513997889900',
    rating_avg: 4.8,
    rating_count: 47,
    cover_image:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=75',
    accessibility_rules: {
      wheelchair: true,
      paved_trail: true,
      pet_friendly: true,
      cell_signal: '5G',
    },
    digital_menu: [
      { id: 'a1', name: 'Kit Sabonete Lama Negra de Peruíbe', price: 'R$ 35,00', tag: 'Exclusivo' },
      { id: 'a2', name: 'Luminária Caiçara em Fibra Natural', price: 'R$ 110,00', tag: 'Feito à mão' },
    ],
    reviews: [],
  },
];

const INITIAL_USERS = [
  {
    id: 'user-pf-1',
    name: 'Lucas Mendes',
    email: 'turista@tairugo.com.br',
    password: '123',
    phone: '(11) 99876-5432',
    city: 'São Paulo - SP',
    role: 'TOURIST',
    verificationStatus: 'APPROVED',
  },
  {
    id: 'merchant-1',
    name: 'Roberto Caiçara',
    businessName: 'Restaurante Tempero Local Caiçara',
    email: 'lojista@tairugo.com.br',
    password: '123',
    phone: '(13) 99700-1234',
    cnpj: '18.234.990/0001-42',
    role: 'MERCHANT',
    ownedPoiId: 'poi-6',
    verificationStatus: 'APPROVED',
  },
  {
    id: 'admin-1',
    name: 'Moderação Oficial TairúGo',
    email: 'admin@tairugo.com.br',
    password: '123',
    role: 'ADMIN',
    verificationStatus: 'APPROVED',
  },
];

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Navegação Principal
      activeTab: 'inicio', // 'inicio' | 'pontos' | 'mapa' | 'comercio' | 'dicas' | 'merchant' | 'admin'
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Configuração da API do Google Maps
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      setGoogleMapsApiKey: (key) => {
        set({ googleMapsApiKey: key.trim() });
        get().showToast('Chave da API do Google Maps atualizada com sucesso!');
      },

      // Notificações Fluídas (Toast)
      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { id: Date.now(), message, type } });
        setTimeout(() => {
          set((s) => (s.toast && Date.now() - s.toast.id >= 3400 ? { toast: null } : {}));
        }, 3500);
      },

      // Estado Geográfico e do Mapa
      userLocation: PERUIBE_CENTER,
      mapCenter: [-24.338, -47.005],
      mapZoom: 13,
      radiusKm: 30,
      searchQuery: '',
      activeCategory: 'todos',
      onlyFavoritesFilter: false,
      selectedPoiId: null,
      activeRoutePoiId: null,
      favorites: ['poi-1'],

      // Base de POIs e Usuários Cadastrados
      pois: INITIAL_POIS,
      registeredUsers: INITIAL_USERS,

      // Estado de Autenticação RBAC (Turista PF, Lojista PJ, Admin)
      currentUser: null,
      showQuickLoginModal: false,
      authModalInitialTab: 'login', // 'login' | 'register'
      authModalInitialRole: 'TOURIST', // 'TOURIST' | 'MERCHANT'
      pendingProtectedAction: null,
      showMerchantClaimModal: false,

      // Fila de Moderação de Empresas PJ
      merchantClaims: [
        {
          id: 'claim-101',
          businessName: 'Quiosque Brisa do Guaraú',
          ownerName: 'Carlos Eduardo Silva',
          cnpj: '41.892.301/0001-19',
          category: 'Restaurantes',
          address: 'Orla da Praia do Guaraú, Quiosque 04',
          licenseFile: 'alvara_funcionamento_2026_guarau.webp',
          status: 'PENDING',
          submittedAt: 'Hoje, 09:40',
        },
        {
          id: 'claim-102',
          businessName: 'EcoTurismo Juréia Expedições',
          ownerName: 'Mariana Costa',
          cnpj: '29.401.882/0001-05',
          category: 'Trilhas & Guias',
          address: 'Estrada do Una, Km 2 - Peruíbe/SP',
          licenseFile: 'cadastur_alvara_jureia.pdf',
          status: 'APPROVED',
          submittedAt: 'Ontem, 16:15',
        },
      ],

      weeklyPinMetrics: [
        { day: 'Seg', clicks: 48, routes: 14 },
        { day: 'Ter', clicks: 62, routes: 21 },
        { day: 'Qua', clicks: 55, routes: 19 },
        { day: 'Qui', clicks: 89, routes: 34 },
        { day: 'Sex', clicks: 146, routes: 68 },
        { day: 'Sáb', clicks: 238, routes: 115 },
        { day: 'Dom', clicks: 210, routes: 98 },
      ],

      // Actions Geográficas
      setUserLocation: (coords) => set({ userLocation: coords }),
      setMapViewport: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      setRadiusKm: (radiusKm) => set({ radiusKm }),
      toggleOnlyFavoritesFilter: () =>
        set((s) => ({ onlyFavoritesFilter: !s.onlyFavoritesFilter })),

      selectPoi: (poiId) => {
        const poi = get().pois.find((p) => p.id === poiId);
        if (poi) {
          set((state) => ({
            selectedPoiId: poiId,
            mapCenter: [poi.lat, poi.lng],
            weeklyPinMetrics: state.weeklyPinMetrics.map((m, idx) =>
              idx === 6 ? { ...m, clicks: m.clicks + 1 } : m
            ),
          }));
        } else {
          set({ selectedPoiId: null });
        }
      },

      traceRouteToPoi: (poiId) => {
        const poi = get().pois.find((p) => p.id === poiId);
        if (!poi) return;
        set((state) => ({
          activeRoutePoiId: poiId,
          selectedPoiId: null, // Fecha a gaveta para exibir a rota limpa no Google Maps
          activeTab: 'mapa',
          mapCenter: [
            (state.userLocation.lat + poi.lat) / 2,
            (state.userLocation.lng + poi.lng) / 2,
          ],
          mapZoom: 13,
          weeklyPinMetrics: state.weeklyPinMetrics.map((m, idx) =>
            idx === 6 ? { ...m, routes: m.routes + 1 } : m
          ),
        }));
        get().showToast(`Rota traçada até ${poi.name}!`);
      },

      clearActiveRoute: () => set({ activeRoutePoiId: null }),

      // Abrir Modal de Autenticação / Cadastro escolhendo Aba e Perfil (Turista ou Lojista)
      openAuthModal: ({ tab = 'login', role = 'TOURIST', pendingAction = null } = {}) => {
        set({
          showQuickLoginModal: true,
          authModalInitialTab: tab,
          authModalInitialRole: role,
          pendingProtectedAction: pendingAction,
        });
      },

      // Executa ação protegida exigindo Login sem perder o estado do mapa
      requireAuthForAction: (actionCallback) => {
        const { currentUser } = get();
        if (currentUser) {
          actionCallback(currentUser);
        } else {
          set({
            showQuickLoginModal: true,
            authModalInitialTab: 'login',
            pendingProtectedAction: actionCallback,
          });
        }
      },

      // Login por E-mail e Senha ou Perfil Rápido
      loginWithCredentials: ({ email, password }) => {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const found = get().registeredUsers.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );

        if (!found || (password && found.password && found.password !== password)) {
          return {
            ok: false,
            error: 'E-mail ou senha incorretos. Confira seus dados ou crie uma conta.',
          };
        }

        get().loginUser(found);
        return { ok: true, user: found };
      },

      // Cadastro Completo de Novo Usuário (Turista PF ou Lojista PJ)
      registerNewUser: (payload) => {
        const {
          name,
          email,
          password,
          phone,
          city,
          role = 'TOURIST',
          // Dados de Lojista PJ
          businessName,
          cnpj,
          categorySlug = 'restaurantes',
          address,
          lat,
          lng,
          openingHours,
          description,
          licenseFile,
        } = payload;

        const normalizedEmail = (email || '').trim().toLowerCase();
        const existing = get().registeredUsers.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );
        if (existing) {
          return {
            ok: false,
            error: 'Este e-mail já possui cadastro. Faça login na aba Entrar.',
          };
        }

        const userId = `user-${Date.now()}`;
        const newPoiId = role === 'MERCHANT' ? `poi-biz-${Date.now()}` : null;

        const categoryMap = {
          restaurantes: 'Gastronomia',
          hospedagem: 'Hospedagem',
          lojas: 'Artesanato & Comércio',
        };

        const newUser = {
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          password,
          phone: phone || '',
          city: city || 'Peruíbe - SP',
          role,
          businessName: role === 'MERCHANT' ? businessName : null,
          cnpj: role === 'MERCHANT' ? cnpj : null,
          ownedPoiId: newPoiId,
          verificationStatus: role === 'MERCHANT' ? 'PENDING' : 'APPROVED',
        };

        set((state) => {
          let updatedPois = state.pois;
          let updatedClaims = state.merchantClaims;

          // Se for Lojista (PJ), já cria o ponto comercial no mapa e envia o Alvará para fila do Admin
          if (role === 'MERCHANT') {
            const newPoi = {
              id: newPoiId,
              name: businessName.trim(),
              slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              category_slug: categorySlug,
              category_name: categoryMap[categorySlug] || 'Comércio Local',
              is_commercial: true,
              ownership: 'PRIVATE',
              owner_id: userId,
              lat: lat ? parseFloat(lat) : -24.3228 + (Math.random() - 0.5) * 0.01,
              lng: lng ? parseFloat(lng) : -46.9985 + (Math.random() - 0.5) * 0.01,
              address: address || 'Av. Padre Anchieta - Centro, Peruíbe/SP',
              short_description:
                description?.slice(0, 120) ||
                `Estabelecimento comercial parceiro em Peruíbe (${businessName}).`,
              description:
                description ||
                `Bem-vindo ao ${businessName}! Atendimento especial para turistas e moradores de Peruíbe.`,
              opening_hours: openingHours || '09h - 22h',
              entry_fee: 'Entrada Franca',
              requires_guide: false,
              is_open_now: true,
              is_featured: false,
              phone_whatsapp: phone || '5513997000000',
              rating_avg: 5.0,
              rating_count: 1,
              cover_image:
                categorySlug === 'hospedagem'
                  ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=75'
                  : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=75',
              accessibility_rules: {
                wheelchair: true,
                paved_trail: true,
                pet_friendly: true,
                cell_signal: '5G + Wi-Fi',
              },
              digital_menu: [
                {
                  id: `m-${Date.now()}`,
                  name: 'Destaque de Boas-Vindas TairúGo',
                  price: 'Consulte',
                  tag: 'Novo em Peruíbe',
                },
              ],
              reviews: [],
            };

            const newClaim = {
              id: `claim-${Date.now()}`,
              userId,
              poiId: newPoiId,
              businessName: businessName.trim(),
              ownerName: name.trim(),
              cnpj,
              category: categoryMap[categorySlug] || 'Comércio Local',
              address: newPoi.address,
              licenseFile: licenseFile || 'alvara_municipal_peruibe.pdf',
              status: 'PENDING',
              submittedAt: 'Agora mesmo',
            };

            updatedPois = [newPoi, ...state.pois];
            updatedClaims = [newClaim, ...state.merchantClaims];
          }

          return {
            registeredUsers: [...state.registeredUsers, newUser],
            pois: updatedPois,
            merchantClaims: updatedClaims,
          };
        });

        get().loginUser(newUser);
        if (role === 'MERCHANT') {
          set({ activeTab: 'merchant' });
          get().showToast(
            `Empresa "${businessName}" cadastrada! Acesse seu Painel de Gestão PJ.`
          );
        } else {
          get().showToast(`Bem-vindo(a), ${name}! Sua conta de Turista foi criada.`);
        }

        return { ok: true, user: newUser };
      },

      loginUser: (userProfile) => {
        const pending = get().pendingProtectedAction;
        set({
          currentUser: userProfile,
          showQuickLoginModal: false,
          pendingProtectedAction: null,
        });
        if (typeof pending === 'function') {
          pending(userProfile);
        } else {
          get().showToast(`Sessão iniciada como ${userProfile.name}`);
        }
      },

      logoutUser: () => {
        set({ currentUser: null, activeTab: 'inicio' });
        get().showToast('Você saiu da sua conta.');
      },

      closeQuickLoginModal: () =>
        set({ showQuickLoginModal: false, pendingProtectedAction: null }),
      setShowMerchantClaimModal: (flag) => set({ showMerchantClaimModal: flag }),

      toggleFavorite: (poiId) => {
        get().requireAuthForAction(() => {
          set((state) => {
            const exists = state.favorites.includes(poiId);
            get().showToast(
              exists ? 'Removido dos seus favoritos' : 'Salvo nos seus favoritos!'
            );
            return {
              favorites: exists
                ? state.favorites.filter((id) => id !== poiId)
                : [...state.favorites, poiId],
            };
          });
        });
      },

      addReviewToPoi: (poiId, { rating, comment, photoCompressionInfo }) => {
        get().requireAuthForAction((user) => {
          set((state) => ({
            pois: state.pois.map((poi) => {
              if (poi.id !== poiId) return poi;
              const newReview = {
                id: `rev-${Date.now()}`,
                user_name: user.name,
                rating: Number(rating),
                comment,
                photoCompressionInfo,
                created_at: 'Agora mesmo',
              };
              const updatedReviews = [newReview, ...poi.reviews];
              const newCount = poi.rating_count + 1;
              const newAvg = Number(
                ((poi.rating_avg * poi.rating_count + Number(rating)) / newCount).toFixed(1)
              );
              return {
                ...poi,
                rating_avg: newAvg,
                rating_count: newCount,
                reviews: updatedReviews,
              };
            }),
          }));
          get().showToast('Sua avaliação foi publicada com sucesso!');
        });
      },

      // Ações do Lojista PJ
      togglePoiOpenStatus: (poiId) => {
        set((state) => ({
          pois: state.pois.map((p) =>
            p.id === poiId ? { ...p, is_open_now: !p.is_open_now } : p
          ),
        }));
        get().showToast('Status de funcionamento atualizado no mapa!');
      },

      replyToReview: (poiId, reviewId, replyText) => {
        set((state) => ({
          pois: state.pois.map((poi) => {
            if (poi.id !== poiId) return poi;
            return {
              ...poi,
              reviews: poi.reviews.map((r) =>
                r.id === reviewId ? { ...r, merchant_reply: replyText } : r
              ),
            };
          }),
        }));
        get().showToast('Resposta oficial publicada na avaliação!');
      },

      addMenuItemToPoi: (poiId, item) => {
        set((state) => ({
          pois: state.pois.map((poi) => {
            if (poi.id !== poiId) return poi;
            return {
              ...poi,
              digital_menu: [
                ...(poi.digital_menu || []),
                { id: `m-${Date.now()}`, ...item },
              ],
            };
          }),
        }));
        get().showToast('Item adicionado ao seu cardápio digital!');
      },

      removeMenuItemFromPoi: (poiId, itemId) => {
        set((state) => ({
          pois: state.pois.map((poi) => {
            if (poi.id !== poiId) return poi;
            return {
              ...poi,
              digital_menu: (poi.digital_menu || []).filter((i) => i.id !== itemId),
            };
          }),
        }));
        get().showToast('Item removido do cardápio.');
      },

      submitMerchantClaim: (claimData) => {
        get().registerNewUser({
          name: claimData.ownerName || claimData.businessName,
          email:
            claimData.email ||
            `contato@${claimData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
          password: claimData.password || '123456',
          role: 'MERCHANT',
          businessName: claimData.businessName,
          cnpj: claimData.cnpj,
          categorySlug: claimData.categorySlug || 'restaurantes',
          address: claimData.address,
          licenseFile: claimData.licenseFile,
        });
        set({ showMerchantClaimModal: false });
      },

      updateMerchantClaimStatus: (claimId, newStatus) => {
        set((state) => {
          const targetClaim = state.merchantClaims.find((c) => c.id === claimId);
          return {
            merchantClaims: state.merchantClaims.map((c) =>
              c.id === claimId ? { ...c, status: newStatus } : c
            ),
            registeredUsers: state.registeredUsers.map((u) =>
              targetClaim && u.id === targetClaim.userId
                ? { ...u, verificationStatus: newStatus }
                : u
            ),
            currentUser:
              targetClaim && state.currentUser?.id === targetClaim.userId
                ? { ...state.currentUser, verificationStatus: newStatus }
                : state.currentUser,
          };
        });
        get().showToast(
          newStatus === 'APPROVED'
            ? 'Alvará comercial aprovado! O lojista já está verificado.'
            : 'Solicitação comercial recusada.'
        );
      },

      // Seletor Computado: POIs filtrados e ordenados por distância (km) do usuário
      getFilteredPois: (options = {}) => {
        const state = get();
        const {
          userLocation,
          pois,
          activeCategory,
          searchQuery,
          radiusKm,
          onlyFavoritesFilter,
          favorites,
        } = state;

        const categoryFilter = options.categoryOverride ?? activeCategory;
        const onlyCommercial = options.onlyCommercial ?? null;
        const onlyTourist = options.onlyTourist ?? null;

        return pois
          .map((poi) => ({
            ...poi,
            distance_km: calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              poi.lat,
              poi.lng
            ),
          }))
          .filter((poi) => {
            if (poi.distance_km > radiusKm) return false;
            if (onlyFavoritesFilter && !favorites.includes(poi.id)) return false;
            if (onlyCommercial === true && !poi.is_commercial) return false;
            if (onlyTourist === true && poi.is_commercial) return false;
            if (
              categoryFilter &&
              categoryFilter !== 'todos' &&
              poi.category_slug !== categoryFilter
            ) {
              return false;
            }
            if (searchQuery.trim() !== '') {
              const q = searchQuery.toLowerCase();
              const matchName = poi.name.toLowerCase().includes(q);
              const matchDesc = poi.short_description.toLowerCase().includes(q);
              const matchAddr = poi.address.toLowerCase().includes(q);
              if (!matchName && !matchDesc && !matchAddr) return false;
            }
            return true;
          })
          .sort((a, b) => a.distance_km - b.distance_km);
      },
    }),
    {
      name: 'tairugo-peruibe-storage-v2',
      partialize: (state) => ({
        pois: state.pois,
        registeredUsers: state.registeredUsers,
        currentUser: state.currentUser,
        favorites: state.favorites,
        merchantClaims: state.merchantClaims,
        googleMapsApiKey: state.googleMapsApiKey,
      }),
    }
  )
);
