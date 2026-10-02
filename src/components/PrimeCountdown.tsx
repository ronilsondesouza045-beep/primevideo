import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, ShieldCheck, Lock } from 'lucide-react';

interface PrimeCountdownProps {
  createdAt?: string;
  expiresAt?: string;
  className?: string;
  onExpire?: () => void;
}

export const PrimeCountdown: React.FC<PrimeCountdownProps> = ({
  createdAt,
  expiresAt,
  className = '',
  onExpire,
}) => {
  // Target expiration date requested by user: 26/10/2026
  const getTargetDate = () => {
    if (expiresAt) {
      const exp = new Date(expiresAt);
      if (!isNaN(exp.getTime())) return exp;
    }
    // Target expiration date: 26/10/2026 23:59:59
    return new Date('2026-10-26T23:59:59.999Z');
  };

  const targetDate = getTargetDate();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate.getTime() - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const checkTimer = () => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired && onExpire) {
        onExpire();
      }
    };

    checkTimer();
    const timer = setInterval(checkTimer, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, createdAt]);

  const createdDateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('pt-BR')
    : '26/09/2026';

  const expDateStr = '26/10/2026';

  return (
    <div className={`p-3.5 bg-gradient-to-b from-cyan-950/60 to-slate-950/80 border border-cyan-500/30 rounded-2xl space-y-2.5 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 font-bold text-cyan-300">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          Validade em Tempo Real:
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
            timeLeft.isExpired
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-sm'
          }`}
        >
          {timeLeft.isExpired ? (
            <>
              <Lock className="w-3 h-3 text-red-400" />
              <span>Bloqueado (Expirado)</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Liberado / VIP Ativo</span>
            </>
          )}
        </span>
      </div>

      {/* Countdown Grid */}
      {timeLeft.isExpired ? (
        <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Este acesso do Prime Video expirou em 26/10/2026 e foi bloqueado automaticamente!</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-sm">
            <span className="block text-base sm:text-lg font-black text-cyan-300 font-mono leading-none mb-1">
              {timeLeft.days}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Dias</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-sm">
            <span className="block text-base sm:text-lg font-black text-cyan-300 font-mono leading-none mb-1">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Horas</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-sm">
            <span className="block text-base sm:text-lg font-black text-cyan-300 font-mono leading-none mb-1">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Min</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-sm">
            <span className="block text-base sm:text-lg font-black text-amber-400 font-mono leading-none mb-1">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Seg</span>
          </div>
        </div>
      )}

      {/* Footer Info Dates */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-cyan-500/15 font-medium">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          Criação: <strong className="text-slate-200">{createdDateStr}</strong>
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-cyan-400" />
          Vencimento: <strong className="text-cyan-300">{expDateStr}</strong>
        </span>
      </div>
    </div>
  );
};
