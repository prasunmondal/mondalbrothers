const CACHE_NAME = "mb-poultry-cache-v4";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./pwa-installation.js",
  "./log-worker.js",
  "./local-name-storage.js",
  "./header-style.css",
  "./service-worker.js",

  "./retail-calculator/retail-calculator.html",
  "./retail-calculator/retail-calculator-script.css",
  "./retail-calculator/retail-calculator-script.js",
  "./retail-calculator/retail-calculator-style.css",
  "./retail-calculator/sales-report.css",
  "./retail-calculator/sales-report.js",

  "./images/payment-qr.jpeg",
  "./images/icon-192.jpg",
  "./images/icon-512.jpg",
  "./images/mb-icon.png"
  "./images/right-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});


self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
