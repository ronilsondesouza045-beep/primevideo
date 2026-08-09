import React, { useState, useEffect } from 'react';
import { Search, X, Package, Ticket as TicketIcon, ShoppingBag, Users, LayoutDashboard, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onNavigateTab: (tab: 'home' | 'catalog' | 'benefits' | 'accesses' | 'orders' | 'profile' | 'admin' | 'status' | 'tickets' | 'favorites') => void;
  onSelectProduct?: (productId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    products: any[];
    tickets: any[];
    orders: any[];
    users: any[];
    adminPages: any[];
  }>({
    products: [],
    tickets: [],
    orders: [],
    users: [],
    adminPages: []
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
          window.dispatchEvent(new CustomEvent('open-global-search'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ products: [], tickets: [], orders: [], users: [], adminPages: [] });
      return;
    }

    if (!query.trim()) {
      setResults({ products: [], tickets: [], orders: [], users: [], adminPages: [] });
      return;
    }

    const timer = setTimeout(() => {
      fetchSearchResults(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const fetchSearchResults = async (q: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasResults =
    results.products.length > 0 ||
    results.tickets.length > 0 ||
    results.orders.length > 0 ||
    results.users.length > 0 ||
    results.adminPages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-amber-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar produtos, pedidos, chamados, usuários ou páginas... (Ctrl + K)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Pesquisando base de dados...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-400 mb-2">Digite para iniciar a busca global no STREAMHUB VIP</p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
                <span className="bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-800">Netflix</span>
                <span className="bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-800">Prime Video</span>
                <span className="bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-800">IPTV</span>
                <span className="bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-800">Pedidos</span>
                <span className="bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-800">Suporte</span>
              </div>
            </div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-400">
              Nenhum resultado encontrado para "<span className="text-slate-200">{query}</span>".
            </div>
          )}

          {/* PRODUCTS SECTION */}
          {!loading && results.products.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5 text-red-500" />
                <span>Produtos & Catálogo ({results.products.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigateTab('catalog');
                      if (onSelectProduct) onSelectProduct(p.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {p.category} • {p.price === 0 ? 'GRÁTIS' : `R$ ${p.price.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN PAGES SECTION */}
          {!loading && results.adminPages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Páginas Administrativas</span>
              </div>
              <div className="space-y-1.5">
                {results.adminPages.map((pg, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigateTab('admin');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition flex items-center justify-between group"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
                      {pg.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      /admin?tab={pg.tab}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TICKETS SECTION */}
          {!loading && results.tickets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                <TicketIcon className="w-3.5 h-3.5" />
                <span>Chamados de Suporte</span>
              </div>
              <div className="space-y-1.5">
                {results.tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigateTab('tickets');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        #{t.id.slice(-6)} - {t.subject}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Status: <span className="text-amber-400 font-bold">{t.status}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS SECTION */}
          {!loading && results.orders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Pedidos & Pagamentos</span>
              </div>
              <div className="space-y-1.5">
                {results.orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onNavigateTab('orders');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Pedido #{o.id.slice(-8)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {o.userEmail} • R$ {(o.amount || 0).toFixed(2)} ({o.status})
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* USERS SECTION */}
          {!loading && results.users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Usuários Cadastrados</span>
              </div>
              <div className="space-y-1.5">
                {results.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onNavigateTab('admin');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {u.name} ({u.email})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cargo: <span className="text-amber-400 font-bold uppercase">{u.role}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Shortcuts Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            Atalhos: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Ctrl + K</kbd> Pesquisar • <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">ESC</kbd> Fechar
          </span>
          <span className="text-slate-400 font-medium hidden sm:inline">STREAMHUB VIP PROFESSIONAL+</span>
        </div>

      </div>
    </div>
  );
};
