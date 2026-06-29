// Upload video to Cloudinary
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'deh49nghj',
  api_key: '397217659319937',
  api_secret: '0J_M0B6Asi0vLQOAJswEc-PJl18'
});

async function uploadVideo() {
  try {
    const videoPath = path.join(__dirname, 'public', 'web.mp4');
    
    console.log('📤 Uploading video to Cloudinary...');
    console.log('File:', videoPath);

    // Use upload_large for files over 100MB
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(videoPath, {
        resource_type: 'video',
        public_id: 'lakshana-salon/hero-background',
        chunk_size: 20000000, // 20MB chunks
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    console.log('✅ Upload complete!');
    console.log('📎 Public URL:', result.secure_url);
    console.log('📊 Size:', (result.bytes / 1024 / 1024).toFixed(2), 'MB');
    console.log('⏱️  Duration:', result.duration, 'seconds');
    console.log('\n🔧 Update your Hero.tsx with:');
    console.log(`<source src="${result.secure_url}" type="video/mp4" />`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

uploadVideo();
