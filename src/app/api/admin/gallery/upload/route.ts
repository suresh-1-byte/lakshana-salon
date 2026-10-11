// ═══════════════════════════════════════════════════════
//  POST /api/admin/gallery/upload  (admin only — see middleware)
//  Uploads an image to Firebase Storage with the server's credentials, so
//  Storage security rules can forbid public writes.
//  Body: multipart/form-data with a `file` field. Returns { url }.
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getStorage } from 'firebase-admin/storage';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BYTES = 4 * 1024 * 1024; // Vercel request bodies are limited to ~4.5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image to upload' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, GIF or AVIF images are allowed' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 4 MB or smaller' }, { status: 400 });
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json({ error: 'Storage bucket is not configured' }, { status: 500 });
    }

    getAdminDb(); // makes sure the Firebase Admin app is initialised
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(-80);
    const objectPath = `gallery/${Date.now()}_${safeName}`;
    const token = randomUUID();

    await getStorage()
      .bucket(bucketName)
      .file(objectPath)
      .save(Buffer.from(await file.arrayBuffer()), {
        resumable: false,
        contentType: file.type,
        metadata: {
          cacheControl: 'public, max-age=31536000',
          // Same download-token mechanism the Firebase client SDK uses
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error('Gallery upload failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
