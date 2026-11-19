import React from 'react';
import { useAppStore } from '../store/useAppStore';

const TOURIST_CATEGORIES = [
  { slug: 'todos', label: 'Todos' },
  { slug: 'praias', label: 'Praias' },
  { slug: 'cachoeiras', label: 'Cachoeiras' },
  { slug: 'trilhas', label: 'Trilhas' },
  { slug: 'mirantes', label: 'Mirantes' },
  { slug: 'historico', label: 'Histórico' },
];

const COMMERCIAL_CATEGORIES = [
  { slug: 'todos', label: 'Todos' },
  { slug: 'restaurantes', label: 'Restaurantes' },
  { slug: 'hospedagem', label: 'Pousadas' },
  { slug: 'lojas', label: 'Lojas & Artesanato' },
];

const ALL_CATEGORIES = [
  { slug: 'todos', label: 'Todos' },
  { slug: 'praias', label: 'Praias' },
  { slug: 'cachoeiras', label: 'Cachoeiras' },
  { slug: 'trilhas', label: 'Trilhas' },
  { slug: 'mirantes', label: 'Mirantes' },
  { slug: 'historico', label: 'Histórico' },
  { slug: 'restaurantes', label: 'Restaurantes' },
  { slug: 'hospedagem', label: 'Pousadas' },
  { slug: 'lojas', label: 'Artesanato' },
];

/**
 * COMPONENTE DE NAVEGAÇÃO: Botões de Categorias Rápidas (FilterPills)
 * Totalmente enquadrado: scroll horizontal suave no celular e quebra inteligente (flex-wrap)
 * em telas maiores para nunca cortar botões na borda direita.
 */
export default function FilterPills({ mode = 'all', className = '' }) {
  const activeCategory = useAppStore((s) => s.activeCategory);
  const setActiveCategory = useAppStore((s) => s.setActiveCategory);

  const pills =
    mode === 'tourist'
      ? TOURIST_CATEGORIES
      : mode === 'commercial'
      ? COMMERCIAL_CATEGORIES
      : ALL_CATEGORIES;

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto md:overflow-x-visible md:flex-wrap md:justify-center no-scrollbar py-1 px-0.5 ${className}`}
      role="tablist"
      aria-label="Filtros rápidos de categoria"
    >
      {pills.map((pill) => {
        const isActive = activeCategory === pill.slug;
        return (
          <button
            key={pill.slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveCategory(pill.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 border ${
              isActive
                ? 'bg-[#00C2FF] text-[#060E1E] border-[#00C2FF] shadow-[0_0_15px_rgba(0,194,255,0.45)]'
                : 'bg-[#0B172A]/95 text-slate-200 border-slate-700/80 hover:border-cyan-400/60 hover:text-white shadow-sm'
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
