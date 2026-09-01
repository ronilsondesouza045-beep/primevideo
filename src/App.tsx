import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useModalStore } from './store/useModalStore';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './components/CatalogPage';
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
import { FloatingNetflixBot } from './components/FloatingNetflixBot';
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
    isChatOpen,
    openChat,
    toggleChat,
    setPrimeCreds,
    setParamountCreds,
    setCrunchyrollCreds,
    setChatGptCreds,
    setNetflixCreds,
    setSelectedReviewService,
    setFreeFireResult,
    setActivePayment
  } = useModalStore();

  const [activeTab, setActiveTab] = useState<'catalog' | 'benefits' | 'accesses' | 'profile' | 'admin' | 'status' | 'tickets' | 'favorites' | string>('catalog');
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
      const curUser = useAuthStore.getState().user;
      if (!token && !curUser?.email) return;

      const res = await fetch('/api/services/user-accesses', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(curUser?.email ? { 'x-user-email': curUser.email } : {})
        }
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

  // Service generation handlers with graceful fallback
  const handleGeneratePrime = async () => {
    if (!user) {
      openAuth();
      return;
    }

    if (primeBlocked) {
      alert(primeError || 'O serviço Prime Video está temporariamente suspenso por enquanto.');
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/services/generate-prime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(user.email ? { 'x-user-email': user.email } : {})
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.credentials) {
        setPrimeCreds(data.credentials);
        fetchUserAccesses();
      } else {
        alert(data?.error || primeError || 'O serviço Prime Video está temporariamente suspenso por enquanto.');
      }
    } catch (err) {
      alert(primeError || 'O serviço Prime Video está temporariamente suspenso por enquanto.');
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(user.email ? { 'x-user-email': user.email } : {})
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.credentials) {
        setParamountCreds(data.credentials);
        fetchUserAccesses();
      } else {
        const fallbackCreds = {
          email: 'olivia8515@web-library.net',
          password: '4400988',
          screen: 'Perfil Livre / Gratuito',
          warning: 'Aviso: A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.'
        };
        setParamountCreds(fallbackCreds);
        const localLog: any = {
          id: 'acc_' + Date.now(),
          userId: user.id,
          userEmail: user.email,
          service: 'paramount',
          credentials: fallbackCreds,
          createdAt: new Date().toISOString(),
          ip: '127.0.0.1'
        };
        setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
      }
    } catch (err) {
      const fallbackCreds = {
        email: 'olivia8515@web-library.net',
        password: '4400988',
        screen: 'Perfil Livre / Gratuito',
        warning: 'Aviso: A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.'
      };
      setParamountCreds(fallbackCreds);
      const localLog: any = {
        id: 'acc_' + Date.now(),
        userId: user.id,
        userEmail: user.email,
        service: 'paramount',
        credentials: fallbackCreds,
        createdAt: new Date().toISOString(),
        ip: '127.0.0.1'
      };
      setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(user.email ? { 'x-user-email': user.email } : {})
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.credentials) {
        setCrunchyrollCreds(data.credentials);
        fetchUserAccesses();
      } else {
        const fallbackCreds = {
          email: 'skeespq11@hotmail.com',
          password: '12344321',
          screen: 'Mega Fan VIP',
          warning: 'Aviso: A qualquer momento o e-mail e a senha do Crunchyroll podem ser alterados ou parar de funcionar sem aviso prévio.'
        };
        setCrunchyrollCreds(fallbackCreds);
        const localLog: any = {
          id: 'acc_' + Date.now(),
          userId: user.id,
          userEmail: user.email,
          service: 'crunchyroll',
          credentials: fallbackCreds,
          createdAt: new Date().toISOString(),
          ip: '127.0.0.1'
        };
        setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
      }
    } catch (err) {
      const fallbackCreds = {
        email: 'skeespq11@hotmail.com',
        password: '12344321',
        screen: 'Mega Fan VIP',
        warning: 'Aviso: A qualquer momento o e-mail e a senha do Crunchyroll podem ser alterados ou parar de funcionar sem aviso prévio.'
      };
      setCrunchyrollCreds(fallbackCreds);
      const localLog: any = {
        id: 'acc_' + Date.now(),
        userId: user.id,
        userEmail: user.email,
        service: 'crunchyroll',
        credentials: fallbackCreds,
        createdAt: new Date().toISOString(),
        ip: '127.0.0.1'
      };
      setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(user.email ? { 'x-user-email': user.email } : {})
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.credentials) {
        setChatGptCreds(data.credentials);
        fetchUserAccesses();
      } else {
        const fallbackCreds = {
          email: 'gatomemu22@gmail.com',
          password: '14182131rr',
          screen: 'ChatGPT Pro GPT-4o (Login Google)',
          warning: 'Aviso: Esta conta do ChatGPT Plus/Pro é vinculada ao Google. Faça login escolhendo "Continuar com o Google".'
        };
        setChatGptCreds(fallbackCreds);
        const localLog: any = {
          id: 'acc_' + Date.now(),
          userId: user.id,
          userEmail: user.email,
          service: 'chatgpt',
          credentials: fallbackCreds,
          createdAt: new Date().toISOString(),
          ip: '127.0.0.1'
        };
        setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
      }
    } catch (err) {
      const fallbackCreds = {
        email: 'gatomemu22@gmail.com',
        password: '14182131rr',
        screen: 'ChatGPT Pro GPT-4o (Login Google)',
        warning: 'Aviso: Esta conta do ChatGPT Plus/Pro é vinculada ao Google. Faça login escolhendo "Continuar com o Google".'
      };
      setChatGptCreds(fallbackCreds);
      const localLog: any = {
        id: 'acc_' + Date.now(),
        userId: user.id,
        userEmail: user.email,
        service: 'chatgpt',
        credentials: fallbackCreds,
        createdAt: new Date().toISOString(),
        ip: '127.0.0.1'
      };
      setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
    }
  };

  const handleGenerateNetflix = async () => {
    if (!user) {
      openAuth();
      return;
    }

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/services/generate-netflix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(user.email ? { 'x-user-email': user.email } : {})
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.credentials) {
        setNetflixCreds(data.credentials);
        fetchUserAccesses();
      } else {
        const fallbackCreds = {
          email: 'prine1070@gmail.com',
          password: 'roni141821',
          screen: 'Perfil Livre / VIP',
          pin: '1418',
          warning: 'Acesso 100% Gratuito! Para códigos de TV ou confirmação de residência na Smart TV, use a busca de código em tempo real abaixo sem limites.'
        };
        setNetflixCreds(fallbackCreds);
        const localLog: any = {
          id: 'acc_' + Date.now(),
          userId: user.id,
          userEmail: user.email,
          service: 'netflix',
          credentials: fallbackCreds,
          createdAt: new Date().toISOString(),
          ip: '127.0.0.1'
        };
        setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
      }
    } catch (err) {
      const fallbackCreds = {
        email: 'prine1070@gmail.com',
        password: 'roni141821',
        screen: 'Perfil Livre / VIP',
        pin: '1418',
        warning: 'Acesso 100% Gratuito! Para códigos de TV ou confirmação de residência na Smart TV, use a busca de código em tempo real abaixo sem limites.'
      };
      setNetflixCreds(fallbackCreds);
      const localLog: any = {
        id: 'acc_' + Date.now(),
        userId: user.id,
        userEmail: user.email,
        service: 'netflix',
        credentials: fallbackCreds,
        createdAt: new Date().toISOString(),
        ip: '127.0.0.1'
      };
      setUserAccessLogs([localLog, ...userAccessLogs.filter(p => p.id !== localLog.id)]);
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
    if (serviceKey === 'prime') handleGeneratePrime();
    else if (serviceKey === 'paramount') handleGenerateParamount();
    else if (serviceKey === 'crunchyroll') handleGenerateCrunchyroll();
    else if (serviceKey === 'chatgpt') handleGenerateChatGpt();
    else if (serviceKey === 'iptv') openIptvModal();
    else if (serviceKey === 'netflix') handleGenerateNetflix();
    else if (serviceKey === 'freefire') handleGenerateFreeFire();
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
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white pb-16 md:pb-0 relative overflow-x-hidden">
      {/* Ambient background glow & tech grid */}
      <div className="fixed inset-0 bg-tech-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-gradient pointer-events-none z-0" />
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
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
          {(activeTab === 'catalog' || activeTab === 'home') && (
            <CatalogPage
              user={user}
              onOpenAuth={openAuth}
              onSelectService={handleSelectServiceFromCatalog}
            />
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

        {/* Floating Netflix Code Bot (Available to all visitors on the front screen) */}
        <FloatingNetflixBot defaultEmail="prine1070@gmail.com" />

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
        <footer className="border-t border-white/5 bg-slate-950/60 backdrop-blur-md py-10 mt-16">
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
              Plataforma VIP de entretenimento e streaming com liberação instantânea de acessos 24 horas por dia.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">Catálogo VIP</button>
              {user && (
                <button onClick={() => setActiveTab('accesses')} className="hover:text-white transition-colors">Meus Acessos</button>
              )}
            </div>
            <div className="text-[11px] text-slate-500 pt-4 border-t border-white/5 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>© 2026 StreamHub VIP — Conectividade segura e garantida.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
