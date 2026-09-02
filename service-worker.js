// ========================================
// SAIER INTERN
// Service Worker
// ========================================

const CACHE_NAME = "saier-intern-v2";

const DATEIEN = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./logo.png",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png"
];


// ========================================
// INSTALLATION
// ========================================

self.addEventListener("install", function(event) {

    console.log("SAIER INTERN: Neue Version wird installiert.");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function(cache) {

                return cache.addAll(DATEIEN);

            })

    );

    // Neue Version sofort aktivieren
    self.skipWaiting();

});


// ========================================
// AKTIVIERUNG
// ========================================

self.addEventListener("activate", function(event) {

    console.log("SAIER INTERN: Neue Version aktiviert.");

    event.waitUntil(

        caches.keys()
            .then(function(cacheNames) {

                return Promise.all(

                    cacheNames
                        .filter(function(cacheName) {

                            return cacheName !== CACHE_NAME;

                        })
                        .map(function(cacheName) {

                            return caches.delete(cacheName);

                        })

                );

            })

    );

    // Neue Version für alle Seiten übernehmen
    self.clients.claim();

});


// ========================================
// DATEIEN LADEN
// ========================================

self.addEventListener("fetch", function(event) {

    event.respondWith(

        fetch(event.request)
            .then(function(response) {

                // Erfolgreiche aktuelle Datei zurückgeben
                return response;

            })
            .catch(function() {

                // Wenn kein Internet vorhanden ist:
                // gespeicherte Version verwenden

                return caches.match(event.request);

            })

    );

});