import React from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Landmark,
  Building2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * PAINEL DO ADMINISTRADOR (AdminPanel - RBAC Admin)
 * Moderação de conteúdo, aprovação de Alvarás/CNPJs de empresas locais
 * e curadoria de pontos turísticos públicos de Peruíbe (ex: Ruínas do Abarebebê).
 */
export default function AdminPanel() {
  const merchantClaims = useAppStore((s) => s.merchantClaims);
  const updateMerchantClaimStatus = useAppStore((s) => s.updateMerchantClaimStatus);
  const pois = useAppStore((s) => s.pois);

  const publicPois = pois.filter((p) => p.ownership === 'PUBLIC');

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <div className="bg-[#112239] border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-white">
              Painel de Governança & Moderação (Admin)
            </h1>
            <p className="text-xs text-slate-400">
              Validação de Alvarás Comerciais (PJ) e Gestão de Patrimônios Públicos de Peruíbe
            </p>
          </div>
        </div>
      </div>

      {/* Fila de Validação de Empresas PJ (Alvará e CNPJ) */}
      <div className="bg-[#112239] border border-slate-800 rounded-3xl p-5 space-y-4">
        <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          Solicitações Comerciais PJ (Verificação de Alvará & CNPJ)
        </h2>

        <div className="space-y-3">
          {merchantClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-[#0B172A] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {claim.businessName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      claim.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                        : claim.status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {claim.status === 'APPROVED'
                      ? 'APROVADO'
                      : claim.status === 'REJECTED'
                      ? 'RECUSADO'
                      : 'AGUARDANDO APROVAÇÃO'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  CNPJ: <strong className="text-slate-200">{claim.cnpj}</strong> •{' '}
                  {claim.category} • {claim.address}
                </p>
                <p className="text-[11px] text-cyan-400 flex items-center gap-1 pt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                  Anexo S3: {claim.licenseFile} ({claim.submittedAt})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateMerchantClaimStatus(claim.id, 'APPROVED')}
                  className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3.5 py-2 rounded-xl transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar Alvará
                </button>
                <button
                  type="button"
                  onClick={() => updateMerchantClaimStatus(claim.id, 'REJECTED')}
                  className="inline-flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold px-3.5 py-2 rounded-xl transition"
                >
                  <XCircle className="w-4 h-4" />
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Autonomia de Dados: Pontos Turísticos Públicos Moderados pelo Sistema */}
      <div className="bg-[#112239] border border-slate-800 rounded-3xl p-5 space-y-4">
        <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
          <Landmark className="w-4 h-4 text-cyan-400" />
          Patrimônios & Pontos Turísticos Públicos (Autonomia de Dados)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {publicPois.map((poi) => (
            <div
              key={poi.id}
              className="bg-[#0B172A] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">{poi.name}</p>
                <p className="text-[11px] text-slate-400">
                  Coords PostGIS: {poi.lat}, {poi.lng} • {poi.opening_hours}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 px-2.5 py-1 rounded-lg">
                PÚBLICO OFICIAL
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
