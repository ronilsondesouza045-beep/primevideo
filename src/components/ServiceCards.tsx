import React from 'react';
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Zap, CreditCard, Lock, Star, XCircle } from 'lucide-react';
import { PrimeCountdown } from './PrimeCountdown';

interface ServiceCardsProps {
  onGeneratePrime: () => void;
  onBuyNetflix: () => void;
  primeBlocked?: boolean;
  primeError?: string | null;
}

export const ServiceCards: React.FC<ServiceCardsProps> = ({
  onGeneratePrime,
  onBuyNetflix,
  primeBlocked = false,
  primeError = null,
}) => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Escolha seu Plano de Entretenimento VIP
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
          Gerencie suas contas de streaming com facilidade, credenciais liberadas na hora e garantia de acesso.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* ======================================================== */}
        {/* CARD 1: PRIME VIDEO (100% GRATUITO) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-cyan-950/50 group overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 uppercase flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                100% GRATUITO
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                Acesso Imediato
              </span>
            </div>

            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Play className="w-6 h-6 text-cyan-400 fill-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Prime Video VIP
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Amazon Prime Video Oficial
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
              Obtenha acesso totalmente <strong className="text-white">gratuito</strong> para assistir a todo o acervo do Prime Video, com filmes, séries premiadas, jogos ao vivo e programas originais.
            </p>

            {/* Benefits List */}
            <ul className="space-y-2.5 mb-6 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Sem necessidade de cartão de crédito</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>E-mail e senha liberados instantaneamente</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Qualidade Full HD e suporte a múltiplos perfis</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Renovação contínua no painel VIP</span>
              </li>
            </ul>

            {/* Info Badge */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[11px] sm:text-xs font-semibold leading-relaxed mb-4 flex items-start gap-2.5 shadow-lg">
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-cyan-300">✨ ACESSO VIP LIBERADO:</strong> Clique no botão abaixo para gerar instantaneamente seu e-mail e senha do Prime Video 100% grátis.
              </span>
            </div>

            {/* Live Real-Time Countdown */}
            <div className="mb-4">
              <PrimeCountdown />
            </div>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-3 mb-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Preço do Acesso:</span>
              <span className="font-black text-cyan-400 text-sm">R$ 0,00 (Grátis)</span>
            </div>

            <button
              onClick={onGeneratePrime}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 group/btn bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-cyan-600/20 hover:shadow-cyan-600/40"
            >
              <span>Gerar Acesso Prime Video Grátis</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARD 2: NETFLIX VIP (BLOQUEADO / EM BREVE) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between transition-all group overflow-hidden opacity-90 hover:opacity-100">
          
          {/* Subtle Lock Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Banner Ribbon */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1 shadow-md">
              <Lock className="w-3 h-3 text-amber-400" />
              EM BREVE
            </span>
          </div>

          <div>
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                NETFLIX VIP - EM BREVE
              </span>
            </div>

            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 p-0.5 shadow-lg border border-slate-700">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="font-black text-slate-500 text-2xl tracking-tighter">N</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-300 flex items-center gap-2">
                  Netflix VIP
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md font-bold">
                    Em Breve
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Aguardando reabastecimento de novas contas
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Estamos preparando um novo lote de contas da Netflix em <strong className="text-slate-300">Ultra HD 4K</strong> com perfis individuais e suporte a PIN. Em breve o serviço estará liberado nesta plataforma.
            </p>

            {/* Lock Notice Banner */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold leading-relaxed mb-6 flex items-start gap-3 shadow-inner">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-black mb-0.5">🔒 SERVIÇO BLOQUEADO TEMPORARIAMENTE</p>
                <p className="text-amber-200/80 font-normal">
                  No momento somente o <strong className="text-cyan-300">Prime Video VIP Gratuito</strong> está disponível para resgate imediato. Fique atento às atualizações!
                </p>
              </div>
            </div>

            {/* Benefits List */}
            <ul className="space-y-2.5 mb-8 text-xs text-slate-400 opacity-80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>Perfil Individual e Tela Exclusiva com PIN (Em Breve)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>Qualidade 4K Ultra HD + HDR (Em Breve)</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-3 mb-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status do Serviço:</span>
              <span className="font-bold text-amber-400 text-xs uppercase tracking-wide">Em Breve (Indisponível)</span>
            </div>

            <button
              onClick={onBuyNetflix}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 group/btn"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Netflix VIP (Em Breve)</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
