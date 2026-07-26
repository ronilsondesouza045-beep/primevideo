import React, { useState } from 'react';
import { AccessLog, PaymentRecord } from '../types';
import { Sparkles, Copy, Check, Play, ShieldCheck, Zap, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { PrimeCountdown } from './PrimeCountdown';

interface UserAccessesProps {
  accessLogs: AccessLog[];
  payments: PaymentRecord[];
  onRefresh: () => void;
  onOpenNetflixModal: (payment: PaymentRecord) => void;
}

export const UserAccesses: React.FC<UserAccessesProps> = ({
  accessLogs,
  payments,
  onRefresh,
  onOpenNetflixModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-black text-white">Painel do Cliente VIP</h2>
          </div>
          <p className="text-slate-400 text-xs">
            Gerencie todas as suas contas, senhas e acessos liberados no StreamHub VIP.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Atualizar Acessos</span>
        </button>
      </div>

      {/* Grid Section 1: Netflix VIP Purchases */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">Minhas Assinaturas Netflix (R$ 10,00)</h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
            Você ainda não realizou compras da Netflix VIP. Clique no menu principal para garantir seu acesso por R$ 10,00.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {p.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      p.status === 'APROVADO'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : p.status === 'PENDENTE'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 font-black text-xl flex items-center justify-center border border-red-500/30">
                    N
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Netflix VIP Ultra HD 4K</h4>
                    <span className="text-xs text-slate-400 font-medium">Valor: R$ {p.amount.toFixed(2)}</span>
                  </div>
                </div>

                {p.status === 'APROVADO' && p.credentials ? (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">E-mail:</span>
                      <span className="font-mono text-slate-200 font-bold">{p.credentials.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Senha:</span>
                      <span className="font-mono text-slate-200 font-bold">{p.credentials.password}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-300">
                      <span>Perfil / PIN:</span>
                      <span className="font-mono font-bold">{p.credentials.screen} ({p.credentials.pin})</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenNetflixModal(p)}
                    className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold border border-red-500/30 transition-all"
                  >
                    Concluir / Verificar Pagamento
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Section 2: Prime Video Free Accesses */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          <h3 className="text-lg font-bold text-white">Acessos Prime Video VIP (Gratuito)</h3>
        </div>

        {accessLogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
            Você ainda não gerou nenhum acesso gratuito do Prime Video. Clique em "Gerar Prime Video" na página principal!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accessLogs.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    VIP GRATUITO
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Play className="w-5 h-5 fill-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Prime Video VIP</h4>
                    <span className="text-xs text-slate-400">Acesso ilimitado</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">E-mail:</span>
                    <button
                      onClick={() => copyText(`${a.id}_email`, a.credentials.email)}
                      className="font-mono text-cyan-300 font-bold hover:underline flex items-center gap-1"
                    >
                      {a.credentials.email}
                      {copiedId === `${a.id}_email` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Senha:</span>
                    <button
                      onClick={() => copyText(`${a.id}_pwd`, a.credentials.password)}
                      className="font-mono text-cyan-300 font-bold hover:underline flex items-center gap-1"
                    >
                      {a.credentials.password}
                      {copiedId === `${a.id}_pwd` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Real-time Countdown Timer */}
                <PrimeCountdown createdAt={a.createdAt} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
