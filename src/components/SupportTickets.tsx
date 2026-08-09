import React, { useState, useEffect } from 'react';
import { Ticket, Plus, MessageSquare, Send, CheckCircle2, Clock, AlertCircle, ArrowLeft, User as UserIcon, Shield, Search } from 'lucide-react';
import { Ticket as TicketType, User } from '../types';

interface SupportTicketsProps {
  currentUser: User | null;
}

export const SupportTickets: React.FC<SupportTicketsProps> = ({ currentUser }) => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(false);

  // New ticket state
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'Suporte Técnico' | 'Acessos' | 'IPTV' | 'Pagamentos' | 'Dúvidas' | 'Geral'>('Suporte Técnico');
  const [newPriority, setNewPriority] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Média');
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Message reply state
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [currentUser]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch('/api/tickets', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.tickets) {
          setTickets(data.tickets);
        }
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          priority: newPriority,
          message: newMessage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsCreating(false);
        setNewSubject('');
        setNewMessage('');
        fetchTickets();
        if (data.ticket) setSelectedTicket(data.ticket);
      }
    } catch (e) {
      console.error('Error creating ticket:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setReplying(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: replyText })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ticket) {
          setSelectedTicket(data.ticket);
          setReplyText('');
          fetchTickets();
        }
      }
    } catch (e) {
      console.error('Error replying ticket:', e);
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async (status: TicketType['status']) => {
    if (!selectedTicket) return;
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch(`/api/tickets/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ticket) {
          setSelectedTicket(data.ticket);
          fetchTickets();
        }
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const isStaff = currentUser && ['admin', 'super_admin', 'support', 'moderator'].includes(currentUser.role);

  const getStatusBadge = (status: TicketType['status']) => {
    switch (status) {
      case 'ABERTO':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">ABERTO</span>;
      case 'EM_ATENDIMENTO':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">EM ATENDIMENTO</span>;
      case 'AGUARDANDO_USUARIO':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">AGUARDANDO RESPOSTA</span>;
      case 'RESOLVIDO':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">RESOLVIDO</span>;
      case 'FECHADO':
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">FECHADO</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Ticket className="w-7 h-7 text-red-500" />
            Central de Suporte VIP
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Abra e acompanhe seus chamados de suporte técnico, dúvidas sobre acessos, IPTV e pagamentos.
          </p>
        </div>

        {!isCreating && !selectedTicket && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Abrir Novo Chamado
          </button>
        )}
      </div>

      {/* CREATE TICKET MODAL / FORM */}
      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Novo Chamado de Atendimento
            </h2>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Assunto do Chamado *
              </label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Ex: Dúvida na instalação do IPTV / Problema de acesso"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Suporte Técnico">Suporte Técnico</option>
                  <option value="Acessos">Liberação de Acessos</option>
                  <option value="IPTV">Servidor IPTV</option>
                  <option value="Pagamentos">Pagamentos & Ton</option>
                  <option value="Dúvidas">Dúvidas Frequentes</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média (Normal)</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente (Acesso bloqueado)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mensagem detalhada *
              </label>
              <textarea
                required
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Descreva o que está acontecendo detalhadamente para que nossa equipe possa te ajudar rapidamente..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                {submitting ? 'Enviando...' : 'Enviar Chamado'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SELECTED TICKET DETAILS & CONVERSATION */}
      {selectedTicket && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a Lista
            </button>

            <div className="flex items-center gap-3">
              {getStatusBadge(selectedTicket.status)}

              {isStaff && (
                <select
                  value={selectedTicket.status}
                  onChange={(e: any) => handleUpdateStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-amber-400 font-bold focus:outline-none"
                >
                  <option value="ABERTO">ABERTO</option>
                  <option value="EM_ATENDIMENTO">EM ATENDIMENTO</option>
                  <option value="AGUARDANDO_USUARIO">AGUARDANDO USUÁRIO</option>
                  <option value="RESOLVIDO">RESOLVIDO</option>
                  <option value="FECHADO">FECHADO</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
              <span>#{selectedTicket.id.slice(-6)}</span>
              <span>•</span>
              <span className="font-bold text-slate-300">{selectedTicket.category}</span>
              <span>•</span>
              <span>Prioridade: <strong className="text-amber-400">{selectedTicket.priority}</strong></span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{selectedTicket.subject}</h2>
            <div className="text-[11px] text-slate-400 mt-1">
              Aberto por <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail}) em {new Date(selectedTicket.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {selectedTicket.messages.map((m) => {
              const isSupportMsg = m.sender === 'support';
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl max-w-2xl border ${
                    isSupportMsg
                      ? 'bg-amber-500/10 border-amber-500/30 ml-auto text-slate-100'
                      : 'bg-slate-800/60 border-slate-800 mr-auto text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      {isSupportMsg ? (
                        <Shield className="w-4 h-4 text-amber-400" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={`text-xs font-bold ${isSupportMsg ? 'text-amber-300' : 'text-slate-200'}`}>
                        {m.senderName} {isSupportMsg && '(Suporte VIP)'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          {selectedTicket.status !== 'FECHADO' ? (
            <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-800 space-y-3">
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua mensagem de resposta..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={replying}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  {replying ? 'Enviando...' : 'Enviar Resposta'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
              Este chamado está encerrado. Abra um novo chamado caso precise de ajuda.
            </div>
          )}
        </div>
      )}

      {/* TICKETS LIST */}
      {!isCreating && !selectedTicket && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading && (
            <div className="p-12 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Carregando chamados...
            </div>
          )}

          {!loading && tickets.length === 0 && (
            <div className="p-12 text-center">
              <Ticket className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-300">Nenhum chamado de suporte aberto</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                Precisa de auxílio com acessos, renovação IPTV ou dúvidas? Clique em "Abrir Novo Chamado".
              </p>
            </div>
          )}

          {!loading && tickets.length > 0 && (
            <div className="divide-y divide-slate-800">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="p-4 hover:bg-slate-800/50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(t.status)}
                      <span className="text-[11px] text-slate-400 font-mono">#{t.id.slice(-6)}</span>
                      <span className="text-[11px] font-bold text-amber-400">{t.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition">
                      {t.subject}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {t.messages[t.messages.length - 1]?.text || 'Sem mensagens'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      {t.messages.length} msg(s)
                    </span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
