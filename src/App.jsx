import React, { useEffect } from 'react';
import {
  Home,
  Compass,
  MapPin,
  ShoppingCart,
  Lightbulb,
  UserCheck,
  UserPlus,
  Store,
  Shield,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { requestUserGeolocation } from './services/geoServices';
import HomeView from './views/HomeView';
import MerchantDashboard from './views/MerchantDashboard';
import AdminPanel from './views/AdminPanel';
import SidebarDetails from './components/SidebarDetails';
import QuickLoginModal from './components/QuickLoginModal';
import MerchantClaimModal from './components/MerchantClaimModal';

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const currentUser = useAppStore((s) => s.currentUser);
  const logoutUser = useAppStore((s) => s.logoutUser);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const toast = useAppStore((s) => s.toast);

  // Solicita permissão de geolocalização nativa ao abrir o app (Jornada PF Passo 1)
  useEffect(() => {
    requestUserGeolocation().then((coords) => {
      if (coords && !coords.isFallback) {
        setUserLocation(coords);
      }
    });
  }, [setUserLocation]);

  const bottomNavItems = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'pontos', label: 'Pontos', icon: Compass },
    { id: 'mapa', label: 'Mapa', icon: MapPin },
    { id: 'comercio', label: 'Comércio', icon: ShoppingCart },
    { id: 'dicas', label: 'Dicas', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-[#060E1E] text-slate-100 flex flex-col">
      {/* Notificação Flutuante Fluida (Toast) */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[1000] bg-[#0B172A]/95 backdrop-blur-md border border-cyan-400/60 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Barra Superior de Ecossistema (Módulos Turista PF, Empresa PJ e Admin) */}
      <header className="h-14 bg-[#0B172A]/95 backdrop-blur-md border-b border-slate-800/90 px-4 flex items-center justify-between z-[600] sticky top-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-2.5 text-left group"
          >
            <img
              src="/assets/logo.png"
              alt="Logo TairúGo"
              className="w-9 h-9 rounded-xl object-cover shadow-[0_0_12px_rgba(0,194,255,0.45)] group-hover:scale-105 transition-transform"
            />
            <span className="font-serif font-bold text-base tracking-tight text-white">
              TairúGo
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded-md">
              Peruíbe • Google Maps
            </span>
          </button>
        </div>

        {/* Seletor Rápido de Módulos (Turista PF / Painel PJ / Admin) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('merchant')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border transition ${
              activeTab === 'merchant'
                ? 'bg-[#00C2FF] text-[#060E1E] border-[#00C2FF]'
                : 'bg-[#112239] text-slate-300 border-slate-700/70 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Painel Lojista (PJ)</span>
            <span className="md:hidden">PJ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border transition ${
              activeTab === 'admin'
                ? 'bg-amber-400 text-[#060E1E] border-amber-400'
                : 'bg-[#112239] text-slate-300 border-slate-700/70 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Moderação (Admin)</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-cyan-400 truncate max-w-[140px]">
                  {currentUser.name}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                  {currentUser.role === 'MERCHANT'
                    ? 'Lojista PJ'
                    : currentUser.role === 'ADMIN'
                    ? 'Administrador'
                    : 'Turista PF'}
                </span>
              </div>
              <button
                type="button"
                onClick={logoutUser}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openAuthModal({ tab: 'register', role: 'TOURIST' })}
                className="text-xs font-bold bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cadastrar</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal({ tab: 'login' })}
                className="text-xs font-bold bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-400 border border-cyan-400/40 px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Dinâmico das Views */}
      <main className="flex-1 relative">
        {activeTab === 'merchant' ? (
          <MerchantDashboard />
        ) : activeTab === 'admin' ? (
          <AdminPanel />
        ) : (
          <HomeView />
        )}
      </main>

      {/* Gaveta Lateral Deslizante de Detalhes do Ponto (SidebarDetails) */}
      <SidebarDetails />

      {/* Modais Flutuantes (Login/Cadastro Turista PF e Lojista PJ preservando estado do mapa) */}
      <QuickLoginModal />
      <MerchantClaimModal />

      {/* Barra de Navegação Inferior (Idêntica aos 5 ícones dos Wireframes) */}
      <nav
        aria-label="Navegação Principal Mobile e Híbrida"
        className="fixed bottom-0 inset-x-0 h-16 bg-[#060E1E]/95 backdrop-blur-xl border-t border-slate-800/90 z-[650] flex items-center justify-around px-2"
      >
        {bottomNavItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive
                  ? 'text-[#00C2FF]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComponent
                className={`w-5 h-5 ${
                  isActive ? 'drop-shadow-[0_0_8px_rgba(0,194,255,0.8)]' : ''
                }`}
              />
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
