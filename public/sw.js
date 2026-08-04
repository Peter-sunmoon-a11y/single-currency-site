self.importScripts("/webpush.js");

self.addEventListener("install", () => {
  // 立即接管，不等待旧 SW 的所有页面关闭
  void self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // 清除所有旧缓存（含 Vite PWA 遗留缓存），防止旧版 HTML 继续被服务
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});
