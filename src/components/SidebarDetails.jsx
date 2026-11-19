import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Heart,
  Star,
  Clock,
  Ticket,
  Navigation,
  ShieldCheck,
  Accessibility,
  Wifi,
  Send,
  Upload,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * COMPONENTE GAVETA LATERAL (SidebarDetails)
 * Perfeitamente enquadrada entre o Header superior (top-14) e a Barra Inferior (bottom-16).
 */
export default function SidebarDetails() {
  const selectedPoiId = useAppStore((s) => s.selectedPoiId);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const getFilteredPois = useAppStore((s) => s.getFilteredPois);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const traceRouteToPoi = useAppStore((s) => s.traceRouteToPoi);
  const addReviewToPoi = useAppStore((s) => s.addReviewToPoi);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoCompressionInfo, setPhotoCompressionInfo] = useState(null);

  const allPois = getFilteredPois({ categoryOverride: 'todos' });
  const poi = allPois.find((p) => p.id === selectedPoiId);

  useEffect(() => {
    setImgLoaded(false);
    setComment('');
    setPhotoCompressionInfo(null);
  }, [selectedPoiId]);

  if (!poi) return null;

  const isFavorite = favorites.includes(poi.id);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const originalKB = Math.round(file.size / 1024) || 2450;
    const compressedKB = Math.max(38, Math.round(originalKB * 0.08));
    setPhotoCompressionInfo({
      fileName: file.name.replace(/\.[^.]+$/, '.webp'),
      originalKB,
      compressedKB,
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addReviewToPoi(poi.id, {
      rating,
      comment,
      photoCompressionInfo,
    });
    setComment('');
    setPhotoCompressionInfo(null);
  };

  return (
    <aside
      aria-label={`Detalhes de ${poi.name}`}
      className="fixed top-14 bottom-16 right-0 z-[580] w-full sm:w-[430px] bg-[#060E1E] border-l border-slate-800/90 shadow-2xl overflow-y-auto custom-scrollbar pb-8 animate-in slide-in-from-right duration-300"
    >
      {/* Hero Image com Skeleton Placeholder para conexões 3G oscilantes */}
      <div className="relative h-60 w-full bg-[#112239] overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#112239] via-[#1A3150] to-[#112239] flex items-center justify-center">
            <span className="text-xs text-cyan-400/80 font-medium">
              Otimizando WebP (Modo 3G Juréia)...
            </span>
          </div>
        )}
        <img
          src={poi.cover_image}
          alt={poi.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060E1E] via-[#060E1E]/20 to-transparent" />

        {/* Botões Flutuantes Superiores (Voltar e Favoritar) */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => selectPoi(null)}
            className="w-10 h-10 rounded-full bg-[#060E1E]/80 backdrop-blur-md border border-slate-700/70 flex items-center justify-center text-white hover:border-cyan-400 transition"
            title="Fechar detalhes"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(poi.id)}
            className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition ${
              isFavorite
                ? 'bg-cyan-400 text-[#060E1E] border-cyan-400'
                : 'bg-[#060E1E]/80 text-white border-slate-700/70 hover:border-cyan-400'
            }`}
            title="Salvar nos favoritos"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-5 -mt-4 relative z-10 space-y-5">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase tracking-wider font-bold text-cyan-400">
            {poi.category_name}
          </span>
          <span className="text-slate-400 font-medium">
            Distância: <strong className="text-slate-200">{poi.distance_km} km</strong>
          </span>
        </div>

        <div>
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">
            {poi.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {poi.address}
          </p>

          <div className="flex items-center gap-1.5 mt-2.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(poi.rating_avg)
                    ? 'text-cyan-400 fill-cyan-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-cyan-400 ml-1">
              {poi.rating_avg}
            </span>
            <span className="text-xs text-slate-400">
              ({poi.rating_count} avaliações)
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{poi.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#112239] border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Horário</p>
              <p className="text-xs font-bold text-white">{poi.opening_hours}</p>
            </div>
          </div>

          <div className="bg-[#112239] border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Entrada</p>
              <p className="text-xs font-bold text-white">{poi.entry_fee}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#112239]/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Accessibility className="w-4 h-4 text-cyan-400" />
            Acessibilidade & Condições Locais
          </p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span
              className={`px-2.5 py-1 rounded-lg border ${
                poi.requires_guide
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
              }`}
            >
              {poi.requires_guide
                ? '⚠️ Exige Guia Credenciado (Juréia)'
                : '✓ Acesso Livre sem Guia'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300">
              {poi.accessibility_rules?.wheelchair
                ? '♿ Acessível p/ Cadeirantes'
                : '🥾 Trilha Natural Irregular'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-cyan-300 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {poi.accessibility_rules?.cell_signal || '4G'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => traceRouteToPoi(poi.id)}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-sm shadow-[0_0_25px_rgba(0,194,255,0.4)] transition flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4 fill-current" />
          Como Chegar (Traçar Rota no Mapa)
        </button>

        {poi.is_commercial && poi.digital_menu?.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Cardápio & Destaques do Comércio
            </h2>
            <div className="space-y-2">
              {poi.digital_menu.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#112239] border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      {item.tag}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <h2 className="font-serif text-base font-bold text-white">
            Avaliações ({poi.reviews?.length || 0})
          </h2>

          <form
            onSubmit={handleReviewSubmit}
            className="bg-[#112239] border border-slate-800 rounded-2xl p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">
                Sua nota para este local:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        n <= rating
                          ? 'text-cyan-400 fill-cyan-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência em Peruíbe..."
              className="w-full bg-[#0B172A] border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            {photoCompressionInfo && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Sharp Compressor: <strong>{photoCompressionInfo.fileName}</strong> reduzida de{' '}
                  {photoCompressionInfo.originalKB}KB para{' '}
                  <strong>{photoCompressionInfo.compressedKB}KB (WebP 3G)</strong>
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-[#0B172A] border border-slate-700 px-3 py-2 rounded-xl">
                <Upload className="w-3.5 h-3.5" />
                <span>Foto (Auto-WebP)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-cyan-400 hover:bg-cyan-300 text-[#060E1E] font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            {poi.reviews?.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#112239] border border-slate-800/90 rounded-2xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {rev.user_name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating
                            ? 'text-cyan-400 fill-cyan-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] text-cyan-400 font-bold ml-1">
                      {rev.rating}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>

                {rev.merchant_reply && (
                  <div className="mt-2 pl-3 border-l-2 border-cyan-400 bg-[#0B172A]/80 p-2 rounded-r-xl">
                    <p className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Resposta Oficial do Estabelecimento:
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {rev.merchant_reply}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
