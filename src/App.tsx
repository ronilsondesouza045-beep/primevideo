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
    try {
      const res = await fetch('/api/services/prime-status');
      if (res.ok) {
        const data = await res.json();
        if (data.blocked) {
          setPrimeBlocked(true);
          setPrimeError(data.errorMessage || '❌ BLOQUEADO: Você ou alguém da sua rede de internet (IP) já resgatou o acesso gratuito do Prime Video. Limite máximo atingido.');
        } else {
          setPrimeBlocked(false);
          setPrimeError(null);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status do Prime Video:', err);
    }
  };

  const checkUserSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadUserHistory();
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  const loadUserHistory = async () => {
    try {
      const res = await fetch('/api/services/user-accesses');
      if (res.ok) {
        const data = await res.json();
        setUserAccessLogs(data.accessLogs || []);
        setUserPayments(data.payments || []);
        if (data.primeBlocked) {
          setPrimeBlocked(true);
          setPrimeError('❌ BLOQUEADO: Você ou alguém da sua rede de internet (IP) já resgatou o acesso gratuito do Prime Video. Limite máximo atingido.');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
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

    try {
      const res = await fetch('/api/services/generate-prime', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.access) {
        setPrimeCreds(data.access.credentials);
        setPrimeBlocked(true);
        loadUserHistory();
      } else {
        const errorMsg = data.error || '❌ BLOQUEADO: Você ou alguém da sua rede de internet (IP) já resgatou o acesso gratuito do Prime Video. Limite máximo atingido.';
        setPrimeError(errorMsg);
        setPrimeBlocked(true);
      }
    } catch (err) {
      setPrimeError('Falha na comunicação com o servidor.');
    }
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
