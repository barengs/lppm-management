import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const AUTO_LOGOUT_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds

/**
 * Hook to track user inactivity and trigger lockscreen/logout
 * @param {Function} onLockScreen - Callback when 30 minutes of inactivity
 * @param {Function} onAutoLogout - Callback when 60 minutes of inactivity
 * @param {boolean} isLocked - Current lock state
 */
export default function useInactivityTracker(onLockScreen, onAutoLogout, isLocked = false) {
    const lockTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const resetTimers = useCallback(() => {
        // Don't reset if already locked
        if (isLocked) return;

        lastActivityRef.current = Date.now();
        
        // Clear existing timers
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        // Set lockscreen timer (30 minutes)
        lockTimerRef.current = setTimeout(() => {
            console.log('30 minutes of inactivity - triggering lockscreen');
            onLockScreen();
        }, INACTIVITY_TIMEOUT);

        // Set auto-logout timer (60 minutes)
        logoutTimerRef.current = setTimeout(() => {
            console.log('60 minutes of inactivity - auto logout');
            onAutoLogout();
        }, AUTO_LOGOUT_TIMEOUT);
    }, [onLockScreen, onAutoLogout, isLocked]);

    useEffect(() => {
        // Activity events to track
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        // Reset timers on any activity
        events.forEach(event => {
            window.addEventListener(event, resetTimers);
        });

        // Initialize timers
        resetTimers();

        // Cleanup
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimers);
            });
            if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    }, [resetTimers]);

    // Reset timers when unlocked
    useEffect(() => {
        if (!isLocked) {
            resetTimers();
        }
    }, [isLocked, resetTimers]);

    return {
        lastActivity: lastActivityRef.current,
        resetTimers
    };
}
