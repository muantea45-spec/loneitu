import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowDown, RefreshCw, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

const THRESHOLD = 65;
const MAX_PULL = 110;
const DAMPING = 0.42;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing' | 'completed'>('idle');

  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {}
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || statusRef.current === 'refreshing') return;

    // Only allow pull to refresh when scrolled to top of window
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY <= 0) {
      startYRef.current = e.touches[0].clientY;
      isTrackingRef.current = true;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTrackingRef.current || disabled || statusRef.current === 'refreshing') return;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY > 0) {
      // Scrolled down during gesture; cancel
      isTrackingRef.current = false;
      setPullDistance(0);
      setStatus('idle');
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Prevent browser default overscroll / native refresh when we handle it
      if (diff > 10 && e.cancelable) {
        e.preventDefault();
      }

      const damped = Math.min(MAX_PULL, diff * DAMPING);
      setPullDistance(damped);

      if (damped >= THRESHOLD && statusRef.current !== 'ready') {
        setStatus('ready');
        triggerHaptic();
      } else if (damped < THRESHOLD && statusRef.current !== 'pulling') {
        setStatus('pulling');
      }
    } else {
      isTrackingRef.current = false;
      setPullDistance(0);
      setStatus('idle');
    }
  }, [disabled, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isTrackingRef.current || disabled) return;
    isTrackingRef.current = false;

    if (statusRef.current === 'ready') {
      setStatus('refreshing');
      setPullDistance(56); // Hold at indicator height

      try {
        await onRefresh();
        setStatus('completed');
        setTimeout(() => {
          setPullDistance(0);
          setTimeout(() => setStatus('idle'), 250);
        }, 750);
      } catch (err) {
        console.error('Pull to refresh failed', err);
        setPullDistance(0);
        setStatus('idle');
      }
    } else {
      setPullDistance(0);
      setStatus('idle');
    }
  }, [disabled, onRefresh]);

  useEffect(() => {
    // Only register touch listeners on touch-capable devices
    if (typeof window === 'undefined' || !('ontouchstart' in window)) return;

    const options: AddEventListenerOptions = { passive: false };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, options);
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Rotation calculation based on pull percentage
  const rotation = Math.min(180, (pullDistance / THRESHOLD) * 180);

  return (
    <>
      {/* Pull Indicator Floating Capsule */}
      {(pullDistance > 0 || status === 'refreshing' || status === 'completed') && (
        <div
          className="fixed left-0 right-0 top-22 sm:top-24 z-30 pointer-events-none flex justify-center transition-transform duration-200"
          style={{
            transform: `translateY(${Math.max(0, pullDistance - 16)}px)`,
          }}
        >
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full border border-[#DDD4BC] shadow-md text-xs font-semibold text-[#143520] transition-all">
            {status === 'refreshing' ? (
              <>
                <RefreshCw className="w-4 h-4 text-[#256B3A] animate-spin" />
                <span>Data thar lak mek a ni...</span>
              </>
            ) : status === 'completed' ? (
              <>
                <div className="w-4 h-4 rounded-full bg-[#256B3A] flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-[#256B3A] font-bold">A thar ber a ni tawh e!</span>
              </>
            ) : status === 'ready' ? (
              <>
                <div
                  className="w-4 h-4 text-[#256B3A] transition-transform duration-200"
                  style={{ transform: 'rotate(180deg)' }}
                >
                  <ArrowDown className="w-4 h-4" />
                </div>
                <span className="font-bold text-[#256B3A]">Thlah rawh le...</span>
              </>
            ) : (
              <>
                <div
                  className="w-4 h-4 text-[#6F5B3C] transition-transform duration-75"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <ArrowDown className="w-4 h-4" />
                </div>
                <span className="text-[#6F5B3C] font-medium">Pawt thla rawh...</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.35}px)` : 'none',
        }}
      >
        {children}
      </div>
    </>
  );
};

