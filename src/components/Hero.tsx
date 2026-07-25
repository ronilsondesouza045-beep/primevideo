import React from 'react';
import { Play, Flame, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface HeroProps {
  onGeneratePrime: () => void;
  onBuyNetflix: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGeneratePrime, onBuyNetflix }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Feature Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wide shadow-lg shadow-red-950/40">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span>PLATAFORMA LÍDER EM ENTRETENIMENTO VIP</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Assista aos Melhores Filmes e Séries no <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-purple-500 bg-clip-text text-transparent">
              StreamHub VIP
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Liberação instantânea de acessos exclusivos de streaming. Aproveite nosso 
            <strong className="text-cyan-400"> Prime Video 100% Gratuito</strong>! 
            <span className="text-slate-400 block sm:inline sm:ml-1 font-semibold">(Netflix VIP estará disponível <strong className="text-amber-400">Em Breve</strong>)</span>.
          </p>
        </div>

        {/* Quick Action Hero Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <button
            onClick={onGeneratePrime}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/20 hover:shadow-cyan-600/40 transition-all flex items-center justify-center gap-2 group"
          >
            <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            Gerar Prime Video (Grátis)
          </button>

          <button
            onClick={onBuyNetflix}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-400 font-bold text-sm shadow-md cursor-not-allowed transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Netflix VIP</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
              Em Breve
            </span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Acesso Seguro & Garantido</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Entrega Automática</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <Flame className="w-4 h-4 text-red-400" />
            <span>Catálogo Ultra HD 4K</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Suporte Online 24/7</span>
          </div>
        </div>

      </div>
    </section>
  );
};
