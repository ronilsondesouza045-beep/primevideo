import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useModalStore } from './store/useModalStore';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCards } from './components/ServiceCards';
import { CatalogPage } from './components/CatalogPage';
import { FreeToolsPage } from './components/FreeToolsPage';
import { BenefitsPage } from './components/BenefitsPage';
import { UserAccesses } from './components/UserAccesses';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { SystemStatusPage } from './components/SystemStatusPage';
import { SupportTickets } from './components/SupportTickets';
import { FavoritesPage } from './components/FavoritesPage';
import { ModalManager } from './components/ModalManager';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { Product } from './types';
import { Tv, ShieldCheck, Heart, Sparkles, Flame, Radio } from 'lucide-react';

export default function App() {
  const { 
    user, 
    userAccessLogs, 
    userPayments, 
    setUser, 
    setUserAccessLogs, 
    setUserPayments, 
    checkSession, 
    logout 
  } = useAuthStore();

  const {
    openAuth,
    openSearch,
    openNotifs,
    openIptvModal,
    openTikTokLiveModal,
    isChatOpen,
    openChat,
    toggleChat,
    setPrimeCreds,
    setParamountCreds,
    setCrunchyrollCreds,
    setChatGptCreds,
    setSelectedReviewService,
    setFreeFireResult,
    setActivePayment
  } = useModalStore();

  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'free-tools' | 'benefits' | 'accesses' | 'profile' | 'admin' | 'status' | 'tickets' | 'favorites'>('home');
  const [primeBlocked, setPrimeBlocked] = useState(false);
  const [primeError, setPrimeError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [freeFireStock, setFreeFireStock] = useState({
    total: 2,
    available: 2,
    claimed: 0,
    outOfStock: false
  });

  // Track visit and check user session on mount
  useEffect(() => {
    checkSession();
    fetchUserAccesses();
    fetchProducts();
    trackVisit();
  }, []);

  const trackVisit = async () => {
    try {
      await fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname })
      });
    } catch (e) {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
      }
    } catch (e) {}
  };

  const fetchUserAccesses = useCallback(async () => {
    try {
      const token = localStorage.getItem('streamhub_token');
      if (!token) return;

      const res = await fetch('/api/services/user-accesses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessLogs) setUserAccessLogs(data.accessLogs);
        if (data.payments) setUserPayments(data.payments);
        if (data.primeBlocked !== undefined) setPrimeBlocked(data.primeBlocked);
      }
    } catch (e) {
      console.error('Erro ao carregar histórico de acessos:', e);
    }
  }, [setUserAccessLogs, setUserPayments]);

  // Check Prime limits / status
  const checkPrimeStatus = async () => {
    try {
      const res = await fetch('/api/services/prime-status');
      if (res.ok) {
        const data = await res.json();
        setPrimeBlocked(data.blocked || false);
        setPrimeError(data.errorMessage || null);
      }
    } catch (e) {}
  };

  useEffect(() => {
    checkPrimeStatus();
  }, [user]);

  // Service generation handlers
  const handleGeneratePrime = async () => {
    if (!user) {
      openAuth();
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/services/generate-prime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPrimeCreds(data.credentials);
        fetchUserAccesses();
      } else {
        alert(data.error || 'Não foi possível liberar o acesso ao Prime Video no momento.');
      }
    } catch (err) {
      alert('Erro de conexão ao gerar acesso ao Prime Video.');
    }
  };

  const handleGenerateParamount = async () => {
    if (!user) {
      openAuth();
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/services/generate-paramount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setParamountCreds(data.credentials);
        fetchUserAccesses();
      } else {
        alert(data.error || 'Não foi possível liberar o acesso ao Paramount+.');
      }
    } catch (err) {
      alert('Erro de conexão ao gerar acesso ao Paramount+.');
    }
  };

  const handleGenerateCrunchyroll = async () => {
    if (!user) {
      openAuth();
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/services/generate-crunchyroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCrunchyrollCreds(data.credentials);
        fetchUserAccesses();
      } else {
        alert(data.error || 'Não foi possível liberar o acesso ao Crunchyroll.');
      }
    } catch (err) {
      alert('Erro de conexão ao gerar acesso ao Crunchyroll.');
    }
  };

  const handleGenerateChatGpt = async () => {
    if (!user) {
      openAuth();
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/services/generate-chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChatGptCreds(data.credentials);
        fetchUserAccesses();
      } else {
        alert(data.error || 'Não foi possível liberar o acesso ao ChatGPT.');
      }
    } catch (err) {
      alert('Erro de conexão ao gerar acesso ao ChatGPT.');
    }
  };

  const handleBuyNetflix = async () => {
    if (!user) {
      openAuth();
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/payments/create-netflix-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActivePayment({
          id: data.paymentId,
          status: data.status,
          tonLink: data.tonPaymentLink,
          pixCode: data.pixCode,
          credentials: null
        });
        fetchUserAccesses();
      } else {
        alert(data.error || 'Erro ao gerar pedido de pagamento.');
      }
    } catch (err) {
      alert('Erro ao conectar ao servidor de pagamentos.');
    }
  };

  const handleGenerateFreeFire = async () => {
    if (!user) {
      openAuth();
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/services/generate-freefire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      setFreeFireResult(data);
      fetchUserAccesses();
    } catch (err) {
      setFreeFireResult({
        success: false,
        message: 'Erro ao resgatar PIN do Free Fire.'
      });
    }
  };

  const handleSelectServiceFromCatalog = (serviceKey: string) => {
    if (serviceKey === 'tiktok-live') openTikTokLiveModal();
    else if (serviceKey === 'prime') handleGeneratePrime();
    else if (serviceKey === 'paramount') handleGenerateParamount();
    else if (serviceKey === 'crunchyroll') handleGenerateCrunchyroll();
    else if (serviceKey === 'chatgpt') handleGenerateChatGpt();
    else if (serviceKey === 'iptv') openIptvModal();
    else if (serviceKey === 'netflix') handleBuyNetflix();
    else if (serviceKey === 'freefire') handleGenerateFreeFire();
    else if (serviceKey === 'free-tools') setActiveTab('free-tools');
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!user) {
      openAuth();
      return;
    }
    const curFavs = user.favorites || [];
    const updated = curFavs.includes(productId)
      ? curFavs.filter(id => id !== productId)
      : [...curFavs, productId];

    const updatedUser = { ...user, favorites: updated };
    setUser(updatedUser);

    try {
      const token = localStorage.getItem('streamhub_token');
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ favorites: updated })
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white pb-16 md:pb-0">
      <OfflineBanner />

      {/* Main Top Navigation */}
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

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <Hero 
              onGeneratePrime={handleGeneratePrime}
              onBuyNetflix={handleBuyNetflix}
            />
            <ServiceCards
              onGeneratePrime={handleGeneratePrime}
              onGenerateParamount={handleGenerateParamount}
              onGenerateCrunchyroll={handleGenerateCrunchyroll}
              onGenerateChatGpt={handleGenerateChatGpt}
              onGenerateFreeFire={handleGenerateFreeFire}
              onBuyNetflix={handleBuyNetflix}
              onGenerateIptv={openIptvModal}
              onOpenTikTokLive={openTikTokLiveModal}
              onOpenReviews={(service) => setSelectedReviewService(service)}
              primeBlocked={primeBlocked}
              primeError={primeError}
              freeFireStock={freeFireStock}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <CatalogPage
            user={user}
            onOpenAuth={openAuth}
            onSelectService={handleSelectServiceFromCatalog}
            primeBlocked={primeBlocked}
            primeError={primeError}
            freeFireStock={freeFireStock}
            onOpenReviews={(service) => setSelectedReviewService(service)}
          />
        )}

        {activeTab === 'free-tools' && (
          <FreeToolsPage />
        )}

        {activeTab === 'benefits' && (
          <BenefitsPage onOpenCatalog={() => setActiveTab('catalog')} />
        )}

        {activeTab === 'accesses' && (
          <UserAccesses
            accessLogs={userAccessLogs}
            payments={userPayments}
            onRefresh={fetchUserAccesses}
            onOpenNetflixModal={(payment) => {
              setActivePayment({
                id: payment.id,
                status: payment.status,
                tonLink: payment.tonTransactionId || '',
                pixCode: payment.pixCode || '',
                credentials: payment.credentials || null
              });
            }}
          />
        )}

        {activeTab === 'profile' && user && (
          <UserProfile
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel user={user} />
        )}

        {activeTab === 'status' && (
          <SystemStatusPage />
        )}

        {activeTab === 'tickets' && (
          <SupportTickets currentUser={user} />
        )}

        {activeTab === 'favorites' && (
          <FavoritesPage
            currentUser={user}
            products={products}
            onSelectProduct={() => setActiveTab('catalog')}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* Global Modals Manager */}
      <ModalManager
        onNavigate={(tab) => setActiveTab(tab as any)}
        primeBlocked={primeBlocked}
        primeError={primeError}
        freeFireStock={freeFireStock}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={openAuth}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/30">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              STREAMHUB <span className="text-red-500">VIP</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Plataforma de entretenimento, streaming e ferramentas com liberação instantânea de acessos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Início</button>
            <button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">Catálogo VIP</button>
            <button onClick={() => setActiveTab('free-tools')} className="hover:text-white transition-colors">Ferramentas Gratuitas</button>
            <button onClick={() => setActiveTab('benefits')} className="hover:text-white transition-colors">Benefícios & FAQ</button>
            <button onClick={() => setActiveTab('status')} className="hover:text-white transition-colors">Status do Sistema</button>
          </div>
          <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-900 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>© 2026 StreamHub VIP — Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
