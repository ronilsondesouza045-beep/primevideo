import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Server, Database, Globe, CreditCard, Headphones, Sparkles, Cpu, Clock, Check } from 'lucide-react';

export const SystemStatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [runningUpdate, setRunningUpdate] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [autoUpdateInfo, setAutoUpdateInfo] = useState<any>(null);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

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
        if (data.autoUpdate) setAutoUpdateInfo(data.autoUpdate);
      }
    } catch (e) {
      console.error('Error fetching system status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerManualUpdate = async () => {
    setRunningUpdate(true);
    setUpdateMsg(null);
    try {
      const res = await fetch('/api/auto-update/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUpdateMsg('✅ Atualização automática e varredura de bugs concluída com sucesso!');
        await fetchStatus();
      }
    } catch (e) {
      setUpdateMsg('❌ Erro ao executar atualização.');
    } finally {
      setRunningUpdate(false);
    }
  };

  const handleUpdateInterval = async (intervalDays: number) => {
    try {
      const res = await fetch('/api/auto-update/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true, intervalDays })
      });
      if (res.ok) {
        const data = await res.json();
        setAutoUpdateInfo(data.autoUpdate);
      }
    } catch (e) {
      console.error('Error updating settings:', e);
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Website') || name.includes('PWA')) return <Globe className="w-5 h-5 text-blue-400" />;
    if (name.includes('Catálogo') || name.includes('Estoque')) return <Database className="w-5 h-5 text-emerald-400" />;
    if (name.includes('API') || name.includes('Node')) return <Server className="w-5 h-5 text-amber-400" />;
    if (name.includes('Ton') || name.includes('Pix')) return <CreditCard className="w-5 h-5 text-purple-400" />;
    if (name.includes('Atualização') || name.includes('Auto-Heal')) return <Cpu className="w-5 h-5 text-purple-400" />;
    return <Headphones className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-400" />
            Status & Atualizações Automáticas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoramento em tempo real, varredura automática de integridade e correções sem intervenção manual.
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
              {statusData?.overall === 'Operational' ? 'Todos os Sistemas Operacionais & Atualizados' : 'Sistemas Operacionais'}
            </h2>
            <p className="text-xs text-slate-300">
              Plataforma, catálogo VIP e gerador IPTV com 100% de estabilidade e verificação automática.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono text-right shrink-0">
          Última verificação:<br />
          <strong className="text-slate-200">{statusData?.updatedAt ? new Date(statusData.updatedAt).toLocaleTimeString() : 'Agora'}</strong>
        </div>
      </div>

      {/* AUTO-UPDATE & AUTO-HEAL CONTROL PANEL */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Atualização Automática & Varredura de Bugs</h3>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  {autoUpdateInfo?.version || 'v2.5.0-AutoHeal'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                O sistema realiza varredura periódica do catálogo, limpa cache e corrige falhas automaticamente sem você precisar fazer nada.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerManualUpdate}
            disabled={runningUpdate}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 border border-purple-400/30 transition shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${runningUpdate ? 'animate-spin' : ''}`} />
            {runningUpdate ? 'Verificando...' : 'Rodar Varredura & Atualização Agora'}
          </button>
        </div>

        {updateMsg && (
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs font-medium text-purple-200">
            {updateMsg}
          </div>
        )}

        {/* FREQUENCY CONFIGURATION */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300">Frequência da Atualização Automática:</span>
          </div>

          <div className="flex items-center gap-2">
            {[2, 5, 10].map((days) => {
              const active = autoUpdateInfo?.intervalDays === days;
              return (
                <button
                  key={days}
                  onClick={() => handleUpdateInterval(days)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                    active
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  A cada {days} dias
                </button>
              );
            })}
          </div>
        </div>

        {/* LOG HISTORY */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Histórico de Varreduras Automáticas</h4>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {autoUpdateInfo?.history?.map((log: any, idx: number) => (
              <div key={log.id || idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-bold text-slate-200">Atualização Automática ({log.version})</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
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

