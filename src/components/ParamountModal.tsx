import React, { useState } from 'react';
import { ServiceCredentials } from '../types';
import { X, Copy, Check, Tv, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';

interface ParamountModalProps {
  credentials: ServiceCredentials | null;
  onClose: () => void;
  onOpenChat: () => void;
}

export const ParamountModal: React.FC<ParamountModalProps> = ({
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
      <div className="relative w-full max-w-lg bg-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/60 overflow-hidden">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-indigo-500 to-blue-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              ACESSO LIBERADO 100% GRATUITO
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Paramount+ Oficial
            </h3>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-semibold leading-relaxed mb-6 flex items-start gap-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-bold mb-1">⚠️ AVISO IMPORTANTE</p>
            <p className="text-amber-200/90">
              A qualquer momento esta conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio. Aproveite enquanto estiver ativa!
            </p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 mb-6 shadow-inner">
          
          {/* Email Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              E-mail Paramount+
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={credentials.email}
                className="bg-transparent text-sm font-mono font-bold text-blue-300 w-full focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(credentials.email, 'email')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  copiedEmail
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
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
              Senha Paramount+
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={credentials.password}
                className="bg-transparent text-sm font-mono font-bold text-blue-300 w-full focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  copiedPassword
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
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

        {/* Instructions */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 mb-6">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Instruções de Acesso:
          </h4>
          <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal pl-4">
            <li>Acesse o aplicativo ou site oficial do Paramount+ (paramountplus.com).</li>
            <li>Insira o e-mail e a senha fornecidos acima.</li>
            <li>Lembre-se que o acesso é compartilhado e gratuito.</li>
          </ol>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://www.paramountplus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <span>Ir para o Paramount+</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
