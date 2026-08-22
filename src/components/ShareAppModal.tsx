import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Check, MessageCircle, Send, ExternalLink, Sparkles, QrCode } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const shareUrl = 'https://primevideo-ten.vercel.app/';
  const shareTitle = 'StreamHub VIP - ChatGPT Plus/Pro, Prime Video, Netflix & Catálogo Completo';
  const shareText = `🍿 *STREAMHUB VIP - CATÁLOGO COMPLETO & CHATGPT PRO GRÁTIS!* 🚀\n\n🔥 Acesse agora contas liberadas:\n🤖 *ChatGPT Plus / Pro (GPT-4o)* - 100% Gratuito\n🎬 *Prime Video, Paramount+, Crunchyroll & Netflix*\n\n👉 Acesse o link oficial: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('🍿 Acesse o StreamHub VIP com ChatGPT Pro e Catálogo Completo Grátis!')}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: 'Acesse o catálogo do StreamHub VIP com ChatGPT Pro e Streaming Grátis!',
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-emerald-500/20 via-cyan-500/10 to-transparent blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between relative z-10 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Compartilhar Link com Amigos
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  Envie o link do catálogo completo com foto e capa organizada
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Visual Social Card Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  📸 Prévia da foto ao enviar no WhatsApp / Redes:
                </label>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Capa Oficial Ativa
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl group">
                <img
                  src="/social_share_banner.jpg"
                  alt="Prévia StreamHub VIP com ChatGPT Pro e Catálogo"
                  className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider">
                      ChatGPT Pro + Streaming
                    </span>
                    <span className="bg-red-600 text-white font-bold text-[10px] uppercase px-1.5 py-0.5 rounded-md">
                      100% Free
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1 drop-shadow">
                    StreamHub VIP - Catálogo Completo & Contas Liberadas
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-1 drop-shadow-sm font-medium">
                    https://primevideo-ten.vercel.app/
                  </p>
                </div>
              </div>
            </div>

            {/* Copy Link Input Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Link direto do site:
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-2xl p-2 pl-3.5 focus-within:border-emerald-500 transition-colors">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent border-none text-white text-xs font-mono w-full focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-95'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Buttons Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 p-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                Enviar no WhatsApp
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex items-center justify-center gap-2 p-3 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/50 hover:border-sky-400 text-sky-300 hover:text-white rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <Send className="w-4 h-4 text-sky-400" />
                Enviar no Telegram
              </button>
            </div>

            {/* Mobile Native Share / QR Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                Compartilhar via Celular (Apps)
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  showQr
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Mostrar QR Code"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </button>
            </div>

            {/* QR Code Section */}
            {showQr && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center space-y-2"
              >
                <div className="inline-block p-2.5 bg-white rounded-xl shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                    alt="QR Code StreamHub VIP"
                    className="w-32 h-32"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Aponte a câmera do celular para abrir o site instantaneamente
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              ✨ Ao enviar o link, a foto do catálogo e ChatGPT Pro aparece automaticamente no preview da mensagem!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
