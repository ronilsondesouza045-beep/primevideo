import React, { useState, useEffect } from 'react';
import { User, ServiceCredentials, AccessLog, PaymentRecord } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCards } from './components/ServiceCards';
import { PrimeModal } from './components/PrimeModal';
import { ParamountModal } from './components/ParamountModal';
import { NetflixModal } from './components/NetflixModal';
import { FreeFireModal } from './components/FreeFireModal';
import { ServiceReviewsModal } from './components/ServiceReviewsModal';
import { UserAccesses } from './components/UserAccesses';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { SupportChatbot } from './components/SupportChatbot';
import { Tv, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'accesses' | 'admin'>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Modals state
  const [primeCreds, setPrimeCreds] = useState<ServiceCredentials | null>(null);
  const [paramountCreds, setParamountCreds] = useState<ServiceCredentials | null>(null);
  const [selectedReviewService, setSelectedReviewService] = useState<'prime' | 'paramount' | 'freefire' | null>(null);
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
  }, []);

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
      try {
        logs = JSON.parse(localLogsRaw);
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/services/user-accesses', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.accessLogs && data.accessLogs.length > 0) {
          const merged = [...data.accessLogs];
          logs.forEach((l) => {
            if (!merged.some((m) => m.id === l.id || m.service === l.service)) {
              merged.push(l);
            }
          });
          logs = merged;
        }
        if (data.payments) {
          pymts = data.payments;
        }
      }
    } catch (err) {
      console.log('API history check bypassed, loading local storage logs');
    }

    // Deduplicate logs strictly by service (1 card per service type)
    const uniqueLogs: AccessLog[] = [];
    const seenServices = new Set<string>();
    for (const log of logs) {
      if (!seenServices.has(log.service)) {
        seenServices.add(log.service);
        uniqueLogs.push(log);
      }
    }

    localStorage.setItem(`streamhub_logs_${userEmailKey}`, JSON.stringify(uniqueLogs));
    setUserAccessLogs(uniqueLogs);
    setUserPayments(pymts);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
    } catch (e) {}
    localStorage.removeItem('streamhub_user');
    localStorage.removeItem('streamhub_token');
    setUser(null);
    setActiveTab('home');
    setUserAccessLogs([]);
    setUserPayments([]);
    checkPrimeStatus();
  };

  // Generate Free Prime Video Access
  const handleGeneratePrime = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setPrimeError(null);
    setPrimeBlocked(false);

    const defaultPrimeCredentials = {
      email: 'primevideosouza368@gmail.com',
      password: 'roni141821',
      pin: 'Sem PIN',
      screen: 'Livre / Escolha qualquer perfil'
    };

    // 1. Try server API
    try {
      const res = await fetch('/api/services/generate-prime', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          setPrimeCreds(data.access.credentials);
          setPrimeBlocked(false);
          loadUserHistory();
          return;
        }
      }
    } catch (err) {
      console.log('Server API unreachable, executing robust client-side VIP Prime generation');
    }

    // 2. Client-side fallback (Guarantees instant generation on Vercel static sites)
    const userEmailKey = user.email.toLowerCase();

    const newAccessLog: AccessLog = {
      id: `acc_local_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      service: 'prime',
      credentials: defaultPrimeCredentials,
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newAccessLog, ...userAccessLogs.filter(l => l.service !== 'prime')];
    setUserAccessLogs(updatedLogs);
    localStorage.setItem(`streamhub_logs_${userEmailKey}`, JSON.stringify(updatedLogs));

    setPrimeCreds(defaultPrimeCredentials);
    setPrimeBlocked(false);
  };

  // Generate Free Paramount+ Access
  const handleGenerateParamount = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const defaultParamountCredentials = {
      email: 'olivia8515@web-library.net',
      password: '4400988',
      screen: 'Perfil Livre / Gratuito',
      warning: 'Aviso: A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.'
    };

    // 1. Try server API
    try {
      const res = await fetch('/api/services/generate-paramount', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          setParamountCreds(data.access.credentials);
          loadUserHistory();
          return;
        }
      }
    } catch (err) {
      console.log('Server API unreachable, executing client-side Paramount generation');
    }

    // 2. Client-side fallback
    const userEmailKey = user.email.toLowerCase();

    const newAccessLog: AccessLog = {
      id: `acc_paramount_local_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      service: 'paramount',
      credentials: defaultParamountCredentials,
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newAccessLog, ...userAccessLogs.filter(l => l.service !== 'paramount')];
    setUserAccessLogs(updatedLogs);
    localStorage.setItem(`streamhub_logs_${userEmailKey}`, JSON.stringify(updatedLogs));

    setParamountCreds(defaultParamountCredentials);
  };

  // Generate Free Fire Codiguin PIN (Temporarily blocked for maintenance)
  const handleGenerateFreeFire = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setFreeFireResult({
      message: '⚠️ O resgate de códigos do Free Fire está temporariamente suspenso para manutenção e atualização do sistema. Por favor, tente novamente em breve!',
      success: false,
      outOfStock: true
    });
  };

  // Buy Netflix Access (R$ 10,00) - Temporarily blocked / Em Breve
  const handleBuyNetflix = () => {
    alert('🔒 Acessos da Netflix temporariamente em reabastecimento!\n\nEm breve teremos novos logins Netflix VIP disponíveis nesta plataforma.\n\nAproveite e resgate seu Prime Video 100% GRATUITO no momento!');
  };

  // Verify Payment Status
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/verify/${paymentId}`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.approved) {
        setActivePayment((prev) => prev ? {
          ...prev,
          status: 'APROVADO',
          credentials: data.credentials
        } : null);
        loadUserHistory();
      }
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
    }
  };

  // Simulate Payment Approval for Demo Testing
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white flex flex-col justify-between">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16 md:pb-0">
        {activeTab === 'home' && (
          <>
            <Hero
              onGeneratePrime={handleGeneratePrime}
              onBuyNetflix={handleBuyNetflix}
            />
            <ServiceCards
              onGeneratePrime={handleGeneratePrime}
              onGenerateParamount={handleGenerateParamount}
              onGenerateFreeFire={handleGenerateFreeFire}
              onBuyNetflix={handleBuyNetflix}
              onOpenReviews={(srv) => setSelectedReviewService(srv)}
              primeBlocked={primeBlocked}
              primeError={primeError}
              freeFireStock={freeFireStock}
            />
          </>
        )}

        {activeTab === 'accesses' && (
          <UserAccesses
            accessLogs={userAccessLogs}
            payments={userPayments}
            onRefresh={loadUserHistory}
            onOpenNetflixModal={handleOpenExistingPaymentModal}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel currentUser={user} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <span className="font-bold text-slate-300">StreamHub VIP</span>
            <span>- Seu portal exclusivo de streaming e entretenimento.</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} StreamHub VIP. Todos os direitos reservados. Suporte: <span className="text-slate-300 font-bold">ronisouza495@gmail.com</span>
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
        />
      )}

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
