import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * COMPONENTE DE NAVEGAÇÃO: Barra de Pesquisa Inteligente (SearchBar)
 * Filtra pontos turísticos e comércios em tempo real tanto no Mapa quanto nas listas.
 */
export default function SearchBar({
  placeholder = 'Onde você quer ir hoje?',
  showRadiusControl = false,
  className = '',
}) {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const radiusKm = useAppStore((s) => s.radiusKm);
  const setRadiusKm = useAppStore((s) => s.setRadiusKm);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center bg-[#112239]/95 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-3 shadow-lg focus-within:border-cyan-400 transition-colors">
        <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Pesquisar ponto turístico ou comércio em Peruíbe"
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="p-1 text-slate-400 hover:text-white rounded-full transition"
            title="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {showRadiusControl && (
          <div className="flex items-center gap-1.5 pl-3 ml-2 border-l border-slate-700/80 text-xs text-cyan-400 font-medium shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-transparent text-cyan-400 focus:outline-none cursor-pointer"
              title="Raio de busca espacial (PostGIS)"
            >
              <option value={5} className="bg-[#0B172A] text-white">5 km</option>
              <option value={15} className="bg-[#0B172A] text-white">15 km</option>
              <option value={30} className="bg-[#0B172A] text-white">30 km</option>
              <option value={60} className="bg-[#0B172A] text-white">60 km</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
