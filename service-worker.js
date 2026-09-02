const CACHE_NAME = "saier-intern-v1";

const DATEIEN = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./logo.png",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


// App-Dateien speichern
self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function(cache) {

                return cache.addAll(DATEIEN);

            })

    );

});


// Gespeicherte Dateien verwenden
self.addEventListener("fetch", function(event) {

    event.respondWith(

        caches.match(event.request)
            .then(function(response) {

                return response || fetch(event.request);

            })

    );

});