import React, { useState, useEffect } from 'react';
import { User, AdminStats, PaymentRecord } from '../types';
import { ShieldCheck, Users, DollarSign, Play, Zap, CheckCircle2, XCircle, Trash2, Edit, Save, RefreshCw, AlertCircle, Lock } from 'lucide-react';

interface AdminPanelProps {
  currentUser: User | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'payments' | 'credentials'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Credentials editing state
  const [primeEmail, setPrimeEmail] = useState('');
  const [primePassword, setPrimePassword] = useState('');
  const [netflixEmail, setNetflixEmail] = useState('');
  const [netflixPassword, setNetflixPassword] = useState('');
  const [netflixPin, setNetflixPin] = useState('');
  const [netflixScreen, setNetflixScreen] = useState('');
  const [tonLink, setTonLink] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Stats
      const resStats = await fetch('/api/admin/stats');
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // 2. Fetch Users
      const resUsers = await fetch('/api/admin/users');
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.users || []);
      }

      // 3. Fetch Payments
      const resPayments = await fetch('/api/admin/payments');
      if (resPayments.ok) {
        const data = await resPayments.json();
        setPayments(data.payments || []);
      }

      // 4. Fetch Credentials
      const resCreds = await fetch('/api/admin/credentials');
      if (resCreds.ok) {
        const data = await resCreds.json();
        if (data.prime) {
          setPrimeEmail(data.prime.email || '');
          setPrimePassword(data.prime.password || '');
        }
        if (data.netflix) {
          setNetflixEmail(data.netflix.email || '');
          setNetflixPassword(data.netflix.password || '');
          setNetflixPin(data.netflix.pin || '');
          setNetflixScreen(data.netflix.screen || '');
          setTonLink(data.netflix.tonLink || '');
        }
      }
    } catch (err) {
      setErrorMsg('Erro ao conectar com o servidor do Painel Administrativo.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccessMsg(`Status do usuário atualizado para ${newStatus}`);
        loadAdminData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao atualizar usuário');
      }
    } catch (err) {
      alert('Erro ao modificar usuário.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário permanentemente?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg('Usuário excluído com sucesso.');
        loadAdminData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir');
      }
    } catch (err) {
      alert('Erro na requisição.');
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, { method: 'POST' });
      if (res.ok) {
        setSuccessMsg(`Pagamento ${paymentId} APROVADO e conta Netflix liberada!`);
        loadAdminData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao aprovar');
      }
    } catch (err) {
      alert('Erro ao processar aprovação.');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, { method: 'POST' });
      if (res.ok) {
        setSuccessMsg(`Pagamento ${paymentId} rejeitado.`);
        loadAdminData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Erro ao rejeitar.');
    }
  };

  const handleSaveCredentials = async (serviceId: 'prime' | 'netflix') => {
    try {
      const payload = serviceId === 'prime' ? {
        serviceId: 'prime',
        email: primeEmail,
        password: primePassword
      } : {
        serviceId: 'netflix',
        email: netflixEmail,
        password: netflixPassword,
        pin: netflixPin,
        screen: netflixScreen,
        tonLink
      };

      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(`Credenciais do ${serviceId.toUpperCase()} salvas com sucesso!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Erro ao salvar credenciais.');
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-300 font-bold text-sm">Carregando dados do Painel Admin...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded uppercase border border-amber-500/30">
                ADMINISTRAÇÃO MASTER
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">Painel Administrativo StreamHub VIP</h2>
            <p className="text-xs text-slate-400">Administrador: ronisouza495@gmail.com</p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold border border-purple-500/30 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-purple-400" />
          <span>Sincronizar Dados</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Métricas e Visão Geral
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          Gerenciar Usuários ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          Vendas Netflix (R$ 10,00) ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          Contas & Link Ton
        </button>
      </div>

      {/* TAB 1: METRICS DASHBOARD */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Faturamento Total</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                R$ {stats.totalSales.toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500">Vendas Netflix Aprovadas</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Usuários Cadastrados</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                {stats.totalUsers}
              </p>
              <span className="text-[11px] text-slate-500">Base total de clientes</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Acessos Prime Video</span>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
                {stats.primeAccessCount}
              </p>
              <span className="text-[11px] text-slate-500">Gerados Grátis</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Vendas Netflix VIP</span>
              <p className="text-2xl sm:text-3xl font-black text-red-500 mt-1">
                {stats.approvedPaymentsCount}
              </p>
              <span className="text-[11px] text-slate-500">Pagamentos Aprovados</span>
            </div>

          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">Instruções do Administrador Master</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Como administrador exclusivo (`ronisouza495@gmail.com`), você possui controle completo sobre todas as transações, aprovação de acessos Netflix, liberação de senhas do Prime Video e configuração do link oficial da Ton.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-x-auto animate-fadeIn">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 px-3">E-mail</th>
                <th className="pb-3 px-3">Nome</th>
                <th className="pb-3 px-3">Função</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-3 font-bold text-white">{u.email}</td>
                  <td className="py-3.5 px-3 text-slate-300">{u.name}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      u.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {u.status === 'active' ? 'ATIVO' : 'BLOQUEADO'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200"
                    >
                      {u.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    </button>
                    {u.email.toLowerCase() !== 'ronisouza495@gmail.com' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: NETFLIX PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-x-auto animate-fadeIn">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 px-3">ID Pedido</th>
                <th className="pb-3 px-3">Cliente</th>
                <th className="pb-3 px-3">Valor</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Data</th>
                <th className="pb-3 px-3 text-right">Ação Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-300">{p.id}</td>
                  <td className="py-3.5 px-3 text-slate-200 font-medium">{p.userEmail}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-400">R$ {p.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      p.status === 'APROVADO'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : p.status === 'PENDENTE'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{new Date(p.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-3 text-right space-x-2">
                    {p.status !== 'APROVADO' && (
                      <button
                        onClick={() => handleApprovePayment(p.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm"
                      >
                        Aprovar Pagamento
                      </button>
                    )}
                    {p.status === 'PENDENTE' && (
                      <button
                        onClick={() => handleRejectPayment(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[11px] font-bold"
                      >
                        Rejeitar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: CREDENTIALS POOL & TON LINK MANAGER */}
      {activeTab === 'credentials' && (
        <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* Prime Video Config */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              <h3 className="text-base font-bold text-white">Credencial Padrão Prime Video (Grátis)</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">E-mail Prime Video</label>
                <input
                  type="text"
                  value={primeEmail}
                  onChange={(e) => setPrimeEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Senha Prime Video</label>
                <input
                  type="text"
                  value={primePassword}
                  onChange={(e) => setPrimePassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={() => handleSaveCredentials('prime')}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Credenciais Prime Video</span>
              </button>
            </div>
          </div>

          {/* Netflix & Ton Link Config */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-white">Credencial Netflix & Link Ton</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">E-mail Netflix</label>
                <input
                  type="text"
                  value={netflixEmail}
                  onChange={(e) => setNetflixEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-red-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Senha Netflix</label>
                <input
                  type="text"
                  value={netflixPassword}
                  onChange={(e) => setNetflixPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-red-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">PIN do Perfil</label>
                  <input
                    type="text"
                    value={netflixPin}
                    onChange={(e) => setNetflixPin(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Nome do Perfil</label>
                  <input
                    type="text"
                    value={netflixScreen}
                    onChange={(e) => setNetflixScreen(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Link de Pagamento Ton</label>
                <input
                  type="text"
                  value={tonLink}
                  onChange={(e) => setTonLink(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                onClick={() => handleSaveCredentials('netflix')}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configuração Netflix & Ton</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
