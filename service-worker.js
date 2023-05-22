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

// self.addEventListener("message", (event) => {
//   if (event.data && event.data.action === "reloadAPI") {
//     // Perform async API call reload logic here
//     // This could involve clearing caches, fetching new data, etc.

//     // Once the reload is complete, post a message to the client
//     self.clients.matchAll().then((clients) => {
//       clients.forEach((client) => {
//         client.postMessage("APIReloaded");
//       });
//     });
//   }
// });