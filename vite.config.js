import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            includeAssets: [
                "favicon.ico",
                "apple-touch-icon.png",
                "masked-icon.svg",
            ],
            manifest: {
                name: "VocabPix",
                short_name: "VocabPix",
                description: "Learn and memorize vocabulary with a fast installable app.",
                id: "/",
                lang: "en",
                theme_color: "#e70013",
                background_color: "#ffffff",
                display: "standalone",
                display_override: ["window-controls-overlay", "standalone", "minimal-ui", "browser"],
                start_url: "/",
                scope: "/",
                orientation: "portrait",
                categories: ["education", "productivity"],
                icons: [
                    {
                        src: "/icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/icons/icon-maskable-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3,mpeg}"],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) =>
                            request.destination === "document",
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "pages",
                            networkTimeoutSeconds: 5,
                        },
                    },
                    {
                        urlPattern: ({ request }) =>
                            ["style", "script", "worker"].includes(
                                request.destination
                            ),
                        handler: "StaleWhileRevalidate",
                        options: {
                            cacheName: "assets",
                        },
                    },
                    {
                        urlPattern: ({ request }) =>
                            request.destination === "image",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "images",
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },
});
