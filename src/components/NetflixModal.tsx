import React, { useState, useEffect } from 'react';
import { ServiceCredentials } from '../types';
import { X, Copy, Check, ExternalLink, QrCode, CreditCard, RefreshCw, CheckCircle2, ShieldCheck, Zap, Lock } from 'lucide-react';

interface NetflixModalProps {
  paymentId: string | null;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  tonLink: string;
  pixCode: string;
  credentials: ServiceCredentials | null;
  onClose: () => void;
  onVerifyPayment: (paymentId: string) => Promise<void>;
  onSimulateApprove?: (paymentId: string) => Promise<void>;
}

export const NetflixModal: React.FC<NetflixModalProps> = ({
  paymentId,
  status,
  tonLink,
  pixCode,
  credentials,
  onClose,
  onVerifyPayment,
  onSimulateApprove,
}) => {
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (paymentId && status === 'PENDENTE') {
      const timer = setInterval(() => {
        onVerifyPayment(paymentId);
      }, 5000); // Auto poll status every 5s
      return () => clearInterval(timer);
    }
  }, [paymentId, status]);

  if (!paymentId) return null;

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode || tonLink);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const copyCred = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleManualVerify = async () => {
    setIsVerifying(true);
    await onVerifyPayment(paymentId);
    setIsVerifying(false);
  };

  const handleSimulateApproval = async () => {
    if (onSimulateApprove && paymentId) {
      setIsVerifying(true);
      await onSimulateApprove(paymentId);
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg my-auto bg-slate-900 border border-red-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-red-950/80 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center font-black text-red-500 text-2xl">
            N
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-red-400 uppercase bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              NETFLIX VIP ULTRA HD 4K
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              {status === 'APROVADO' ? '🎉 Acesso Liberado!' : 'Pagamento de R$ 10,00'}
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
              Filmes & Séries Exclusivas
            </span>
            <span className="bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-md border border-red-500/40 backdrop-blur-sm">
              4K Ultra HD
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CASE 1: PAYMENT APPROVED -> DISPLAY CREDENTIALS */}
        {/* ========================================================= */}
        {status === 'APROVADO' && credentials ? (
          <div className="space-y-5 animate-fadeIn">
            
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Pagamento Confirmado com Sucesso!</p>
                <p className="text-[11px] text-slate-300">Sua conta Netflix Ultra HD está pronta para uso.</p>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
              
              {/* E-mail */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  E-mail Netflix
                </label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={credentials.email}
                    className="bg-transparent text-sm font-mono font-bold text-red-300 w-full focus:outline-none"
                  />
                  <button
                    onClick={() => copyCred(credentials.email, setCopiedEmail)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all flex items-center gap-1"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Senha
                </label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={credentials.password}
                    className="bg-transparent text-sm font-mono font-bold text-red-300 w-full focus:outline-none"
                  />
                  <button
                    onClick={() => copyCred(credentials.password, setCopiedPassword)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all flex items-center gap-1"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPassword ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Perfil & PIN */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Seu Perfil</span>
                  <span className="text-xs font-extrabold text-amber-300">{credentials.screen || 'Perfil VIP #1'}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">PIN do Perfil</span>
                    <span className="text-sm font-mono font-black text-amber-400">{credentials.pin || '1418'}</span>
                  </div>
                  <button
                    onClick={() => copyCred(credentials.pin || '1418', setCopiedPin)}
                    className="p-1.5 rounded bg-amber-500/20 text-amber-300"
                  >
                    {copiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            <a
              href="https://www.netflix.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30"
            >
              <span>Entrar na Netflix Agora</span>
              <ExternalLink className="w-4 h-4" />
            </a>

          </div>
        ) : (
          /* ========================================================= */
          /* CASE 2: PENDING PAYMENT -> SHOW TON LINK & PIX CODE */
          /* ========================================================= */
          <div className="space-y-5">
            
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Valor Total</span>
                <span className="text-2xl font-black text-red-500">R$ 10,00</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Código do Pedido</span>
                <span className="text-xs font-mono font-bold text-slate-200">{paymentId}</span>
              </div>
            </div>

            {/* Direct Payment Link Ton Button */}
            <a
              href={tonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-600/30 group transition-all"
            >
              <CreditCard className="w-5 h-5" />
              <span>PAGAR R$ 10,00 NO LINK TON (PIX/CARTÃO)</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* PIX Copy & Paste Box */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  Código PIX Copia e Cola
                </span>
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="text-[11px] font-bold text-cyan-400 hover:underline"
                >
                  {showQr ? 'Ocultar QR Code' : 'Ver QR Code'}
                </button>
              </div>

              {showQr && (
                <div className="flex justify-center p-3 bg-white rounded-xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(tonLink)}`}
                    alt="QR Code Pix"
                    className="w-40 h-40"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={pixCode || tonLink}
                  className="bg-transparent text-xs font-mono text-slate-300 w-full focus:outline-none truncate"
                />
                <button
                  onClick={copyPix}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    copiedPix ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Automatic Status Verification Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-red-500 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-slate-200">Aguardando Confirmação de Pagamento</p>
                  <p className="text-[10px] text-slate-400">Verificação em tempo real ativa.</p>
                </div>
              </div>

              <button
                onClick={handleManualVerify}
                disabled={isVerifying}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>{isVerifying ? 'Verificando...' : 'Verificar Agora'}</span>
              </button>
            </div>

            {/* Test Simulation Button */}
            {onSimulateApprove && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleSimulateApproval}
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>[Ambiente de Teste] Simular Confirmação Instantânea Ton</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
