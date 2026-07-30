import React from 'react';
import { User } from '../types';
import { Tv, ShieldCheck, LogIn, LogOut, Sparkles, MessageSquare, KeyRound } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: 'home' | 'accesses' | 'admin';
  setActiveTab: (tab: 'home' | 'accesses' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenChat,
}) => {
  const isAdmin = user?.email?.toLowerCase() === 'ronisouza495@gmail.com' || user?.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:text-red-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-red-500 bg-clip-text text-transparent">
                  STREAMHUB
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md tracking-widest uppercase">
                  VIP
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                Portal Exclusivo de Streaming
              </p>
            </div>
          </div>

          {/* Desktop Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800 p-1.5 rounded-full">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Início & Streaming
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('accesses')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'accesses'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Meus Acessos VIP
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-purple-300 hover:text-purple-200 hover:bg-purple-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Painel Admin
              </button>
            )}
          </nav>

          {/* User Auth Controls & Golden Wallet */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Profile Picture */}
                <div 
                  onClick={() => setActiveTab('accesses')}
                  className="relative group flex items-center justify-center cursor-pointer"
                  title="Ver Meus Acessos VIP"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-red-600 via-amber-400 to-purple-600 p-0.5 shadow-lg shadow-red-600/30 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=dc2626&color=ffffff&bold=true`}
                      alt={user.name || 'Perfil'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full bg-slate-900"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'VIP')}&background=dc2626&color=ffffff&bold=true`;
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Sessão Ativa VIP"></span>
                </div>

                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-black text-slate-100 leading-tight">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-400 tracking-wide flex items-center gap-1">
                    {isAdmin ? '👑 Administrador VIP' : 'Cliente VIP'}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Sair da Conta"
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors ml-0.5"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Ergonomic Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 py-1.5 px-2 flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.8)] pb-safe">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-red-400 font-extrabold bg-red-500/10 border border-red-500/20'
              : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <Tv className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Início</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('accesses')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activeTab === 'accesses'
                ? 'text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/20'
                : 'text-slate-400 font-medium hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Acessos VIP</span>
          </button>
        )}

        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-purple-400 font-medium hover:text-purple-300 active:scale-95 transition-all relative"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[10px]">Suporte</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'text-purple-300 font-extrabold bg-purple-500/10 border border-purple-500/20'
                : 'text-slate-400 font-medium hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Admin</span>
          </button>
        )}
      </nav>
    </>
  );
};


