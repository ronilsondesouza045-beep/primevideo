import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useModalStore } from './store/useModalStore';
import { ModalManager } from './components/ModalManager';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { CatalogPage } from './components/CatalogPage';
import { BenefitsPage } from './components/BenefitsPage';
import { UserProfile } from './components/UserProfile';
import { UserAccesses } from './components/UserAccesses';
import { FavoritesPage } from './components/FavoritesPage';
import { SupportTickets } from './components/SupportTickets';
import { SystemStatusPage } from './components/SystemStatusPage';
import { AdminPanel } from './components/AdminPanel';
import { SupportChatbot } from './components/SupportChatbot';
import { FreeToolsPage } from './components/FreeToolsPage';
import { Tv } from 'lucide-react';
import { AccessLog, PaymentRecord, ServiceCredentials } from './types';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, userAccessLogs, userPayments, setUserAccessLogs, setUserPayments, checkSession, logout, setUser } = useAuthStore();
  const {
    openAuth,
    openSearch,
    openNotifs,
    openChat,
    openIptvModal,
    setPrimeCreds,
    setParamountCreds,
    setCrunchyrollCreds,
    setChatGptCreds,
    setFreeFireResult,
    setActivePayment,
    setSelectedReviewService
  } = useModalStore();

  const [primeBlocked, setPrimeBlocked] = useState(false);
  const [primeError, setPrimeError] = useState<string | null>(null);

  // Free Fire Stock State
  const [freeFireStock, setFreeFireStock] = useState({
    total: 2,
    available: 2,
    claimed: 0,
    outOfStock: false
  });

  // Calculate activeTab based on current pathname
  const getActiveTab = (): any => {
    const path = location.pathname;
    if (path === '/' || path === '/catalogo') return 'catalog';
    if (path === '/ferramentas-gratis' || path === '/catalogo-free') return 'free-tools';
    if (path === '/beneficios') return 'benefits';
    if (path === '/meus-acessos' || path === '/pedidos') return 'accesses';
    if (path === '/perfil') return 'profile';
    if (path === '/favoritos') return 'favorites';
    if (path.startsWith('/suporte')) return 'tickets';
    if (path === '/status') return 'status';
    if (path.startsWith('/admin')) return 'admin';
    return 'catalog';
  };

  const activeTab = getActiveTab();

  const setActiveTab = (tab: string) => {
    switch (tab) {
      case 'home':
      case 'catalog':
        navigate('/catalogo');
        break;
      case 'free-tools':
      case 'free':
      case 'ferramentas-gratis':
        navigate('/ferramentas-gratis');
        break;
      case 'benefits':
        navigate('/beneficios');
        break;
      case 'accesses':
      case 'orders':
        navigate('/meus-acessos');
        break;
      case 'profile':
        navigate('/perfil');
        break;
      case 'favorites':
        navigate('/favoritos');
        break;
      case 'tickets':
        navigate('/suporte');
        break;
      case 'status':
        navigate('/status');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/catalogo');
    }
  };

  // Check Session & Presence on Mount
  useEffect(() => {
    checkSession();
    checkPrimeStatus();
    trackVisit();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    trackUserPresence();
    const presenceInterval = setInterval(trackUserPresence, 20000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(presenceInterval);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadUserHistory();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('streamhub_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const trackUserPresence = async () => {
    try {
      const headers = getAuthHeaders();
      if (user?.email) headers['x-user-email'] = user.email;

      await fetch('/api/track-presence', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user?.id || 'guest',
          userName: user?.name || 'Visitante',
          userEmail: user?.email || 'visitante@streamhub.com',
          role: user?.role || 'client'
        })
      });
    } catch (e) {}
  };

  const trackVisit = async () => {
    try {
      await fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: location.pathname })
      });
    } catch (e) {}
  };

  const checkPrimeStatus = async () => {
    setPrimeBlocked(false);
    setPrimeError(null);
    try {
      await fetch('/api/services/prime-status');
    } catch (err) {}
  };

  const loadUserHistory = async () => {
    const userEmailKey = user?.email ? user.email.toLowerCase() : 'guest';
    let logs: AccessLog[] = [];
    let pymts: PaymentRecord[] = [];

    const localLogsRaw = localStorage.getItem(`streamhub_logs_${userEmailKey}`);
    if (localLogsRaw) {
      try { logs = JSON.parse(localLogsRaw); } catch (e) {}
    }

    const localPymtsRaw = localStorage.getItem(`streamhub_payments_${userEmailKey}`);
    if (localPymtsRaw) {
      try { pymts = JSON.parse(localPymtsRaw); } catch (e) {}
    }

    try {
      const res = await fetch('/api/user/accesses', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.accesses && data.accesses.length > 0) logs = data.accesses;
        if (data.payments && data.payments.length > 0) pymts = data.payments;
      }
    } catch (e) {}

    setUserAccessLogs(logs);
    setUserPayments(pymts);
  };

  // Generate Prime
  const handleGeneratePrime = async () => {
    if (!user) { openAuth(); return; }
    try {
      let res = await fetch('/api/services/prime', { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/services/generate-prime', { method: 'POST', headers: getAuthHeaders() });
      }
      const data = await res.json();
      const creds = data.credentials || data.access?.credentials;

      if (res.ok && creds) {
        setPrimeCreds(creds);
      } else {
        setPrimeCreds({
          email: 'primevideosouza368@gmail.com',
          password: 'roni141821',
          pin: 'Sem PIN',
          screen: 'Livre / Escolha qualquer perfil'
        });
      }
      loadUserHistory();
    } catch (e) {
      setPrimeCreds({
        email: 'primevideosouza368@gmail.com',
        password: 'roni141821',
        pin: 'Sem PIN',
        screen: 'Livre / Escolha qualquer perfil'
      });
      loadUserHistory();
    }
  };

  // Generate Paramount
  const handleGenerateParamount = async () => {
    if (!user) { openAuth(); return; }
    try {
      let res = await fetch('/api/services/paramount', { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/services/generate-paramount', { method: 'POST', headers: getAuthHeaders() });
      }
      const data = await res.json();
      const creds = data.credentials || data.access?.credentials;

      if (res.ok && creds) {
        setParamountCreds(creds);
      } else {
        setParamountCreds({
          email: 'olivia8515@web-library.net',
          password: '4400988',
          screen: 'Perfil Livre / Gratuito'
        });
      }
      loadUserHistory();
    } catch (e) {
      setParamountCreds({
        email: 'olivia8515@web-library.net',
        password: '4400988',
        screen: 'Perfil Livre / Gratuito'
      });
      loadUserHistory();
    }
  };

  // Generate Crunchyroll
  const handleGenerateCrunchyroll = async () => {
    if (!user) { openAuth(); return; }
    try {
      let res = await fetch('/api/services/crunchyroll', { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/services/generate-crunchyroll', { method: 'POST', headers: getAuthHeaders() });
      }
      const data = await res.json();
      const creds = data.credentials || data.access?.credentials;

      if (res.ok && creds) {
        setCrunchyrollCreds(creds);
      } else {
        setCrunchyrollCreds({
          email: 'skeespq11@hotmail.com',
          password: '12344321',
          screen: 'Perfil Livre / Gratuito'
        });
      }
      loadUserHistory();
    } catch (e) {
      setCrunchyrollCreds({
        email: 'skeespq11@hotmail.com',
        password: '12344321',
        screen: 'Perfil Livre / Gratuito'
      });
      loadUserHistory();
    }
  };

  // Generate ChatGPT
  const handleGenerateChatGpt = async () => {
    if (!user) { openAuth(); return; }
    try {
      let res = await fetch('/api/services/chatgpt', { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/services/generate-chatgpt', { method: 'POST', headers: getAuthHeaders() });
      }
      const data = await res.json();
      const creds = data.credentials || data.access?.credentials;

      if (res.ok && creds) {
        setChatGptCreds(creds);
      } else {
        setChatGptCreds({
          email: 'souzaroni187@gmail.com',
          password: 'gatodebota123',
          screen: 'ChatGPT Pro GPT-4o'
        });
      }
      loadUserHistory();
    } catch (e) {
      setChatGptCreds({
        email: 'souzaroni187@gmail.com',
        password: 'gatodebota123',
        screen: 'ChatGPT Pro GPT-4o'
      });
      loadUserHistory();
    }
  };

  // Generate Free Fire
  const handleGenerateFreeFire = async () => {
    if (!user) { openAuth(); return; }
    try {
      const res = await fetch('/api/services/freefire', { method: 'POST', headers: getAuthHeaders() });
      const data = await res.json();

      setFreeFireResult({
        code: data.code,
        message: data.message || data.error,
        success: res.ok && data.success,
        outOfStock: data.outOfStock,
        alreadyClaimed: data.alreadyClaimed
      });
      loadUserHistory();
    } catch (e) {
      setFreeFireResult({
        message: 'Erro de conexão ao solicitar CODIGUIN Free Fire.',
        success: false
      });
    }
  };

  // Buy Netflix
  const handleBuyNetflix = async () => {
    if (!user) { openAuth(); return; }
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: 10.00 })
      });
      const data = await res.json();

      if (res.ok && data.payment) {
        setActivePayment({
          id: data.payment.id,
          status: data.payment.status,
          tonLink: data.tonLink || 'https://payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO',
          pixCode: data.pixCode || '',
          credentials: data.payment.credentials || null
        });
        loadUserHistory();
      } else {
        alert(data.error || 'Erro ao gerar pedido de pagamento.');
      }
    } catch (err) {
      alert('Erro ao processar solicitação de pagamento.');
    }
  };

  const handleSelectServiceFromCatalog = (serviceKey: string) => {
    if (serviceKey === 'prime') handleGeneratePrime();
    else if (serviceKey === 'paramount') handleGenerateParamount();
    else if (serviceKey === 'crunchyroll') handleGenerateCrunchyroll();
    else if (serviceKey === 'chatgpt') handleGenerateChatGpt();
    else if (serviceKey === 'netflix') handleBuyNetflix();
    else if (serviceKey === 'iptv') openIptvModal();
    else if (serviceKey === 'smm') openChat();
    else if (serviceKey === 'freefire') handleGenerateFreeFire();
  };

  const handleOpenExistingPaymentModal = (p: PaymentRecord) => {
    setActivePayment({
      id: p.id,
      status: p.status,
      tonLink: 'https://payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO',
      pixCode: p.pixCode || '',
      credentials: p.credentials || null
    });
  };

  const isAdmin = user?.email?.toLowerCase() === 'ronisouza495@gmail.com' || ['admin', 'super_admin'].includes(user?.role || '');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white flex flex-col justify-between">
      
      {/* Connectivity Banner */}
      <OfflineBanner />

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={openAuth}
        onLogout={logout}
        onOpenChat={openChat}
        onOpenSearch={openSearch}
        onOpenNotifs={openNotifs}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-20 md:pb-8">
        <Routes>
          <Route path="/" element={
            <CatalogPage
              user={user}
              onOpenAuth={openAuth}
              onSelectService={handleSelectServiceFromCatalog}
              primeBlocked={primeBlocked}
              primeError={primeError}
              freeFireStock={freeFireStock}
              onOpenReviews={setSelectedReviewService}
            />
          } />
          <Route path="/catalogo" element={
            <CatalogPage
              user={user}
              onOpenAuth={openAuth}
              onSelectService={handleSelectServiceFromCatalog}
              primeBlocked={primeBlocked}
              primeError={primeError}
              freeFireStock={freeFireStock}
              onOpenReviews={setSelectedReviewService}
            />
          } />
          <Route path="/beneficios" element={
            <BenefitsPage
              onOpenCatalog={() => navigate('/catalogo')}
            />
          } />
          <Route path="/ferramentas-gratis" element={<FreeToolsPage />} />
          <Route path="/catalogo-free" element={<FreeToolsPage />} />
          <Route path="/meus-acessos" element={
            <UserAccesses
              accessLogs={userAccessLogs}
              payments={userPayments}
              onRefresh={loadUserHistory}
              onOpenNetflixModal={handleOpenExistingPaymentModal}
            />
          } />
          <Route path="/perfil" element={
            user ? (
              <UserProfile
                user={user}
                onUpdateUser={(updated) => setUser(updated)}
              />
            ) : (
              <Navigate to="/catalogo" replace />
            )
          } />
          <Route path="/favoritos" element={
            <FavoritesPage
              currentUser={user}
              onSelectService={handleSelectServiceFromCatalog}
            />
          } />
          <Route path="/suporte" element={<SupportTickets currentUser={user} />} />
          <Route path="/suporte/:id" element={<SupportTickets currentUser={user} />} />
          <Route path="/status" element={<SystemStatusPage />} />
          
          {/* Protected Admin Route */}
          <Route path="/admin/*" element={
            isAdmin ? <AdminPanel currentUser={user} /> : <Navigate to="/catalogo" replace />
          } />

          <Route path="*" element={<Navigate to="/catalogo" replace />} />
        </Routes>
      </main>

      {/* Global Modal Manager */}
      <ModalManager
        onNavigate={setActiveTab}
        primeBlocked={primeBlocked}
        primeError={primeError}
        freeFireStock={freeFireStock}
      />

      {/* Support Chatbot */}
      <SupportChatbot />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={openAuth}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <span className="font-black text-slate-300">STREAMHUB VIP 2.0</span>
            <span>- Seu portal exclusivo de streaming e entretenimento.</span>
          </div>
          <div>
            © 2026 STREAMHUB VIP 2.0. Todos os direitos reservados. Suporte: <span className="text-slate-300 font-bold">ronisouza495@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
