import React, { useState } from 'react';
import { ServiceCredentials } from '../types';
import { X, Copy, Check, Play, ShieldCheck, ExternalLink, Sparkles, HelpCircle } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 overflow-hidden">
        
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
        <div className="flex items-center gap-3 mb-6">
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

        {/* Credentials Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 mb-6 shadow-inner">
          
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

        {/* Real-time Countdown Timer */}
        <div className="mb-6">
          <PrimeCountdown />
        </div>

        {/* Instructions */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 mb-6">
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

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://www.primevideo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <span>Ir para o Prime Video</span>
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
