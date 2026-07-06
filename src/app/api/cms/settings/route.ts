import { NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/cms/settings
 * Public endpoint — returns salon info for website display (name, hours, contact, social).
 */
export async function GET() {
  try {
    const doc = await adminDb.collection(Collections.SETTINGS).doc('salon').get();

    const data = doc.exists ? doc.data()! : {};

    // Only expose public-safe fields
    const publicSettings = {
      salonName:    data.salonName    || 'Lakshana Premier Beauty Salon',
      tagline:      data.tagline      || "Nolambur's Finest Sanctuary",
      phone:        data.phone        || '',
      email:        data.email        || '',
      address:      data.address      || '',
      city:         data.city         || 'Nolambur',
      state:        data.state        || 'Tamil Nadu',
      pincode:      data.pincode      || '',
      businessHours: data.businessHours || {},
      socialLinks:  data.socialLinks  || {},
      logoUrl:      data.logoUrl      || '/logo.png',
    };

    return NextResponse.json({ success: true, settings: publicSettings }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('CMS settings error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
