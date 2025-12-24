const CACHE_NAME = "calc-v6";

const SHELL = [
    "/static/style.css",
    "/static/script.js",
    "/static/manifest.json",
    "/static/offline.html"
];

// Install
self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
    );
});

// Activate
self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

// Fetch
self.addEventListener("fetch", event => {
    const req = event.request;

    // API → network first
    if (req.url.includes("/calculate")) {
        event.respondWith(
            fetch(req).catch(() =>
                new Response(
                    JSON.stringify({ result: "Offline", history: [] }),
                    { headers: { "Content-Type": "application/json" } }
                )
            )
        );
        return;
    }

    // Navigation → app shell
    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req).catch(() =>
                caches.match("/static/offline.html")
            )
        );
        return;
    }

    // Static assets
    event.respondWith(
        caches.match(req).then(cached => cached || fetch(req))
    );
});
