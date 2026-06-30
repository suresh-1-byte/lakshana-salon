'use client';

import { useState, useEffect } from 'react';

export default function TestFCMSendPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any>(null);
  const [loadingTokens, setLoadingTokens] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoadingTokens(true);
    try {
      const response = await fetch('/api/fcm-token/list');
      const data = await response.json();
      setTokens(data);
    } catch (err) {
      setTokens({ error: String(err) });
    }
    setLoadingTokens(false);
  };

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
      
      // Refresh tokens after sending
      fetchTokens();
    } catch (err) {
      setResult({ error: String(err) });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">FCM Test - Send Notification</h1>
        
        {/* Token List */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Tokens in Database</h2>
            <button
              onClick={fetchTokens}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              🔄 Refresh
            </button>
          </div>
          
          {loadingTokens ? (
            <p className="text-gray-400">Loading tokens...</p>
          ) : tokens?.success ? (
            <div>
              <p className="text-green-400 mb-3">
                ✅ Found {tokens.count} token{tokens.count !== 1 ? 's' : ''}
              </p>
              {tokens.count > 0 ? (
                <div className="space-y-3">
                  {tokens.tokens.map((t: any, i: number) => (
                    <div key={i} className="bg-gray-900 rounded p-4 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Token #{i + 1}</p>
                      <p className="text-xs text-gray-500 font-mono break-all mb-2">
                        {t.token.substring(0, 60)}...
                      </p>
                      {t.email && (
                        <p className="text-sm text-blue-400">📧 {t.email}</p>
                      )}
                      {t.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(t.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-400">No tokens found. Subscribe to notifications first.</p>
              )}
            </div>
          ) : (
            <p className="text-red-400">Error loading tokens: {tokens?.error}</p>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={sendTestNotification}
          disabled={loading || !tokens?.count}
          className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold mb-6"
        >
          {loading ? 'Sending...' : `Send Test Notification to ${tokens?.count || 0} Device(s)`}
        </button>
        
        {/* Results */}
        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Result:</h2>
            <pre className="text-sm overflow-auto bg-gray-900 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.success && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded">
                <p className="text-green-400 font-semibold mb-2">
                  ✅ Notification Sent!
                </p>
                <ul className="text-sm space-y-1">
                  <li>📤 Sent: <strong>{result.sent}</strong></li>
                  {result.failed > 0 && (
                    <li className="text-red-400">❌ Failed: <strong>{result.failed}</strong></li>
                  )}
                  {result.cleaned > 0 && (
                    <li className="text-yellow-400">🧹 Cleaned: <strong>{result.cleaned}</strong> invalid tokens</li>
                  )}
                </ul>
              </div>
            )}
            
            {result.error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded">
                <p className="text-red-400">❌ Error: {result.error}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-400">
          <p><strong>Note:</strong> This will send a test notification to ALL subscribed devices.</p>
          <p className="mt-2">Check the browser on the subscribed device to see if the notification appears.</p>
          
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
            <p className="text-blue-300 font-semibold mb-2">💡 Troubleshooting:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Make sure browser notifications are enabled</li>
              <li>Browser must be open (or in background) to receive notifications</li>
              <li>Check if browser has permission to show notifications</li>
              <li>Some browsers block notifications in incognito mode</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
