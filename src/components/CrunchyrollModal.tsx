import React, { useState } from 'react';
import { ServiceCredentials } from '../types';
import { X, Copy, Check, Tv, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';

interface CrunchyrollModalProps {
  credentials: ServiceCredentials | null;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const CrunchyrollModal: React.FC<CrunchyrollModalProps> = ({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg my-auto bg-slate-900 border border-orange-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-orange-950/60 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-orange-300 uppercase bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              ACESSO LIBERADO 100% GRATUITO
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Crunchyroll VIP
            </h3>
          </div>
        </div>

        {/* Catalog Banner Image */}
        <div className="relative mb-5 rounded-2xl overflow-hidden border border-orange-500/30 bg-slate-950 shadow-lg">
          <img
            src="https://t2.tudocdn.net/793619?w=776&h=338"
            alt="Catálogo Crunchyroll Animes"
            referrerPolicy="no-referrer"
            className="w-full h-36 sm:h-44 object-cover object-center"
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
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-orange-200">
            <span className="bg-slate-950/85 px-2.5 py-0.5 rounded-md border border-orange-500/30 backdrop-blur-sm">
              Animes • Desenhos • Filmes
            </span>
            <span className="bg-orange-500/20 text-orange-300 px-2.5 py-0.5 rounded-md border border-orange-500/40 backdrop-blur-sm">
              Full HD • Dublado/Legendado
            </span>
          </div>
        </div>

        {/* Organized Categories Tag Badges */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[11px] font-bold">
            🎌 Animes (Shonen, Ação, Romance)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            🎨 Desenhos & Animações
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[11px] font-bold">
            🎬 Filmes de Anime
          </span>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-semibold leading-relaxed mb-6 flex items-start gap-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-bold mb-1">⚠️ AVISO IMPORTANTE</p>
            <p className="text-amber-200/90">
              A qualquer momento o e-mail e a senha deste acesso gratuito do Crunchyroll podem ser alterados ou parar de funcionar sem aviso prévio. Aproveite para assistir seus animes e filmes enquanto estiver ativo!
            </p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 mb-6 shadow-inner">
          
          {/* Email Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              E-mail Crunchyroll
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
              <span className="font-mono text-sm sm:text-base font-black text-orange-300 flex-1 break-all select-all">
                {credentials.email}
              </span>
              <button
                onClick={() => copyToClipboard(credentials.email, 'email')}
                className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
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
              Senha Crunchyroll
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
              <span className="font-mono text-sm sm:text-base font-black text-orange-300 flex-1 break-all select-all">
                {credentials.password}
              </span>
              <button
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
              >
                {copiedPassword ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
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

        {/* Direct Link to Crunchyroll */}
        <div className="space-y-3">
          <a
            href="https://www.crunchyroll.com/pt-br/login"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Entrar no Site / App do Crunchyroll</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
};
