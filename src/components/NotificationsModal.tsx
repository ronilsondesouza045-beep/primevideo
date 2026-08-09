import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X, ExternalLink, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SystemNotification, User } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onNavigateTab: (tab: any) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch('/api/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          const unreadCount = data.notifications.filter((n: SystemNotification) => !n.read).length;
          if (onUnreadCountChange) onUnreadCountChange(unreadCount);
        }
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      await fetch('/api/notifications/read', { method: 'POST', headers });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (e) {
      console.error('Error marking read:', e);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'alert':
        return <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Central de Notificações</h3>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Todas as notificações lidas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar lidas
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {loading && (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Carregando notificações...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-300">Nenhuma notificação por enquanto</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Você receberá avisos sobre seus acessos, pedidos, ofertas VIP e chamados de suporte aqui.
              </p>
            </div>
          )}

          {!loading && notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-xl border transition flex items-start gap-3 ${
                !n.read
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {getIcon(n.type)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-xs font-bold ${!n.read ? 'text-amber-300' : 'text-slate-200'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {n.message}
                </p>

                {n.link && (
                  <button
                    onClick={() => {
                      if (n.link?.includes('suporte')) onNavigateTab('tickets');
                      else if (n.link?.includes('catalog')) onNavigateTab('catalog');
                      else onNavigateTab('accesses');
                      onClose();
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ver Detalhes</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 text-center">
          Notificações em tempo real ativadas no STREAMHUB VIP
        </div>

      </div>
    </div>
  );
};
