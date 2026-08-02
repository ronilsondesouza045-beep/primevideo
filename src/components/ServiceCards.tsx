import React from 'react';
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Zap, CreditCard, Lock, Star, XCircle, Tv, AlertTriangle, Flame, MessageSquare } from 'lucide-react';
import { PrimeCountdown } from './PrimeCountdown';

interface ServiceCardsProps {
  onGeneratePrime: () => void;
  onGenerateParamount: () => void;
  onGenerateCrunchyroll: () => void;
  onGenerateFreeFire: () => void;
  onBuyNetflix: () => void;
  onGenerateIptv?: () => void;
  onOpenReviews?: (service: 'prime' | 'paramount' | 'freefire' | 'crunchyroll') => void;
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
  onGenerateCrunchyroll,
  onGenerateFreeFire,
  onBuyNetflix,
  onGenerateIptv,
  onOpenReviews,
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
          Gerencie suas contas de streaming, gere acessos de IPTV gratuitos com atualização instantânea e resgate seus benefícios.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* ======================================================== */}
        {/* CARD 0: GERADOR & CATÁLOGO IPTV GRÁTIS (DESTAQUE PRINCIPAL) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-cyan-500/50 hover:border-cyan-400 p-6 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-cyan-500/20 group overflow-hidden md:col-span-2 lg:col-span-1">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-1.5 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                100% GRÁTIS
              </span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                31 Acessos Disponíveis
              </span>
            </div>

            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Tv className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white leading-tight flex items-center gap-1.5">
                  IPTV Grátis <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">M3U / XC</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  Catálogo & Gerador Instantâneo
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              Gere usuários, senhas e listas M3U <strong className="text-white">gratuitamente</strong> para assistir a canais, filmes e séries.
            </p>

            {/* IPTV Banner */}
            <div className="relative mb-3.5 rounded-2xl overflow-hidden border border-cyan-500/40 group/img bg-slate-950 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80"
                alt="Catálogo IPTV Grátis"
                referrerPolicy="no-referrer"
                className="w-full h-32 sm:h-36 object-cover object-center transform group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-cyan-200">
                <span className="bg-slate-950/85 px-2 py-0.5 rounded-md border border-cyan-500/30 backdrop-blur-sm">
                  Canais + Filmes + Séries
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/40 backdrop-blur-sm">
                  FHD & 4K
                </span>
              </div>
            </div>

            {/* Warning Message Inside Card */}
            <div className="p-2.5 rounded-xl border text-[10px] font-semibold mb-4 leading-normal bg-amber-950/60 border-amber-500/40 text-amber-200">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>⚠️ AVISO:</strong> Alguns acessos podem estar ocupados por limite de conexões. Se não conectar, basta gerar outro usuário na hora!</span>
              </div>
            </div>

            {/* Benefits List */}
            <ul className="space-y-1.5 mb-4 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>31 Acessos Ativos Atualizados</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Usuário, Senha, Server DNS e M3U</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Cópia rápida em 1 Clique</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-2.5 mb-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Servidor:</span>
              <span className="font-mono font-bold text-cyan-300 text-[11px]">
                ger99.xyz:80
              </span>
            </div>

            <button
              onClick={onGenerateIptv}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white cursor-pointer transform active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" />
              <span>GERAR IPTV / VER CATÁLOGO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARD 1: PRIME VIDEO (100% GRATUITO) */}

        
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

            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              Acesso <strong className="text-white">gratuito</strong> para assistir a filmes, séries e esportes originais do Prime Video.
            </p>

            {/* Prime Video Catalog Banner / Banner de Séries e Filmes */}
            <div className="relative mb-3.5 rounded-2xl overflow-hidden border border-cyan-500/30 group/img bg-slate-950 shadow-md">
              <img
                src="https://www.estadao.com.br/resizer/v2/R7LIQKAH2VAPXH5FZC3WR4CBO4.jpg?auth=7bbc99ce8d477bc5ca0bf74b850e698ffc80c46235b29c3a71bda5629a0378cd"
                alt="Catálogo Prime Video"
                referrerPolicy="no-referrer"
                className="w-full h-32 sm:h-36 object-cover object-center transform group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-cyan-200">
                <span className="bg-slate-950/85 px-2 py-0.5 rounded-md border border-cyan-500/30 backdrop-blur-sm">
                  Catálogo Prime Video
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/40 backdrop-blur-sm">
                  Ultra HD 4K
                </span>
              </div>
            </div>

            {/* Real-time Rating Button/Badge */}
            {onOpenReviews && (
              <button
                onClick={() => onOpenReviews('prime')}
                className="w-full mb-3 p-2 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between group/rev"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-white">4.9/5.0</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    98% Chrome
                  </span>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 group-hover/rev:underline flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Avaliações
                </span>
              </button>
            )}

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

            {/* Paramount+ Catalog Banner / Banner de Séries e Filmes */}
            <div className="relative mb-3.5 rounded-2xl overflow-hidden border border-blue-500/30 group/img bg-slate-950 shadow-md">
              <img
                src="https://t2.tudocdn.net/703654?w=1200&h=1200"
                alt="Catálogo Paramount+"
                referrerPolicy="no-referrer"
                className="w-full h-32 sm:h-36 object-cover object-center transform group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-blue-200">
                <span className="bg-slate-950/85 px-2 py-0.5 rounded-md border border-blue-500/30 backdrop-blur-sm">
                  Catálogo Paramount+
                </span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/40 backdrop-blur-sm">
                  Filmes & Séries
                </span>
              </div>
            </div>

            {/* Real-time Rating Button/Badge */}
            {onOpenReviews && (
              <button
                onClick={() => onOpenReviews('paramount')}
                className="w-full mb-3 p-2 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all flex items-center justify-between group/rev"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-white">4.8/5.0</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    96% Chrome
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 group-hover/rev:underline flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Avaliações
                </span>
              </button>
            )}

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
        {/* CARD 3: CRUNCHYROLL VIP (100% GRATUITO) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 p-6 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-orange-950/50 group overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-1.5 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-orange-300 bg-orange-500/10 border border-orange-500/30 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                100% GRÁTIS
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Imediato
              </span>
            </div>

            {/* Service Title & Logo Branding */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-500 p-0.5 shadow-lg shadow-orange-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Tv className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  Crunchyroll VIP
                </h3>
                <p className="text-[11px] text-orange-300 font-medium">
                  Animes, Desenhos & Filmes
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              Catálogo completo com <strong className="text-white">Animes, Desenhos Animados e Filmes de Anime</strong> organizados em alta definição.
            </p>

            {/* Crunchyroll Catalog Banner */}
            <div className="relative mb-3 rounded-2xl overflow-hidden border border-orange-500/30 group/img bg-slate-950 shadow-md">
              <img
                src="https://t2.tudocdn.net/793619?w=776&h=338"
                alt="Catálogo Crunchyroll Animes"
                referrerPolicy="no-referrer"
                className="w-full h-32 sm:h-36 object-cover object-center transform group-hover/img:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "https://getyourcomicon.co.uk/wp-content/uploads/2026/03/Crunchyroll-AltLogo-Header.webp") {
                    target.src = "https://getyourcomicon.co.uk/wp-content/uploads/2026/03/Crunchyroll-AltLogo-Header.webp";
                  } else {
                    target.src = "https://cdn.vox-cdn.com/thumbor/P3PByAeb2U910M6YkI6S1yFesqU=/0x0:1920x1080/1200x800/filters:focal(807x387:1113x693)/cdn.vox-cdn.com/uploads/chorus_image/image/70568205/crunchyroll.0.png";
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-orange-200">
                <span className="bg-slate-950/85 px-2 py-0.5 rounded-md border border-orange-500/30 backdrop-blur-sm">
                  Animes & Filmes
                </span>
                <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-md border border-orange-500/40 backdrop-blur-sm">
                  Dublado / Legendado
                </span>
              </div>
            </div>

            {/* Category Badges Organizados */}
            <div className="mb-3 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-300">
                🎌 Animes
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300">
                🎨 Desenhos
              </span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-300">
                🎬 Filmes de Anime
              </span>
            </div>

            {/* Real-time Rating Button/Badge */}
            {onOpenReviews && (
              <button
                onClick={() => onOpenReviews('crunchyroll')}
                className="w-full mb-3 p-2 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-orange-500/40 text-left transition-all flex items-center justify-between group/rev"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-white">4.9/5.0</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    99% Aprovação
                  </span>
                </div>
                <span className="text-[10px] font-bold text-orange-400 group-hover/rev:underline flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Avaliações
                </span>
              </button>
            )}

            {/* Warning Notice */}
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[10px] font-semibold mb-4 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Aviso: A qualquer momento o e-mail e a senha podem ser alterados ou parar de funcionar.</span>
            </div>

            {/* Benefits List */}
            <ul className="space-y-1.5 mb-4 text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>E-mail e senha instantâneos</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Acervo completo de Animes & Desenhos</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-2.5 mb-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Preço:</span>
              <span className="font-black text-orange-400 text-xs">R$ 0,00 (Grátis)</span>
            </div>

            <button
              onClick={onGenerateCrunchyroll}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 group/btn bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white shadow-orange-600/20"
            >
              <span>Gerar Crunchyroll</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARD 3: FREE FIRE (TEMPORARIAMENTE MANUTENÇÃO / BLOQUEADO) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between transition-all group overflow-hidden opacity-95">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-1.5 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 uppercase flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                EM MANUTENÇÃO
              </span>

              {/* Status Badge */}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-amber-400 bg-amber-950/60 border-amber-500/40">
                BLOQUEADO TEMPORARIAMENTE
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
                  Indisponível Temporariamente
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              O serviço de resgate de Códigos Digitais / PINs do Free Fire está em manutenção para atualizações.
            </p>

            {/* Free Fire Catalog Banner / Banner do Jogo */}
            <div className="relative mb-3.5 rounded-2xl overflow-hidden border border-amber-500/30 group/img bg-slate-950 shadow-md">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDn8lFduZ9xS9171yqCOBDrUXUXdqFddrtXYUa0FJKL_12pDpx98a2db0&s=10"
                alt="Catálogo Free Fire"
                referrerPolicy="no-referrer"
                className="w-full h-32 sm:h-36 object-cover object-center transform group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-amber-200">
                <span className="bg-slate-950/85 px-2 py-0.5 rounded-md border border-amber-500/30 backdrop-blur-sm">
                  Free Fire - Diamantes
                </span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/40 backdrop-blur-sm">
                  100 + 10% Bônus
                </span>
              </div>
            </div>

            {/* Real-time Rating Button/Badge */}
            {onOpenReviews && (
              <button
                onClick={() => onOpenReviews('freefire')}
                className="w-full mb-3 p-2 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group/rev"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-white">5.0/5.0</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Avaliações Salvas
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 group-hover/rev:underline flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Ver Histórico
                </span>
              </button>
            )}

            {/* Notice / Maintenance Rule */}
            <div className="p-2.5 rounded-xl border text-[10px] font-semibold mb-4 leading-normal bg-amber-950/50 border-amber-500/40 text-amber-200">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>⚠️ EM MANUTENÇÃO:</strong> Resgate suspenso temporariamente para ajustes do sistema. Voltaremos em breve!</span>
              </div>
            </div>

            {/* Benefits List */}
            <ul className="space-y-2 mb-4 text-[11px] text-slate-400 opacity-80">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>100 Diamantes + 10% de Bônus (Em breve)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Resgate Oficial (Portal dos Créditos)</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div>
            <div className="p-2.5 mb-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <span className="font-bold text-amber-400 text-xs">
                Em Manutenção
              </span>
            </div>

            <button
              onClick={onGenerateFreeFire}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Fire (Em Manutenção)</span>
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

            <p className="text-slate-400 text-xs mb-3 leading-relaxed">
              Contas da Netflix em <strong className="text-slate-300">Ultra HD 4K</strong> com perfis individuais. Em breve disponível.
            </p>

            {/* Netflix Catalog Banner / Banner de Séries e Filmes */}
            <div className="relative mb-3.5 rounded-2xl overflow-hidden border border-red-500/30 group/img bg-slate-950 shadow-md">
              <img
                src="https://cdn.prod.website-files.com/6615907cf43a722162c27a58/67aca413ce96c91ff946e3f1_netflix.webp"
                alt="Catálogo Netflix VIP"
                referrerPolicy="no-referrer"
                className="w-full h-32 sm:h-36 object-cover object-center transform group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-red-200">
                <span className="bg-slate-950/85 px-2 py-0.5 rounded-md border border-red-500/30 backdrop-blur-sm">
                  Catálogo Netflix VIP
                </span>
                <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md border border-red-500/40 backdrop-blur-sm">
                  4K Ultra HD
                </span>
              </div>
            </div>

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

