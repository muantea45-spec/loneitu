import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
      setShowOnlineToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showOnlineToast) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto bg-[#143520] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#256B3A] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="w-2 h-2 rounded-full bg-[#BFDC28] animate-ping shrink-0" />
        <Wifi className="w-4 h-4 text-[#BFDC28] shrink-0" />
        <span className="text-xs font-semibold">Signal a lo awm leh ta e (Online).</span>
      </div>
    );
  }

  if (isOffline && !dismissed) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[94%] bg-[#143520]/95 backdrop-blur-md text-white p-3.5 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border border-[#BFDC28]/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#BFDC28] flex items-center justify-center shrink-0 border border-[#BFDC28]/30">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
              <span>Offline Field Mode</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#BFDC28] text-[#143520] font-bold">Cached</span>
            </p>
            <p className="text-[11px] text-[#ADC6A7] mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none">
              Signal a awm lo chung pawhin thlai enkawl dan leh article dahkhawmte i chhiar thei reng e.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss offline banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
};
