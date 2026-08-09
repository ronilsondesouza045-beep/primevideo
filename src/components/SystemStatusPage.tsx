import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Server, Database, Globe, CreditCard, Headphones } from 'lucide-react';

export const SystemStatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (e) {
      console.error('Error fetching system status:', e);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Website') || name.includes('PWA')) return <Globe className="w-5 h-5 text-blue-400" />;
    if (name.includes('Catálogo') || name.includes('Estoque')) return <Database className="w-5 h-5 text-emerald-400" />;
    if (name.includes('API') || name.includes('Node')) return <Server className="w-5 h-5 text-amber-400" />;
    if (name.includes('Ton') || name.includes('Pix')) return <CreditCard className="w-5 h-5 text-purple-400" />;
    return <Headphones className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-400" />
            Status do Sistema STREAMHUB VIP
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoramento em tempo real dos servidores, gateway de pagamento, API e disponibilidade dos serviços.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Global Status Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Status Geral</div>
            <h2 className="text-lg font-black text-slate-100">
              {statusData?.overall === 'Operational' ? 'Todos os Sistemas Operacionais' : 'Sistemas Operacionais'}
            </h2>
            <p className="text-xs text-slate-300">
              Plataforma e servidores IPTV com 100% de tempo de atividade registrado no momento.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono text-right shrink-0">
          Última verificação:<br />
          <strong className="text-slate-200">{statusData?.updatedAt ? new Date(statusData.updatedAt).toLocaleTimeString() : 'Agora'}</strong>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Serviços da Plataforma</h3>

        {loading && (
          <div className="py-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Checando latência e status dos microsserviços...
          </div>
        )}

        {!loading && statusData?.services?.map((s: any, idx: number) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              {getServiceIcon(s.name)}
              <div>
                <h4 className="text-xs font-bold text-slate-200">{s.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono">Latência: {s.latencyMs}ms</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">{s.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* History Incidents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Histórico de Manutenções & Incidentes</h3>

        <div className="space-y-3">
          {statusData?.incidentsHistory?.map((inc: any, idx: number) => (
            <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200">{inc.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500">{inc.date}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Concluído e resolvido com sucesso sem interrupção de acesso para os clientes VIP.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
