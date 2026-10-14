import React, {useEffect, useMemo, useState} from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Users,
} from 'lucide-react';

import {User} from '../types';

interface AnalyticsDashboardAdminProps {
  currentUser: User | null;
}

type Period = 'today' | '7d' | '30d';

interface SalesPoint {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface AnalyticsData {
  period: Period;
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  totalUsers: number;
  newUsers: number;
  onlineUsersCount: number;
  totalProducts: number;
  lowStockCount: number;
  salesChart: SalesPoint[];
}

const periodLabels: Record<Period, string> = {
  today: 'Hoje',
  '7d': '7 dias',
  '30d': '30 dias',
};

export const AnalyticsDashboardAdmin: React.FC<
  AnalyticsDashboardAdminProps
> = ({currentUser}) => {
  const [period, setPeriod] = useState<Period>('30d');
  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const token =
          localStorage.getItem('streamhub_token');

        const headers: Record<string, string> = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        if (currentUser?.email) {
          headers['x-user-email'] = currentUser.email;
        }

        const response = await fetch(
          `/api/admin/analytics?period=${period}`,
          {headers},
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`,
          );
        }

        const data = await response.json();

        if (!data.analytics) {
          throw new Error(
            'Resposta sem analytics.',
          );
        }

        setAnalytics(data.analytics);
      } catch (err) {
        console.error(
          'Erro ao carregar analytics:',
          err,
        );

        setError(
          'Não foi possível carregar os dados administrativos.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, currentUser?.email]);

  const chart = analytics?.salesChart ?? [];

  const hasMovement = useMemo(
    () =>
      chart.some(
        (item) =>
          item.revenue > 0 ||
          item.orders > 0,
      ),
    [chart],
  );

  const maxRevenue = useMemo(
    () =>
      Math.max(
        1,
        ...chart.map(
          (item) => item.revenue,
        ),
      ),
    [chart],
  );

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">
          Atualizando dados...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <p className="text-sm text-red-300">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />

            <h2 className="text-lg font-black text-white">
              Visão geral
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Dados registrados pelo sistema no período selecionado.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-xl border border-slate-800 bg-slate-950/70 p-1">

          {(
            ['today', '7d', '30d'] as const
          ).map((item) => (
            <button
              key={item}
              onClick={() =>
                setPeriod(item)
              }
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                period === item
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {periodLabels[item]}
            </button>
          ))}

        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <MetricCard
          title="Receita aprovada"
          value={`R$ ${(analytics?.revenue ?? 0).toFixed(2)}`}
          detail={`${analytics?.approvedOrders ?? 0} pagamento(s) aprovado(s)`}
          icon={<DollarSign className="w-5 h-5" />}
          tone="emerald"
        />

        <MetricCard
          title="Pedidos"
          value={String(
            analytics?.totalOrders ?? 0,
          )}
          detail={`${analytics?.pendingOrders ?? 0} pendente(s)`}
          icon={<ShoppingBag className="w-5 h-5" />}
          tone="amber"
        />

        <MetricCard
          title="Usuários online"
          value={String(
            analytics?.onlineUsersCount ?? 0,
          )}
          detail={`${analytics?.totalUsers ?? 0} usuário(s) cadastrado(s)`}
          icon={<Activity className="w-5 h-5" />}
          tone="cyan"
        />

        <MetricCard
          title="Novos usuários"
          value={String(
            analytics?.newUsers ?? 0,
          )}
          detail={`No período de ${periodLabels[period].toLowerCase()}`}
          icon={<Users className="w-5 h-5" />}
          tone="blue"
        />

      </div>


      <div className="pv2-surface-card rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

        <div className="flex items-center justify-between gap-3 mb-5">

          <div>
            <h3 className="text-sm font-bold text-white">
              Movimentação financeira
            </h3>

            <p className="text-[11px] text-slate-500 mt-1">
              Receita aprovada e pedidos registrados.
            </p>
          </div>

          <span className="text-[11px] font-bold text-slate-500">
            {periodLabels[period]}
          </span>

        </div>

        {!hasMovement ? (

          <div className="py-8 text-center">
            <BarChart3 className="w-8 h-8 text-slate-700 mx-auto mb-3" />

            <p className="text-sm font-bold text-slate-400">
              Nenhuma movimentação neste período
            </p>

            <p className="text-xs text-slate-600 mt-1">
              O gráfico aparecerá quando houver pedidos registrados.
            </p>
          </div>

        ) : (

          <div className="space-y-3">

            {chart.map((item) => {
              const percentage =
                Math.max(
                  3,
                  Math.round(
                    (item.revenue /
                      maxRevenue) *
                      100,
                  ),
                );

              return (
                <div
                  key={item.date}
                  className="grid grid-cols-[86px_1fr_auto] items-center gap-3"
                >

                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.date}
                  </span>

                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-white">
                      R$ {item.revenue.toFixed(2)}
                    </p>

                    <p className="text-[10px] text-slate-500">
                      {item.orders} pedido(s)
                    </p>
                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>


      {(analytics?.lowStockCount ?? 0) > 0 && (

        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

          <div>
            <p className="text-sm font-bold text-amber-300">
              Atenção ao catálogo
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {analytics?.lowStockCount} produto(s) estão marcados como estoque baixo ou esgotado.
            </p>
          </div>

        </div>

      )}

    </div>
  );
};


interface MetricCardProps {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone:
    | 'emerald'
    | 'amber'
    | 'cyan'
    | 'blue';
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone,
}: MetricCardProps) {

  const tones = {
    emerald:
      'text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
    amber:
      'text-amber-400 bg-amber-500/10 border-amber-500/10',
    cyan:
      'text-cyan-400 bg-cyan-500/10 border-cyan-500/10',
    blue:
      'text-blue-400 bg-blue-500/10 border-blue-500/10',
  };

  return (
    <div className="pv2-kpi-card rounded-2xl border border-slate-800 bg-slate-900/80 p-5">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-black text-white mt-3">
            {value}
          </p>
        </div>

        <div
          className={`p-2.5 rounded-xl border ${tones[tone]}`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-4 text-[11px] text-slate-500">
        {detail}
      </p>

    </div>
  );
}