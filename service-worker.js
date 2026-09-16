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

// ========================================
// PUSH-NACHRICHTEN
// ========================================

self.addEventListener("push", function(event) {

    let daten = {};

    try {

        daten = event.data
            ? event.data.json()
            : {};

    } catch (error) {

        console.error(
            "SAIER INTERN: Push-Daten konnten nicht gelesen werden.",
            error
        );

        daten = {
            titel: "SAIER INTERN",
            nachricht: event.data
                ? event.data.text()
                : "Du hast eine neue Nachricht."
        };

    }

    const titel =
        daten.titel ||
        "SAIER INTERN";

    const nachricht =
        daten.nachricht ||
        daten.body ||
        "Du hast eine neue Nachricht.";

    const optionen = {

        body: nachricht,

        icon: "./icon-192.png",

        badge: "./icon-192.png",

        data: {

            url: daten.url ||
                "./"

        }

    };

    event.waitUntil(

        self.registration.showNotification(
            titel,
            optionen
        )

    );

});


// ========================================
// PUSH-NACHRICHT ANGEKLICKT
// ========================================

self.addEventListener(
    "notificationclick",
    function(event) {

        event.notification.close();

        const ziel =
            event.notification.data?.url ||
            "./";

        event.waitUntil(

            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            })

            .then(function(clientList) {

                for (const client of clientList) {

                    if (
                        client.url.includes(
                            self.location.origin
                        ) &&
                        "focus" in client
                    ) {

                        return client.focus();

                    }

                }

                if (clients.openWindow) {

                    return clients.openWindow(
                        ziel
                    );

                }

            })

        );

    }
);