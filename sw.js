/**
 * Looptap Service worker
 */

const version = "1.1.3";
const currentCacheName = "looptap-v" + version;

self.addEventListener("install", function(e) {
	console.log("Install event triggered. New updates available.");
	const filesToCache = ["/", "/favicon.ico", "/vue.min.js", "/style.css", "/script.js", "/manifest.json"];

	// Deleting the previous version of cache
	e.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter((cacheName) => cacheName != currentCacheName).map((cacheName) => caches.delete(cacheName))
			);
		})
	);

	// add the files to cache
	e.waitUntil(
		caches.open(currentCacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.match(event.request).then(function(cache) {
			return cache || fetch(event.request);
		})
	);
});
