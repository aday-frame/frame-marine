/* ── FRAME MARINE — SERVICE WORKER ── */
'use strict';

const CACHE = 'frame-marine-v26';

const PRECACHE = [
  '/app.html',
  '/css/design-system.css',
  '/css/layout.css',
  '/css/components.css',
  '/js/data.js',
  '/js/app.js',
  '/js/work-orders.js',
  '/js/dashboard.js',
  '/js/monitoring.js',
  '/js/charter.js',
  '/js/owner.js',
  '/js/certificates.js',
  '/js/safety.js',
  '/js/inventory.js',
  '/js/budget.js',
  '/js/hours.js',
  '/js/documents.js',
  '/js/reports.js',
  '/js/kb.js',
  '/js/upgrade.js',
  '/js/roles.js',
  '/js/properties.js',
  '/js/procurement.js',
  '/js/compliance.js',
  '/js/search.js',
  '/js/offline.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Fonts: cache-first
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com') || url.includes('unpkg.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        });
      })
    );
    return;
  }

  // All other requests: network-first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp && resp.status === 200 && resp.type !== 'opaque') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
