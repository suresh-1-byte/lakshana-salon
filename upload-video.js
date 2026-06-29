// Script to upload web.mp4 to Firebase Storage
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

async function uploadVideo() {
  try {
    const videoPath = path.join(__dirname, 'public', 'web.mp4');
    const destination = 'videos/web.mp4';

    console.log('📤 Uploading video to Firebase Storage...');
    console.log('File:', videoPath);

    // Upload file
    await bucket.upload(videoPath, {
      destination: destination,
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
      public: true, // Make the file publicly accessible
    });

    // Get the public URL
    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });

    // Or get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

    console.log('✅ Upload complete!');
    console.log('📎 Public URL:', publicUrl);
    console.log('\n🔧 Update your Hero.tsx with:');
    console.log(`<source src="${publicUrl}" type="video/mp4" />`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadVideo();
