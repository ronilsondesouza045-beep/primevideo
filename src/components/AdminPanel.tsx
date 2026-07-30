import React, { useState, useEffect } from 'react';
import { User, AdminStats, PaymentRecord, VisitorLog, AccessLog, SmmOrder, SmmService } from '../types';
import {
  ShieldCheck,
  Users,
  DollarSign,
  Play,
  Zap,
  CheckCircle2,
  XCircle,
  Trash2,
  Save,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Globe,
  Search,
  Clock,
  Key,
  Activity,
  Chrome,
  MessageSquare,
  Send,
  UserCheck,
  Tv,
  TrendingUp,
  Link,
  Layers,
  Sparkles,
  Settings,
  ExternalLink,
  Server,
  Database,
  ListFilter
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'support' | 'visitors' | 'users' | 'accesses' | 'payments' | 'credentials'
  >('dashboard');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [generatedAccesses, setGeneratedAccesses] = useState<(AccessLog & { userName?: string })[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [supportChats, setSupportChats] = useState<any[]>([]);

  // SMM Management State
  const [smmBalance, setSmmBalance] = useState<{ balance: string; online: boolean; latencyMs: number } | null>(null);
  const [smmOrders, setSmmOrders] = useState<SmmOrder[]>([]);
  const [smmServices, setSmmServices] = useState<SmmService[]>([]);
  const [smmConfig, setSmmConfig] = useState({
    apiKey: 'fdd634b7dace29b68e6ac06a947e0407',
    apiUrl: 'https://verifiedatacado.com/api/v2',
    cooldownHours: 24,
    freeTrialQty: 50,
    bannedIps: [] as string[],
    lastSyncAt: undefined as string | undefined,
    lastApiStatus: undefined as boolean | undefined,
    lastApiBalance: undefined as string | undefined,
    lastServicesCount: undefined as number | undefined,
    disabledCategories: [] as string[],
    syncLogs: [] as any[]
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionFeedback, setConnectionFeedback] = useState<{
    success: boolean;
    online: boolean;
    message?: string;
    error?: string;
    balance?: string;
    servicesCount?: number;
    latencyMs?: number;
    timestamp?: string;
  } | null>(null);
  const [newBanIp, setNewBanIp] = useState('');
  const [syncingSmm, setSyncingSmm] = useState(false);
  const [selectedUserKey, setSelectedUserKey] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Credentials editing state
  const [primeEmail, setPrimeEmail] = useState('');
  const [primePassword, setPrimePassword] = useState('');
  const [paramountEmail, setParamountEmail] = useState('');
  const [paramountPassword, setParamountPassword] = useState('');
  const [netflixEmail, setNetflixEmail] = useState('');
  const [netflixPassword, setNetflixPassword] = useState('');
  const [netflixPin, setNetflixPin] = useState('');
  const [netflixScreen, setNetflixScreen] = useState('');
  const [tonLink, setTonLink] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  // Real-time polling every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getAuthHeaders = () => {
    let userEmail = currentUser?.email || 'ronisouza495@gmail.com';
    const userStr = localStorage.getItem('streamhub_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) userEmail = u.email;
      } catch (e) {}
    }
    const token = localStorage.getItem('streamhub_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const loadAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    setErrorMsg('');
    const headers = getAuthHeaders();
    const fetchOptions: RequestInit = { headers, credentials: 'include' };

    try {
      // 1. Fetch Stats
      const resStats = await fetch('/api/admin/stats', fetchOptions);
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // 2. Fetch Visitors
      const resVisitors = await fetch('/api/admin/visitors', fetchOptions);
      if (resVisitors.ok) {
        const data = await resVisitors.json();
        setVisitors(data.visitors || []);
      }

      // 3. Fetch Users
      const resUsers = await fetch('/api/admin/users', fetchOptions);
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.users || []);
      }

      // 4. Fetch Generated Accesses
      const resAccesses = await fetch('/api/admin/access-logs', fetchOptions);
      if (resAccesses.ok) {
        const data = await resAccesses.json();
        setGeneratedAccesses(data.accessLogs || []);
      }

      // 5. Fetch Payments
      const resPayments = await fetch('/api/admin/payments', fetchOptions);
      if (resPayments.ok) {
        const data = await resPayments.json();
        setPayments(data.payments || []);
      }

      // 6. Fetch Credentials
      const resCreds = await fetch('/api/admin/credentials', fetchOptions);
      if (resCreds.ok) {
        const data = await resCreds.json();
        if (data.prime) {
          setPrimeEmail(data.prime.email || '');
          setPrimePassword(data.prime.password || '');
        }
        if (data.paramount) {
          setParamountEmail(data.paramount.email || '');
          setParamountPassword(data.paramount.password || '');
        }
        if (data.netflix) {
          setNetflixEmail(data.netflix.email || '');
          setNetflixPassword(data.netflix.password || '');
          setNetflixPin(data.netflix.pin || '');
          setNetflixScreen(data.netflix.screen || '');
          setTonLink(data.netflix.tonLink || '');
        }
      }

      // 7. Fetch SMM Supplier Balance & Config
      const resBalance = await fetch('/api/smm/balance', fetchOptions);
      if (resBalance.ok) {
        const balData = await resBalance.json();
        setSmmBalance({ balance: balData.balance || '0.00', online: balData.online, latencyMs: balData.latencyMs || 0 });
      }

      const resSmmOrders = await fetch('/api/admin/smm/orders', fetchOptions);
      if (resSmmOrders.ok) {
        const ordData = await resSmmOrders.json();
        setSmmOrders(ordData.orders || []);
      }

      const resSmmConfig = await fetch('/api/admin/smm/config', fetchOptions);
      if (resSmmConfig.ok) {
        const cfgData = await resSmmConfig.json();
        if (cfgData.config) setSmmConfig(cfgData.config);
      }

      const resSmmCatalog = await fetch('/api/smm/catalog', fetchOptions);
      if (resSmmCatalog.ok) {
        const catData = await resSmmCatalog.json();
        setSmmServices(catData.services || []);
      }

      // 7. Fetch Support Chats
      const resChats = await fetch('/api/admin/support/chats', fetchOptions);
      if (resChats.ok) {
        const data = await resChats.json();
        setSupportChats(data.chats || []);
      }


    } catch (err) {
      if (!silent) setErrorMsg('Erro ao conectar com o servidor do Painel Administrativo.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendAdminReply = async (userId: string, userEmail: string) => {
    if (!adminReplyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          userId,
          userEmail,
          text: adminReplyText.trim()
        })
      });

      if (res.ok) {
        setAdminReplyText('');
        setSuccessMsg('Resposta enviada com sucesso ao cliente!');
        loadAdminData(true);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao enviar resposta.');
      }
    } catch (err) {
      alert('Erro na comunicação com o servidor.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccessMsg(`Status do usuário atualizado para ${newStatus}`);
        loadAdminData(true);
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
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        setSuccessMsg('Usuário excluído com sucesso.');
        loadAdminData(true);
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
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        setSuccessMsg(`Pagamento ${paymentId} APROVADO e conta Netflix liberada!`);
        loadAdminData(true);
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
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        setSuccessMsg(`Pagamento ${paymentId} rejeitado.`);
        loadAdminData(true);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Erro ao rejeitar.');
    }
  };

  const handleSaveCredentials = async (serviceId: 'prime' | 'netflix' | 'paramount') => {
    try {
      let payload: any = {};
      if (serviceId === 'prime') {
        payload = { serviceId: 'prime', email: primeEmail, password: primePassword };
      } else if (serviceId === 'paramount') {
        payload = { serviceId: 'paramount', email: paramountEmail, password: paramountPassword };
      } else {
        payload = {
          serviceId: 'netflix',
          email: netflixEmail,
          password: netflixPassword,
          pin: netflixPin,
          screen: netflixScreen,
          tonLink
        };
      }

      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
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

  const handleTestApiConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionFeedback(null);
      const res = await fetch('/api/admin/smm/test-connection', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          apiUrl: smmConfig.apiUrl,
          apiKey: smmConfig.apiKey
        })
      });
      const data = await res.json();
      setConnectionFeedback({
        success: data.success,
        online: data.online,
        message: data.message,
        error: data.error,
        balance: data.balance,
        servicesCount: data.servicesCount,
        latencyMs: data.latencyMs,
        timestamp: new Date().toLocaleString('pt-BR')
      });

      if (data.online) {
        setSmmBalance({ balance: data.balance || '0.00', online: true, latencyMs: data.latencyMs || 0 });
      } else {
        setSmmBalance({ balance: '0.00', online: false, latencyMs: data.latencyMs || 999 });
      }

      loadAdminData(true);
    } catch (err) {
      setConnectionFeedback({
        success: false,
        online: false,
        error: 'Erro na comunicação ao testar conexão com a API.',
        timestamp: new Date().toLocaleString('pt-BR')
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleToggleCategory = async (categoryName: string) => {
    try {
      const res = await fetch('/api/admin/smm/category/toggle', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ categoryName })
      });
      const data = await res.json();
      if (data.success) {
        setSmmConfig(prev => ({
          ...prev,
          disabledCategories: data.disabledCategories || []
        }));
        loadAdminData(true);
      }
    } catch (err) {
      console.error('Erro ao alternar categoria:', err);
    }
  };

  const handleSyncSmmServices = async () => {
    try {
      setSyncingSmm(true);
      const res = await fetch('/api/admin/smm/sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Serviços do catálogo SMM sincronizados com sucesso!');
        loadAdminData(true);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Erro ao sincronizar catálogo SMM.');
      }
    } catch (err) {
      alert('Erro na comunicação ao sincronizar serviços SMM.');
    } finally {
      setSyncingSmm(false);
    }
  };

  const handleSaveSmmSettings = async () => {
    try {
      const res = await fetch('/api/admin/smm/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(smmConfig)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Configurações do Módulo SMM salvas com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert(data.error || 'Erro ao salvar configurações.');
      }
    } catch (err) {
      alert('Erro ao salvar configurações SMM.');
    }
  };

  const handleToggleSmmService = async (serviceId: number) => {
    try {
      const res = await fetch('/api/admin/smm/service/toggle', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ serviceId })
      });
      const data = await res.json();
      if (data.success) {
        setSmmServices(prev => prev.map(s => s.serviceId === serviceId ? { ...s, enabled: data.enabled } : s));
      }
    } catch (err) {
      console.error('Erro ao alternar serviço:', err);
    }
  };

  const handleAddBanIp = async () => {
    if (!newBanIp.trim()) return;
    const updated = Array.from(new Set([...(smmConfig.bannedIps || []), newBanIp.trim()]));
    const newCfg = { ...smmConfig, bannedIps: updated };
    setSmmConfig(newCfg);
    setNewBanIp('');

    await fetch('/api/admin/smm/config', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(newCfg)
    });
    setSuccessMsg(`IP ${newBanIp} adicionado à lista de bloqueio.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemoveBanIp = async (ipToRemove: string) => {
    const updated = (smmConfig.bannedIps || []).filter(ip => ip !== ipToRemove);
    const newCfg = { ...smmConfig, bannedIps: updated };
    setSmmConfig(newCfg);

    await fetch('/api/admin/smm/config', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(newCfg)
    });
  };

  const handleResetSmmTrials = async () => {
    if (!confirm('Deseja resetar e liberar todos os cooldowns de testes grátis agora?')) return;
    try {
      const res = await fetch('/api/admin/smm/reset-trials', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Cooldowns de teste resetados e liberados!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Erro ao resetar cooldowns.');
    }
  };

  const handleUpdateSmmOrderStatus = async (orderId: string, status: SmmOrder['status']) => {
    try {
      const res = await fetch('/api/admin/smm/order/status', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ orderId, status })
      });
      const data = await res.json();
      if (data.success) {
        setSmmOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        setSuccessMsg(`Status do pedido #${orderId} alterado para ${status}`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Erro ao atualizar status do pedido.');
    }
  };



  // Filtered lists
  const filteredVisitors = visitors.filter(v =>
    v.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.userName && v.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.userEmail && v.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.userId && v.userId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = users.filter(u =>
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAccesses = generatedAccesses.filter(a =>
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.userName && a.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    a.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-300 font-bold text-sm">Carregando dados em Tempo Real do Painel Admin...</p>
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
                ADMINISTRAÇÃO MASTER (TEMPO REAL)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                AO VIVO
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">Painel de Monitoramento StreamHub VIP</h2>
            <p className="text-xs text-slate-400">Administrador: ronisouza495@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
            title="Atualizar em tempo real a cada 10s"
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>Tempo Real: {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => loadAdminData()}
            className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold border border-purple-500/30 transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-purple-400" />
            <span>Atualizar Agora</span>
          </button>
        </div>
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
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Visão Geral & Métricas
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'support'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Chat & Atendimento</span>
          {stats?.unreadMessagesCount ? (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
              {stats.unreadMessagesCount}
            </span>
          ) : (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
              {supportChats.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('visitors')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'visitors'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          Visitas & Navegadores ({visitors.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários Cadastrados ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('accesses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'accesses'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Key className="w-4 h-4 text-amber-300" />
          Logins Gerados ({generatedAccesses.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          Vendas Netflix ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          Contas & Link Ton
        </button>
      </div>

      {/* TAB: SMM API & CATALOG CONFIGURATION */}
      {activeTab === 'smm' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* TOP METRICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Total Usuários
              </span>
              <p className="text-xl font-black text-white font-mono">
                {stats?.totalUsers || users.length}
              </p>
              <p className="text-[10px] text-slate-500">Cadastrados na base</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Solicitações Teste
              </span>
              <p className="text-xl font-black text-cyan-400 font-mono">
                {smmOrders.length}
              </p>
              <p className="text-[10px] text-slate-500">Pedidos de teste gerados</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Serviços Sincronizados
              </span>
              <p className="text-xl font-black text-emerald-400 font-mono">
                {smmConfig.lastServicesCount || smmServices.length}
              </p>
              <p className="text-[10px] text-slate-500">{smmServices.filter(s => s.enabled).length} serviços ativos</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Saldo da API
              </span>
              <p className="text-xl font-black text-amber-300 font-mono">
                R$ {smmConfig.lastApiBalance || smmBalance?.balance || '0.00'}
              </p>
              <p className="text-[10px] text-slate-500">Provedor Verified Atacado</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-sky-400" /> Status da API
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${smmBalance?.online ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                  {smmBalance?.online ? '● ONLINE' : '○ OFFLINE'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{smmBalance?.latencyMs || 0}ms</span>
              </div>
              <p className="text-[10px] text-slate-500">Resposta em tempo real</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Última Sincronização
              </span>
              <p className="text-xs font-bold text-slate-200 font-mono mt-1 truncate">
                {smmConfig.lastSyncAt ? new Date(smmConfig.lastSyncAt).toLocaleString('pt-BR') : 'Ainda não sincronizado'}
              </p>
              <p className="text-[10px] text-slate-500">Catálogo do Fornecedor</p>
            </div>

          </div>

          {/* MAIN API CONFIGURATION & ACTIONS CARD */}
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 space-y-6 shadow-xl shadow-cyan-950/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  <span>Configurações da API SMM</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gerencie a credencial do provedor Verified Atacado, teste de conexão e sincronização do catálogo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestApiConnection}
                  disabled={testingConnection}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Activity className={`w-4 h-4 ${testingConnection ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                  <span>{testingConnection ? 'Testando Conexão...' : 'Testar Conexão'}</span>
                </button>

                <button
                  onClick={handleSyncSmmServices}
                  disabled={syncingSmm}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncingSmm ? 'animate-spin' : ''}`} />
                  <span>{syncingSmm ? 'Sincronizando...' : 'Atualizar Catálogo'}</span>
                </button>

                <button
                  onClick={handleResetSmmTrials}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
                  title="Libera o cooldown de 24h para você e outros usuários realizarem novos testes"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Liberar Cooldowns</span>
                </button>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* URL da API */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  URL da API <span className="text-cyan-400">(Padrão: https://verifiedatacado.com/api/v2)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={smmConfig.apiUrl}
                    onChange={(e) => setSmmConfig({ ...smmConfig, apiUrl: e.target.value })}
                    placeholder="https://verifiedatacado.com/api/v2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <Server className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* API Key */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  API Key <span className="text-slate-500">(Armazenada de forma segura no backend)</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={smmConfig.apiKey}
                    onChange={(e) => setSmmConfig({ ...smmConfig, apiKey: e.target.value })}
                    placeholder="Insira sua chave de API aqui..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1 transition-colors"
                    title={showApiKey ? 'Ocultar API Key' : 'Exibir API Key'}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Intervalo do Teste Grátis (Horas) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Intervalo de Teste (Horas)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={smmConfig.cooldownHours}
                  onChange={(e) => setSmmConfig({ ...smmConfig, cooldownHours: parseInt(e.target.value) || 24 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Bloqueio de solicitações por {smmConfig.cooldownHours}h</p>
              </div>

              {/* Quantidade por Teste Grátis */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Quantidade por Teste
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={smmConfig.freeTrialQty}
                  onChange={(e) => setSmmConfig({ ...smmConfig, freeTrialQty: parseInt(e.target.value) || 50 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Ex: 50 curtidas/seguidores grátis</p>
              </div>

              {/* Save Button */}
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={handleSaveSmmSettings}
                  className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações da API</span>
                </button>
              </div>

            </div>

            {/* TEST CONNECTION FEEDBACK CARD */}
            {connectionFeedback && (
              <div className={`p-5 rounded-2xl border ${connectionFeedback.online ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'} space-y-3 animate-in fade-in duration-300`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    {connectionFeedback.online ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-extrabold text-sm text-white">
                      {connectionFeedback.online ? 'Conexão com a API Estabelecida com Sucesso!' : 'Falha na Conexão com a API SMM'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Verificado em: {connectionFeedback.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                    <strong className={connectionFeedback.online ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {connectionFeedback.online ? '● ONLINE' : '○ OFFLINE'}
                    </strong>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Saldo Retornado</span>
                    <strong className="text-white">
                      R$ {connectionFeedback.balance || '0.00'}
                    </strong>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Serviços no Provedor</span>
                    <strong className="text-cyan-400">
                      {connectionFeedback.servicesCount || 0} Serviços
                    </strong>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Tempo de Resposta</span>
                    <strong className="text-amber-300">
                      {connectionFeedback.latencyMs || 0}ms
                    </strong>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-300 pt-1">
                  {connectionFeedback.message || connectionFeedback.error}
                </p>
              </div>
            )}

            {/* IP BAN LIST */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Bloqueio de IPs & Usuários Abusivos ({smmConfig.bannedIps?.length || 0})</span>
              </h4>

              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Digitar IP a ser banido (ex: 187.12.34.56)..."
                  value={newBanIp}
                  onChange={(e) => setNewBanIp(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono"
                />
                <button
                  onClick={handleAddBanIp}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
                >
                  Banir IP
                </button>
              </div>

              {smmConfig.bannedIps && smmConfig.bannedIps.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {smmConfig.bannedIps.map((ip) => (
                    <span
                      key={ip}
                      className="bg-rose-950/80 border border-rose-800 text-rose-300 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-2"
                    >
                      <span>{ip}</span>
                      <button
                        onClick={() => handleRemoveBanIp(ip)}
                        className="text-rose-400 hover:text-white"
                        title="Desbloquear IP"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* CATEGORY MANAGEMENT PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ListFilter className="w-5 h-5 text-cyan-400" />
                  <span>Gerenciamento de Categorias do Catálogo</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ative ou desative categorias inteiras do catálogo exibido para os clientes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {Array.from(new Set(smmServices.map(s => s.category))).map((cat: string) => {
                const count = smmServices.filter(s => s.category === cat).length;
                const isDisabled = (smmConfig.disabledCategories || []).includes(cat);

                return (
                  <div
                    key={cat}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${isDisabled ? 'bg-slate-950/60 border-rose-900/50 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-xs block truncate text-white">{cat}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{count} serviços vinculados</span>
                    </div>

                    <button
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex-shrink-0 ${isDisabled ? 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'}`}
                    >
                      {isDisabled ? 'Oculta' : 'Ativa'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SMM ORDERS MANAGEMENT TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Gerenciamento Global de Pedidos de Teste Grátis</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Total: {smmOrders.length} Solicitações</span>
            </div>

            {smmOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum pedido de teste grátis registrado no sistema.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">ID Pedido</th>
                      <th className="py-2.5 px-3">Cliente / Email</th>
                      <th className="py-2.5 px-3">Serviço</th>
                      <th className="py-2.5 px-3">Link Destino</th>
                      <th className="py-2.5 px-3 text-center">Qtd</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Data/Hora</th>
                      <th className="py-2.5 px-3 text-right">Alterar Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {smmOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                          #{ord.id}
                          {ord.supplierOrderId && (
                            <span className="block text-[10px] text-slate-500">API: #{ord.supplierOrderId}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white block">{ord.userEmail}</span>
                          <span className="text-[10px] text-slate-500 font-mono">User ID: {ord.userId}</span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <span className="font-bold text-slate-200 block truncate">{ord.serviceName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{ord.category}</span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <a
                            href={ord.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline truncate block flex items-center gap-1"
                          >
                            <span className="truncate max-w-[160px]">{ord.link}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                          {ord.quantity}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateSmmOrderStatus(ord.id, e.target.value as SmmOrder['status'])}
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            <option value="PROCESSANDO">PROCESSANDO</option>
                            <option value="CONCLUIDO">CONCLUIDO</option>
                            <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
                            <option value="PENDENTE_APROVACAO">PENDENTE_APROVACAO</option>
                            <option value="PARCIAL">PARCIAL</option>
                            <option value="CANCELADO">CANCELADO</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SMM SYNC & AUDIT LOGS TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span>Logs de Auditoria & Sincronização SMM</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Últimos {smmConfig.syncLogs?.length || 0} Registros</span>
            </div>

            {(!smmConfig.syncLogs || smmConfig.syncLogs.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum log de sincronização registrado até o momento.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Data/Hora</th>
                      <th className="py-2.5 px-3">Tipo / Nível</th>
                      <th className="py-2.5 px-3">Mensagem</th>
                      <th className="py-2.5 px-3">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {smmConfig.syncLogs.slice(0, 50).map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '-'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            log.level === 'ERROR' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-white font-sans font-medium">
                          {log.message}
                        </td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-xs">
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CATALOG INDIVIDUAL SERVICES ACTIVATION */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Ativação Individual de Serviços no Catálogo Público</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {smmServices.filter(s => s.enabled).length} de {smmServices.length} Ativos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">ID Serviço</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Nome do Serviço</th>
                    <th className="py-2.5 px-3 text-center">Taxa Original</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {smmServices.slice(0, 100).map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        #{srv.serviceId}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {srv.category}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white max-w-md truncate">
                        {srv.name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                        R$ {srv.originalRate.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${srv.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                          {srv.enabled ? 'ATIVO' : 'DESATIVADO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleToggleSmmService(srv.serviceId)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${srv.enabled ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800' : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'}`}
                        >
                          {srv.enabled ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Stat Cards */}
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
              <span className="text-[11px] text-slate-500">Clientes com Conta</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Acessos Prime Video</span>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
                {stats.primeAccessCount}
              </p>
              <span className="text-[11px] text-slate-500">Logins Liberados</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Acessos Paramount+</span>
              <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                {stats.paramountAccessCount || 0}
              </p>
              <span className="text-[11px] text-slate-500">Logins Gratuitos</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total de Entradas no Site</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                {stats.totalVisits}
              </p>
              <span className="text-[11px] text-slate-500">Acessos Registrados</span>
            </div>

          </div>

          {/* Browser and Device Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Chrome className="w-4 h-4 text-blue-400" />
                  Acessos no Chrome
                </span>
                <p className="text-2xl font-black text-blue-400 mt-1">{stats.chromeVisits}</p>
                <span className="text-[10px] text-slate-500">Total de Entradas Registradas</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Chrome className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  Visitantes Únicos (Chrome)
                </span>
                <p className="text-2xl font-black text-cyan-400 mt-1">{stats.uniqueChromeVisits || 0}</p>
                <span className="text-[10px] text-slate-500">IPs / Visitantes Distintos</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Cadastrados via Chrome
                </span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{stats.chromeRegisteredUsers || 0}</p>
                <span className="text-[10px] text-slate-500">Usuários Únicos Logados</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  Mobile vs Desktop
                </span>
                <p className="text-xl font-black text-purple-400 mt-1">{stats.mobileVisits} / {stats.desktopVisits}</p>
                <span className="text-[10px] text-slate-500">Celular / Computador</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">Monitoramento do Administrador Master</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Como administrador exclusivo (`ronisouza495@gmail.com`), este painel exibe em tempo real o histórico completo de visitantes, logins normais efetuados, usuários que geraram logins do Prime Video e mensagens de suporte.
            </p>
          </div>
        </div>
      )}

      {/* TAB: SUPPORT CHATS & ADMIN REPLIES */}
      {activeTab === 'support' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Atendimento ao Cliente em Tempo Real
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Responda diretamente às dúvidas dos usuários enviadas pelo Chatbot do site.
              </p>
            </div>
            <button
              onClick={() => loadAdminData(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              Atualizar Conversas
            </button>
          </div>

          {supportChats.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-950/50 rounded-2xl border border-slate-800/80">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
              <h4 className="text-sm font-bold text-white mb-1">Nenhuma mensagem recebida ainda</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Quando os clientes enviarem perguntas pelo assistente virtual no site, os tópicos e conversas aparecerão aqui organizadamente para você responder em tempo real.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
              {/* Left Column: User Chat List */}
              <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Clientes ({supportChats.length})
                </span>

                <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
                  {supportChats.map((chat) => {
                    const chatKey = chat.userId || chat.userEmail || 'guest';
                    const isSelected = selectedUserKey ? selectedUserKey === chatKey : supportChats[0] === chat;
                    const activeKey = selectedUserKey || supportChats[0]?.userId || supportChats[0]?.userEmail;

                    return (
                      <div
                        key={chatKey}
                        onClick={() => setSelectedUserKey(chatKey)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-950/60 border-purple-500/50 shadow-md shadow-purple-950/30'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30 uppercase">
                              {(chat.userName || 'C')[0]}
                            </div>
                            <span className="text-xs font-bold text-white truncate max-w-[140px]">
                              {chat.userName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(chat.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1 italic mb-1.5">
                          "{chat.lastMessage}"
                        </p>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 truncate max-w-[160px]">{chat.userEmail}</span>
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white font-black px-2 py-0.5 rounded-full text-[9px] animate-pulse">
                              {chat.unreadCount} nova(s)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Chat Window */}
              {(() => {
                const activeChat = supportChats.find(
                  c => (c.userId || c.userEmail || 'guest') === (selectedUserKey || supportChats[0]?.userId || supportChats[0]?.userEmail)
                ) || supportChats[0];

                if (!activeChat) return null;

                return (
                  <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Conversando com: {activeChat.userName}
                        </h4>
                        <span className="text-xs text-slate-400">{activeChat.userEmail}</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                        ID: {activeChat.userId}
                      </span>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-2 mb-4">
                      {activeChat.messages.map((m: any, idx: number) => {
                        const isUser = m.sender === 'user';
                        const isAdmin = m.sender === 'admin';

                        return (
                          <div
                            key={m.id || idx}
                            className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-slate-400">
                                {isUser ? activeChat.userName : isAdmin ? '👨‍💻 Você (Admin Roni)' : '🤖 Assistente Virtual'}
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div
                              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                                  : isAdmin
                                  ? 'bg-purple-600 text-white font-medium rounded-tr-none shadow-md shadow-purple-600/20'
                                  : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tr-none'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{m.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin Reply Box */}
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                      <textarea
                        rows={2}
                        placeholder={`Digite sua resposta em tempo real para ${activeChat.userName}...`}
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 italic">
                          O cliente receberá sua resposta instantaneamente no assistente do site.
                        </span>
                        <button
                          disabled={sendingReply || !adminReplyText.trim()}
                          onClick={() => handleSendAdminReply(activeChat.userId, activeChat.userEmail)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {sendingReply ? 'Enviando...' : 'Enviar Resposta ao Cliente'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* SEARCH BAR FOR TABLES */}
      {activeTab !== 'dashboard' && activeTab !== 'credentials' && (
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail, ID, IP ou navegador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
          />
        </div>
      )}

      {/* TAB 2: VISITORS & BROWSER LOGS */}
      {activeTab === 'visitors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-x-auto animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Entradas no Site em Tempo Real ({filteredVisitors.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Registra Chrome, Celular, IP e Usuários Logados
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 px-3">Data e Hora</th>
                <th className="pb-3 px-3">IP do Visitante</th>
                <th className="pb-3 px-3">Navegador</th>
                <th className="pb-3 px-3">Dispositivo</th>
                <th className="pb-3 px-3">Usuário Logado</th>
                <th className="pb-3 px-3">Página</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                    {new Date(v.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300">{v.ip}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-1 ${
                      v.browser === 'Google Chrome'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {v.browser === 'Google Chrome' && <Chrome className="w-3 h-3 text-blue-400" />}
                      {v.browser}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/80 text-slate-300">
                      {v.device}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {v.userEmail ? (
                      <div>
                        <strong className="block text-white">{v.userName || v.userEmail.split('@')[0]}</strong>
                        <span className="text-[10px] text-cyan-400 font-mono">{v.userEmail}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Visitante Não Logado</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{v.path}</td>
                </tr>
              ))}
              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhuma entrada registrada no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-x-auto animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Usuários Cadastrados / Logados ({filteredUsers.length})
            </h3>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 px-3">ID do Usuário</th>
                <th className="pb-3 px-3">Nome</th>
                <th className="pb-3 px-3">E-mail</th>
                <th className="pb-3 px-3">Último Login</th>
                <th className="pb-3 px-3">IP do Login</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Ações Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-300 text-[11px]">{u.id}</td>
                  <td className="py-3.5 px-3 text-white font-bold">{u.name}</td>
                  <td className="py-3.5 px-3 font-mono text-cyan-300">{u.email}</td>
                  <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR') : (u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : 'N/A')}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{u.lastIp || '127.0.0.1'}</td>
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

      {/* TAB 4: GENERATED LOGINS / ACCESS LOGS */}
      {activeTab === 'accesses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-x-auto animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-300" />
              Pessoas que Geraram Logins ({filteredAccesses.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Histórico completo de senhas liberadas (Prime Video / Netflix)
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 px-3">ID Acesso</th>
                <th className="pb-3 px-3">ID Usuário</th>
                <th className="pb-3 px-3">Nome / E-mail</th>
                <th className="pb-3 px-3">Serviço</th>
                <th className="pb-3 px-3">Credencial Liberada</th>
                <th className="pb-3 px-3">IP</th>
                <th className="pb-3 px-3">Data e Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccesses.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-mono font-bold text-purple-300 text-[11px]">{a.id}</td>
                  <td className="py-3 px-3 font-mono text-amber-300 text-[11px]">{a.userId}</td>
                  <td className="py-3 px-3">
                    <strong className="block text-white">{a.userName || 'Cliente VIP'}</strong>
                    <span className="text-[10px] text-cyan-400 font-mono">{a.userEmail}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      a.service === 'prime'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {a.service === 'prime' ? 'PRIME VIDEO' : 'NETFLIX VIP'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    <div>
                      <span className="text-emerald-400 font-bold">{a.credentials.email}</span>
                      <span className="text-slate-500 block text-[10px]">Senha: {a.credentials.password}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{a.userIp || '127.0.0.1'}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                    {new Date(a.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              {filteredAccesses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum acesso gerado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: NETFLIX PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-x-auto animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" />
              Pedidos de Vendas Netflix R$ 10,00 ({payments.length})
            </h3>
          </div>

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

      {/* TAB 6: CREDENTIALS POOL & TON LINK MANAGER */}
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

          {/* Paramount+ Config */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Credencial Paramount+ (Grátis)</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">E-mail Paramount+</label>
                <input
                  type="text"
                  value={paramountEmail}
                  onChange={(e) => setParamountEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Senha Paramount+</label>
                <input
                  type="text"
                  value={paramountPassword}
                  onChange={(e) => setParamountPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <p className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                Aviso exibido ao cliente: Esta conta gratuita do Paramount+ pode ser alterada ou parar de funcionar a qualquer momento sem aviso prévio.
              </p>

              <button
                onClick={() => handleSaveCredentials('paramount')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Credenciais Paramount+</span>
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
