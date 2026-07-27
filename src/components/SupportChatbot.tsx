import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage } from '../types';
import { X, Send, User as UserIcon, Loader2, Sparkles, Volume2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StandingBotAvatar } from './StandingBotAvatar';

interface SupportChatbotProps {
  user?: User | null;
  onSavePrimeAccess?: () => void;
}

export const SupportChatbot: React.FC<SupportChatbotProps> = ({ user, onSavePrimeAccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [greetedUserId, setGreetedUserId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: 'Olá! Sou o **Robô de Atendimento VIP**! 🤖🍿\nSeja bem-vindo ao suporte inteligente do StreamHub. Como posso te ajudar hoje?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-greeting when user logs in via Chrome / Google / Email
  useEffect(() => {
    if (user && user.id !== greetedUserId) {
      setGreetedUserId(user.id);
      const firstName = user.name ? user.name.split(' ')[0] : 'Cliente VIP';

      const welcomeText = `🎉 **Olá, ${user.name || user.email}!** Seja muito bem-vindo(a) ao **StreamHub VIP**!\n\nSou seu **assistente de suporte virtual**. Seu perfil já está ativo e sincronizado em tempo real!\n\nComo posso te ajudar hoje, ${firstName}?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `welcome_${Date.now()}`,
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Pop floating speech bubble notification over the standing bot
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [user, greetedUserId]);

  // Poll for Admin Direct Messages/Replies every 5 seconds
  useEffect(() => {
    if (!isOpen && !user) return;
    const pollHistory = async () => {
      try {
        const uParam = user?.id || user?.email || 'guest';
        const res = await fetch(`/api/support/history?userId=${encodeURIComponent(uParam)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.messages && Array.isArray(data.messages)) {
            // Find admin replies not yet in local messages
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

  const getSmartBotResponse = (query: string, currentUser?: User | null): string => {
    const lower = query.toLowerCase();
    const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Cliente';

    // 1. Paramount+
    if (lower.includes('paramount')) {
      return `🎉 **Acesso Paramount+ Gratuito Liberado!**\n\n` +
        `📧 **E-mail:** \`olivia8515@web-library.net\`\n` +
        `🔑 **Senha:** \`4400988\`\n\n` +
        `⚠️ **Aviso:** A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.\n\n` +
        `📌 **Instruções:** Acesse [paramountplus.com](https://www.paramountplus.com) e faça login.\n\n` +
        `💡 *Este acesso também fica salvo para você na seção "Meus Acessos Liberados" no menu do seu perfil!*`;
    }

    // 2. Prime Video
    if (
      lower.includes('prime') ||
      lower.includes('gratis') ||
      lower.includes('gratuito') ||
      lower.includes('resgatar') ||
      lower.includes('como') ||
      lower.includes('senha') ||
      lower.includes('conta') ||
      lower.includes('acesso')
    ) {
      return `🎉 **Acesso Prime Video VIP Liberado com Sucesso!**\n\n` +
        `📧 **E-mail:** \`primevideosouza368@gmail.com\`\n` +
        `🔑 **Senha:** \`roni141821\`\n\n` +
        `📌 **Instruções:** Acesse [primevideo.com](https://www.primevideo.com) e faça login.\n\n` +
        `💡 *Este acesso também fica salvo para você na seção "Meus Acessos Liberados" no menu do seu perfil!*`;
    }

    // 3. Netflix / Valor / Ton / Pix
    if (
      lower.includes('netflix') ||
      lower.includes('10') ||
      lower.includes('pagar') ||
      lower.includes('comprar') ||
      lower.includes('valor') ||
      lower.includes('preço') ||
      lower.includes('pix') ||
      lower.includes('ton')
    ) {
      return `🍿 **Netflix VIP (Em Breve):**\n\n` +
        `O serviço da Netflix está temporariamente indisponível para novos pedidos pois nosso estoque de contas VIP está em fase de reabastecimento.\n\n` +
        `Assim que reabastecido, estará disponível por apenas **R$ 10,00/mês** via Pix ou Cartão pelo nosso checkout oficial Ton.\n\n` +
        `💡 Enquanto isso, aproveite o **Prime Video** e **Paramount+** 100% GRATUITOS disponíveis na plataforma!`;
    }

    // 4. Admin / Suporte / Contato / Roni
    if (
      lower.includes('admin') ||
      lower.includes('administrador') ||
      lower.includes('suporte') ||
      lower.includes('falar') ||
      lower.includes('roni') ||
      lower.includes('dono') ||
      lower.includes('contato') ||
      lower.includes('email')
    ) {
      return `✉️ **Atendimento com o Administrador:**\n\n` +
        `Você pode entrar em contato diretamente com a administração oficial:\n` +
        `• **E-mail do Admin:** \`ronisouza495@gmail.com\`\n` +
        `• **Atendimento:** Resposta rápida em até 24 horas.\n\n` +
        `Como posso te ajudar por aqui enquanto isso, ${firstName}?`;
    }

    // 5. Saudações
    if (
      lower.includes('ola') ||
      lower.includes('olá') ||
      lower.includes('oi') ||
      lower.includes('bom dia') ||
      lower.includes('boa tarde') ||
      lower.includes('boa noite') ||
      lower.includes('tudo bem') ||
      lower.includes('fala')
    ) {
      return `👋 Olá, ${firstName}! Sou a **Assistente Virtual StreamHub VIP**! 🤖🍿\n\nComo posso te ajudar hoje? Você pode me perguntar sobre como resgatar o Prime Video e Paramount+ grátis ou como falar com o suporte.`;
    }

    // 6. Resposta Padrão de Suporte VIP
    return `🤖 **Atendimento de Suporte StreamHub VIP**\n\n` +
      `Como posso ajudar você, ${firstName}?\n\n` +
      `• 🎬 **Prime Video:** 100% Gratuito!\n` +
      `• 📺 **Paramount+:** 100% Gratuito!\n` +
      `• 🍿 **Netflix VIP:** Em breve por R$ 10,00/mês.\n` +
      `• ✉️ **Suporte Admin:** Fale pelo e-mail \`ronisouza495@gmail.com\`.\n\n` +
      `Digite sua dúvida aqui que eu te ajudo na hora!`;
  };

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
    const alreadyHasParamount = logs.some((l: any) => l.service === 'paramount' && l.credentials?.email === defaultParamountCredentials.email);
    if (!alreadyHasParamount) {
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
    const alreadyHasPrime = logs.some((l: any) => l.service === 'prime' || l.credentials?.email === defaultPrimeCredentials.email);
    if (!alreadyHasPrime) {
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

    // Save support message to server for Admin
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
    } catch (err) {
      console.log('Server API offline/static deployment, utilizing smart client response engine');
    }

    if (!replyText) {
      replyText = getSmartBotResponse(query, user);
    }

    if (
      replyText.includes('olivia8515@web-library.net') ||
      replyText.includes('Paramount') ||
      query.toLowerCase().includes('paramount')
    ) {
      saveParamountAccessToLocal();
    } else if (
      replyText.includes('primevideosouza368@gmail.com') ||
      replyText.includes('Prime Video') ||
      query.toLowerCase().includes('prime') ||
      query.toLowerCase().includes('resgatar') ||
      query.toLowerCase().includes('gerar')
    ) {
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, lineIdx) => {
          const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
          return (
            <p key={lineIdx} className="leading-relaxed min-h-[1.25rem]">
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={partIdx} className="font-bold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                  return (
                    <code key={partIdx} className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px] border border-slate-700/50">
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // Speak welcome aloud using Web Speech Synthesis if available
  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      
      {/* Floating Welcome Speech Bubble Toast (When closed) */}
      {!isOpen && showToast && (
        <div className="mb-3 max-w-xs bg-slate-900/95 border-2 border-red-500/80 rounded-2xl p-3 shadow-2xl shadow-red-900/50 backdrop-blur-md animate-fadeIn flex items-start gap-2.5 relative group cursor-pointer"
             onClick={() => setIsOpen(true)}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -left-1"></div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-100 leading-tight">
              👋 Olá <span className="text-red-400">{user?.name ? user.name.split(' ')[0] : 'Cliente VIP'}</span>!
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              Seja bem-vindo(a) ao suporte online. Clique para ver sua conta!
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

      {/* Floating Standing Mascot Button (When Closed) */}
      {!isOpen && (
        <div className="relative flex flex-col items-center group">
          {/* Badge Online */}
          <div className="mb-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-[9px] font-bold text-emerald-400 shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ATENDIMENTO ONLINE
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative group p-2 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-red-600/70 shadow-2xl shadow-red-600/40 hover:scale-105 transition-all flex items-center justify-center overflow-visible"
            title="Abrir Atendimento com Bot Standing VIP"
          >
            <StandingBotAvatar size="md" isWaving={true} />

            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950 flex flex-col h-[520px] overflow-hidden animate-fadeIn">
          
          {/* Header with Standing Mascot & Live Status */}
          <div className="p-3.5 bg-gradient-to-r from-slate-950 via-purple-950/80 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-purple-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                <StandingBotAvatar size="sm" isWaving={true} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  Suporte StreamHub VIP
                  <span className="px-1.5 py-0.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                    24H
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {user ? `Logado como: ${user.name || user.email}` : 'Atendimento Humanizado'}
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
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSendMessage('Como resgatar meu Paramount+ grátis?')}
              className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 whitespace-nowrap hover:bg-blue-500/20 transition-all font-medium"
            >
              📺 Paramount+
            </button>
            <button
              onClick={() => handleSendMessage('Como resgatar meu Prime Video grátis?')}
              className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 whitespace-nowrap hover:bg-cyan-500/20 transition-all font-medium"
            >
              🎬 Prime Video
            </button>
            <button
              onClick={() => handleSendMessage('Quando a Netflix vai estar disponível?')}
              className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap hover:bg-amber-500/20 transition-all font-medium"
            >
              🍿 Netflix (Em Breve)
            </button>
            <button
              onClick={() => handleSendMessage('Quero falar com a administração do sistema')}
              className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 whitespace-nowrap hover:bg-purple-500/20 transition-all font-medium"
            >
              ✉️ Falar com Admin
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <StandingBotAvatar size="sm" isWaving={false} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium rounded-tr-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/80 shadow-md'
                  }`}
                >
                  {renderFormattedContent(m.content)}
                  
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/5 text-[9px] opacity-70">
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handleSpeakText(m.content)}
                        className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Ouvir em Voz Alta"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Ouvir</span>
                      </button>
                    )}
                    <span className="ml-auto">{m.timestamp}</span>
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>O Robô VIP está digitando sua resposta...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={user ? `Digite sua mensagem, ${user.name ? user.name.split(' ')[0] : 'Cliente'}...` : "Digite sua mensagem aqui..."}
              className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white disabled:opacity-50 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
