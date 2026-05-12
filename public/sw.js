const CACHE_PREFIX = "vocabpix";
const CACHE_VERSION = "v1";
const APP_CACHE = `${CACHE_PREFIX}-${CACHE_VERSION}-app`;
const OFFLINE_URL = "/offline.html";

const CORE_ASSETS = [
    OFFLINE_URL,
    "/manifest.webmanifest",
    "/favicon.ico",
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/icons/icon-maskable-512x512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(APP_CACHE).then((cache) =>
            Promise.allSettled(
                CORE_ASSETS.map((asset) =>
                    cache.add(new Request(asset, { cache: "reload" })),
                ),
            ),
        ),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) =>
                                key.startsWith(`${CACHE_PREFIX}-`) &&
                                key !== APP_CACHE,
                        )
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (!["http:", "https:"].includes(url.protocol)) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(APP_CACHE).then((cache) => {
                        cache.put(request, copy);
                    });
                    return response;
                })
                .catch(async () => {
                    return (
                        (await caches.match(request)) ||
                        (await caches.match(OFFLINE_URL))
                    );
                }),
        );
        return;
    }

    if (
        url.origin === self.location.origin &&
        (url.pathname.startsWith("/build/") ||
            ["image", "font", "style", "script"].includes(request.destination))
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const network = fetch(request)
                    .then((response) => {
                        const copy = response.clone();
                        caches.open(APP_CACHE).then((cache) => {
                            cache.put(request, copy);
                        });
                        return response;
                    })
                    .catch(() => cached);

                return cached || network;
            }),
        );
    }
});
