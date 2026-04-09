import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { registerSW } from "virtual:pwa-register";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

const updateSW = registerSW({
    immediate: false,
    onNeedRefresh() {
        toast.info("A new version is ready.", {
            action: {
                label: "Refresh",
                onClick: () => updateSW(true),
            },
            duration: Infinity,
        });
    },
    onOfflineReady() {
        toast.success("Offline support is ready.");
    },
    onRegistered(registration) {
        console.log("Service Worker registered:", registration);
    },
    onRegisterError(error) {
        console.error("Service Worker registration failed:", error);
    },
});

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

        root.render(
            <ThemeProvider defaultTheme="light" storageKey="admin-theme">
                <PageLoadingState />
                <App {...props} />
                <ThemedToaster />
            </ThemeProvider>,
        );

        // Hide splash screen on app mount
        const splash = document.getElementById("app-splash");
        if (splash) {
            splash.classList.add("opacity-0", "pointer-events-none");
            setTimeout(() => splash.remove(), 500);
        }
    },
    progress: {
        color: "#e70013",
    },
});
