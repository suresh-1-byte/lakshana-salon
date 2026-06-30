'use client';

import { useState } from 'react';

export default function FCMDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('idle');

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testFCM = async () => {
    setLogs([]);
    setStatus('testing');
    
    try {
      addLog('🔧 Starting FCM Debug Test...');
      
      // Check browser support
      if (!('serviceWorker' in navigator)) {
        addLog('❌ Service Workers not supported');
        setStatus('error');
        return;
      }
      addLog('✅ Service Worker API available');
      
      if (!('Notification' in window)) {
        addLog('❌ Notifications not supported');
        setStatus('error');
        return;
      }
      addLog('✅ Notification API available');
      
      // Check permission
      addLog(`📋 Current permission: ${Notification.permission}`);
      
      if (Notification.permission === 'denied') {
        addLog('❌ Notification permission denied - please reset in browser settings');
        setStatus('error');
        return;
      }
      
      // Request permission if needed
      if (Notification.permission === 'default') {
        addLog('🔔 Requesting notification permission...');
        const permission = await Notification.requestPermission();
        addLog(`📋 Permission result: ${permission}`);
        
        if (permission !== 'granted') {
          addLog('❌ Permission not granted');
          setStatus('error');
          return;
        }
      }
      
      addLog('✅ Notification permission granted');
      
      // Unregister old service workers
      addLog('🧹 Checking for old service workers...');
      const existingRegs = await navigator.serviceWorker.getRegistrations();
      addLog(`📋 Found ${existingRegs.length} existing service worker(s)`);
      
      for (const reg of existingRegs) {
        addLog(`🗑️ Unregistering: ${reg.scope}`);
        await reg.unregister();
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('✅ Old service workers cleared');
      
      // Register new service worker
      const swUrl = '/firebase-messaging-sw.js?v=' + Date.now();
      addLog(`📝 Registering new service worker: ${swUrl}`);
      
      const swReg = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
        updateViaCache: 'none'
      });
      
      addLog(`✅ Service worker registered: ${swReg.scope}`);
      
      // Wait for activation
      await new Promise<void>((resolve) => {
        if (swReg.active) {
          addLog('✅ Service worker already active');
          resolve();
          return;
        }
        
        const sw = swReg.installing || swReg.waiting;
        if (sw) {
          addLog(`⏳ Service worker state: ${sw.state}`);
          sw.addEventListener('statechange', function onState() {
            addLog(`📋 Service worker state changed: ${sw.state}`);
            if (sw.state === 'activated') {
              sw.removeEventListener('statechange', onState);
              resolve();
            }
          });
        } else {
          navigator.serviceWorker.ready.then(() => {
            addLog('✅ Service worker ready');
            resolve();
          });
        }
      });
      
      // Check environment variables
      addLog('🔍 Checking Firebase config...');
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      
      addLog(`📋 API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : '❌ MISSING'}`);
      addLog(`📋 Project ID: ${projectId || '❌ MISSING'}`);
      addLog(`📋 VAPID Key: ${vapidKey ? vapidKey.substring(0, 20) + '...' : '❌ MISSING'}`);
      
      // Get Firebase Messaging
      addLog('🔥 Initializing Firebase Messaging...');
      const { getFirebaseMessaging } = await import('@/lib/firebase');
      const { getToken } = await import('firebase/messaging');
      const messaging = await getFirebaseMessaging();
      
      if (!messaging) {
        addLog('❌ Firebase Messaging not available');
        setStatus('error');
        return;
      }
      addLog('✅ Firebase Messaging initialized');
      
      // Get token
      addLog('🎫 Requesting FCM token...');
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });
      
      if (!token) {
        addLog('❌ Failed to get FCM token');
        setStatus('error');
        return;
      }
      
      addLog(`✅ FCM Token obtained: ${token.substring(0, 40)}...`);
      
      // Save token
      addLog('💾 Saving token to server...');
      const response = await fetch('/api/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: 'debug-test@example.com' }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addLog('✅ Token saved successfully!');
        addLog(`📋 Response: ${JSON.stringify(data)}`);
        setStatus('success');
      } else {
        addLog(`❌ Failed to save token: ${JSON.stringify(data)}`);
        setStatus('error');
      }
      
    } catch (err) {
      addLog(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
      if (err instanceof Error && err.stack) {
        addLog(`📋 Stack: ${err.stack}`);
      }
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">FCM Token Debug Tool</h1>
        <p className="text-gray-400 mb-6">Test Firebase Cloud Messaging token registration</p>
        
        <button
          onClick={testFCM}
          disabled={status === 'testing'}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 rounded-lg font-semibold mb-6"
        >
          {status === 'testing' ? 'Testing...' : 'Start FCM Test'}
        </button>
        
        {status === 'success' && (
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-semibold">✅ Test completed successfully!</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-semibold">❌ Test failed - check logs below</p>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Console Logs:</h2>
          <div className="space-y-1 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click "Start FCM Test" to begin.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-300">{log}</div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-400">
          <p><strong>Note:</strong> This page helps diagnose FCM token issues by showing detailed logs.</p>
          <p className="mt-2">If you see errors, please screenshot and share them.</p>
        </div>
      </div>
    </div>
  );
}
