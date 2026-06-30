'use client';

import { useState } from 'react';

export default function TestFCMSendPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendTestNotification = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🧪 Test Notification',
          body: 'This is a test notification from Lakshana Beauty Salon!',
          url: '/',
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">FCM Test - Send Notification</h1>
        
        <button
          onClick={sendTestNotification}
          disabled={loading}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 rounded-lg font-semibold mb-6"
        >
          {loading ? 'Sending...' : 'Send Test Notification to All'}
        </button>
        
        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Result:</h2>
            <pre className="text-sm overflow-auto bg-gray-900 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.success && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded">
                <p className="text-green-400">
                  ✅ Sent: {result.sent} notifications
                  {result.failed > 0 && ` | ❌ Failed: ${result.failed}`}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-400">
          <p><strong>Note:</strong> This will send a test notification to ALL subscribed FCM tokens in the database.</p>
          <p className="mt-2">Check your mobile device to see if the notification appears.</p>
        </div>
      </div>
    </div>
  );
}
