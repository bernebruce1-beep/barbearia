// Service worker do painel: só permite instalar como aplicativo.
// Não guarda nada em cache, então os dados vêm sempre atualizados.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", () => {});
