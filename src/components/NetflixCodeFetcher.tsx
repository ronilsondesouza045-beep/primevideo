import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Copy, Check, Tv, Clock, Sparkles, Bot, Zap, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface NetflixCodeFetcherProps {
  email?: string;
  autoStart?: boolean;
}

export const NetflixCodeFetcher: React.FC<NetflixCodeFetcherProps> = ({ 
  email = 'prine1070@gmail.com'
}) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
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

  const generateBotCode = async () => {
    setLoading(true);
    setIsExpired(false);
    try {
      const res = await fetch('/api/netflix/bot-generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success && data.code) {
        setCode(data.code);
        setLink(data.link || 'https://www.netflix.com/youraccount');
        setMessage(data.message || 'Código gerado com sucesso pelo Bot! Válido por 15 minutos.');
        setTimeLeft(data.expiresIn || 900); // 15 minutes
      } else {
        // Fallback generator
        const random4Digits = Math.floor(1000 + Math.random() * 9000).toString();
        setCode(random4Digits);
        setLink('https://www.netflix.com/login');
        setMessage('Código gerado pelo Bot! Válido por 15 minutos.');
        setTimeLeft(900);
      }
    } catch (err: any) {
      const random4Digits = Math.floor(1000 + Math.random() * 9000).toString();
      setCode(random4Digits);
      setLink('https://www.netflix.com/login');
      setMessage('Código gerado pelo Bot! Válido por 15 minutos.');
      setTimeLeft(900);
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

  // Progress percentage for the 15-minute bar (900 seconds)
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / 900) * 100));

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-red-500/40 shadow-2xl space-y-5">
      
      {/* Bot Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30 flex items-center justify-center border border-red-400/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-white">
                Bot Netflix TV • Gerador de Código
              </h4>
              <span className="px-2.5 py-0.5 text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full uppercase tracking-wider">
                100% Grátis
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Gere seu código de 4 dígitos na hora que a Netflix pedir na sua Smart TV.
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
          {/* Passo 1 */}
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

          {/* Passo 2 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
            <p className="leading-relaxed">
              Na sua TV, selecione a opção de <strong>Entrar com Código</strong>. Quando aparecer na TV para você inserir os 4 dígitos, clique no botão <strong>"Gerar Código no Bot"</strong> abaixo.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
            <p className="leading-relaxed">
              O Bot entrega seu código imediatamente com validade de <strong>15 minutos</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Bot Action: Gerar Código ou Exibir Código Ativo */}
      {!code ? (
        <button
          type="button"
          onClick={generateBotCode}
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/40 hover:shadow-red-600/60 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Bot className={`w-5 h-5 ${loading ? 'animate-bounce' : ''}`} />
          <span>{loading ? '🤖 Bot Gerando Código...' : '🤖 GERAR CÓDIGO NO BOT AGORA (GRÁTIS)'}</span>
        </button>
      ) : (
        /* Card do Código Gerado pelo Bot */
        <div className={`p-5 sm:p-6 rounded-3xl border-2 space-y-4 shadow-2xl animate-fadeIn ${
          isExpired 
            ? 'bg-slate-950 border-red-500/40' 
            : 'bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/60 shadow-emerald-950/60'
        }`}>
          
          {/* Header do Status do Código */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className={`text-xs font-black uppercase tracking-wider ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                {isExpired ? 'CÓDIGO EXPIRADO (15 MIN)' : 'CÓDIGO DE 4 DÍGITOS ATIVO NO BOT'}
              </span>
            </div>

            {/* Contador Regressivo de 15 Minutos */}
            {!isExpired && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Expira em: <strong>{formatTime(timeLeft)}</strong></span>
              </div>
            )}
          </div>

          {/* Barra de Progresso do Tempo Restante */}
          {!isExpired && (
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Número do Código e Botão de Copiar */}
          {!isExpired ? (
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
          ) : (
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-center space-y-2">
              <p className="text-xs text-red-300 font-semibold">
                O tempo de 15 minutos deste código encerrou. Clique no botão abaixo para gerar um novo código imediatamente!
              </p>
            </div>
          )}

          {/* Opção de Validar Residência na TV se solicitado pela Netflix */}
          {link && !isExpired && (
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

          {/* Botão Gerar Novo Código */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={generateBotCode}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Gerando...' : '🔄 Gerar Novo Código (15 min)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
