import React, { useState } from 'react';
import { Flame, Copy, Check, ExternalLink, ShieldCheck, AlertCircle, X, Sparkles } from 'lucide-react';
import { FreeFirePin } from '../types';

interface FreeFireModalResult {
  code?: string;
  message?: string;
  success?: boolean;
  outOfStock?: boolean;
  alreadyClaimed?: boolean;
  pin?: FreeFirePin;
}

interface FreeFireModalProps {
  pin?: FreeFirePin | null;
  errorMsg?: string | null;
  result?: FreeFireModalResult | null;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const FreeFireModal: React.FC<FreeFireModalProps> = ({
  pin,
  errorMsg,
  result,
  onClose,
  onOpenChat
}) => {
  const [copied, setCopied] = useState(false);

  const activePinCode = result?.pin?.code || result?.code || pin?.code;
  const isSuccess = Boolean(activePinCode && (result?.success !== false));
  const activeError = result && !result.success ? (result.message || 'Não foi possível resgatar o código.') : errorMsg;

  const handleCopy = () => {
    if (activePinCode) {
      navigator.clipboard.writeText(activePinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/50 space-y-6 overflow-hidden">
        {/* Glow overlay */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 mx-auto">
            <Flame className="w-8 h-8 fill-amber-200 text-amber-100" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Free Fire - Código Digital
          </h2>
          <p className="text-xs sm:text-sm text-amber-400 font-medium">
            100 Diamantes + 10% de Bônus Grátis
          </p>
        </div>

        {activeError ? (
          /* Error / Out of Stock / Already Claimed State */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Aviso do Sistema</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                {activeError}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          /* Success State - Display Code */
          <div className="space-y-5">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PIN Liberado com sucesso! Salvo na sua conta em "Meus Acessos".</span>
            </div>

            {/* Code display Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 text-center relative group">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                CÓDIGO DIGITAL (PIN)
              </span>
              <div className="font-mono text-lg sm:text-xl font-bold text-amber-300 select-all tracking-wider break-all bg-slate-900/90 py-3 px-2 rounded-xl border border-slate-800">
                {activePinCode}
              </div>
              <button
                onClick={handleCopy}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Código Copiado para a Área de Transferência!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código Digital
                  </>
                )}
              </button>
            </div>

            {/* Redemption Instructions */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Como Resgatar Seus Diamantes:
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>Acesse o site oficial da Garena: <strong className="text-amber-300">recargajogo.com.br</strong></li>
                <li>Selecione o jogo <strong className="text-amber-300">Free Fire</strong> e faça login com seu ID ou conta.</li>
                <li>Escolha a forma de pagamento <strong className="text-amber-300">E-Prepag / Código Digital</strong>.</li>
                <li>Cole o código acima e confirme o resgate!</li>
              </ol>

              <a
                href="https://recargajogo.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                Ir para o Recarga Jogo (recargajogo.com.br)
              </a>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed">
              {result?.message || 'Não há código do Free Fire disponível no momento ou você já atingiu o limite de resgates.'}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
