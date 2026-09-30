// Service worker do painel: só permite instalar como aplicativo.
// Não guarda nada em cache, então os dados vêm sempre atualizados.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", () => {});


// Tocar na notificação abre (ou traz para frente) o painel.

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(janelas => {
            const painel = janelas.find(janela => janela.url.includes("admin.html"));
            return painel ? painel.focus() : self.clients.openWindow("admin.html");
        })
    );
});
