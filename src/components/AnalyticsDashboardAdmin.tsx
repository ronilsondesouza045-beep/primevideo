import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users, Shield, ArrowUpRight, BarChart3, AlertTriangle, Package, Calendar } from 'lucide-react';
import { User } from '../types';

interface AnalyticsDashboardAdminProps {
  currentUser: User | null;
}

export const AnalyticsDashboardAdmin: React.FC<AnalyticsDashboardAdminProps> = ({ currentUser }) => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | '12m'>('30d');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch(`/api/admin/analytics?period=${period}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.analytics) setAnalytics(data.analytics);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = {
    today: 'Hoje',
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    '12m': 'Últimos 12 meses'
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Métricas Financeiras & Desempenho
          </h2>
          <p className="text-xs text-slate-400">
            Relatórios e faturamento real agregados do gateway Ton, cadastros de clientes e acessos.
          </p>
        </div>

        {/* Period Selector Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['today', '7d', '30d', '90d', '12m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                period === p
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Calculando faturamento e métricas da base...
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento Total</span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-100">
                R$ {(analytics?.revenue || 0).toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                Vendas Aprovadas Ton/Pix
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Pedidos</span>
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-100">
                {analytics?.ordersCount || 0}
              </div>
              <p className="text-[11px] text-amber-400 font-bold">
                {analytics?.pendingOrders || 0} pendentes / em processamento
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Novos Usuários</span>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-100">
                {analytics?.newUsers || 0}
              </div>
              <p className="text-[11px] text-blue-400 font-bold">
                Cadastros ativos no período
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estoque Alerta</span>
                <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-100">
                {analytics?.lowStockCount || 0}
              </div>
              <p className="text-[11px] text-red-400 font-bold">
                Produtos com estoque &lt; 5 unidades
              </p>
            </div>

          </div>

          {/* Daily Sales Visual Breakdown Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Histórico de Faturamento ({periodLabels[period]})</span>
              <span className="text-[11px] text-amber-400 font-mono">Dados Reais</span>
            </h3>

            {analytics?.dailyChart?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Sem registros de faturamento para o período.</p>
            ) : (
              <div className="space-y-2 pt-2">
                {analytics?.dailyChart?.slice(0, 7).map((d: any, idx: number) => {
                  const maxAmount = Math.max(...analytics.dailyChart.map((x: any) => x.amount), 1);
                  const percentage = Math.min(Math.round((d.amount / maxAmount) * 100), 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{d.date}</span>
                        <span className="text-amber-400 font-bold">R$ {d.amount.toFixed(2)} ({d.count} pedido/s)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Best Selling Products */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Produtos Mais Vendidos no Período
            </h3>

            {analytics?.topProducts?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Nenhum produto vendido no período selecionado.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {analytics?.topProducts?.map((tp: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{tp.name}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">R$ {tp.revenue.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">{tp.count} unidade(s) sold</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </>
      )}

    </div>
  );
};
