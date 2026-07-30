import React, { useState } from 'react';
import { ServiceCredentials } from '../types';
import { X, Copy, Check, Play, ShieldCheck, ExternalLink, HelpCircle, Tv, Laptop, ArrowRight } from 'lucide-react';
import { PrimeCountdown } from './PrimeCountdown';

interface PrimeModalProps {
  credentials: ServiceCredentials | null;
  onClose: () => void;
  onOpenChat: () => void;
}

export const PrimeModal: React.FC<PrimeModalProps> = ({
  credentials,
  onClose,
  onOpenChat,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'tv'>('login');
  const [tvCode, setTvCode] = useState('');

  if (!credentials) return null;

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleRegisterTv = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Opens the Prime Video TV registration page provided by the user
    window.open('https://www.primevideo.com/region/na/ontv/code?ref_=atv_auth_red_aft&ie=UTF8', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg my-auto bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-cyan-950/60 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Play className="w-6 h-6 fill-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              ACESSO LIBERADO 100% GRATUITO
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Prime Video VIP
            </h3>
          </div>
        </div>

        {/* Catalog Banner Image */}
        <div className="relative mb-4 rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-lg">
          <img
            src="https://www.estadao.com.br/resizer/v2/R7LIQKAH2VAPXH5FZC3WR4CBO4.jpg?auth=7bbc99ce8d477bc5ca0bf74b850e698ffc80c46235b29c3a71bda5629a0378cd"
            alt="Catálogo Prime Video"
            referrerPolicy="no-referrer"
            className="w-full h-28 sm:h-32 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-cyan-200">
            <span className="bg-slate-950/85 px-2.5 py-0.5 rounded-md border border-cyan-500/30 backdrop-blur-sm">
              Filmes & Séries Exclusivas
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-md border border-cyan-500/40 backdrop-blur-sm">
              4K Ultra HD
            </span>
          </div>
        </div>

        {/* Access Method Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Celular / PC (E-mail)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tv')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tv'
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-cyan-300 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Smart TV (Código)</span>
          </button>
        </div>

        {/* TAB 1: CELULAR / COMPUTER (EMAIL & PASSWORD) */}
        {activeTab === 'login' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
              {/* Email Field */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  E-mail de Acesso Prime Video
                </label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={credentials.email}
                    className="bg-transparent text-sm font-mono font-bold text-cyan-300 w-full focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      copiedEmail
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                    }`}
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Senha de Acesso Prime Video
                </label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={credentials.password}
                    className="bg-transparent text-sm font-mono font-bold text-cyan-300 w-full focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(credentials.password, 'password')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      copiedPassword
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                    }`}
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <PrimeCountdown />

            {/* Instructions */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Como acessar no seu dispositivo:
              </h4>
              <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal pl-4">
                <li>Abra o aplicativo Prime Video na Smart TV, celular ou computador.</li>
                <li>Cole o e-mail e a senha copiados acima.</li>
                <li>Escolha um dos perfis disponíveis e bom filme!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: SMART TV REGISTRATION VIA CODE (MATCHES AMAZON'S DESIGN) */}
        {activeTab === 'tv' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* TV Registration Header Card */}
            <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-cyan-400" />
                  Registre sua TV ou dispositivo compatível
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Insira o código exibido em sua TV para registrá-lo diretamente na sua conta Prime.
                </p>
              </div>

              {/* Form Input for TV Registration Code */}
              <form onSubmit={handleRegisterTv} className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Código de registro (exibido na sua TV):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={tvCode}
                    onChange={(e) => setTvCode(e.target.value.toUpperCase())}
                    placeholder="ex: HQ2W4Z"
                    maxLength={10}
                    className="flex-1 bg-slate-900 border border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-cyan-300 font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-cyan-400 uppercase placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Registrar Dispositivo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Direct Link to Prime Video TV Registration */}
              <div className="pt-2 border-t border-slate-800">
                <a
                  href="https://www.primevideo.com/region/na/ontv/code?ref_=atv_auth_red_aft&ie=UTF8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Abrir Página Oficial da Prime Video (amazon.com/mytv)</span>
                </a>
              </div>
            </div>

            {/* Step by Step Guide (Etapa 1, 2, 3) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h5 className="text-xs font-extrabold text-slate-200">
                Onde está meu código na TV?
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase text-cyan-400 block">Etapa 1</span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Abra o app <strong>Prime Video</strong> em sua TV ou dispositivo.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase text-cyan-400 block">Etapa 2</span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Selecione <strong>"Registrar-se no site da Prime"</strong>.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase text-cyan-400 block">Etapa 3</span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    O código de registro aparece na parte esquerda da tela.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Credentials Copy inside TV Tab just in case user needs to log in on TV first */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs flex items-center justify-between text-slate-300">
              <span className="text-[11px] font-medium text-slate-400">Precisando dos dados de e-mail?</span>
              <button
                onClick={() => setActiveTab('login')}
                className="text-cyan-400 font-bold hover:underline text-[11px] flex items-center gap-1"
              >
                <span>Ver E-mail e Senha</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <a
            href="https://www.primevideo.com/region/na/ontv/code?ref_=atv_auth_red_aft&ie=UTF8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Tv className="w-4 h-4" />
            <span>Ir para o Prime Video TV</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenChat}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Suporte Bot</span>
          </button>
        </div>

      </div>
    </div>
  );
};

