import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Wrapper so the Toaster can read the active theme from context
function ThemedToaster() {
    const { theme } = useTheme();
    return (
        <Toaster
            position="bottom-right"
            closeButton
            expand={false}
            richColors
            theme={theme} // "light" | "dark" | "system"
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
                <App {...props} />
                <ThemedToaster />
            </ThemeProvider>,
        );
    },
    progress: {
        color: "#e70013",
    },
});
