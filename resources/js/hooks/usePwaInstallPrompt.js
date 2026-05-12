import { useEffect, useState } from "react";

function isStandaloneDisplay() {
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.matchMedia?.("(display-mode: window-controls-overlay)").matches ||
        window.navigator.standalone === true
    );
}

export function usePwaInstallPrompt() {
    const [promptEvent, setPromptEvent] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setIsStandalone(isStandaloneDisplay());

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setPromptEvent(event);
        };

        const handleAppInstalled = () => {
            setPromptEvent(null);
            setIsStandalone(true);
        };

        const displayModeQuery = window.matchMedia?.(
            "(display-mode: standalone)",
        );
        const handleDisplayModeChange = () => {
            setIsStandalone(isStandaloneDisplay());
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);
        displayModeQuery?.addEventListener?.("change", handleDisplayModeChange);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
            displayModeQuery?.removeEventListener?.(
                "change",
                handleDisplayModeChange,
            );
        };
    }, []);

    const promptInstall = async () => {
        if (!promptEvent) return "unavailable";

        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        setPromptEvent(null);
        return choice?.outcome ?? "dismissed";
    };

    return {
        canPrompt: Boolean(promptEvent),
        isStandalone,
        promptInstall,
    };
}
