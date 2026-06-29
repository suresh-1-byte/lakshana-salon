'use client';

import { useEffect } from 'react';
import { getFirebaseMessaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';

export function usePushNotifications() {
  useEffect(() => {
    const setup = async () => {
      try {
        if (typeof window === 'undefined') return;
        if (!('Notification' in window))   return;
        if (!('serviceWorker' in navigator)) return;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        // Register SW and wait for active state
        const swReg = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        );

        // Wait for SW to become active
        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey:                  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          await fetch('/api/fcm-token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ token }),
          });
        }

        // Foreground message handler
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          if (title) {
            new Notification(title, {
              body:  body || '',
              icon:  '/logo.png',
              badge: '/logo.png',
            });
          }
        });
      } catch (err) {
        console.error('Push notification setup failed:', err);
      }
    };

    setup();
  }, []);
}
