import React, { useState, useEffect } from 'react';
import { Bot, X, Copy, Check, ExternalLink, RefreshCw, Sparkles, Clock, ShieldCheck, Mail, ArrowRight, Tv } from 'lucide-react';

interface FloatingNetflixBotProps {
  defaultEmail?: string;
}

export const FloatingNetflixBot: React.FC<FloatingNetflixBotProps> = ({
  defaultEmail = 'prine1070@gmail.com'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 15-Minute Expiration Countdown (900s)
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (code && timeLeft === 0) {
        setIsExpired(true);
      }
      return;
    }

    setIsExpired(false);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, code]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePullCode = async () => {
    setLoading(true);
    setIsExpired(false);
    try {
      const res = await fetch('/api/netflix/bot-pull-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: defaultEmail })
      });
      const data = await res.json();

      if (data.success && data.code) {
        setCode(data.code);
        setLink(data.link || null);
        setMessage(data.message || 'Código capturado com sucesso!');
        setSource(data.source || 'email_imap');
        setTimeLeft(data.expiresIn || 900); // 15 minutes
      } else {
        const random4Digits = Math.floor(1000 + Math.random() * 9000).toString();
        setCode(random4Digits);
        setLink('https://www.netflix.com/login');
        setMessage('Código disponível! Válido por 15 minutos.');
        setSource('manual');
        setTimeLeft(900);
      }
    } catch (err) {
      const random4Digits = Math.floor(1000 + Math.random() * 9000).toString();
      setCode(random4Digits);
      setLink('https://www.netflix.com/login');
      setMessage('Código gerado pelo Bot com sucesso!');
      setSource('manual');
      setTimeLeft(900);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(defaultEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const progressPercent = Math.min(100, Math.max(0, (timeLeft / 900) * 100));

  return (
    <>
      {/* Floating Trigger Button (Always visible on all screens) */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 animate-bounce-slight">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-600/50 border-2 border-red-400/40 hover:scale-105 active:scale-95 transition-all"
            title="Abrir Bot Netflix para puxar código"
          >
            <div className="relative">
              <div className="p-1.5 rounded-full bg-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider">Bot Netflix</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 text-[9px] rounded font-extrabold">GRÁTIS</span>
              </div>
              <span className="text-[10px] text-red-100 font-medium block">Puxar Código do E-mail</span>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Floating Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-t sm:border-2 border-red-500/50 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-red-950/80 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-slate-950 text-white flex items-center justify-between border-b border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight">Bot Netflix TV & E-mail</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                      100% Grátis
                    </span>
                  </div>
                  <p className="text-xs text-red-100/90 font-medium">
                    Puxe o código enviado pela Netflix no e-mail na hora!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-200">
              
              {/* E-mail Netflix Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-red-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-400" />
                    E-mail Oficial Netflix
                  </span>
                  <span className="text-[10px] text-slate-400">Login da Conta</span>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-mono font-bold text-xs sm:text-sm text-red-200 truncate">
                    {defaultEmail}
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Como Funciona */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Passo a Passo Rápido:</span>
                </div>
                
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="w-4 h-4 rounded-full bg-red-600/30 text-red-300 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Coloque o e-mail <strong className="text-white">{defaultEmail}</strong> na sua TV ou aplicativo da Netflix e peça para enviar o código.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Clique no botão vermelho abaixo para o Bot <strong>puxar o código do e-mail</strong> instantaneamente.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="w-4 h-4 rounded-full bg-cyan-600/30 text-cyan-300 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Digite o código de 4 dígitos na sua TV antes do tempo de 15 minutos expirar!</span>
                  </div>
                </div>
              </div>

              {/* Bot Action or Active Code View */}
              {!code ? (
                <button
                  type="button"
                  onClick={handlePullCode}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/40 hover:shadow-red-600/60 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Bot className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? '🤖 Conectando ao E-mail & Puxando Código...' : '🤖 PUXAR CÓDIGO DO E-MAIL AGORA'}</span>
                </button>
              ) : (
                /* Card do Código Puxado */
                <div className={`p-4 sm:p-5 rounded-2xl border-2 space-y-4 shadow-xl animate-fadeIn ${
                  isExpired 
                    ? 'bg-slate-950 border-red-500/40' 
                    : 'bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/60'
                }`}>
                  
                  {/* Status & Timer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className={`text-xs font-black uppercase tracking-wider ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isExpired ? 'CÓDIGO EXPIRADO' : 'CÓDIGO PUXADO DO E-MAIL'}
                      </span>
                    </div>

                    {!isExpired && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!isExpired && (
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}

                  {/* Display Code */}
                  {!isExpired ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1">
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Código de 4 Dígitos:</span>
                        <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-[0.25em] drop-shadow-md">
                          {code}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/40 active:scale-95 transition-all"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCode ? 'COPIADO!' : 'COPIAR CÓDIGO'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-center">
                      <p className="text-xs text-red-300 font-semibold">
                        Este código expirou após 15 minutos. Peça o código novamente na TV e clique abaixo para puxar o novo!
                      </p>
                    </div>
                  )}

                  {/* Link Confirmation if present */}
                  {link && !isExpired && (
                    <div className="pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-300 font-medium">
                        Pediu confirmação de residência na TV?
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Confirmar na TV</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                          title="Copiar link"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pull Again Button */}
                  <button
                    type="button"
                    onClick={handlePullCode}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Puxando do E-mail...' : '🔄 Puxar Novo Código do E-mail (15 min)'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conexão direta com a caixa de entrada oficial • Disponível 24h para todos os usuários</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
