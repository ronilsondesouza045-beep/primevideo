import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Tv, 
  Radio, 
  Sparkles, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity, 
  Gift, 
  MessageSquare, 
  Users, 
  Flame 
} from 'lucide-react';

interface TikTokLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TikTokLiveModal: React.FC<TikTokLiveModalProps> = ({ isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const TIKTOK_LIVE_URL = 'https://tiktoklivewebvercelv43viewersgiftsl.vercel.app/';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(TIKTOK_LIVE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(TIKTOK_LIVE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full bg-slate-900 border border-pink-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen 
            ? 'fixed inset-0 rounded-none border-none z-50 h-screen max-w-none' 
            : 'max-w-5xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-600 to-cyan-400 p-0.5 shadow-lg shadow-pink-500/25 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-pink-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Monitor de Live TikTok
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-500/20 to-cyan-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1 uppercase tracking-wider">
                  <Activity className="w-3 h-3 text-pink-400" />
                  Tempo Real
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Monitore chat, espectadores, presentes (gifts) e curtidas de qualquer transmissão do TikTok
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              title="Recarregar Monitor"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Recarregar</span>
            </button>

            <button
              onClick={handleCopyLink}
              title="Copiar Link"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs font-semibold">{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={handleOpenExternal}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no Navegador</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 text-pink-300 font-semibold">
              <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
              Chat em Tempo Real
            </span>
            <span className="flex items-center gap-1 text-cyan-300 font-semibold">
              <Gift className="w-3.5 h-3.5 text-cyan-400" />
              Presentes & Doações (Gifts)
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Contador de Espectadores
            </span>
            <span className="flex items-center gap-1 text-rose-300 font-semibold">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Curtidas & Engajamento
            </span>
          </div>

          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Conexão Web Segura Direta</span>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-200 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-0.5 animate-spin">
                <div className="w-full h-full bg-slate-950 rounded-[14px]" />
              </div>
              <p className="text-xs font-bold text-slate-300">Carregando Monitor TikTok Live...</p>
              <p className="text-[11px] text-slate-500">Conectando ao serviço em tempo real</p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={TIKTOK_LIVE_URL}
            title="TikTok Live Monitor - Chat, Viewers & Gifts"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Modal Footer Instructions */}
        <div className="px-5 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span><strong>Como usar:</strong> Digite o <strong>@username</strong> do criador que está em live no TikTok e clique em conectar para ver as mensagens e presentes ao vivo.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition border border-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
