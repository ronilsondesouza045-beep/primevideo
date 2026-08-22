import React, { useState, useEffect } from 'react';
import { User, SystemNotification } from '../types';
import { 
  Tv, ShieldCheck, LogIn, LogOut, Sparkles, Grid, Award, 
  User as UserIcon, Bell, CheckCircle2, AlertCircle, ShoppingBag, 
  ChevronDown, Wallet, Search, Heart, Ticket, Activity, Layers, Share2
} from 'lucide-react';
import { useModalStore } from '../store/useModalStore';

interface NavbarProps {
  user: User | null;
  activeTab: 'home' | 'catalog' | 'free-tools' | 'benefits' | 'accesses' | 'orders' | 'profile' | 'admin' | 'status' | 'tickets' | 'favorites' | string;
  setActiveTab: (tab: any) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenChat?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifs?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenChat,
  onOpenSearch,
  onOpenNotifs,
}) => {
  const isAdmin = user?.email?.toLowerCase() === 'ronisouza495@gmail.com' || ['admin', 'super_admin'].includes(user?.role || '');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { openShare } = useModalStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('streamhub_token');
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setUnreadCount(data.notifications.filter((n: SystemNotification) => !n.read).length);
        }
      }
    } catch (e) {}
  };

  const handleMarkNotifsRead = async () => {
    setUnreadCount(0);
    try {
      const token = localStorage.getItem('streamhub_token');
      if (!token) return;
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {}
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo STREAMHUB VIP 2.0 */}
          <div 
            onClick={() => setActiveTab('catalog')}
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
                  VIP 2.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                Portal Exclusivo de Streaming & Entretenimento
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1.5 rounded-full shadow-inner">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'catalog' || activeTab === 'home'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-red-400" />
              Catálogo VIP
            </button>

            <button
              onClick={() => setActiveTab('free-tools')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'free-tools'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ferramentas Grátis</span>
              <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                GRÁTIS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'benefits'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Benefícios
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('accesses')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'accesses'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Meus Acessos
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-purple-300 hover:text-purple-200 hover:bg-purple-950/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Painel Admin
              </button>
            )}
          </nav>

          {/* User Auth & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Command K Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-2"
              title="Pesquisa Global (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-xs font-semibold text-slate-400">Buscar...</span>
              <kbd className="hidden lg:inline-block text-[9px] font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                Ctrl K
              </kbd>
            </button>

            {/* Share Link Button */}
            <button
              onClick={openShare}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400 hover:bg-emerald-900/60 transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
              title="Compartilhar Link do Catálogo"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline text-xs font-bold text-emerald-300">Compartilhar</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications Bell Button */}
                <button
                  onClick={onOpenNotifs}
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Central de Notificações"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 via-amber-400 to-purple-600 p-0.5 shadow-md overflow-hidden flex items-center justify-center">
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=dc2626&color=ffffff&bold=true`}
                        alt={user.name || 'Perfil'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full bg-slate-950"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'VIP')}&background=dc2626&color=ffffff&bold=true`;
                        }}
                      />
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-extrabold text-slate-200 leading-tight group-hover:text-white transition-colors">
                        {user.name || user.email.split('@')[0]}
                      </span>
                      <span className="text-[9px] font-bold text-amber-400 uppercase">
                        {user.role || 'Cliente VIP'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-0.5" />
                  </button>

                  {/* Profile Menu Popover */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                        <p className="text-xs font-bold text-white truncate">{user.name || user.email}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        {user.walletBalance !== undefined && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Saldo: R$ {user.walletBalance.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Minha Conta / Perfil
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('free-tools');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                      >
                        <Layers className="w-4 h-4 text-emerald-400" />
                        Ferramentas Gratuitas
                        <span className="ml-auto text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          GRÁTIS
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('favorites');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                      >
                        <Heart className="w-4 h-4 text-red-400" />
                        Meus Favoritos
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('tickets');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                      >
                        <Ticket className="w-4 h-4 text-blue-400" />
                        Suporte & Chamados
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('status');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                      >
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Status do Sistema
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('accesses');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Meus Acessos Liberados
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-purple-300 hover:text-purple-200 hover:bg-purple-950/50 rounded-xl transition-colors text-left"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          Painel Administrativo
                        </button>
                      )}

                      <div className="border-t border-slate-800/80 my-1 pt-1">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair da Conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
    </>
  );
};
