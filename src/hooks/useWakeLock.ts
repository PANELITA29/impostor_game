import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to manage Screen Wake Lock API to prevent the device display
 * from dimming or locking during critical gameplay moments.
 *
 * Automatically re-acquires the lock on `visibilitychange` when returning to foreground.
 */
export function useWakeLock(enabled: boolean = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockSentinelRef = useRef<any>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;

    try {
      if (wakeLockSentinelRef.current && !wakeLockSentinelRef.current.released) {
        return;
      }
      const sentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinelRef.current = sentinel;
      setIsActive(true);

      sentinel.addEventListener('release', () => {
        setIsActive(false);
        wakeLockSentinelRef.current = null;
      });
    } catch (err: any) {
      // Screen Wake Lock could be refused if battery saver is on or window minimized
      setIsActive(false);
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
      } catch {
        // Ignore release errors
      } finally {
        wakeLockSentinelRef.current = null;
        setIsActive(false);
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      requestLock();
    } else {
      releaseLock();
    }

    // Re-acquire lock when coming back to the tab/app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [enabled, requestLock, releaseLock]);

  return { isSupported, isActive };
}

