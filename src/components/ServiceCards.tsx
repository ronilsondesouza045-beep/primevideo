import React from 'react';
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Zap, CreditCard, Lock, Star, XCircle, Tv, AlertTriangle, Flame } from 'lucide-react';
import { PrimeCountdown } from './PrimeCountdown';

interface ServiceCardsProps {
  onGeneratePrime: () => void;
  onGenerateParamount: () => void;
  onGenerateFreeFire: () => void;
  onBuyNetflix: () => void;
  primeBlocked?: boolean;
  primeError?: string | null;
  freeFireStock?: {
    total: number;
    available: number;
    claimed: number;
    outOfStock: boolean;
  };
}

export const ServiceCards: React.FC<ServiceCardsProps> = ({
  onGeneratePrime,
  onGenerateParamount,
  onGenerateFreeFire,
  onBuyNetflix,
  primeBlocked = false,
  primeError = null,
  freeFireStock = { total: 2, available: 2, claimed: 0, outOfStock: false }
}) => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Catálogo VIP de Serviços & Prêmios Gratuitos
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
          Gerencie suas contas de streaming e resgate seus PINs do Free Fire com facilidade e liberação instantânea.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        
        {/* ======================================================== */}
        {/* CARD 1: PRIME VIDEO (100% GRATUITO) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-6 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-cyan-950/50 group overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-1.5 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                100% GRÁTIS
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Imediato
              </span>
            </div>

            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  Prime Video
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Amazon Prime Oficial
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              Acesso <strong className="text-white">gratuito</strong> para assistir a filmes, séries e esportes originais do Prime Video.
            </p>

            {/* Benefits List */}
            <ul className="space-y-2 mb-4 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Sem cartão de crédito</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>E-mail e senha na hora</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Qualidade Full HD</span>
              </li>
            </ul>

            <div className="mb-4">
              <PrimeCountdown />
            </div>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-2.5 mb-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Preço:</span>
              <span className="font-black text-cyan-400 text-xs">R$ 0,00 (Grátis)</span>
            </div>

            <button
              onClick={onGeneratePrime}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 group/btn bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-600/20"
            >
              <span>Gerar Prime Video</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARD 2: PARAMOUNT+ (100% GRATUITO) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 p-6 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-blue-950/50 group overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-1.5 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-blue-300 bg-blue-500/10 border border-blue-500/30 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                100% GRÁTIS
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Imediato
              </span>
            </div>

            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Tv className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  Paramount+
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Paramount+ Oficial
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              Acesso <strong className="text-white">gratuito</strong> para assistir a filmes de Hollywood e séries exclusivas.
            </p>

            {/* Warning Notice */}
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[10px] font-semibold mb-4 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Aviso: Pode ser alterado sem prévio aviso.</span>
            </div>

            {/* Benefits List */}
            <ul className="space-y-2 mb-4 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>E-mail e senha instantâneos</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Acervo Paramount+ completo</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-2.5 mb-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Preço:</span>
              <span className="font-black text-blue-400 text-xs">R$ 0,00 (Grátis)</span>
            </div>

            <button
              onClick={onGenerateParamount}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 group/btn bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white shadow-blue-600/20"
            >
              <span>Gerar Paramount+</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARD 3: FREE FIRE (100 DIAMANTES + 10% BÔNUS - 100% GRATUITO) */}
        {/* ======================================================== */}
        <div className={`relative rounded-3xl bg-slate-900/90 border p-6 flex flex-col justify-between transition-all group overflow-hidden ${
          freeFireStock.outOfStock
            ? 'border-slate-800 hover:border-red-500/40 opacity-95'
            : 'border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-950/50'
        }`}>
          
          {/* Subtle Glow */}
          <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all ${
            freeFireStock.outOfStock ? 'bg-red-600/10' : 'bg-amber-500/15 group-hover:bg-amber-500/25'
          }`} />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-1.5 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                100% GRÁTIS
              </span>

              {/* Real-time Stock Badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                freeFireStock.outOfStock
                  ? 'text-red-400 bg-red-950/60 border-red-500/40 animate-pulse'
                  : 'text-amber-300 bg-amber-950/60 border-amber-500/40'
              }`}>
                {freeFireStock.outOfStock
                  ? '0 PINS - ESGOTADO'
                  : `${freeFireStock.available}/${freeFireStock.total} PINS RESTANTES`}
              </span>
            </div>

            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  Free Fire
                </h3>
                <p className="text-[11px] text-amber-400 font-medium">
                  100 Diamantes + 10% Bônus
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              Código Digital / PIN original para resgate direto no site oficial <strong className="text-amber-300">recargajogo.com.br</strong>.
            </p>

            {/* Notice / Limit Rule */}
            <div className={`p-2.5 rounded-xl border text-[10px] font-semibold mb-4 leading-normal ${
              freeFireStock.outOfStock
                ? 'bg-red-950/50 border-red-500/40 text-red-200'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            }`}>
              {freeFireStock.outOfStock ? (
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>⚠️ OS PINS ACABARAM!</strong> Todos os códigos deste lote foram resgatados.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Limite:</strong> 1 código por IP/login. Resgate imediato.</span>
                </div>
              )}
            </div>

            {/* Benefits List */}
            <ul className="space-y-2 mb-4 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>100 Diamantes + 10% de Bônus</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Resgate Oficial Garena (Recarga Jogo)</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-2.5 mb-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Estoque Realtime:</span>
              <span className={`font-black text-xs ${
                freeFireStock.outOfStock ? 'text-red-400' : 'text-amber-400'
              }`}>
                {freeFireStock.outOfStock ? 'Esgotado' : 'Disponível Agora'}
              </span>
            </div>

            <button
              onClick={onGenerateFreeFire}
              className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 group/btn ${
                freeFireStock.outOfStock
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer hover:bg-slate-750'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 font-black'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{freeFireStock.outOfStock ? 'Verificar Codiguin FF' : 'Gerar Codiguin FF (Grátis)'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARD 4: NETFLIX VIP (BLOQUEADO / EM BREVE) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between transition-all group overflow-hidden opacity-90 hover:opacity-100">
          
          {/* Subtle Lock Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Banner Ribbon */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              EM BREVE
            </span>
          </div>

          <div>
            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 p-0.5 border border-slate-700 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-black text-slate-500 text-xl tracking-tighter">N</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-300">
                  Netflix VIP
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Em reabastecimento
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              Contas da Netflix em <strong className="text-slate-300">Ultra HD 4K</strong> com perfis individuais. Em breve disponível.
            </p>

            {/* Lock Notice Banner */}
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[10px] font-semibold mb-4 flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Em reabastecimento. Em breve liberado!</span>
            </div>

            {/* Benefits List */}
            <ul className="space-y-2 mb-4 text-[11px] text-slate-400 opacity-80">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Perfil Tela Exclusiva com PIN</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Qualidade 4K Ultra HD</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-2.5 mb-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Status:</span>
              <span className="font-bold text-amber-400 text-[11px]">Em Breve</span>
            </div>

            <button
              onClick={onBuyNetflix}
              className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 group/btn"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Netflix VIP (Em Breve)</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

