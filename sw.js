// Nhà 25 – giữ sẵn khung app để mở nhanh. Dữ liệu luôn lấy trực tiếp từ máy chủ.
const V = 'n25-v2';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const q = e.request, u = new URL(q.url);
  if (q.method !== 'GET' || u.hostname.endsWith('google.com') || u.hostname.endsWith('googleusercontent.com')) return;
  const keep = r => { if (r && r.ok) { const c = r.clone(); caches.open(V).then(ch => ch.put(q, c)); } return r; };
  if (u.hostname === 'cdnjs.cloudflare.com') {            // thư viện: lấy bản đã lưu trước
    e.respondWith(caches.match(q).then(h => h || fetch(q).then(keep)));
  } else if (u.origin === location.origin) {               // trang app: luôn hỏi GitHub bản mới (bỏ qua bộ nhớ đệm 10 phút), mất mạng thì dùng bản đã lưu
    e.respondWith(fetch(q.url, { cache: 'no-cache' }).then(keep).catch(() => caches.match(q, { ignoreSearch: true })));
  }
});
