import { manifest, version } from "@parcel/service-worker";

async function install() {
  const cache = await caches.open(version);
  // console.log(version);
  await cache.addAll(manifest);
}

addEventListener("install", (e) => e.waitUntil(install()));

async function activate() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => key !== version && caches.delete(key)));
}

addEventListener("activate", (e) => e.waitUntil(activate()));

self.addEventListener("install", () => {
  setTimeout(() => {
    self.skipWaiting();
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.navigate(client.url);
      });
    });
  }, 60000 * 10);
});
