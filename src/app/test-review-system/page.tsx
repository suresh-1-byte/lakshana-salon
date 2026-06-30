'use client';

import { useState } from 'react';

export default function TestReviewSystem() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      return { name, status: res.status, success: res.ok, data };
    } catch (err: any) {
      return { name, error: err.message };
    }
  };

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    // Test 1: Check if public reviews endpoint exists
    testResults.publicEndpoint = await testEndpoint(
      'Public Reviews Endpoint',
      '/api/public/reviews',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }
    );

    // Test 2: Submit a test review
    testResults.submitReview = await testEndpoint(
      'Submit Test Review',
      '/api/public/reviews',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Test Customer',
          rating: 5,
          comment: 'This is a test review from diagnostic page',
          service: 'Test Service',
          source: 'diagnostic_test'
        })
      }
    );

    // Test 3: Check test reviews endpoint
    testResults.testEndpoint = await testEndpoint('Test Reviews Fetch', '/api/test-reviews');

    // Test 4: Check admin reviews endpoint
    testResults.adminEndpoint = await testEndpoint('Admin Reviews Fetch', '/api/admin/reviews');

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Review System Diagnostic</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 mb-8">
          {loading ? 'Running Tests...' : 'Run Diagnostic Tests'}
        </button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-6">
            {Object.entries(results).map(([key, result]: [string, any]) => (
              <div key={key} className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  {result.success ? '✅' : result.error ? '❌' : '⚠️'}
                  {result.name}
                </h2>
                
                {result.error && (
                  <div className="bg-red-900/30 border border-red-500 rounded p-4 mb-4">
                    <p className="text-red-300 font-mono text-sm">Error: {result.error}</p>
                  </div>
                )}
                
                {result.status && (
                  <p className="mb-2">
                    <span className="text-gray-400">Status:</span>{' '}
                    <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                      {result.status}
                    </span>
                  </p>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-pink-400 hover:text-pink-300">
                    View Response Data
                  </summary>
                  <pre className="mt-4 bg-gray-900 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(result.data || result, null, 2)}
                  </pre>
                </details>
              </div>
            ))}

            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4">📋 Diagnosis Summary</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Public Endpoint:</strong>{' '}
                  {results.publicEndpoint?.success ? 
                    '✅ Working' : 
                    '❌ Not accessible - API route may not be deployed'}
                </p>
                <p>
                  <strong>Review Submission:</strong>{' '}
                  {results.submitReview?.success ? 
                    '✅ Reviews can be submitted' : 
                    '❌ Review submission failed'}
                </p>
                <p>
                  <strong>Admin Fetch:</strong>{' '}
                  {results.adminEndpoint?.success ? 
                    `✅ Found ${results.adminEndpoint?.data?.data?.length || 0} reviews` : 
                    '❌ Cannot fetch reviews'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
