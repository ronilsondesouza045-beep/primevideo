import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-lg backdrop-blur-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Você está offline. Algumas funcionalidades e solicitações de acesso podem ficar indisponíveis até que a conexão seja restabelecida.</span>
    </div>
  );
};
