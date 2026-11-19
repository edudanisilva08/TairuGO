import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  UserCheck,
  Building2,
  Lock,
  UserPlus,
  LogIn,
  MapPin,
  UploadCloud,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * Formata automaticamente o CNPJ no padrão 00.000.000/0001-00
 */
function formatCnpjMask(value) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * SISTEMA COMPLETO DE AUTENTICAÇÃO E CADASTRO DE USUÁRIOS (QuickLoginModal)
 * Permite Login ou Cadastro completo de novos Turistas (PF) e Lojistas (PJ),
 * mantendo o estado exato do mapa e executando ações pendentes automaticamente.
 */
export default function QuickLoginModal() {
  const showQuickLoginModal = useAppStore((s) => s.showQuickLoginModal);
  const authModalInitialTab = useAppStore((s) => s.authModalInitialTab);
  const authModalInitialRole = useAppStore((s) => s.authModalInitialRole);
  const closeQuickLoginModal = useAppStore((s) => s.closeQuickLoginModal);
  const loginUser = useAppStore((s) => s.loginUser);
  const loginWithCredentials = useAppStore((s) => s.loginWithCredentials);
  const registerNewUser = useAppStore((s) => s.registerNewUser);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  // 'login' | 'register'
  const [mode, setMode] = useState('login');
  // 'TOURIST' | 'MERCHANT'
  const [registerRole, setRegisterRole] = useState('TOURIST');
  const [errorMsg, setErrorMsg] = useState('');

  // Campos de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Campos de Cadastro (Comuns PF & PJ)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('São Paulo - SP');

  // Campos Exclusivos de Cadastro Lojista (PJ)
  const [businessName, setBusinessName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [categorySlug, setCategorySlug] = useState('restaurantes');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('09h - 22h');
  const [description, setDescription] = useState('');
  const [licenseFile, setLicenseFile] = useState('');

  useEffect(() => {
    if (showQuickLoginModal) {
      setMode(authModalInitialTab || 'login');
      setRegisterRole(authModalInitialRole || 'TOURIST');
      setErrorMsg('');
    }
  }, [showQuickLoginModal, authModalInitialTab, authModalInitialRole]);

  if (!showQuickLoginModal) return null;

  const handleQuickDemoLogin = (profile) => {
    loginUser(profile);
    if (profile.role === 'MERCHANT') {
      setActiveTab('merchant');
    } else if (profile.role === 'ADMIN') {
      setActiveTab('admin');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginWithCredentials({ email: loginEmail, password: loginPassword });
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    if (res.user.role === 'MERCHANT') {
      setActiveTab('merchant');
    } else if (res.user.role === 'ADMIN') {
      setActiveTab('admin');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Preencha nome, e-mail e senha para criar sua conta.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (registerRole === 'MERCHANT' && (!businessName.trim() || !cnpj.trim())) {
      setErrorMsg('Para conta de Lojista (PJ), informe o Nome Fantasia e o CNPJ.');
      return;
    }

    const res = registerNewUser({
      name,
      email,
      password,
      phone,
      city,
      role: registerRole,
      businessName,
      cnpj,
      categorySlug,
      address,
      openingHours,
      description,
      licenseFile,
    });

    if (!res.ok) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0B172A] border border-slate-700/90 rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeQuickLoginModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
            <Lock className="w-3 h-3" /> Ecossistema TairúGo • Peruíbe
          </span>
          <h2 className="font-serif text-xl font-bold text-white pt-1">
            {mode === 'login'
              ? 'Acesse sua conta TairúGo'
              : 'Cadastro de Novo Usuário'}
          </h2>
          <p className="text-xs text-slate-400">
            Seu estado no mapa e filtros ativos permanecem salvos automaticamente.
          </p>
        </div>

        {/* Abas Superiores: Entrar vs. Criar Conta (Turista ou Lojista) */}
        <div className="grid grid-cols-2 bg-[#112239] p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'login'
                ? 'bg-[#00C2FF] text-[#060E1E] shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'register'
                ? 'bg-[#00C2FF] text-[#060E1E] shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Criar Conta (PF / PJ)
          </button>
        </div>

        {/* Feedback de Erro */}
        {errorMsg && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ===================================================================
            MODO 1: ENTRAR NA CONTA (Login por E-mail/Senha + Acesso Rápido)
           =================================================================== */}
        {mode === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com.br"
                  className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-xs shadow-lg transition"
              >
                Entrar com E-mail e Senha
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="shrink mx-3 text-[11px] text-slate-400">
                Ou acesso rápido 1-Clique (Demonstração)
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    id: 'user-pf-1',
                    name: 'Lucas Mendes (Turista PF)',
                    email: 'turista@tairugo.com.br',
                    role: 'TOURIST',
                  })
                }
                className="w-full flex items-center justify-between bg-[#112239] hover:bg-[#1A3150] text-white border border-slate-700/80 font-semibold text-xs p-3 rounded-2xl transition"
              >
                <span className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  Entrar como Turista (PF)
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">
                  Social Login
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    id: 'merchant-1',
                    name: 'Restaurante Tempero Local (PJ)',
                    email: 'lojista@tairugo.com.br',
                    cnpj: '18.234.990/0001-42',
                    ownedPoiId: 'poi-6',
                    role: 'MERCHANT',
                    verificationStatus: 'APPROVED',
                  })
                }
                className="w-full flex items-center justify-between bg-[#112239] hover:bg-[#1A3150] text-white border border-slate-700/80 font-semibold text-xs p-3 rounded-2xl transition"
              >
                <span className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Entrar como Lojista Verificado (PJ)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  Dashboard PJ
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin({
                    id: 'admin-1',
                    name: 'Moderação Oficial TairúGo',
                    email: 'admin@tairugo.com.br',
                    role: 'ADMIN',
                  })
                }
                className="w-full flex items-center justify-between bg-[#112239]/70 hover:bg-[#1A3150] text-slate-300 border border-slate-800 font-semibold text-xs p-3 rounded-2xl transition"
              >
                <span className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Entrar como Administrador (Moderação)
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  RBAC Admin
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODO 2: CADASTRO DE NOVOS USUÁRIOS (Turista PF ou Lojista PJ)
           =================================================================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Seletor de Perfil de Cadastro: Turista (PF) vs Lojista (PJ) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Como você deseja se cadastrar no TairúGo?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRegisterRole('TOURIST')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                    registerRole === 'TOURIST'
                      ? 'bg-cyan-400/15 border-[#00C2FF] text-white shadow-[0_0_15px_rgba(0,194,255,0.2)]'
                      : 'bg-[#112239] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    {registerRole === 'TOURIST' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">
                    Sou Turista / Morador
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Favoritar locais, traçar rotas e avaliar (PF)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterRole('MERCHANT')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                    registerRole === 'MERCHANT'
                      ? 'bg-cyan-400/15 border-[#00C2FF] text-white shadow-[0_0_15px_rgba(0,194,255,0.2)]'
                      : 'bg-[#112239] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    {registerRole === 'MERCHANT' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">
                    Sou Lojista / Empresa
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Destacar comércio no mapa e ver métricas (PJ)
                  </span>
                </button>
              </div>
            </div>

            {/* Campos Comuns: Nome, E-mail, Senha e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {registerRole === 'MERCHANT'
                    ? 'Nome do Responsável *'
                    : 'Seu Nome Completo *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Costa"
                  className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp / Telefone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(13) 99700-0000"
                  className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com.br"
                  className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Criar Senha *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {registerRole === 'TOURIST' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sua Cidade de Origem
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo - SP / Peruíbe - SP"
                  className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {/* Campos Extras Exclusivos quando o usuário escolhe Lojista (PJ) */}
            {registerRole === 'MERCHANT' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold text-cyan-400">
                  Dados do Estabelecimento Comercial em Peruíbe
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome Fantasia da Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Pousada Canto do Guaraú"
                      className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCnpjMask(e.target.value))}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Categoria no Mapa
                    </label>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="restaurantes">Restaurante / Quiosque</option>
                      <option value="hospedagem">Pousada / Hotelaria</option>
                      <option value="lojas">Artesanato & Comércio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Horário de Funcionamento
                    </label>
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="Ex: 10h - 22h"
                      className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endereço em Peruíbe
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Av. Padre Anchieta, 1200 - Peruíbe/SP"
                      className="w-full bg-[#112239] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descrição Curta do seu Comércio
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Conte aos turistas seus diferenciais..."
                    className="w-full bg-[#112239] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Upload do Comprovante de Alvará */}
                <div className="bg-[#112239] border border-dashed border-cyan-400/50 rounded-2xl p-3 text-center space-y-1.5">
                  <UploadCloud className="w-5 h-5 text-cyan-400 mx-auto" />
                  <p className="text-[11px] text-slate-300">
                    Anexar Alvará Municipal ou Comprovante Comercial (WebP/PDF)
                  </p>
                  <label className="inline-block cursor-pointer bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/40 text-[11px] font-semibold px-3 py-1 rounded-lg transition">
                    Escolher Arquivo
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setLicenseFile(e.target.files?.[0]?.name || '')
                      }
                      className="hidden"
                    />
                  </label>
                  {licenseFile && (
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center justify-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" /> {licenseFile}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#00C2FF] hover:bg-[#00A3D9] text-[#060E1E] font-bold text-xs shadow-lg transition"
            >
              {registerRole === 'MERCHANT'
                ? 'Concluir Cadastro PJ & Criar Pin no Mapa'
                : 'Criar Minha Conta de Turista'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
