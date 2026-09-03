import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Copy, Check, Tv, Clock, Sparkles, Bot, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';

interface NetflixCodeFetcherProps {
  email?: string;
  password?: string;
  autoStart?: boolean;
  coverImage?: string;
  currentUser?: any;
}

const NETFLIX_DEFAULT_IMAGE = 'https://www.shutterstock.com/image-photo/rajasthan-jaipur-india-15-netflix-260nw-2195929279.jpg';

export const NetflixCodeFetcher: React.FC<NetflixCodeFetcherProps> = ({ 
  email = 'prine1070@gmail.com',
  password = 'roni1418rr',
  coverImage = NETFLIX_DEFAULT_IMAGE,
  currentUser
}) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 15-Minute Expiration Countdown (900 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      if (code && timeLeft === 0) {
        setIsExpired(true);
      }
      return;
    }

    setIsExpired(false);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, code]);

  // Formatter for MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pullBotCode = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const userDisplayName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '') || localStorage.getItem('streamhub_user_name') || '';

      const res = await fetch('/api/netflix/bot-pull-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-name': userDisplayName,
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ 
          email,
          userName: userDisplayName
        })
      });
      const data = await res.json();

      if (data.success && data.code && !data.isExpired) {
        setCode(data.code);
        setLink(data.link || null);
        setIsExpired(false);
        setTimeLeft(data.expiresIn || 900); // 15 minutes or remaining time
        setErrorMessage(null);

        // Sync live notification center instantly
        window.dispatchEvent(new CustomEvent('streamhub_notifications_updated'));
      } else if (data.isExpired) {
        setCode(null);
        setIsExpired(true);
        setTimeLeft(0);
        setErrorMessage(
          data.message || 
          '⏱️ O último código no e-mail já expirou (recebido há mais de 15 minutos). Por favor, peça para reenviar o código na sua Smart TV e clique novamente para puxar o código novo!'
        );
      } else {
        setErrorMessage(data.message || 'Nenhum código recente da Netflix encontrado. Peça para enviar o código na TV e clique em Puxar Código!');
      }
    } catch (err: any) {
      setErrorMessage('Erro de conexão ao ler a caixa de entrada. Tente novamente em alguns segundos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Progress percentage for the 15-minute bar (900 seconds)
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / 900) * 100));

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-red-500/40 shadow-2xl space-y-5">
      
      {/* Bot Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-red-500 shadow-lg shadow-red-600/30 bg-slate-900">
              <img
                src={coverImage}
                alt="Netflix Bot"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-white">
                Bot Netflix TV • Resgate de Código
              </h4>
              <span className="px-2.5 py-0.5 text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full uppercase tracking-wider">
                100% Grátis
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Puxe o código de 4 dígitos oficial enviado pela Netflix com validação de 15 minutos.
            </p>
          </div>
        </div>
      </div>

      {/* Passo a Passo Simples */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Como usar na sua Smart TV ou Aparelho:</span>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          {/* E-mail */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-300 font-black flex items-center justify-center text-xs shrink-0">1</span>
              <div>
                <span className="text-slate-400 block text-[11px]">E-mail para colocar na TV:</span>
                <strong className="text-red-300 font-mono text-xs sm:text-sm">{email}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copiado!' : 'Copiar E-mail'}</span>
            </button>
          </div>

          {/* Senha (para quem quiser entrar direto com senha) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-black flex items-center justify-center text-xs shrink-0">🔑</span>
              <div>
                <span className="text-slate-400 block text-[11px]">Senha (caso queira entrar direto):</span>
                <strong className="text-amber-300 font-mono text-xs sm:text-sm tracking-wider">{password}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyPassword}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
            >
              {copiedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPassword ? 'Copiado!' : 'Copiar Senha'}</span>
            </button>
          </div>

          {/* Passo 2 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
            <p className="leading-relaxed">
              Na sua TV, selecione a opção de <strong>Entrar com Código</strong>. Quando a TV pedir os 4 dígitos, clique no botão <strong>"Puxar Código do E-mail"</strong> abaixo.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
            <p className="leading-relaxed">
              O Bot puxa o código em tempo real com validade de <strong>15 minutos</strong>! Se o tempo acabar, basta pedir outro na TV e puxar de novo.
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de Código Expirado ou Mensagem do Bot */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 text-amber-200 text-xs flex items-start gap-3 animate-fadeIn shadow-lg shadow-amber-950/40">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <strong className="block text-amber-300 font-bold text-sm">Aviso de Validade:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Bot Action: Puxar Código ou Exibir Código Ativo */}
      {!code || isExpired ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={pullBotCode}
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
                ? '🤖 Conectando ao Gmail & Puxando Código...' 
                : isExpired 
                  ? '🔄 PEÇA NOVO CÓDIGO NA TV E CLIQUE AQUI' 
                  : '🤖 PUXAR CÓDIGO DO E-MAIL AGORA (GRÁTIS)'}
            </span>
          </button>

          {isExpired && (
            <p className="text-center text-[11px] text-slate-400">
              💡 Dica: A Netflix invalida códigos após 15 minutos. Peça o código na TV e clique acima para capturar o novo na hora.
            </p>
          )}
        </div>
      ) : (
        /* Card do Código Ativo e Válido */
        <div className="p-5 sm:p-6 rounded-3xl border-2 space-y-4 shadow-2xl animate-fadeIn bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/60 shadow-emerald-950/60">
          
          {/* Header do Status do Código */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                CÓDIGO DE 4 DÍGITOS ATIVO NO BOT
              </span>
            </div>

            {/* Contador Regressivo de 15 Minutos */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expira em: <strong>{formatTime(timeLeft)}</strong></span>
            </div>
          </div>

          {/* Barra de Progresso do Tempo Restante */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Número do Código e Botão de Copiar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Digite na sua Smart TV:</span>
              <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-[0.25em] drop-shadow-md">
                {code}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/40 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? 'CÓDIGO COPIADO!' : 'COPIAR CÓDIGO'}</span>
            </button>
          </div>

          {/* Opção de Validar Residência na TV se solicitado pela Netflix */}
          {link && (
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs text-slate-300 font-medium">
                A TV pediu confirmação de residência?
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Confirmar Residência na TV (1 Clique)</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  title="Copiar link direto"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Botão Gerar / Puxar Novo Código */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={pullBotCode}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Puxando...' : '🔄 Puxar Novo Código do E-mail (15 min)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

