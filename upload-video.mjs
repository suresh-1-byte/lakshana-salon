// Script to upload web.mp4 to Firebase Storage
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Parse private key properly - remove quotes and unescape newlines
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Remove surrounding quotes if present
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
}

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey,
};

console.log('🔑 Service Account:', serviceAccount.projectId, serviceAccount.clientEmail);
console.log('🔐 Private Key starts with:', privateKey?.substring(0, 50));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'lakshana-beauty-5ff20.appspot.com', // Changed from firebasestorage.app
});

const bucket = getStorage().bucket();

async function uploadVideo() {
  try {
    const videoPath = join(__dirname, 'public', 'web.mp4');
    const destination = 'videos/web.mp4';

    console.log('📤 Uploading video to Firebase Storage...');
    console.log('File:', videoPath);
    console.log('Size:', (readFileSync(videoPath).length / 1024 / 1024).toFixed(2), 'MB');

    // Upload file
    const [file] = await bucket.upload(videoPath, {
      destination: destination,
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
      public: true, // Make the file publicly accessible
    });

    // Make file public
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

    console.log('✅ Upload complete!');
    console.log('📎 Public URL:', publicUrl);
    console.log('\n🔧 Update your Hero.tsx with:');
    console.log(`<source src="${publicUrl}" type="video/mp4" />`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

uploadVideo();
