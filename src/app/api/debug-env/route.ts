import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Debug endpoint to check environment variables (remove after fixing!)
export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return NextResponse.json({
    hasProjectId: !!projectId,
    projectId: projectId || 'MISSING',
    
    hasClientEmail: !!clientEmail,
    clientEmail: clientEmail || 'MISSING',
    
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey?.length || 0,
    privateKeyStart: privateKey?.substring(0, 50) || 'MISSING',
    privateKeyContainsBegin: privateKey?.includes('BEGIN PRIVATE KEY') || false,
    privateKeyContainsNewlines: privateKey?.includes('\\n') || false,
    
    // Check if it's a placeholder
    isPlaceholder: {
      projectId: projectId === 'your_project_id',
      clientEmail: clientEmail?.includes('your_project') || false,
      privateKey: privateKey?.includes('YOUR_KEY_HERE') || false,
    }
  });
}
