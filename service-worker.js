import { manifest, version } from "@parcel/service-worker";

/**
 * Asynchronous function to install a service worker.
 * It caches the specified resources from the manifest.
 */
async function install() {
  const cache = await caches.open(version);
  // console.log(version);
  await cache.addAll(manifest);
}

// Add an event listener for the "install" event.
addEventListener("install", (e) => e.waitUntil(install()));

/**
 * Asynchronous function to activate a service worker.
 * It removes older caches to clean up storage.
 */
async function activate() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => key !== version && caches.delete(key)));
}

// Event listener for the "activate" event of a service worker before performing activation tasks.
addEventListener("activate", (e) => e.waitUntil(activate()));

/**
 * Event listener for the "install" event of a service worker.
 * It sets a timer to skip waiting and notify all clients to navigate to their current URL.
 */
self.addEventListener("install", () => {
  // Set a timeout to skip waiting and refresh clients after a delay.
  setTimeout(() => {
    // Skip waiting to activate the new service worker.
    self.skipWaiting();

    // Notify all clients to navigate to their current URL.
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.navigate(client.url);
      });
    });
  }, 60000 * 10); // Delay of 10 seconds
});
