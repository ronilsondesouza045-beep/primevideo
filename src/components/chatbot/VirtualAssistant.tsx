import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../../types';
import { AssistantAvatar, AvatarState } from './AssistantAvatar';
import { ChatMessageItem } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { X, Send, Radio, Tv, Film, Sparkles, Zap, MessageSquare } from 'lucide-react';

interface VirtualAssistantProps {
  user?: User | null;
  onSavePrimeAccess?: () => void;
  isOpenExternal?: boolean;
  onToggleExternal?: (open: boolean) => void;
}

export const VirtualAssistant: React.FC<VirtualAssistantProps> = ({
  user,
  onSavePrimeAccess,
  isOpenExternal,
  onToggleExternal
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    setInternalIsOpen(open);
    if (onToggleExternal) {
      onToggleExternal(open);
    }
  };

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [showToast, setShowToast] = useState(false);
  const [greetedUserId, setGreetedUserId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content:
        '🤖 **Central de Atendimento & Status StreamHub VIP** 🍿\n\n' +
        'Seja bem-vindo(a) ao nosso suporte virtual inteligente com assistente 3D! Confira abaixo o **Status em Tempo Real**:\n\n' +
        '🟢 **SERVIÇOS NO AR (100% OPERACIONAIS & GRÁTIS):**\n' +
        '• 📺 **IPTV Grátis (M3U / Xtream):** 31 Acessos ativos (Servidor `ger99.xyz:80`)\n' +
        '• 🎬 **Prime Video VIP:** Liberação Instantânea\n' +
        '• 🍿 **Paramount+ VIP:** Liberação Instantânea\n' +
        '• 🎌 **Crunchyroll VIP:** Animes e Desenhos HD\n\n' +
        '🔴 **SERVIÇOS FORA DO AR (EM MANUTENÇÃO / REABASTECENDO):**\n' +
        '• 🔥 **Free Fire (Codiguin/PIN):** Em manutenção no portal oficial\n' +
        '• 🎥 **Netflix VIP:** Estoque em reabastecimento (Em breve R$ 10/mês)\n\n' +
        '💡 *Clique em uma das opções abaixo ou digite sua dúvida para o assistente 3D te ajudar!*',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reaction state reset
  useEffect(() => {
    if (loading) {
      setAvatarState('thinking');
    } else {
      setAvatarState('idle');
    }
  }, [loading]);

  // Greeting state when user logs in
  useEffect(() => {
    if (user && user.id !== greetedUserId) {
      setGreetedUserId(user.id);
      const firstName = user.name ? user.name.split(' ')[0] : 'Cliente VIP';

      const welcomeText = `🎉 **Olá, ${user.name || user.email}!** Seja muito bem-vindo(a) ao **StreamHub VIP**!\n\nSou seu **assistente virtual 3D humanizado**. Seu perfil está ativo e sincronizado em tempo real!\n\nComo posso te ajudar hoje, ${firstName}?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `welcome_${Date.now()}`,
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setShowToast(true);
      setAvatarState('waving');
      const timer = setTimeout(() => {
        setShowToast(false);
        setAvatarState('idle');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [user, greetedUserId]);

  // Poll for Admin Direct Messages/Replies
  useEffect(() => {
    if (!isOpen && !user) return;
    const pollHistory = async () => {
      try {
        const uParam = user?.id || user?.email || 'guest';
        const res = await fetch(`/api/support/history?userId=${encodeURIComponent(uParam)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.messages && Array.isArray(data.messages)) {
            data.messages.forEach((m: any) => {
              if (m.sender === 'admin') {
                const exists = messages.some((localMsg) => localMsg.content.includes(m.text));
                if (!exists) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: m.id || `admin_reply_${Date.now()}`,
                      role: 'assistant',
                      content: `👨‍💻 **Resposta do Suporte Admin:**\n${m.text}`,
                      timestamp: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                  setAvatarState('happy');
                }
              }
            });
          }
        }
      } catch (e) {}
    };

    pollHistory();
    const interval = setInterval(pollHistory, 5000);
    return () => clearInterval(interval);
  }, [isOpen, user, messages]);

  useEffect(() => {
    if (isOpen) {
      setShowToast(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const saveParamountAccessToLocal = () => {
    const userEmailKey = user?.email ? user.email.toLowerCase() : 'guest';
    const defaultParamountCredentials = {
      email: 'olivia8515@web-library.net',
      password: '4400988',
      screen: 'Perfil Livre / Gratuito',
      warning: 'Aviso: A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.'
    };
    const newLog = {
      id: `acc_paramount_vip_${Date.now()}`,
      userId: user?.id || 'vip_user',
      userEmail: user?.email || 'ronisouza495@gmail.com',
      service: 'paramount',
      credentials: defaultParamountCredentials,
      createdAt: new Date().toISOString()
    };

    const localLogsRaw = localStorage.getItem(`streamhub_logs_${userEmailKey}`);
    let logs: any[] = [];
    if (localLogsRaw) {
      try { logs = JSON.parse(localLogsRaw); } catch (e) {}
    }
    const alreadyHas = logs.some((l: any) => l.service === 'paramount' && l.credentials?.email === defaultParamountCredentials.email);
    if (!alreadyHas) {
      logs.unshift(newLog);
      localStorage.setItem(`streamhub_logs_${userEmailKey}`, JSON.stringify(logs));
    }

    if (onSavePrimeAccess) {
      onSavePrimeAccess();
    }
  };

  const savePrimeAccessToLocal = () => {
    const userEmailKey = user?.email ? user.email.toLowerCase() : 'guest';
    const defaultPrimeCredentials = {
      email: 'primevideosouza368@gmail.com',
      password: 'roni141821',
      pin: 'Sem PIN',
      screen: 'Livre / Escolha qualquer perfil'
    };
    const newLog = {
      id: `acc_prime_vip_${userEmailKey}`,
      userId: user?.id || 'vip_user',
      userEmail: user?.email || 'ronisouza495@gmail.com',
      service: 'prime',
      credentials: defaultPrimeCredentials,
      createdAt: new Date().toISOString()
    };

    const localLogsRaw = localStorage.getItem(`streamhub_logs_${userEmailKey}`);
    let logs: any[] = [];
    if (localLogsRaw) {
      try { logs = JSON.parse(localLogsRaw); } catch (e) {}
    }
    const alreadyHas = logs.some((l: any) => l.service === 'prime' || l.credentials?.email === defaultPrimeCredentials.email);
    if (!alreadyHas) {
      logs.unshift(newLog);
      localStorage.setItem(`streamhub_logs_${userEmailKey}`, JSON.stringify(logs));
    }

    if (onSavePrimeAccess) {
      onSavePrimeAccess();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);
    setAvatarState('thinking');

    // Save message for Admin
    try {
      await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query,
          userId: user?.id || 'guest',
          userName: user?.name || 'Cliente VIP',
          userEmail: user?.email || 'visitante@streamhub.com'
        })
      });
    } catch (e) {}

    let replyText = '';

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: historyPayload })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          replyText = data.reply;
        }
      }
    } catch (err) {}

    if (!replyText) {
      const firstName = user?.name ? user.name.split(' ')[0] : 'Cliente VIP';
      replyText = `🤖 **Atendimento StreamHub VIP 3D**\n\nComo posso te ajudar, ${firstName}?\n\n🟢 **No Ar:** IPTV Grátis (31 contas), Prime Video e Paramount+.\n🔴 **Fora do Ar:** Free Fire e Netflix.\n✉️ **Admin:** \`ronisouza495@gmail.com\`.`;
    }

    if (replyText.includes('Paramount') || query.toLowerCase().includes('paramount')) {
      saveParamountAccessToLocal();
    } else if (replyText.includes('Prime Video') || query.toLowerCase().includes('prime')) {
      savePrimeAccessToLocal();
    }

    const botMsg: ChatMessage = {
      id: `bot_${Date.now()}`,
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
    setAvatarState('talking');
    setTimeout(() => setAvatarState('idle'), 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setAvatarState('talking');
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onend = () => setAvatarState('idle');
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-16 md:bottom-6 right-2 md:right-6 z-50 flex flex-col items-end max-w-full">
      {/* Welcome Toast notification when closed */}
      {!isOpen && showToast && (
        <div
          className="mb-2 max-w-xs bg-slate-900/95 border-2 border-red-500/80 rounded-2xl p-3 shadow-2xl shadow-red-900/50 backdrop-blur-md animate-fadeIn flex items-start gap-2.5 relative group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-1 -left-1"></div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-100 leading-tight">
              👋 Olá <span className="text-red-400">{user?.name ? user.name.split(' ')[0] : 'Cliente VIP'}</span>!
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              Assistente 3D humanizado disponível. Clique para conversar!
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowToast(false);
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating 3D Character Button (When Closed) */}
      {!isOpen && (
        <div className="relative flex flex-col items-center group">
          <div className="mb-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/95 border border-emerald-500/40 text-[9px] font-extrabold text-emerald-400 shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ASSISTENTE 3D ONLINE
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setAvatarState('waving');
              setTimeout(() => setAvatarState('idle'), 2500);
            }}
            className="relative p-2 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-red-600/70 shadow-2xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            title="Abrir Assistente Virtual 3D Humanizado"
          >
            <AssistantAvatar size="md" state={avatarState} interactive={true} />

            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </button>
        </div>
      )}

      {/* Main Chat Modal Container */}
      {isOpen && (
        <div className="w-[calc(100vw-16px)] sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950 flex flex-col h-[78vh] sm:h-[530px] max-h-[570px] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-950 via-purple-950/80 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-purple-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                <AssistantAvatar size="sm" state={avatarState} interactive={true} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  Assistente Virtual 3D
                  <span className="px-1.5 py-0.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                    ONLINE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {user ? `Logado: ${user.name || user.email}` : 'Suporte Humanizado 24H'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Pills */}
          <div className="px-3 py-2.5 bg-slate-950/95 border-b border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Atalhos Rápidos
              </span>
              <span className="text-[9px] text-slate-500 font-bold hidden sm:inline">Deslize →</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
              <button
                onClick={() => handleSendMessage('Qual é o status geral dos serviços?')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 transition-all font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Status Geral</span>
              </button>

              <button
                onClick={() => handleSendMessage('Como usar o IPTV grátis com servidor e lista M3U?')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition-all font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>IPTV Grátis</span>
              </button>

              <button
                onClick={() => handleSendMessage('Como resgatar meu Prime Video grátis?')}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 text-blue-300 transition-all font-bold text-[11px] flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>Prime Video</span>
              </button>

              <button
                onClick={() => handleSendMessage('Como resgatar meu Paramount+ grátis?')}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 transition-all font-bold text-[11px] flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paramount+</span>
              </button>

              <button
                onClick={() => handleSendMessage('Como resgatar meu Crunchyroll VIP?')}
                className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:border-orange-400 text-orange-300 transition-all font-bold text-[11px] flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Crunchyroll</span>
              </button>

              <button
                onClick={() => handleSendMessage('Quero falar com a administração do sistema')}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 text-purple-300 transition-all font-bold text-[11px] flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Direct</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950/50 text-xs">
            {messages.map((m) => (
              <ChatMessageItem key={m.id} message={m} onSpeak={handleSpeakText} />
            ))}

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.trim() && avatarState === 'idle') {
                  setAvatarState('typing');
                } else if (!e.target.value.trim() && avatarState === 'typing') {
                  setAvatarState('idle');
                }
              }}
              onKeyDown={handleKeyPress}
              placeholder={user ? `Digite sua dúvida, ${user.name ? user.name.split(' ')[0] : 'Cliente'}...` : 'Digite sua mensagem...'}
              className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white disabled:opacity-50 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
