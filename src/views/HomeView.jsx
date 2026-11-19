import React from 'react';
import {
  Star,
  MapPin,
  Sun,
  Plane,
  Bike,
  ShieldAlert,
  Utensils,
  ShoppingBag,
  ArrowLeft,
  Building2,
  UserPlus,
  Heart,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import SearchBar from '../components/SearchBar';
import FilterPills from '../components/FilterPills';
import MapContainer from '../components/MapContainer';

/**
 * TELA PRINCIPAL DO TURISTA (HomeView)
 * Altura exata calculada: calc(100vh - 7.5rem) para descontar o Header superior (3.5rem)
 * e a Barra de Navegação inferior (4rem), mantendo 100% dos botões enquadrados na tela.
 */
export default function HomeView() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const getFilteredPois = useAppStore((s) => s.getFilteredPois);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const currentUser = useAppStore((s) => s.currentUser);
  const onlyFavoritesFilter = useAppStore((s) => s.onlyFavoritesFilter);
  const toggleOnlyFavoritesFilter = useAppStore((s) => s.toggleOnlyFavoritesFilter);
  const favorites = useAppStore((s) => s.favorites);

  const touristPois = getFilteredPois({ onlyTourist: true });
  const commercialPois = getFilteredPois({ onlyCommercial: true });
  const featuredPoi =
    touristPois.find((p) => p.slug === 'mirante-das-ilhas') || touristPois[0];

  // Se o usuário estiver na aba "mapa", exibe o MapContainer ocupando exatamente a área útil visível
  if (activeTab === 'mapa') {
    return (
      <div className="w-full h-[calc(100vh-7.5rem)] relative overflow-hidden">
        <MapContainer showNearbyDrawer />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-7.5rem)] bg-[#060E1E] flex flex-col lg:flex-row overflow-hidden">
      {/* Coluna Esquerda / Mobile Principal: Conteúdo Guiado pelos Wireframes */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 px-4 pt-5 pb-8 overflow-y-auto custom-scrollbar h-full lg:border-r lg:border-slate-800/80 space-y-6">
        {/* ===================================================================
            ABA 1: INÍCIO ("home" - Explora Peruíbe)
           =================================================================== */}
        {activeTab === 'inicio' && (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/logo.png"
                  alt="Logo TairúGo"
                  className="w-8 h-8 rounded-xl object-cover shadow-[0_0_14px_rgba(0,194,255,0.5)]"
                />
                <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Explora{' '}
                  <span className="text-cyan-400 text-sm font-sans font-semibold">
                    Peruíbe
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleOnlyFavoritesFilter}
                  className={`text-[11px] font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 border transition ${
                    onlyFavoritesFilter
                      ? 'bg-cyan-400 text-[#060E1E] border-cyan-400 font-bold'
                      : 'bg-[#112239] text-slate-300 border-slate-800 hover:border-cyan-400/50'
                  }`}
                  title="Filtrar apenas locais favoritados"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      onlyFavoritesFilter ? 'fill-current' : 'text-cyan-400'
                    }`}
                  />
                  <span>{favorites.length}</span>
                </button>

                {!currentUser && (
                  <button
                    type="button"
                    onClick={() => openAuthModal({ tab: 'register', role: 'TOURIST' })}
                    className="text-[11px] font-bold bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Criar Conta</span>
                  </button>
                )}
              </div>
            </div>

            <SearchBar placeholder="Onde você quer ir hoje?" />

            {featuredPoi && (
              <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl h-52 group">
                <img
                  src={featuredPoi.cover_image}
                  alt={featuredPoi.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060E1E] via-[#0B172A]/60 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="bg-[#00C2FF] text-[#060E1E] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                    Destaque do Mês
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white leading-tight max-w-[210px]">
                      Mirante das Ilhas
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Vista incrível de todo o arquipélago
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectPoi(featuredPoi.id)}
                    className="bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition shrink-0"
                  >
                    Descubra
                  </button>
                </div>
              </div>
            )}

            {/* Seção Carrossel: Pontos Turísticos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-white">
                  Pontos Turísticos
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('pontos')}
                  className="text-xs font-semibold text-cyan-400 hover:underline"
                >
                  Ver todos
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {touristPois.slice(0, 3).map((poi) => (
                  <button
                    key={poi.id}
                    type="button"
                    onClick={() => selectPoi(poi.id)}
                    className="bg-[#112239] hover:bg-[#1A3150] border border-slate-800/90 rounded-2xl p-2 text-left transition group"
                  >
                    <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-800 mb-2">
                      <img
                        src={poi.cover_image}
                        alt={poi.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <p className="text-xs font-bold text-white truncate">
                      {poi.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4].map((s) => (
                          <Star
                            key={s}
                            className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400"
                          />
                        ))}
                        <span className="text-[10px] text-cyan-400 font-bold ml-1">
                          {poi.rating_avg}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {poi.distance_km}km
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seção: Comércio Local */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-white">
                  Comércio Local
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('comercio')}
                  className="text-xs font-semibold text-cyan-400 hover:underline"
                >
                  Ver todos
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {commercialPois.slice(0, 2).map((biz, idx) => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => selectPoi(biz.id)}
                    className="bg-[#112239] hover:bg-[#1A3150] border border-slate-800 rounded-2xl p-3 flex items-center gap-3 text-left transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                      {idx === 0 ? (
                        <Utensils className="w-4 h-4" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {biz.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {biz.category_name}{' '}
                        <span className="text-cyan-400 font-semibold">
                          {biz.distance_km}km
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-[#112239]/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">
                    Tem um comércio em Peruíbe?
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Cadastre seu CNPJ gratuitamente e apareça no Google Maps do TairúGo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal({ tab: 'register', role: 'MERCHANT' })}
                  className="bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/40 text-xs font-bold px-3 py-2 rounded-xl shrink-0 flex items-center gap-1.5 transition"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Cadastrar PJ
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===================================================================
            ABA 2: PONTOS TURÍSTICOS ("pontos-turisticos" do Wireframe)
           =================================================================== */}
        {activeTab === 'pontos' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('inicio')}
                className="p-2 rounded-xl bg-[#112239] text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="font-serif text-xl font-bold text-white">
                Pontos Turísticos
              </h1>
            </div>

            <FilterPills mode="tourist" />

            <div className="space-y-4">
              {touristPois.map((poi) => (
                <article
                  key={poi.id}
                  onClick={() => selectPoi(poi.id)}
                  className="bg-[#112239] hover:bg-[#162B47] border border-slate-800/90 rounded-3xl overflow-hidden shadow-lg cursor-pointer transition group"
                >
                  <div className="h-40 w-full overflow-hidden bg-slate-800">
                    <img
                      src={poi.cover_image}
                      alt={poi.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-serif text-base font-bold text-white">
                        {poi.name}
                      </h2>
                      <span className="text-[11px] font-semibold bg-[#0B172A] text-cyan-400 border border-cyan-400/30 px-2.5 py-0.5 rounded-lg shrink-0">
                        {poi.distance_km} km
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {poi.short_description}
                    </p>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(poi.rating_avg)
                              ? 'text-cyan-400 fill-cyan-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-cyan-400 ml-1">
                        {poi.rating_avg}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 4: COMÉRCIO LOCAL ("comercio-local" do Wireframe)
           =================================================================== */}
        {activeTab === 'comercio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('inicio')}
                  className="p-2 rounded-xl bg-[#112239] text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="font-serif text-xl font-bold text-white">
                  Comércio Local
                </h1>
              </div>

              <button
                type="button"
                onClick={() => openAuthModal({ tab: 'register', role: 'MERCHANT' })}
                className="text-xs font-bold bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 px-3 py-1.5 rounded-xl hover:bg-cyan-400/25 transition"
              >
                + Cadastrar Meu Comércio (PJ)
              </button>
            </div>

            <FilterPills mode="commercial" />

            <div className="space-y-3">
              {commercialPois.map((biz) => (
                <div
                  key={biz.id}
                  onClick={() => selectPoi(biz.id)}
                  className="bg-[#112239] hover:bg-[#162B47] border border-slate-800 rounded-2xl p-3 flex items-center gap-3.5 cursor-pointer transition"
                >
                  <img
                    src={biz.cover_image}
                    alt={biz.name}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-800"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-400">
                        {biz.category_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          biz.is_open_now
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {biz.is_open_now ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm font-bold text-white truncate">
                      {biz.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      {biz.address}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= Math.round(biz.rating_avg)
                              ? 'text-cyan-400 fill-cyan-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-bold text-cyan-400 ml-1">
                        {biz.rating_avg}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 5: DICAS DE VIAGEM ("dicas-viagem" do Wireframe)
           =================================================================== */}
        {activeTab === 'dicas' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('inicio')}
                className="p-2 rounded-xl bg-[#112239] text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="font-serif text-xl font-bold text-white">
                Dicas de Viagem • Peruíbe
              </h1>
            </div>

            <div className="bg-[#112239] border border-slate-800 rounded-2xl p-4 space-y-2">
              <h2 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-cyan-400" />
                Clima & Temperatura
              </h2>
              <p className="text-xs text-slate-300">
                ☀️ Melhor época: Março a Novembro (trilhas mais secas)
              </p>
              <p className="text-xs text-slate-300">🌡️ Média anual: 22°C – 30°C</p>
              <p className="text-xs text-cyan-400 font-medium pt-1">
                Recomendação: Leve protetor solar biodegradável e roupas leves.
              </p>
            </div>

            <div className="bg-[#112239] border border-slate-800 rounded-2xl p-4 space-y-2">
              <h2 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Plane className="w-4 h-4 text-cyan-400" />
                Como Chegar a Peruíbe
              </h2>
              <p className="text-xs text-slate-300">
                🛣️ Via Rodovia Padre Manoel da Nóbrega (SP-055) / Sistema Anchieta-Imigrantes (~1h50 de São Paulo)
              </p>
              <p className="text-xs text-slate-300">
                🚌 Rodoviária Central de Peruíbe com linhas diárias da Breda/Ultra
              </p>
            </div>

            <div className="bg-[#112239] border border-slate-800 rounded-2xl p-4 space-y-2">
              <h2 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Bike className="w-4 h-4 text-cyan-400" />
                Locomoção Local
              </h2>
              <p className="text-xs text-slate-300">
                🚲 Ciclovia completa em toda a Av. Padre Anchieta (Orla)
              </p>
              <p className="text-xs text-slate-300">
                🚶 O Centro e o Aquário/Lama Negra são facilmente percorríveis a pé
              </p>
              <p className="text-xs text-slate-300">
                🚤 Barco-táxi disponível no Rio Guaraú para travessias e ilhas
              </p>
            </div>

            <div className="bg-[#112239] border border-slate-800 rounded-2xl p-4 space-y-2">
              <h2 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Dicas Importantes (Barra do Una & Juréia)
              </h2>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  Leve dinheiro em espécie para feiras orgânicas e quiosques na Barra do Una
                </li>
                <li>
                  Respeite rigorosamente as trilhas sinalizadas da Reserva da Juréia
                </li>
                <li>
                  Repelente de insetos e protetor solar são essenciais nas cachoeiras
                </li>
                <li>
                  As fotos no TairúGo são otimizadas em WebP para abrir rápido mesmo no 3G
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Coluna Direita (Visível no Desktop em tempo integral): Mapa Interativo Google Maps */}
      <div className="hidden lg:block flex-1 h-full relative">
        <MapContainer showNearbyDrawer />
      </div>
    </div>
  );
}
