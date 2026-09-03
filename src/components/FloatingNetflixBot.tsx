import React, { useState, useEffect } from 'react';
import { Bot, X, Copy, Check, ExternalLink, RefreshCw, Sparkles, Clock, ShieldCheck, Mail, ArrowRight, Tv, Key } from 'lucide-react';

interface FloatingNetflixBotProps {
  defaultEmail?: string;
  defaultPassword?: string;
  coverImage?: string;
}

const NETFLIX_DEFAULT_IMAGE = 'https://www.shutterstock.com/image-photo/rajasthan-jaipur-india-15-netflix-260nw-2195929279.jpg';

export const FloatingNetflixBot: React.FC<FloatingNetflixBotProps> = ({
  defaultEmail = 'prine1070@gmail.com',
  defaultPassword = 'roni1418rr',
  coverImage = NETFLIX_DEFAULT_IMAGE
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePullCode = async () => {
    setLoading(true);
    setIsExpired(false);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/netflix/bot-pull-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: defaultEmail })
      });
      const data = await res.json();

      if (data.success && data.code && !data.isExpired) {
        setCode(data.code);
        setLink(data.link || null);
        setMessage(data.message || 'Código REAL capturado do e-mail!');
        setSource(data.source || 'email_imap');
        setTimeLeft(data.expiresIn || 900); // 15 minutes or remaining time
        setErrorMessage(null);
      } else if (data.isExpired) {
        setCode(null);
        setIsExpired(true);
        setTimeLeft(0);
        setErrorMessage(
          data.message || 
          '⏱️ O último código no e-mail já expirou (recebido há mais de 15 minutos). Peça para enviar um novo código na sua Smart TV e clique abaixo para capturar o código novo!'
        );
      } else {
        setErrorMessage(data.message || 'Nenhum código novo da Netflix encontrado no seu e-mail. Solicite o código na TV/App e clique em Puxar novamente!');
      }
    } catch (err) {
      setErrorMessage('Erro de conexão ao ler a caixa de entrada. Tente novamente em alguns segundos.');
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

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(defaultPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
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
            className="group flex items-center gap-3 pl-2 pr-4 py-2 sm:py-2.5 rounded-full bg-slate-950/95 hover:bg-slate-900 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-600/50 border-2 border-red-500/80 hover:border-red-400 hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
            title="Abrir Bot Netflix para puxar código ou senha"
          >
            {/* Custom Image Avatar */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-red-500 shadow-md shadow-red-600/40 bg-slate-900 group-hover:scale-105 transition-transform">
                <img
                  src={coverImage}
                  alt="Netflix Bot"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div className="text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider font-black text-white">Bot Netflix</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] rounded font-extrabold">GRÁTIS</span>
              </div>
              <span className="text-[10px] text-red-300 font-medium block">Código TV & Senha</span>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Floating Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full sm:max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-t sm:border-2 border-red-500/50 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-red-950/90 overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Custom Netflix Image Hero Header */}
            <div className="relative w-full h-36 sm:h-44 overflow-hidden border-b border-red-500/40 shrink-0">
              <img
                src={coverImage}
                alt="Netflix Bot Capa"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-105 filter brightness-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80';
                }}
              />
              {/* Cinematic gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-950/70 via-slate-950/40 to-black/70" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all z-10"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Info Overlay */}
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-red-500 shadow-xl shadow-red-950 bg-slate-900">
                      <img
                        src={coverImage}
                        alt="Netflix Avatar"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-md">
                        Bot Netflix TV & E-mail
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow">
                        100% Grátis
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 drop-shadow font-medium">
                      Puxe o código de 4 dígitos ou entre direto com senha
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-200">
              
              {/* Mini Status Card com a Imagem Netflix */}
              <div className="relative rounded-2xl overflow-hidden border border-red-500/40 p-3 bg-gradient-to-r from-red-950/60 via-slate-900/90 to-slate-950 flex items-center gap-3.5 shadow-lg shadow-red-950/40">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-red-500/50 shrink-0 shadow-md">
                  <img
                    src={coverImage}
                    alt="Netflix Oficial"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 truncate">Conta Oficial Sincronizada</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">Acesso Netflix VIP 24h</h4>
                  <p className="text-[11px] text-slate-300">Use os dados abaixo para logar direto ou resgatar o código.</p>
                </div>
              </div>

              {/* E-mail & Senha Netflix Boxes */}
              <div className="space-y-2.5">
                {/* E-mail Box */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-red-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-red-400" />
                      E-mail Oficial Netflix
                    </span>
                    <span className="text-[10px] text-slate-400">Login da Conta</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-mono font-bold text-xs sm:text-sm text-red-200 truncate">
                      {defaultEmail}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Senha Box (Nova - Se quiser entrar só com a senha) */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Senha da Conta
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Entrar direto com senha
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-mono font-bold text-xs sm:text-sm text-amber-200 tracking-wider">
                      {defaultPassword}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPassword ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Como Funciona */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between font-bold text-amber-300 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Como Acessar na TV ou Celular:</span>
                  </div>
                </div>
                
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">A</span>
                    <span><strong>Opção 1 (Direto com Senha):</strong> Digite o e-mail <strong className="text-white">{defaultEmail}</strong> e a senha <strong className="text-amber-300">{defaultPassword}</strong> na sua TV/app.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="w-4 h-4 rounded-full bg-red-600/30 text-red-300 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">B</span>
                    <span><strong>Opção 2 (Código da TV):</strong> Na TV, peça o código de 4 dígitos e clique no botão vermelho abaixo para puxar do e-mail na hora!</span>
                  </div>
                </div>
              </div>

              {/* Error / Status Message Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <span className="text-amber-400 font-bold text-base shrink-0">⚠️</span>
                  <div className="leading-relaxed">
                    <strong className="block text-amber-300 font-bold">Aviso do Bot:</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Bot Action or Active Code View */}
              {!code || isExpired ? (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handlePullCode}
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all disabled:opacity-50 active:scale-[0.98] ${
                      isExpired
                        ? 'bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 hover:from-amber-500 hover:to-red-500 text-white shadow-amber-600/40'
                        : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/40 hover:shadow-red-600/60'
                    }`}
                  >
                    <Bot className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>
                      {loading 
                        ? '🤖 Conectando ao E-mail & Puxando Código...' 
                        : isExpired 
                          ? '🔄 PEÇA NOVO CÓDIGO NA TV E CLIQUE AQUI' 
                          : '🤖 PUXAR CÓDIGO DO E-MAIL AGORA'}
                    </span>
                  </button>

                  {isExpired && (
                    <p className="text-center text-[11px] text-slate-400">
                      💡 Peça para a Netflix reenviar o código na sua Smart TV e clique no botão acima para capturar o novo na hora!
                    </p>
                  )}
                </div>
              ) : (
                /* Card do Código Puxado */
                <div className="p-4 sm:p-5 rounded-2xl border-2 space-y-4 shadow-xl animate-fadeIn bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/60 shadow-emerald-950/60">
                  
                  {/* Status & Timer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        CÓDIGO PUXADO DO E-MAIL
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Expira em: <strong>{formatTime(timeLeft)}</strong></span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Display Code */}
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

                  {/* Link Confirmation if present */}
                  {link && (
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
