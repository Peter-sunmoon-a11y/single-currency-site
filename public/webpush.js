let notificationIcon = "/favicon/web-app-manifest-192x192.png";

try {
  const channel = new BroadcastChannel("notification_logo");
  channel.onmessage = (event) => {
    const icon = event?.data?.icon;
    if (typeof icon === "string" && icon) {
      notificationIcon = icon;
    }
  };
} catch {
  // BroadcastChannel not supported
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { data: { body: event.data.text() } };
  }

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || "Notification";
  const body = notification.body || data.body || "";
  const icon = notification.icon || data.icon || notificationIcon;
  const image = notification.image || data.image || "";
  const badge = data.badge || icon;
  const options = {
    body,
    icon,
    badge,
    data,
  };
  if (typeof image === "string" && image.trim() !== "") {
    options.image = image;
  }

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification?.data || {};
  let targetUrl = data.click_action || data.link || data.url || "/";

  if (data.task_id) {
    const sep = targetUrl.includes("?") ? "&" : "?";
    targetUrl = `${targetUrl}${sep}_crm_click=${encodeURIComponent(data.task_id)}`;
  }

  event.waitUntil(
    (async () => {
      const normalizedTargetUrl = new URL(targetUrl, self.location.origin).toString();
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clients) {
        if (client.url === normalizedTargetUrl && "focus" in client) {
          await client.focus();
          return;
        }
      }

      for (const client of clients) {
        if ("focus" in client && "navigate" in client) {
          await client.focus();
          await client.navigate(normalizedTargetUrl);
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(normalizedTargetUrl);
      }
    })(),
  );
});
