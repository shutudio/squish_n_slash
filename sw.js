/* Squish & Slash 서비스워커 — index.html은 네트워크 우선(항상 최신), 리소스는 캐시 우선 */
const V = 'sns-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate' || e.request.url.endsWith('index.html');
  if (isPage){
    // 네트워크 우선: 업데이트가 바로 반영, 오프라인이면 캐시
    e.respondWith(
      fetch(e.request).then(r => {
        const c = r.clone();
        caches.open(V).then(cc => cc.put(e.request, c));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 캐시 우선: 사운드·아이콘 등
    e.respondWith(
      caches.match(e.request).then(m => m || fetch(e.request).then(r => {
        const c = r.clone();
        caches.open(V).then(cc => cc.put(e.request, c));
        return r;
      }))
    );
  }
});
