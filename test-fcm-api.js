// Test script to verify FCM token API
// Run this in the browser console on your deployed site

async function testFCMAPI() {
  const testToken = 'test-token-' + Date.now();
  
  console.log('Testing FCM API with token:', testToken);
  
  try {
    const response = await fetch('/api/fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: testToken }),
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ API is working! Token should be saved to Firestore.');
    } else {
      console.error('❌ API error:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run the test
testFCMAPI();
