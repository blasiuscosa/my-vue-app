/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */
// importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js')
// import { precacheAndRoute } from 'workbox-precaching'
// precacheAndRoute(self.__WB_MANIFEST)

// if (workbox) {
//   workbox.routing.registerRoute(
//     /(.*)\.(?:png|gif|jpg|svg)/,
//     new workbox.strategies.CacheFirst({
//       cacheName: 'ibs-backoffice-images-cache-v1',
//       plugins: [
//         new workbox.expiration.ExpirationPlugin({
//           maxEntries: 50,
//           maxAgeSeconds: 30 * 24 * 60 * 60,
//         }),
//       ],
//     })
//   )
//
//   workbox.routing.registerRoute(
//     new RegExp('.*.css'),
//     new workbox.strategies.CacheFirst({
//       cacheName: 'ibs-backoffice-css-cache-v1',
//       plugins: [
//         new workbox.expiration.ExpirationPlugin({
//           maxEntries: 50,
//           maxAgeSeconds: 10 * 24 * 60 * 60,
//         }),
//       ],
//     })
//   )
//
//   workbox.routing.registerRoute(
//     new RegExp('.*.js'),
//     new workbox.strategies.StaleWhileRevalidate({
//       cacheName: 'ibs-backoffice-js-cache-v1',
//       maxAgeSeconds: 5 * 24 * 60 * 60,
//     })
//   )
//
//   workbox.precaching.precacheAndRoute(self.__precacheManifest, [])
//
//   workbox.routing.registerRoute('/', new workbox.strategies.NetworkFirst(), 'GET')
// }
