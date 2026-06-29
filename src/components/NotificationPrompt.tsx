'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles } from 'lucide-react';

async function registerAndGetToken(): Promise<string | null> {
  try {
    // 1. Register service worker
    const swReg = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' }
    );

    // 2. Wait for SW to become active (handles first-install delay)
    await new Promise<void>((resolve) => {
      if (swReg.active) { resolve(); return; }

      // SW is installing or waiting — listen for activation
      const sw = swReg.installing || swReg.waiting;
      if (sw) {
        sw.addEventListener('statechange', function onState() {
          if (sw.state === 'activated') {
            sw.removeEventListener('statechange', onState);
            resolve();
          }
        });
      } else {
        // Already registered but not yet controlling — use ready
        navigator.serviceWorker.ready.then(() => resolve());
      }
    });

    // 3. Get FCM token
    const { getFirebaseMessaging } = await import('@/lib/firebase');
    const { getToken }             = await import('firebase/messaging');
    const messaging                = await getFirebaseMessaging();
    if (!messaging) return null;

    const token = await getToken(messaging, {
      vapidKey:                  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    return token || null;
  } catch (err) {
    console.error('SW/Token registration error:', err);
    return null;
  }
}

export function NotificationPrompt() {
  const [show,    setShow]    = useState(false);
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined')      return;
    if (!('Notification' in window))        return;
    if (!('serviceWorker' in navigator))    return;
    if (Notification.permission !== 'default') return;

    // Show after 8s — customer has had time to browse
    const t = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Get token and save it
        console.log('[NotificationPrompt] Permission granted, getting FCM token...');
        const token = await registerAndGetToken();
        
        if (token) {
          console.log('[NotificationPrompt] Token obtained, saving to server...');
          const response = await fetch('/api/fcm-token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ token }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            console.log('[NotificationPrompt] Token saved successfully:', data);
          } else {
            console.error('[NotificationPrompt] Failed to save token:', data);
          }
        } else {
          console.warn('[NotificationPrompt] Failed to obtain FCM token');
        }
        
        setGranted(true);
        setTimeout(() => setShow(false), 2500);
      } else {
        // Blocked or dismissed
        console.log('[NotificationPrompt] Permission denied or dismissed');
        setShow(false);
      }
    } catch (err) {
      console.error('[NotificationPrompt] Error:', err);
      // Still show success if permission was granted
      if (Notification.permission === 'granted') {
        setGranted(true);
        setTimeout(() => setShow(false), 2500);
      } else {
        setShow(false);
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl relative"
            style={{
              background: 'linear-gradient(145deg, rgba(45,27,37,0.97) 0%, rgba(26,13,21,0.98) 100%)',
              border:     '1px solid rgba(212,68,122,0.3)',
              boxShadow:  '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,68,122,0.15)',
              backdropFilter: 'blur(40px)',
            }}
          >
            {/* Pink top bar */}
            <div className="h-[2px]"
              style={{ background: 'linear-gradient(90deg, #D4447A, #E8A0B4, #D4447A)' }} />

            {granted ? (
              /* ── Success state ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #D4447A, #B03060)', boxShadow: '0 0 20px rgba(212,68,122,0.4)' }}>
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">You&apos;re all set! ✨</p>
                  <p className="text-white/50 text-xs mt-0.5">
                    You&apos;ll receive our exclusive offers &amp; updates
                  </p>
                </div>
              </motion.div>
            ) : (
              /* ── Permission request ── */
              <div className="p-5">
                {/* Close button */}
                <button
                  onClick={() => setShow(false)}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="Dismiss"
                >
                  <X size={12} />
                </button>

                {/* Content */}
                <div className="flex items-start gap-4 mb-4 pr-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(212,68,122,0.2)',
                      border:     '1px solid rgba(212,68,122,0.35)',
                    }}
                  >
                    <Bell size={20} className="text-[#D4447A]" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm leading-snug">
                      Stay updated with exclusive offers
                    </p>
                    <p className="text-white/45 text-xs mt-1 leading-relaxed">
                      Festival deals, new services &amp; beauty tips from
                      Lakshana Premier Beauty Salon
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShow(false)}
                    className="flex-1 h-9 rounded-xl text-white/40 text-xs font-medium border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Maybe later
                  </button>
                  <button
                    onClick={handleAllow}
                    disabled={loading}
                    className="flex-1 h-9 rounded-xl text-white text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #D4447A, #B03060)',
                      boxShadow:  '0 0 20px rgba(212,68,122,0.35)',
                    }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <><Bell size={12} /> Allow</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
