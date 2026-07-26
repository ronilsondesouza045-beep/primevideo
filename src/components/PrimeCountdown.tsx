import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

interface PrimeCountdownProps {
  createdAt?: string;
  className?: string;
}

export const PrimeCountdown: React.FC<PrimeCountdownProps> = ({
  createdAt,
  className = '',
}) => {
  // Target expiration date: 25/08/2026 23:59:59
  const getTargetDate = () => {
    if (createdAt) {
      const createdDate = new Date(createdAt);
      if (!isNaN(createdDate.getTime())) {
        // Add 31 days to created date
        const exp = new Date(createdDate);
        exp.setDate(exp.getDate() + 31);
        exp.setHours(23, 59, 59, 999);
        return exp;
      }
    }
    // Default fallback expiration date requested by user: 25/08/2026
    return new Date('2026-08-25T23:59:59');
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
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt]);

  const createdDateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('pt-BR')
    : '25/07/2026';

  const expDateStr = targetDate.toLocaleDateString('pt-BR');

  return (
    <div className={`p-3.5 bg-cyan-950/50 border border-cyan-500/30 rounded-2xl space-y-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 font-bold text-cyan-300">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          Validade em Tempo Real:
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
            timeLeft.isExpired
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}
        >
          {timeLeft.isExpired ? 'Expirado' : 'VIP Ativo'}
        </span>
      </div>

      {/* Countdown Grid */}
      {timeLeft.isExpired ? (
        <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>Este acesso do Prime Video expirou!</span>
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
          Criado em: <strong className="text-slate-200">{createdDateStr}</strong>
        </span>
        <span>
          Expira em: <strong className="text-cyan-300">{expDateStr}</strong>
        </span>
      </div>
    </div>
  );
};
