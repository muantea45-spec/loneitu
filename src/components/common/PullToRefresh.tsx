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
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);
  const isPullGestureRef = useRef<boolean | null>(null);
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
    if (disabled || statusRef.current === 'refreshing' || e.touches.length > 1) return;

    // Only allow pull to refresh when scrolled to top of window
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY <= 0) {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      isTrackingRef.current = true;
      isPullGestureRef.current = null;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTrackingRef.current || disabled || statusRef.current === 'refreshing' || e.touches.length > 1) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY > 0) {
      // Scrolled down during gesture; cancel
      isTrackingRef.current = false;
      isPullGestureRef.current = false;
      setIsDragging(false);
      setPullDistance(0);
      setStatus('idle');
      return;
    }

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // Direction locking: distinguish between horizontal swipe and downward pull
    if (isPullGestureRef.current === null) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      if (absX > 6 || absY > 6) {
        if (absX >= absY || diffY <= 0) {
          // Horizontal or upward gesture; abort pull tracking
          isTrackingRef.current = false;
          isPullGestureRef.current = false;
          setIsDragging(false);
          setPullDistance(0);
          setStatus('idle');
          return;
        } else {
          // Definite vertical downward pull gesture
          isPullGestureRef.current = true;
          setIsDragging(true);
        }
      } else {
        return;
      }
    }

    if (!isPullGestureRef.current) return;

    if (diffY > 0) {
      // Strictly prevent browser default overscroll / horizontal drift
      if (e.cancelable) {
        e.preventDefault();
      }

      const damped = Math.min(MAX_PULL, diffY * DAMPING);
      setPullDistance(damped);

      if (damped >= THRESHOLD && statusRef.current !== 'ready') {
        setStatus('ready');
        triggerHaptic();
      } else if (damped < THRESHOLD && statusRef.current !== 'pulling') {
        setStatus('pulling');
      }
    } else {
      isTrackingRef.current = false;
      isPullGestureRef.current = false;
      setIsDragging(false);
      setPullDistance(0);
      setStatus('idle');
    }
  }, [disabled, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isTrackingRef.current || disabled) return;
    isTrackingRef.current = false;
    isPullGestureRef.current = null;
    setIsDragging(false);

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
    <div className="relative w-full max-w-full overflow-x-hidden">
      {/* Pull Indicator Floating Capsule */}
      {(pullDistance > 0 || status === 'refreshing' || status === 'completed') && (
        <div
          className={`fixed inset-x-0 top-22 sm:top-24 z-30 pointer-events-none flex justify-center w-full max-w-full overflow-hidden ${
            isDragging ? 'transition-none' : 'transition-transform duration-250 ease-out'
          }`}
          style={{
            transform: `translate3d(0, ${Math.max(0, pullDistance - 16)}px, 0)`,
            WebkitTransform: `translate3d(0, ${Math.max(0, pullDistance - 16)}px, 0)`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
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
        className={`w-full max-w-full overflow-x-hidden ${
          isDragging ? 'transition-none' : 'transition-transform duration-250 ease-out'
        }`}
        style={{
          transform: pullDistance > 0 ? `translate3d(0, ${pullDistance * 0.35}px, 0)` : 'none',
          WebkitTransform: pullDistance > 0 ? `translate3d(0, ${pullDistance * 0.35}px, 0)` : 'none',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          willChange: pullDistance > 0 ? 'transform' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};
