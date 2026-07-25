import React from 'react';
import { User } from '../types';
import { Tv, ShieldCheck, UserCheck, LogIn, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: 'home' | 'accesses' | 'admin';
  setActiveTab: (tab: 'home' | 'accesses' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
}) => {
  const isAdmin = user?.email?.toLowerCase() === 'ronisouza495@gmail.com' || user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Tv className="w-6 h-6 text-red-500 group-hover:text-red-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-red-500 bg-clip-text text-transparent">
                STREAMHUB
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md tracking-widest uppercase">
                VIP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Portal Exclusivo de Streaming
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800 p-1.5 rounded-full">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Início & Serviços
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

        {/* User Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Circular Google / Custom Profile Picture */}
              <div className="relative group flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 via-amber-400 to-purple-600 p-0.5 shadow-lg shadow-red-600/30 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
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
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Sessão Ativa VIP"></span>
              </div>

              <div className="hidden sm:flex flex-col">
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
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800/80 px-2 py-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-1.5 text-[11px] font-bold text-center rounded-lg ${
            activeTab === 'home' ? 'text-red-500 bg-red-500/10' : 'text-slate-400'
          }`}
        >
          Início
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('accesses')}
            className={`flex-1 py-1.5 text-[11px] font-bold text-center rounded-lg ${
              activeTab === 'accesses' ? 'text-red-500 bg-red-500/10' : 'text-slate-400'
            }`}
          >
            Acessos VIP
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-1.5 text-[11px] font-bold text-center rounded-lg ${
              activeTab === 'admin' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'
            }`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
