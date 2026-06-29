importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyAH8i8dTKxQA6y0PB2_k9aOzO7RROvnpkI',
  authDomain:        'lakshana-beauty-5ff20.firebaseapp.com',
  projectId:         'lakshana-beauty-5ff20',
  storageBucket:     'lakshana-beauty-5ff20.firebasestorage.app',
  messagingSenderId: '206527136985',
  appId:             '1:206527136985:web:384da17fe3d81aeaa76ac8',
});

const messaging = firebase.messaging();

// ── Background push notification handler ─────────────────────────
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Lakshana Beauty Salon';
  const body  = payload.notification?.body  || 'You have a new update';
  const url   = payload.data?.url || '/';

  self.registration.showNotification(title, {
    body,
    icon:   '/logo.png',
    badge:  '/logo.png',
    image:  '/logo-full.png',
    tag:    'lakshana-' + Date.now(),
    renotify: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open',    title: '💄 View'    },
      { action: 'dismiss', title: '✕ Dismiss'  },
    ],
    data: { url },
  });
});

// ── Notification click handler ────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
