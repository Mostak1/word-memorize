import { useState, useEffect } from "react";

export function usePuter() {
    const [ready, setReady] = useState(
        typeof window !== "undefined" && !!window.puter
    );

    useEffect(() => {
        if (window.puter) { setReady(true); return; }
        const interval = setInterval(() => {
            if (window.puter) { setReady(true); clearInterval(interval); }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return { puter: ready ? window.puter : null, ready };
}