// import "../css/app.css";
// import "./bootstrap";

// import { createInertiaApp } from "@inertiajs/react";
// import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
// import { createRoot } from "react-dom/client";
// import { Toaster } from "sonner";
// import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";

// const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// // Wrapper so the Toaster can read the active theme from context
// function ThemedToaster() {
//     const { theme } = useTheme();
//     return (
//         <Toaster
//             position="bottom-right"
//             closeButton
//             expand={false}
//             richColors
//             theme={theme} // "light" | "dark" | "system"
//         />
//     );
// }

// createInertiaApp({
//     title: (title) => `${title} - ${appName}`,
//     resolve: (name) =>
//         resolvePageComponent(
//             `./Pages/${name}.jsx`,
//             import.meta.glob("./Pages/**/*.jsx"),
//         ),
//     setup({ el, App, props }) {
//         const root = createRoot(el);

//         root.render(
//             <ThemeProvider defaultTheme="light" storageKey="admin-theme">
//                 <App {...props} />
//                 <ThemedToaster />
//             </ThemeProvider>,
//         );
//     },
//     progress: {
//         color: "#e70013",
//     },
// });
import { registerSW } from "virtual:pwa-register";
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

// ----------------------------
// PWA: Register Service Worker
// ----------------------------
// if ("serviceWorker" in navigator) {
//     window.addEventListener("load", () => {
//         navigator.serviceWorker
//             .register("/sw.js")
//             .then((registration) => {
//                 console.log("Service Worker registered:", registration);
//             })
//             .catch((error) => {
//                 console.log("Service Worker registration failed:", error);
//             });
//     });
// }

registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log("New version available");
    },
    onOfflineReady() {
        console.log("App ready for offline use");
    },
});
