import React from 'react';
import { ServiceCredentials } from '../types';
import { 
  X, AlertTriangle, Lock, ShieldAlert,
  MessageSquare, Clock
} from 'lucide-react';
import { ChatGptTimer } from './ChatGptTimer';

interface ChatGptModalProps {
  credentials: ServiceCredentials | null;
  onClose: () => void;
  onOpenChat: () => void;
}

export const ChatGptModal: React.FC<ChatGptModalProps> = ({
  credentials,
  onClose,
  onOpenChat,
}) => {
  if (!credentials) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg my-auto bg-slate-900 border border-red-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-red-950/60 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-red-300 uppercase bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1 w-fit">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              ACESSO EXPIRADO & BLOQUEADO
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              ChatGPT Plus / Pro (Suspenso)
            </h3>
          </div>
        </div>

        {/* Real-time Expiration Timer Box */}
        <ChatGptTimer variant="modal" />

        {/* Big Official Suspension Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs leading-relaxed mb-6 shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-red-300 font-black uppercase text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>Comunicado Oficial: Acesso Suspenso</span>
          </div>
          <p className="text-slate-200 mb-2 leading-relaxed">
            O período de validade desta licença do <strong className="text-white">ChatGPT Plus / Pro (GPT-4o)</strong> encerrou-se em <strong className="text-red-300">22 de Setembro de 2026</strong>.
          </p>
          <p className="text-slate-300 mb-3 leading-relaxed">
            Por determinação de segurança e encerramento do prazo, o sistema <strong className="text-white">BLOQUEOU o acesso e a liberação de credenciais por enquanto</strong> até a definição de uma nova data com nova conta oficial.
          </p>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-red-500/30 text-[11px] text-red-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Nenhuma senha será liberada enquanto o serviço estiver com status de expirado.</span>
          </div>
        </div>

        {/* Locked Credentials Placeholder */}
        <div className="bg-slate-950/90 border border-red-500/30 rounded-2xl p-4 sm:p-5 space-y-4 mb-6 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              Credenciais de Acesso
            </span>
            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
              BLOQUEADAS
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              E-mail Google
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-500 text-xs">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span className="italic font-mono">Acesso bloqueado por expiração</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Senha de Login
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-500 text-xs">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-mono tracking-widest text-slate-600">•••••••••••••••• (Suspenso)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 mb-5">
          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar com o Suporte sobre Nova Data</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Entendido, Fechar Aviso</span>
          </button>
        </div>

        {/* Footer Support Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Dúvidas ou atualizações?</span>
          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="text-red-400 font-bold hover:underline cursor-pointer"
          >
            Suporte VIP 24/7
          </button>
        </div>

      </div>
    </div>
  );
};
