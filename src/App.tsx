import React, { useState, useEffect } from 'react';
import { User, ServiceCredentials, AccessLog, PaymentRecord } from './types';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Hero } from './components/Hero';
import { ServiceCards } from './components/ServiceCards';
import { CatalogPage } from './components/CatalogPage';
import { BenefitsPage } from './components/BenefitsPage';
import { UserProfile } from './components/UserProfile';
import { PrimeModal } from './components/PrimeModal';
import { ParamountModal } from './components/ParamountModal';
import { CrunchyrollModal } from './components/CrunchyrollModal';
import { NetflixModal } from './components/NetflixModal';
import { FreeFireModal } from './components/FreeFireModal';
import { IptvModal } from './components/IptvModal';
import { ServiceReviewsModal } from './components/ServiceReviewsModal';
import { UserAccesses } from './components/UserAccesses';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { SupportChatbot } from './components/SupportChatbot';
import { OfflineBanner } from './components/OfflineBanner';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SupportTickets } from './components/SupportTickets';
import { SystemStatusPage } from './components/SystemStatusPage';
import { FavoritesPage } from './components/FavoritesPage';
import { Tv } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'benefits' | 'accesses' | 'orders' | 'profile' | 'admin' | 'status' | 'tickets' | 'favorites'>('catalog');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

  // ETAPA 2 Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  // Modals state
  const [isIptvModalOpen, setIsIptvModalOpen] = useState(false);
  const [primeCreds, setPrimeCreds] = useState<ServiceCredentials | null>(null);
  const [paramountCreds, setParamountCreds] = useState<ServiceCredentials | null>(null);
  const [crunchyrollCreds, setCrunchyrollCreds] = useState<ServiceCredentials | null>(null);
  const [selectedReviewService, setSelectedReviewService] = useState<'prime' | 'paramount' | 'freefire' | 'crunchyroll' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Free Fire Modal & Stock State
  const [freeFireResult, setFreeFireResult] = useState<{
    code?: string;
    message: string;
    success: boolean;
    outOfStock?: boolean;
    alreadyClaimed?: boolean;
  } | null>(null);

  const [freeFireStock, setFreeFireStock] = useState<{
    total: number;
    available: number;
    claimed: number;
    outOfStock: boolean;
  }>({ total: 2, available: 2, claimed: 0, outOfStock: false });

  // Netflix Payment Modal state
  const [activePayment, setActivePayment] = useState<{
    id: string;
    status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
    tonLink: string;
    pixCode: string;
    credentials: ServiceCredentials | null;
  } | null>(null);

  // User History Data
  const [userAccessLogs, setUserAccessLogs] = useState<AccessLog[]>([]);
  const [userPayments, setUserPayments] = useState<PaymentRecord[]>([]);

  // Prime Video limit state
  const [primeBlocked, setPrimeBlocked] = useState(false);
  const [primeError, setPrimeError] = useState<string | null>(null);

  // Check Session & Statuses on Mount
  useEffect(() => {
    checkUserSession();
    checkPrimeStatus();
    checkFreeFireStatus();
    trackVisit();

    // Ctrl+K Global Search shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Track user presence heartbeat
    trackUserPresence();
    const presenceInterval = setInterval(trackUserPresence, 20000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(presenceInterval);
    };
  }, [user]);

  const trackUserPresence = async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('streamhub_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
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

  const checkFreeFireStatus = async () => {
    setFreeFireStock({
      total: 0,
      available: 0,
      claimed: 0,
      outOfStock: true
    });
  };

  const trackVisit = async () => {
    try {
      await fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname }),
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('streamhub_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const checkUserSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user) {
          localStorage.setItem('streamhub_user', JSON.stringify(data.user));
        }
        loadUserHistory();
        return;
      }
    } catch (err) {
      console.log('API auth check bypassed, checking local storage');
    }

    // Local Storage fallback for Vercel/Static deployment
    const savedUser = localStorage.getItem('streamhub_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const loadUserHistory = async () => {
    setPrimeBlocked(false);
    setPrimeError(null);

    const userEmailKey = user?.email ? user.email.toLowerCase() : 'guest';
    let logs: AccessLog[] = [];
    let pymts: PaymentRecord[] = [];

    // Check local storage first
    const localLogsRaw = localStorage.getItem(`streamhub_logs_${userEmailKey}`);
    if (localLogsRaw) {
      try { logs = JSON.parse(localLogsRaw); } catch (e) {}
    }

    const localPymtsRaw = localStorage.getItem(`streamhub_payments_${userEmailKey}`);
    if (localPymtsRaw) {
      try { pymts = JSON.parse(localPymtsRaw); } catch (e) {}
    }

    // Attempt API load
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

  const handleLogout = () => {
    localStorage.removeItem('streamhub_user');
    localStorage.removeItem('streamhub_token');
    setUser(null);
    setActiveTab('home');
  };

  // Generate Prime Credentials
  const handleGeneratePrime = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setPrimeBlocked(false);
    setPrimeError(null);

    try {
      let res = await fetch('/api/services/prime', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/services/generate-prime', {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
      const data = await res.json();
      const creds = data.credentials || data.access?.credentials;

      if (res.ok && creds) {
        setPrimeCreds(creds);
        loadUserHistory();
      } else {
        const fallbackCreds = {
          email: 'primevideosouza368@gmail.com',
          password: 'roni141821',
          pin: 'Sem PIN',
          screen: 'Livre / Escolha qualquer perfil'
        };
        setPrimeCreds(fallbackCreds);
        loadUserHistory();
      }
    } catch (err) {
      const fallbackCreds = {
        email: 'primevideosouza368@gmail.com',
        password: 'roni141821',
        pin: 'Sem PIN',
        screen: 'Livre / Escolha qualquer perfil'
      };
      setPrimeCreds(fallbackCreds);
      loadUserHistory();
    }
  };

  // Generate Paramount Credentials
  const handleGenerateParamount = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      let res = await fetch('/api/services/paramount', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/services/generate-paramount', {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
      const data = await res.json();
      const creds = data.credentials || data.access?.credentials;

      if (res.ok && creds) {
        setParamountCreds(creds);
        loadUserHistory();
      } else {
        const fallbackCreds = {
          email: 'olivia8515@web-library.net',
          password: '4400988',
          screen: 'Perfil Livre / Gratuito'
        };
        setParamountCreds(fallbackCreds);
        loadUserHistory();
      }
    } catch (err) {
      const fallbackCreds = {
        email: 'olivia8515@web-library.net',
        password: '4400988',
        screen: 'Perfil Livre / Gratuito'
      };
      setParamountCreds(fallbackCreds);
      loadUserHistory();
    }
  };

  // Generate Crunchyroll Credentials
  const handleGenerateCrunchyroll = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      let res = await fetch('/api/services/crunchyroll', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/services/generate-crunchyroll', {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
      const data = await res.json();
      const creds = data.credentials || data.access?.credentials;

      if (res.ok && creds) {
        setCrunchyrollCreds(creds);
        loadUserHistory();
      } else {
        const fallbackCreds = {
          email: 'skeespq11@hotmail.com',
          password: '12344321',
          screen: 'Perfil Livre / Gratuito'
        };
        setCrunchyrollCreds(fallbackCreds);
        loadUserHistory();
      }
    } catch (err) {
      const fallbackCreds = {
        email: 'skeespq11@hotmail.com',
        password: '12344321',
        screen: 'Perfil Livre / Gratuito'
      };
      setCrunchyrollCreds(fallbackCreds);
      loadUserHistory();
    }
  };

  // Claim Free Fire PIN
  const handleGenerateFreeFire = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/services/freefire', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      setFreeFireResult({
        code: data.code,
        message: data.message || data.error,
        success: res.ok && data.success,
        outOfStock: data.outOfStock,
        alreadyClaimed: data.alreadyClaimed
      });

      checkFreeFireStatus();
      loadUserHistory();
    } catch (err) {
      setFreeFireResult({
        message: 'Erro de conexão ao solicitar CODIGUIN Free Fire.',
        success: false
      });
    }
  };

  // Buy Netflix 4K Profile via Ton / Pix
  const handleBuyNetflix = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

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

  // Verify Payment Status
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}/status`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.ok && data.payment) {
        setActivePayment({
          id: data.payment.id,
          status: data.payment.status,
          tonLink: 'https://payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO',
          pixCode: data.payment.pixCode || '',
          credentials: data.payment.credentials || null
        });
        loadUserHistory();
      }
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
    }
  };

  // Simulate Payment Approval
  const handleSimulateApprove = async (paymentId: string) => {
    try {
      const res = await fetch('/api/payments/simulate-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActivePayment((prev) => prev ? {
          ...prev,
          status: 'APROVADO',
          credentials: data.credentials
        } : null);
        loadUserHistory();
      }
    } catch (err) {
      console.error('Erro ao simular aprovação:', err);
    }
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

  const handleSelectServiceFromCatalog = (serviceKey: string) => {
    if (serviceKey === 'prime') handleGeneratePrime();
    else if (serviceKey === 'paramount') handleGenerateParamount();
    else if (serviceKey === 'crunchyroll') handleGenerateCrunchyroll();
    else if (serviceKey === 'netflix') handleBuyNetflix();
    else if (serviceKey === 'iptv') setIsIptvModalOpen(true);
    else if (serviceKey === 'smm') setIsChatOpen(true);
    else if (serviceKey === 'freefire') handleGenerateFreeFire();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white flex flex-col justify-between">
      
      {/* Offline Status Connectivity Banner */}
      <OfflineBanner />

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifs={() => setIsNotifsOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-20 md:pb-8">
        {(activeTab === 'catalog' || activeTab === 'home') && (
          <CatalogPage
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSelectService={handleSelectServiceFromCatalog}
          />
        )}

        {activeTab === 'benefits' && (
          <BenefitsPage
            onOpenCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'profile' && user && (
          <UserProfile
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
          />
        )}

        {(activeTab === 'accesses' || activeTab === 'orders') && (
          <UserAccesses
            accessLogs={userAccessLogs}
            payments={userPayments}
            onRefresh={loadUserHistory}
            onOpenNetflixModal={handleOpenExistingPaymentModal}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesPage
            currentUser={user}
            onSelectService={handleSelectServiceFromCatalog}
          />
        )}

        {activeTab === 'tickets' && (
          <SupportTickets currentUser={user} />
        )}

        {activeTab === 'status' && (
          <SystemStatusPage />
        )}

        {activeTab === 'admin' && (
          <AdminPanel currentUser={user} />
        )}
      </main>

      {/* ETAPA 2 Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectService={(serviceKey) => {
          setIsSearchOpen(false);
          handleSelectServiceFromCatalog(serviceKey);
        }}
      />

      <NotificationsModal
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <span className="font-black text-slate-300">STREAMHUB VIP 2.0</span>
            <span>- Seu portal exclusivo de streaming e entretenimento.</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} STREAMHUB VIP 2.0. Todos os direitos reservados. Suporte: <span className="text-slate-300 font-bold">ronisouza495@gmail.com</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            loadUserHistory();
          }}
          onOpenForgotPassword={() => setIsForgotPassOpen(true)}
        />
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPassOpen}
        onClose={() => setIsForgotPassOpen(false)}
      />

      {/* Prime Video Released Credentials Modal */}
      {primeCreds && (
        <PrimeModal
          credentials={primeCreds}
          onClose={() => setPrimeCreds(null)}
          onOpenChat={() => {
            setPrimeCreds(null);
          }}
        />
      )}

      {/* Paramount+ Released Credentials Modal */}
      {paramountCreds && (
        <ParamountModal
          credentials={paramountCreds}
          onClose={() => setParamountCreds(null)}
          onOpenChat={() => {
            setParamountCreds(null);
          }}
        />
      )}

      {/* Crunchyroll Released Credentials Modal */}
      {crunchyrollCreds && (
        <CrunchyrollModal
          credentials={crunchyrollCreds}
          onClose={() => setCrunchyrollCreds(null)}
          onOpenChat={() => {
            setCrunchyrollCreds(null);
            setIsChatOpen(true);
          }}
        />
      )}

      {/* Free Fire Codiguin PIN Modal */}
      {freeFireResult && (
        <FreeFireModal
          result={freeFireResult}
          onClose={() => setFreeFireResult(null)}
        />
      )}

      {/* Real-time Service Reviews Modal */}
      {selectedReviewService && (
        <ServiceReviewsModal
          service={selectedReviewService}
          currentUser={user}
          onClose={() => setSelectedReviewService(null)}
        />
      )}

      {/* Netflix Payment & Credentials Modal */}
      {activePayment && (
        <NetflixModal
          paymentId={activePayment.id}
          status={activePayment.status}
          tonLink={activePayment.tonLink}
          pixCode={activePayment.pixCode}
          credentials={activePayment.credentials}
          onClose={() => setActivePayment(null)}
          onVerifyPayment={handleVerifyPayment}
          onSimulateApprove={handleSimulateApprove}
        />
      )}

      {/* IPTV Generator & Catalog Modal */}
      <IptvModal
        isOpen={isIptvModalOpen}
        onClose={() => setIsIptvModalOpen(false)}
      />

      {/* Floating Support Chatbot */}
      <SupportChatbot 
        user={user} 
        onSavePrimeAccess={loadUserHistory} 
        isOpenExternal={isChatOpen}
        onToggleExternal={setIsChatOpen}
      />

    </div>
  );
}
