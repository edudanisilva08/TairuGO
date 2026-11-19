import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  MessageSquareReply,
  MousePointerClick,
  Navigation,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Power,
  MapPin,
  UserPlus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * PAINEL DE GESTÃO DA EMPRESA (MerchantDashboard - Módulo PJ)
 * Vinculado dinamicamente ao comércio cadastrado pelo Lojista autenticado.
 */
export default function MerchantDashboard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const pois = useAppStore((s) => s.pois);
  const weeklyPinMetrics = useAppStore((s) => s.weeklyPinMetrics);
  const addMenuItemToPoi = useAppStore((s) => s.addMenuItemToPoi);
  const removeMenuItemFromPoi = useAppStore((s) => s.removeMenuItemFromPoi);
  const togglePoiOpenStatus = useAppStore((s) => s.togglePoiOpenStatus);
  const replyToReview = useAppStore((s) => s.replyToReview);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  // Localiza o estabelecimento pertencente ao Lojista logado (ou o comércio padrão de demonstração)
  const merchantPoi =
    pois.find(
      (p) =>
        (currentUser?.ownedPoiId && p.id === currentUser.ownedPoiId) ||
        (currentUser?.id && p.owner_id === currentUser.id)
    ) ||
    pois.find((p) => p.id === 'poi-6') ||
    pois[0];

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemTag, setItemTag] = useState('Destaque do Dia');
  const [replyDrafts, setReplyDrafts] = useState({});

  const totalWeeklyClicks = weeklyPinMetrics.reduce((acc, d) => acc + d.clicks, 0);
  const totalWeeklyRoutes = weeklyPinMetrics.reduce((acc, d) => acc + d.routes, 0);
  const maxClicks = Math.max(...weeklyPinMetrics.map((d) => d.clicks), 1);

  const isPendingApproval = currentUser?.verificationStatus === 'PENDING';

  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;
    addMenuItemToPoi(merchantPoi.id, {
      name: itemName,
      price: itemPrice,
      tag: itemTag,
    });
    setItemName('');
    setItemPrice('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      {/* Banner de Convite caso o visitante ainda não esteja logado como Lojista PJ */}
      {(!currentUser || currentUser.role !== 'MERCHANT') && (
        <div className="bg-gradient-to-r from-[#112239] to-[#0B172A] border border-cyan-400/40 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Modo de Visualização • Módulo da Empresa (PJ)
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              Você pode cadastrar seu próprio restaurante, pousada ou quiosque em Peruíbe agora mesmo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal({ tab: 'register', role: 'MERCHANT' })}
            className="bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0 transition shadow"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Minha Empresa (PJ)
          </button>
        </div>
      )}

      {/* Cabeçalho do Painel Comercial PJ */}
      <div className="bg-[#112239] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-white">
                {merchantPoi.name}
              </h1>
              {isPendingApproval ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> Aguardando Aprovação do Alvará
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> CNPJ & Alvará Verificados
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Painel de Gestão Comercial • {merchantPoi.address}
            </p>
          </div>
        </div>

        {/* Botões Rápidos: Alternar Aberto/Fechado em Tempo Real e Ver Pin no Mapa */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => togglePoiOpenStatus(merchantPoi.id)}
            className={`text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border transition ${
              merchantPoi.is_open_now
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {merchantPoi.is_open_now ? 'Status: ABERTO AGORA' : 'Status: FECHADO'}
          </button>

          <button
            type="button"
            onClick={() => {
              selectPoi(merchantPoi.id);
              setActiveTab('mapa');
            }}
            className="bg-[#0B172A] hover:bg-slate-900 text-cyan-400 border border-cyan-400/40 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition"
          >
            <MapPin className="w-3.5 h-3.5" />
            Ver Meu Pin no Google Maps
          </button>
        </div>
      </div>

      {/* KPIs de Engajamento no Mapa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#112239] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Cliques no seu Pin (7 dias)</p>
            <p className="text-2xl font-bold text-white mt-1">{totalWeeklyClicks}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">
              +24% vs. semana anterior
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 text-cyan-400 flex items-center justify-center">
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#112239] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Rotas Traçadas (&ldquo;Como Chegar&rdquo;)</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{totalWeeklyRoutes}</p>
            <span className="text-[11px] text-slate-400">
              Turistas indo até o estabelecimento
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 text-cyan-400 flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#112239] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Nota Média & Reputação</p>
            <p className="text-2xl font-bold text-white mt-1">
              {merchantPoi.rating_avg} ★
            </p>
            <span className="text-[11px] text-cyan-400">
              {merchantPoi.rating_count} avaliações auditadas
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gráfico Semanal de Cliques no Pin vs. Rotas + Gerenciador de Cardápio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras Interativo */}
        <div className="bg-[#112239] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Desempenho Semanal do Pin no Mapa
            </h2>
            <span className="text-[11px] text-slate-400">PostGIS Telemetry</span>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800 pb-3">
            {weeklyPinMetrics.map((d) => {
              const clickHeightPercent = Math.round((d.clicks / maxClicks) * 100);
              const routeHeightPercent = Math.round((d.routes / maxClicks) * 100);
              return (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <span className="text-[10px] font-bold text-cyan-400">
                    {d.clicks}
                  </span>
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      style={{ height: `${clickHeightPercent}%` }}
                      className="w-3 sm:w-4 bg-[#00C2FF] rounded-t-lg transition-all duration-300"
                      title={`${d.clicks} cliques no pin`}
                    />
                    <div
                      style={{ height: `${routeHeightPercent}%` }}
                      className="w-3 sm:w-4 bg-emerald-400/80 rounded-t-lg transition-all duration-300"
                      title={`${d.routes} rotas traçadas`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#00C2FF] inline-block" />
              Cliques no Pin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
              Botão &ldquo;Como Chegar&rdquo;
            </span>
          </div>
        </div>

        {/* Gerenciador de Cardápio / Portfólio Digital */}
        <div className="bg-[#112239] border border-slate-800 rounded-3xl p-5 space-y-4">
          <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Cardápio & Portfólio Digital ({merchantPoi.digital_menu?.length || 0})
          </h2>

          <form onSubmit={handleAddMenu} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Prato, suíte ou serviço..."
              className="sm:col-span-2 bg-[#0B172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="Preço (ex: R$ 89)"
              className="bg-[#0B172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <select
              value={itemTag}
              onChange={(e) => setItemTag(e.target.value)}
              className="sm:col-span-2 bg-[#0B172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
            >
              <option value="Destaque do Dia">Destaque do Dia</option>
              <option value="Mais Pedido">Mais Pedido</option>
              <option value="Promoção Turista">Promoção Turista</option>
            </select>
            <button
              type="submit"
              className="bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Adicionar
            </button>
          </form>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {merchantPoi.digital_menu?.map((item) => (
              <div
                key={item.id}
                className="bg-[#0B172A] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-bold text-white">{item.name}</p>
                  <span className="text-[10px] text-cyan-400">{item.tag}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-emerald-400">
                    {item.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMenuItemFromPoi(merchantPoi.id, item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Remover item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resposta às Avaliações dos Clientes */}
      <div className="bg-[#112239] border border-slate-800 rounded-3xl p-5 space-y-4">
        <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
          <MessageSquareReply className="w-4 h-4 text-cyan-400" />
          Responder Avaliações de Clientes
        </h2>

        {(!merchantPoi.reviews || merchantPoi.reviews.length === 0) && (
          <p className="text-xs text-slate-400">
            Seu estabelecimento ainda não recebeu avaliações. Assim que um turista comentar, você poderá responder aqui.
          </p>
        )}

        <div className="space-y-3">
          {merchantPoi.reviews?.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#0B172A] border border-slate-800 rounded-2xl p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {rev.user_name} • <span className="text-cyan-400">{rev.rating} ★</span>
                </span>
                <span className="text-[11px] text-slate-400">{rev.created_at}</span>
              </div>
              <p className="text-xs text-slate-300">{rev.comment}</p>

              {rev.merchant_reply ? (
                <div className="bg-[#112239] border-l-2 border-cyan-400 p-2.5 rounded-r-xl text-xs text-cyan-300">
                  <strong>Sua resposta oficial:</strong> {rev.merchant_reply}
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={replyDrafts[rev.id] || ''}
                    onChange={(e) =>
                      setReplyDrafts({ ...replyDrafts, [rev.id]: e.target.value })
                    }
                    placeholder="Escreva uma resposta cordial ao turista..."
                    className="flex-1 bg-[#112239] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!replyDrafts[rev.id]) return;
                      replyToReview(merchantPoi.id, rev.id, replyDrafts[rev.id]);
                    }}
                    className="bg-cyan-400 text-[#060E1E] font-bold text-xs px-4 py-1.5 rounded-xl"
                  >
                    Responder
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
