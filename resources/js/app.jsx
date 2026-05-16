import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { LanguageProvider } from "@/Contexts/LanguageContext";
import { TelemetryProvider } from "@/Utils/telemetry";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

function registerAppServiceWorker(assetUrl) {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", async () => {
        try {
            const baseUrl = assetUrl || window.location.origin;
            const registration = await navigator.serviceWorker.register(`${baseUrl}/sw.js`, {
                scope: `${baseUrl}/`,
            });

            registration.addEventListener("updatefound", () => {
                const worker = registration.installing;
                if (!worker) return;

                worker.addEventListener("statechange", () => {
                    if (worker.state !== "installed") return;

                    if (navigator.serviceWorker.controller) {
                        toast.info("A new version is ready.", {
                            action: {
                                label: "Refresh",
                                onClick: () => {
                                    worker.postMessage({ type: "SKIP_WAITING" });
                                    window.location.reload();
                                },
                            },
                            duration: Infinity,
                        });
                    } else {
                        toast.success("Offline support is ready.");
                    }
                });
            });
        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    });
}

function ThemedToaster() {
    const { theme } = useTheme();

    return (
        <Toaster
            position="bottom-right"
            closeButton
            expand={false}
            richColors
            theme={theme}
        />
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        registerAppServiceWorker(props.initialPage.props.assetUrl);
        const isAdmin =
            props.initialPage.props.auth?.user?.role === "admin" || false;

        const initialLocale =
            props.initialPage.props.userSettings?.ui_language || "en";
            
        root.render(
            <ThemeProvider
                defaultTheme="light"
                storageKey="admin-theme"
                isAdmin={isAdmin}
            >
                <LanguageProvider initialLocale={initialLocale}>
                    <TelemetryProvider initialPage={props.initialPage}>
                        <App {...props} />
                    </TelemetryProvider>
                </LanguageProvider>
                <ThemedToaster />
            </ThemeProvider>,
        );

        // Hide splash screen on app mount
        const splash = document.getElementById("app-splash");
        if (splash) {
            splash.classList.add("opacity-0", "pointer-events-none");
            setTimeout(() => splash.remove(), 500);
        }

        // Online/Offline status listeners
        window.addEventListener("online", () => {
            toast.success("You are back online!", {
                id: "connection-status",
                duration: 4000,
            });
        });

        window.addEventListener("offline", () => {
            toast.error("No internet connection. Some features may be limited.", {
                id: "connection-status",
                duration: Infinity,
            });
        });
    },
    progress: {
        color: "#e70013",
    },
});
