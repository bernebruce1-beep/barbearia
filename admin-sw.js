// Service worker do painel: só permite instalar como aplicativo.
// Não guarda nada em cache, então os dados vêm sempre atualizados.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", () => {});


// Notificação que chega do servidor (mesmo com o painel fechado).

self.addEventListener("push", event => {
    let dados = {};

    try {
        dados = event.data ? event.data.json() : {};
    } catch (erro) {
        dados = { titulo: "Novo agendamento", corpo: event.data?.text() || "" };
    }

    event.waitUntil(
        self.registration.showNotification(dados.titulo || "✂️ Novo agendamento", {
            body: dados.corpo || "",
            icon: "admin-icon-192.png",
            badge: "admin-icon-192.png",
            tag: "agendamento-" + Date.now(),
            vibrate: [200, 100, 200],
            data: { url: dados.url || "admin.html" }
        })
    );
});


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
