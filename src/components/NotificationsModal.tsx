import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCheck, X, ExternalLink, Info, CheckCircle2, 
  AlertTriangle, ShieldAlert, Sparkles, User, Tv, Film, 
  Settings, RefreshCw, Zap
} from 'lucide-react';
import { SystemNotification, User as UserType } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserType | null;
  user?: UserType | null;
  onNavigateTab?: (tab: any) => void;
  onUnreadCountChange?: (count: number) => void;
}

type CategoryFilter = 'all' | 'netflix' | 'streaming' | 'system';

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  user,
  onNavigateTab,
  onUnreadCountChange
}) => {
  const activeUser = user || currentUser;
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const fetchNotifications = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (activeUser?.email) headers['x-user-email'] = activeUser.email;

      const res = await fetch('/api/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n: SystemNotification) => !n.read).length;
          if (onUnreadCountChange) onUnreadCountChange(unread);
        }
      }
    } catch (e) {
      console.error('Error fetching real-time notifications:', e);
    } finally {
      if (showSpinner) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(notifications.length === 0);

      // Real-time synchronization polling every 3 seconds while open
      const interval = setInterval(() => {
        fetchNotifications(false);
      }, 3000);

      const handleLiveUpdate = () => {
        fetchNotifications(false);
      };
      window.addEventListener('streamhub_notifications_updated', handleLiveUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('streamhub_notifications_updated', handleLiveUpdate);
      };
    }
  }, [isOpen, activeUser]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (activeUser?.email) headers['x-user-email'] = activeUser.email;

      await fetch('/api/notifications/read', { method: 'POST', headers });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
      window.dispatchEvent(new CustomEvent('streamhub_notifications_updated'));
    } catch (e) {
      console.error('Error marking read:', e);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const resolveNotificationCategory = (n: SystemNotification): CategoryFilter => {
    if (n.category) {
      if (n.category === 'netflix') return 'netflix';
      if (['streaming', 'catalog', 'iptv'].includes(n.category)) return 'streaming';
      if (n.category === 'system') return 'system';
    }
    const text = `${n.title} ${n.message}`.toLowerCase();
    if (text.includes('netflix') || text.includes('código') || text.includes('codigo')) return 'netflix';
    if (text.includes('prime') || text.includes('paramount') || text.includes('crunchyroll') || text.includes('chatgpt') || text.includes('free fire') || text.includes('iptv') || text.includes('catálogo')) return 'streaming';
    return 'system';
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return resolveNotificationCategory(n) === activeCategory;
  });

  const countForCategory = (cat: CategoryFilter) => {
    if (cat === 'all') return notifications.length;
    return notifications.filter(n => resolveNotificationCategory(n) === cat).length;
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Agora';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 45) return 'Agora mesmo';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Há ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Há ${diffHours} h`;
      return new Date(isoString).toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    } catch {
      return 'Hoje';
    }
  };

  const getNotificationIcon = (n: SystemNotification) => {
    const cat = resolveNotificationCategory(n);
    if (cat === 'netflix') {
      return (
        <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 shadow-md shadow-red-950/40">
          <Tv className="w-5 h-5 text-red-500" />
        </div>
      );
    }
    if (cat === 'streaming') {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-md shadow-amber-950/40">
          <Film className="w-5 h-5 text-amber-400" />
        </div>
      );
    }
    switch (n.type) {
      case 'success':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
        );
      case 'alert':
        return (
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header with Live Synchronization Status */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-red-950/50">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 border-2 border-slate-900 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white tracking-tight">Central de Notificações</h3>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Tempo Real
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Acompanhe em tempo real quem gerou códigos e acessos VIP no catálogo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchNotifications(true)}
                disabled={isRefreshing}
                className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
                title="Sincronizar agora"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time Subheader / Category Tabs */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Todos ({countForCategory('all')})</span>
              </button>

              <button
                onClick={() => setActiveCategory('netflix')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeCategory === 'netflix'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-red-400" />
                <span>Netflix TV ({countForCategory('netflix')})</span>
              </button>

              <button
                onClick={() => setActiveCategory('streaming')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeCategory === 'streaming'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-purple-300" />
                <span>Streamings VIP ({countForCategory('streaming')})</span>
              </button>

              <button
                onClick={() => setActiveCategory('system')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeCategory === 'system'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Sistema ({countForCategory('system')})</span>
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-xl border border-amber-500/20 transition shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marcar todas lidas</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {loading && (
            <div className="py-16 text-center text-xs text-slate-400">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Sincronizando atividades em tempo real...
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Bell className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-200">Nenhuma notificação nesta categoria</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Assim que você ou outro membro puxar um código na Netflix ou resgatar um streaming, o aviso sincroniza aqui em tempo real.
              </p>
            </div>
          )}

          {!loading && filteredNotifications.map((n) => {
            const cat = resolveNotificationCategory(n);
            const isNetflix = cat === 'netflix';
            const isStreaming = cat === 'streaming';

            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 group relative overflow-hidden ${
                  !n.read
                    ? isNetflix
                      ? 'bg-red-950/15 border-red-500/30 shadow-lg shadow-red-950/20'
                      : isStreaming
                      ? 'bg-purple-950/15 border-purple-500/30 shadow-lg shadow-purple-950/20'
                      : 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {/* Visual side accent */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isNetflix ? 'bg-red-500' : isStreaming ? 'bg-purple-500' : 'bg-amber-500'
                  }`} 
                />

                {getNotificationIcon(n)}

                <div className="flex-1 min-w-0 pl-1">
                  {/* Top Bar: Title, Category Badge, and Time */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs sm:text-sm font-bold tracking-tight ${!n.read ? 'text-white' : 'text-slate-200'}`}>
                        {n.title}
                      </h4>
                      {/* Person's Name Highlight */}
                      {n.userName && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px] shadow-sm">
                          <User className="w-3 h-3 text-emerald-400" />
                          <span>{n.userName}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  {/* Message body */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {n.message}
                  </p>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {isNetflix && (
                      <button
                        onClick={() => {
                          onClose();
                          // Trigger Floating Netflix Bot open
                          window.dispatchEvent(new CustomEvent('streamhub_open_netflix_bot'));
                        }}
                        className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md shadow-red-600/30 transition"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Abrir Bot de Código Netflix</span>
                      </button>
                    )}

                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          if (n.link?.includes('suporte')) onNavigateTab('tickets');
                          else if (n.link?.includes('catalog') || isStreaming || isNetflix) onNavigateTab('catalog');
                          else onNavigateTab('accesses');
                          onClose();
                        }}
                        className="text-[11px] font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition inline-flex items-center gap-1"
                      >
                        <span>Ver no Catálogo</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">Sincronização ao vivo de códigos & acessos ativa</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">STREAMHUB VIP v2.5</span>
        </div>

      </div>
    </div>
  );
};
