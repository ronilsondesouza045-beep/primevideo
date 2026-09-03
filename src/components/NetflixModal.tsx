import React, { useState } from 'react';
import { ServiceCredentials } from '../types';
import { X, Copy, Check, ExternalLink, Sparkles, ShieldCheck, Zap, KeyRound, MessageCircle, Tv } from 'lucide-react';
import { NetflixCodeFetcher } from './NetflixCodeFetcher';

interface NetflixModalProps {
  credentials?: ServiceCredentials | null;
  paymentId?: string | null;
  status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  tonLink?: string;
  pixCode?: string;
  isOpen?: boolean;
  payment?: any;
  user?: any;
  onClose: () => void;
  onOpenChat?: () => void;
  onVerifyPayment?: (paymentId: string) => Promise<void>;
  onSimulateApprove?: (paymentId: string) => Promise<void>;
}

export const NetflixModal: React.FC<NetflixModalProps> = ({
  credentials,
  paymentId,
  status,
  isOpen = true,
  payment,
  onClose,
  onOpenChat
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen && !credentials && !payment && !paymentId) return null;

  // Resolve active credentials
  const rawCreds: ServiceCredentials = credentials || payment?.credentials || {
    email: 'prine1070@gmail.com',
    password: 'roni1418rr',
    screen: 'Perfil Livre / VIP',
    pin: '1418',
    warning: 'Acesso 100% Gratuito! Você pode entrar direto com o E-mail e Senha abaixo, ou se a sua TV pedir o código de 4 dígitos, use o Bot de busca de código em tempo real.'
  };

  const effectiveCreds: ServiceCredentials = {
    ...rawCreds,
    password: (!rawCreds.password || rawCreds.password === 'roni141821') ? 'roni1418rr' : rawCreds.password
  };

  const copyCred = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg my-auto bg-slate-900 border border-red-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-red-950/80 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Glow Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center font-black text-red-500 text-2xl shadow-lg shadow-red-600/20">
            N
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-red-400 uppercase bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1 w-fit">
              <Zap className="w-3 h-3 text-amber-400" />
              100% GRATUITO & ILIMITADO
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Netflix VIP Ultra HD 4K
            </h3>
          </div>
        </div>

        {/* Catalog Banner Image */}
        <div className="relative mb-5 rounded-2xl overflow-hidden border border-red-500/30 bg-slate-950 shadow-lg">
          <img
            src="https://cdn.prod.website-files.com/6615907cf43a722162c27a58/67aca413ce96c91ff946e3f1_netflix.webp"
            alt="Catálogo Netflix VIP"
            referrerPolicy="no-referrer"
            className="w-full h-32 sm:h-36 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-red-200">
            <span className="bg-slate-950/85 px-2.5 py-0.5 rounded-md border border-red-500/30 backdrop-blur-sm">
              Filmes & Séries Sem Limites
            </span>
            <span className="bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-md border border-red-500/40 backdrop-blur-sm flex items-center gap-1">
              <Tv className="w-3 h-3 text-amber-400" />
              4K Ultra HD
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-5 animate-fadeIn">
          
          {/* Status Badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 to-slate-950 border border-red-500/30 flex items-center gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Acesso VIP Liberado Gratuitamente!</p>
              <p className="text-[11px] text-slate-300">
                Coloque o e-mail na sua Smart TV e utilize o Bot abaixo para gerar seu código de 4 dígitos na hora (validade de 15 minutos).
              </p>
            </div>
          </div>

          {/* Credentials Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-inner">
            
            {/* E-mail */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                E-mail Netflix
              </label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={effectiveCreds.email || 'prine1070@gmail.com'}
                  className="bg-transparent text-sm font-mono font-bold text-red-300 w-full focus:outline-none"
                />
                <button
                  onClick={() => copyCred(effectiveCreds.email || 'prine1070@gmail.com', setCopiedEmail)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all flex items-center gap-1 flex-shrink-0"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Senha Netflix
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  (Entre direto com a senha se preferir)
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={effectiveCreds.password || 'roni1418rr'}
                  className="bg-transparent text-sm font-mono font-bold text-red-300 w-full focus:outline-none"
                />
                <button
                  onClick={() => copyCred(effectiveCreds.password || 'roni1418rr', setCopiedPassword)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all flex items-center gap-1 flex-shrink-0"
                >
                  {copiedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPassword ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Perfil & PIN */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Perfil Liberado</span>
                <span className="text-xs font-extrabold text-amber-300">{effectiveCreds.screen || 'Perfil Livre / VIP'}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">PIN do Perfil</span>
                  <span className="text-sm font-mono font-black text-amber-400">{effectiveCreds.pin || '1418'}</span>
                </div>
                <button
                  onClick={() => copyCred(effectiveCreds.pin || '1418', setCopiedPin)}
                  className="p-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Direct Netflix Open Link */}
          <a
            href="https://www.netflix.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all active:scale-[0.98]"
          >
            <span>Entrar na Netflix Agora</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Live Netflix Code & TV Household Residence Fetcher */}
          <div className="pt-1">
            <NetflixCodeFetcher email={effectiveCreds.email || 'prine1070@gmail.com'} />
          </div>

          {/* Optional Support Contact */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Precisa de ajuda? Fale com o Suporte VIP</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
