/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE_NAME = `dettik-v${version}`;
const PRECACHE_ASSETS = [...new Set([...build, ...files])];

// ─── INSTALL : Précache tous les assets ─────────────────────────────────────
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => sw.skipWaiting())
  );
});

// ─── ACTIVATE : Nettoie les anciens caches ───────────────────────────────────
sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => sw.clients.claim())
  );
});

// ─── FETCH : Stratégies de cache ─────────────────────────────────────────────
sw.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Les données utilisateur passent désormais par /api sur la même origine :
  // sans cette exclusion, la stratégie « stale while revalidate » ci-dessous les
  // mettrait en cache et pourrait les resservir après une déconnexion.
  if (url.pathname.startsWith('/api/')) return;

  // Requêtes tierces (Clerk, Vercel Blob…) : jamais mises en cache.
  if (url.origin !== self.location.origin) return;

  // Assets précachés → Cache First
  if (PRECACHE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Navigation → Network First + fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Reste → Stale While Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      })
    )
  );
});