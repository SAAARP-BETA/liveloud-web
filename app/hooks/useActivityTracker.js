import { useEffect, useRef } from "react";

const VISIBILITY_START_DELAY = 5000; // 5 seconds
const PERSIST_STOP_DELAY = 10000; // 10 seconds

export function useActivityTracker(token) {
    const visibilityTimerRef = useRef(null);
    const persistTimerRef = useRef(null);
    const activityStartedRef = useRef(false);

    const startHeartbeat = () => {
        // Prevent multiple "start" signals .
        if (!token || activityStartedRef.current) return;

        activityStartedRef.current = true;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity/heartbeat`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => console.error("Heartbeat failed:", err));
    };

    const stopAndPersist = (isUnloading = false) => {
        // Only persist if an activity session was actually started.
        if (!token || !activityStartedRef.current) return;

        activityStartedRef.current = false;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity/persist`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            keepalive: isUnloading,
        }).catch((err) => console.error("Persist failed:", err));
    };

    useEffect(() => {
        if (!token) return;

        const clearAllTimers = () => {
            if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
            if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
            visibilityTimerRef.current = null;
            persistTimerRef.current = null;
        };

        const handleVisibilityChange = () => {
            clearAllTimers();
            if (document.hidden) {
                // When tab is hidden, wait for a delay before persisting.
                persistTimerRef.current = setTimeout(() => stopAndPersist(false), PERSIST_STOP_DELAY);
            } else {
                // When tab is visible, wait for a delay before sending the start signal.
                visibilityTimerRef.current = setTimeout(startHeartbeat, VISIBILITY_START_DELAY);
            }
        };

        const handleUnload = () => stopAndPersist(true);

        // Initial check on mount
        handleVisibilityChange();

        window.addEventListener("beforeunload", handleUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearAllTimers();
            // Persist immediately on unmount if activity was running.
            if (activityStartedRef.current) {
                stopAndPersist(true);
            }
            window.removeEventListener("beforeunload", handleUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [token]);
}
