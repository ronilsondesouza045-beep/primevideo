import React, { useState, useEffect } from 'react';
import { User, ServiceCredentials, AccessLog, PaymentRecord } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCards } from './components/ServiceCards';
import { PrimeModal } from './components/PrimeModal';
import { NetflixModal } from './components/NetflixModal';
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

  // Check Session & Prime Status on Mount
  useEffect(() => {
    checkUserSession();
    checkPrimeStatus();
  }, []);

  const checkPrimeStatus = async () => {
    setPrimeBlocked(false);
    setPrimeError(null);
    try {
      await fetch('/api/services/prime-status');
    } catch (err) {}
  };

  const checkUserSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
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
    try {
      const res = await fetch('/api/services/user-accesses');
      if (res.ok) {
        const data = await res.json();
        setUserAccessLogs(data.accessLogs || []);
        setUserPayments(data.payments || []);
        return;
      }
    } catch (err) {
      console.log('API history check bypassed, loading local storage logs');
    }

    // Local Storage fallback for history
    const userEmailKey = user?.email ? user.email.toLowerCase() : 'guest';
    const localLogsRaw = localStorage.getItem(`streamhub_logs_${userEmailKey}`);
    if (localLogsRaw) {
      try {
        setUserAccessLogs(JSON.parse(localLogsRaw));
      } catch (e) {}
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('streamhub_user');
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
      const res = await fetch('/api/services/generate-prime', { method: 'POST' });
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

    const updatedLogs = [newAccessLog, ...userAccessLogs];
    setUserAccessLogs(updatedLogs);
    localStorage.setItem(`streamhub_logs_${userEmailKey}`, JSON.stringify(updatedLogs));

    setPrimeCreds(defaultPrimeCredentials);
    setPrimeBlocked(false);
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
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onGeneratePrime={handleGeneratePrime}
              onBuyNetflix={handleBuyNetflix}
            />
            <ServiceCards
              onGeneratePrime={handleGeneratePrime}
              onBuyNetflix={handleBuyNetflix}
              primeBlocked={primeBlocked}
              primeError={primeError}
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
      <SupportChatbot user={user} />

    </div>
  );
}
