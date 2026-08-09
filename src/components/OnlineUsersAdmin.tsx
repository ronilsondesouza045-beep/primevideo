import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Monitor, Shield, Clock, Circle } from 'lucide-react';
import { UserPresence, User } from '../types';

interface OnlineUsersAdminProps {
  currentUser: User | null;
}

export const OnlineUsersAdmin: React.FC<OnlineUsersAdminProps> = ({ currentUser }) => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch('/api/admin/online-users', { headers });
      if (res.ok) {
        const data = await res.json();
        setOnlineUsers(data.onlineUsers || []);
        setCount(data.count || 0);
      }
    } catch (e) {
      console.error('Error fetching online users:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Usuários Conectados em Tempo Real ({count})
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe a atividade instantânea e dispositivos dos clientes navegando no STREAMHUB VIP.
          </p>
        </div>

        <button
          onClick={fetchOnlineUsers}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {loading && onlineUsers.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Mapeando sessões ativas no servidor...
        </div>
      ) : onlineUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
          Nenhum usuário ativo detectado nos últimos 5 minutos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {onlineUsers.map((u) => (
            <div
              key={u.userId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200">
                      {u.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-100">{u.userName}</h3>
                    <p className="text-[11px] text-slate-400">{u.userEmail}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {u.role}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  {u.device || 'Desktop'} • {u.browser || 'Web'}
                </span>

                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  {new Date(u.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
