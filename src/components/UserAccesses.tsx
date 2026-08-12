import React, { useState } from 'react';
import { AccessLog, PaymentRecord } from '../types';
import { Sparkles, Copy, Check, Play, ShieldCheck, Zap, ExternalLink, Clock, RefreshCw, Tv, AlertTriangle, Flame, Bot } from 'lucide-react';
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

      {/* Grid Section 2: Free Accesses & Claimed Codes */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          <h3 className="text-lg font-bold text-white">Meus Logins & Códigos Liberados (Prime, Paramount+ & Free Fire)</h3>
        </div>

        {(() => {
          // Deduplicate logs strictly by service (1 card per service)
          const uniqueAccessLogs: AccessLog[] = [];
          const seenServices = new Set<string>();
          for (const log of accessLogs) {
            if (!seenServices.has(log.service)) {
              seenServices.add(log.service);
              uniqueAccessLogs.push(log);
            }
          }

          if (uniqueAccessLogs.length === 0) {
            return (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                Você ainda não gerou nenhum acesso ou PIN gratuito. Clique em "Gerar" no catálogo principal para resgatar!
              </div>
            );
          }

          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uniqueAccessLogs.map((a) => {
                const isParamount = a.service === 'paramount';
                const isCrunchyroll = a.service === 'crunchyroll';
                const isFreeFire = a.service === 'freefire';
                const isChatGpt = a.service === 'chatgpt';

                return (
                  <div
                    key={a.id}
                  className={`p-5 rounded-2xl bg-slate-900 border transition-all space-y-3 ${
                    isFreeFire
                      ? 'border-slate-800 hover:border-amber-500/50'
                      : isChatGpt
                      ? 'border-slate-800 hover:border-emerald-500/50'
                      : isCrunchyroll
                      ? 'border-slate-800 hover:border-orange-500/50'
                      : isParamount
                      ? 'border-slate-800 hover:border-blue-500/40'
                      : 'border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                      isFreeFire
                        ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                        : isChatGpt
                        ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                        : isCrunchyroll
                        ? 'text-orange-300 bg-orange-950/60 border-orange-500/30'
                        : isParamount
                        ? 'text-blue-400 bg-blue-950/60 border-blue-500/30'
                        : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
                    }`}>
                      {isFreeFire ? 'FREE FIRE (100 DIAMANTES)' : isChatGpt ? 'CHATGPT PRO (GPT-4o)' : isCrunchyroll ? 'CRUNCHYROLL GRÁTIS' : isParamount ? 'PARAMOUNT+ GRÁTIS' : 'PRIME VIDEO GRÁTIS'}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isFreeFire
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : isChatGpt
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : isCrunchyroll
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : isParamount
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {isFreeFire ? (
                        <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ) : isChatGpt ? (
                        <Bot className="w-5 h-5 text-emerald-400" />
                      ) : isCrunchyroll ? (
                        <Tv className="w-5 h-5 text-orange-400" />
                      ) : isParamount ? (
                        <Tv className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Play className="w-5 h-5 fill-cyan-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {isFreeFire ? 'Codiguin Free Fire' : isChatGpt ? 'ChatGPT Plus / Pro' : isCrunchyroll ? 'Crunchyroll VIP' : isParamount ? 'Paramount+' : 'Prime Video VIP'}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {isFreeFire ? '100 Diamantes + 10% Bônus' : isChatGpt ? 'Inteligência Artificial GPT-4o' : isCrunchyroll ? 'Animes, Desenhos & Filmes' : 'Acesso Gratuito'}
                      </span>
                    </div>
                  </div>

                  {isFreeFire ? (
                    <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 text-xs space-y-2">
                      <div className="text-[10px] uppercase font-bold text-amber-400">CÓDIGO DIGITAL (PIN):</div>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm font-black text-amber-300 break-all select-all">
                          {a.credentials.password}
                        </span>
                        <button
                          onClick={() => copyText(`${a.id}_code`, a.credentials.password)}
                          className="p-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 shrink-0"
                        >
                          {copiedId === `${a.id}_code` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <a
                        href="https://www.portaldoscreditos.com.br/redeem"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/20 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Resgatar no Portal dos Créditos
                      </a>
                    </div>
                  ) : (
                    <>
                      {(isParamount || isCrunchyroll) && (
                        <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                          ⚠️ A qualquer momento o e-mail e a senha podem ser alterados.
                        </div>
                      )}

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">E-mail:</span>
                          <button
                            onClick={() => copyText(`${a.id}_email`, a.credentials.email)}
                            className={`font-mono font-bold hover:underline flex items-center gap-1 ${
                              isChatGpt ? 'text-emerald-300' : isCrunchyroll ? 'text-orange-300' : isParamount ? 'text-blue-300' : 'text-cyan-300'
                            }`}
                          >
                            {a.credentials.email}
                            {copiedId === `${a.id}_email` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Senha:</span>
                          <button
                            onClick={() => copyText(`${a.id}_pwd`, a.credentials.password)}
                            className={`font-mono font-bold hover:underline flex items-center gap-1 ${
                              isChatGpt ? 'text-emerald-300' : isCrunchyroll ? 'text-orange-300' : isParamount ? 'text-blue-300' : 'text-cyan-300'
                            }`}
                          >
                            {a.credentials.password}
                            {copiedId === `${a.id}_pwd` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {isChatGpt && (
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href="https://chatgpt.com/auth/login?next=%2F"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Entrar na Web
                          </a>
                          <a
                            href="https://play.google.com/store/apps/details?id=com.openai.chatgpt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Play Store App
                          </a>
                        </div>
                      )}

                      {!isParamount && !isCrunchyroll && !isChatGpt && <PrimeCountdown createdAt={a.createdAt} />}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
      </div>

    </div>
  );
};
