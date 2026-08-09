import React from 'react';
import { User } from '../types';
import { Home, Grid, Sparkles, ShieldCheck, User as UserIcon, Award } from 'lucide-react';

interface MobileBottomNavProps {
  user: User | null;
  activeTab: 'home' | 'catalog' | 'benefits' | 'accesses' | 'orders' | 'profile' | 'admin' | 'status' | 'tickets' | 'favorites';
  setActiveTab: (tab: any) => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth
}) => {
  const isAdmin = user?.email?.toLowerCase() === 'ronisouza495@gmail.com' || ['admin', 'super_admin'].includes(user?.role || '');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Catálogo VIP */}
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'catalog' || activeTab === 'home'
              ? 'text-red-500 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">Catálogo VIP</span>
        </button>

        {/* Benefícios */}
        <button
          onClick={() => setActiveTab('benefits')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'benefits'
              ? 'text-red-500 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px]">Vantagens</span>
        </button>

        {/* Acessos */}
        <button
          onClick={() => {
            if (user) {
              setActiveTab('accesses');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'accesses'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Meus Acessos</span>
        </button>

        {/* Perfil / Admin */}
        {isAdmin ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'text-purple-400 font-bold scale-105'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="text-[10px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (user) {
                setActiveTab('profile');
              } else {
                onOpenAuth();
              }
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'text-red-500 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Perfil</span>
          </button>
        )}
      </div>
    </nav>
  );
};
