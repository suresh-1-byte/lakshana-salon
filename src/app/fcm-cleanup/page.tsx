'use client';

import { useState } from 'react';

export default function FCMCleanupPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteAllResult, setDeleteAllResult] = useState<any>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const runCleanup = async () => {
    if (!confirm('This will test all FCM tokens and remove invalid ones. Continue?')) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/fcm-token/cleanup', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    }
    
    setLoading(false);
  };

  const deleteAllTokens = async () => {
    if (!confirm('⚠️ WARNING: This will DELETE ALL FCM tokens from the database. This cannot be undone. Are you sure?')) return;
    if (!confirm('This is your last chance! Really delete ALL tokens?')) return;
    
    setDeletingAll(true);
    setDeleteAllResult(null);
    
    try {
      const response = await fetch('/api/fcm-token/delete-all', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      setDeleteAllResult(data);
    } catch (err) {
      setDeleteAllResult({ error: String(err) });
    }
    
    setDeletingAll(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">FCM Token Management</h1>
        <p className="text-gray-400 mb-6">Clean up invalid tokens or start fresh</p>
        
        {/* Clean Invalid Tokens Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">🧹 Clean Invalid Tokens</h2>
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ This will test each FCM token and remove any that are invalid or expired (e.g., from deleted Firebase projects).
            </p>
          </div>
          
          <button
            onClick={runCleanup}
            disabled={loading}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 rounded-lg font-semibold mb-4"
          >
            {loading ? 'Checking tokens...' : 'Clean Up Invalid Tokens'}
          </button>
          
          {result && (
            <div>
              <pre className="text-sm overflow-auto bg-gray-900 p-4 rounded mb-4">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.success && (
                <div className="p-4 bg-green-900/30 border border-green-500 rounded">
                  <p className="text-green-400 mb-2">✅ Cleanup completed!</p>
                  <ul className="text-sm space-y-1">
                    <li>📊 Total: <strong>{result.total}</strong></li>
                    <li>✅ Valid: <strong>{result.valid}</strong></li>
                    <li>🗑️ Removed: <strong>{result.deleted}</strong></li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete All Tokens Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-red-500/30">
          <h2 className="text-xl font-semibold mb-3 text-red-400">🗑️ Delete All Tokens</h2>
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm font-bold mb-2">
              ⚠️ DANGER ZONE ⚠️
            </p>
            <p className="text-red-300 text-sm">
              This will permanently delete ALL FCM tokens from the database. Use this when:
            </p>
            <ul className="text-red-300 text-sm list-disc list-inside mt-2 ml-2">
              <li>Migrating to a new Firebase project</li>
              <li>Starting fresh with new customer subscriptions</li>
              <li>All tokens are from an old/deleted project</li>
            </ul>
          </div>
          
          <button
            onClick={deleteAllTokens}
            disabled={deletingAll}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {deletingAll ? 'Deleting...' : '🗑️ Delete All Tokens'}
          </button>
          
          {deleteAllResult && (
            <div className="mt-4">
              <pre className="text-sm overflow-auto bg-gray-900 p-4 rounded mb-4">
                {JSON.stringify(deleteAllResult, null, 2)}
              </pre>
              
              {deleteAllResult.success && (
                <div className="p-4 bg-green-900/30 border border-green-500 rounded">
                  <p className="text-green-400 mb-2">✅ All tokens deleted!</p>
                  <p className="text-sm">Deleted: <strong>{deleteAllResult.deleted}</strong> tokens</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Database is now clean. New customers can subscribe starting now.
                  </p>
                </div>
              )}
              
              {deleteAllResult.error && (
                <div className="p-4 bg-red-900/30 border border-red-500 rounded">
                  <p className="text-red-400">❌ Error: {deleteAllResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-400 space-y-2 bg-gray-800 rounded-lg p-6">
          <p className="font-semibold text-white mb-2">📖 How to use:</p>
          
          <div className="mb-4">
            <p className="font-medium text-gray-300">Option 1: Clean Invalid (Recommended)</p>
            <p className="text-xs ml-4 mt-1">
              • Tests each token and removes only invalid ones<br/>
              • Keeps all working tokens<br/>
              • Best for routine maintenance
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-300">Option 2: Delete All (Nuclear)</p>
            <p className="text-xs ml-4 mt-1">
              • Removes ALL tokens immediately<br/>
              • Use when migrating Firebase projects<br/>
              • Requires all customers to re-subscribe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
