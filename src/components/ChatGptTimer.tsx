import React, { useState, useEffect } from 'react';
import { Calendar, Timer } from 'lucide-react';

interface ChatGptTimerProps {
  variant?: 'card' | 'modal';
}

export const ChatGptTimer: React.FC<ChatGptTimerProps> = ({ variant = 'card' }) => {
  const startDate = '11/08/2026';
  const endDate = '11/09/2026';
  // Target expiration: 11 de Setembro de 2026 às 23:59:59
  const targetTimestamp = new Date('2026-09-11T23:59:59').getTime();

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  function calculateTimeLeft() {
    const now = Date.now();
    const diff = Math.max(0, targetTimestamp - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, diff };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  if (variant === 'modal') {
    return (
      <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Validade da Conta em Tempo Real
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Contagem regressiva até o término da licença
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Criação: <strong className="text-white">{startDate}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Término: <strong className="text-emerald-400">{endDate}</strong></span>
          </div>
        </div>

        {/* Live Timer Boxes */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2 sm:p-2.5">
            <span className="block text-lg sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {format2Digits(timeLeft.days)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dias</span>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2 sm:p-2.5">
            <span className="block text-lg sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {format2Digits(timeLeft.hours)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Horas</span>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2 sm:p-2.5">
            <span className="block text-lg sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {format2Digits(timeLeft.minutes)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min</span>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2 sm:p-2.5 bg-emerald-950/40">
            <span className="block text-lg sm:text-2xl font-black text-emerald-300 font-mono tracking-tight animate-pulse">
              {format2Digits(timeLeft.seconds)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Seg</span>
          </div>
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 mb-3.5 shadow-md">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Criação: <strong className="text-white">{startDate}</strong></span>
        </div>
        <div className="text-slate-300">
          Término: <strong className="text-emerald-400">{endDate}</strong>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
          <Timer className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Tempo Restante:</span>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-500/30">
          <span className="text-emerald-400">{timeLeft.days}d</span>
          <span className="text-slate-500">:</span>
          <span>{format2Digits(timeLeft.hours)}h</span>
          <span className="text-slate-500">:</span>
          <span>{format2Digits(timeLeft.minutes)}m</span>
          <span className="text-slate-500">:</span>
          <span className="text-emerald-300">{format2Digits(timeLeft.seconds)}s</span>
        </div>
      </div>
    </div>
  );
};
