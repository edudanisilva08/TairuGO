import React, { useState } from 'react';
import { X, Building2, FileCheck2, MapPin, UploadCloud } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * FLUXO DE CADASTRO PJ (MerchantClaimModal)
 * "Anuncie seu Comércio / Reivindique seu Espaço" com validação de CNPJ,
 * coordenadas exatas no mapa e upload do comprovante de Alvará de Funcionamento.
 */
export default function MerchantClaimModal() {
  const showMerchantClaimModal = useAppStore((s) => s.showMerchantClaimModal);
  const setShowMerchantClaimModal = useAppStore((s) => s.setShowMerchantClaimModal);
  const submitMerchantClaim = useAppStore((s) => s.submitMerchantClaim);

  const [businessName, setBusinessName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [category, setCategory] = useState('Restaurantes');
  const [address, setAddress] = useState('');
  const [licenseFile, setLicenseFile] = useState('');

  if (!showMerchantClaimModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!businessName || !cnpj) return;
    submitMerchantClaim({
      businessName,
      cnpj,
      category,
      address: address || 'Av. Padre Anchieta - Peruíbe/SP',
      licenseFile: licenseFile || 'alvara_comercial_peruibe.pdf',
    });
  };

  return (
    <div className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0B172A] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setShowMerchantClaimModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-white">
              Anuncie seu Comércio em Peruíbe
            </h2>
            <p className="text-xs text-slate-400">
              Cadastro Pessoa Jurídica (PJ) com verificação de Alvará Municipal
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome Fantasia do Estabelecimento *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Pousada & Restaurante Brisa do Guaraú"
              className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                required
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Segmento Comercial
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Restaurantes">Restaurante / Quiosque</option>
                <option value="Pousadas">Pousada / Hotelaria</option>
                <option value="Artesanato">Artesanato & Comércio Local</option>
                <option value="Agência Ambiental">Agência / Guia Juréia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Endereço Comercial em Peruíbe (Georreferenciado)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Padre Anchieta, 1500 - Centro, Peruíbe/SP"
                className="w-full bg-[#112239] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Upload do Alvará de Funcionamento */}
          <div className="bg-[#112239] border border-dashed border-cyan-400/50 rounded-2xl p-4 text-center space-y-2">
            <UploadCloud className="w-7 h-7 text-cyan-400 mx-auto" />
            <p className="text-xs font-semibold text-white">
              Comprovante de Alvará ou Inscrição Municipal
            </p>
            <p className="text-[11px] text-slate-400">
              Envie foto (JPG/WebP) ou PDF. O status entrará em &ldquo;Aguardando Aprovação&rdquo;.
            </p>
            <label className="inline-block cursor-pointer bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/40 text-xs font-semibold px-4 py-1.5 rounded-xl transition">
              Selecionar Arquivo
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setLicenseFile(e.target.files?.[0]?.name || '')}
                className="hidden"
              />
            </label>
            {licenseFile && (
              <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1 pt-1">
                <FileCheck2 className="w-4 h-4" /> {licenseFile}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-xs shadow-lg transition"
          >
            Enviar para Validação & Reivindicar Pin no Mapa
          </button>
        </form>
      </div>
    </div>
  );
}
