self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const hasTag = Boolean(data.tag);
  const shouldRenotify = hasTag && Boolean(data.renotify);

  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: data.badge || "/badge.png",
    ...(hasTag && { tag: data.tag }),
    ...(hasTag && { renotify: shouldRenotify }),
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
