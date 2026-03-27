/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

const sw = globalThis.self as unknown as ServiceWorkerGlobalScope

// Precache all SvelteKit build output
const precacheList = [...build, ...files, ...prerendered].map((url) => ({
	url,
	revision: version
}))

precacheAndRoute(precacheList)
cleanupOutdatedCaches()

// API: NetworkFirst, 10s timeout, 24h cache
registerRoute(
	({ url }) => url.pathname.startsWith('/api/'),
	new NetworkFirst({
		cacheName: 'api-cache',
		networkTimeoutSeconds: 10,
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86400 })
		]
	})
)

// Images: CacheFirst, 30 days
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'images-cache',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 2592000 })
		]
	})
)

// Fonts: StaleWhileRevalidate, 1 year
registerRoute(
	({ request }) => request.destination === 'font',
	new StaleWhileRevalidate({
		cacheName: 'fonts-cache',
		plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 31536000 })]
	})
)

sw.addEventListener('install', () => {
	sw.skipWaiting()
})

sw.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(sw.clients.claim())
})

sw.addEventListener('message', (event: ExtendableMessageEvent) => {
	if (event.data?.type === 'SKIP_WAITING') {
		sw.skipWaiting()
	}
})
