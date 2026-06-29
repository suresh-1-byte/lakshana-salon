import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections, logActivity } from '@/lib/firebase-admin';

const DEFAULT_SETTINGS = {
  salonName: 'Lakshana Premier Beauty Salon',
  tagline: "Nolambur's Finest Sanctuary",
  phone: '+91 90000 00000',
  email: 'hello@lakshanabeauty.com',
  address: 'Shop No. X, XYZ Complex',
  city: 'Nolambur',
  state: 'Tamil Nadu',
  pincode: '600037',
  gstNumber: '',
  businessHours: {
    Monday:    { open: '09:00', close: '20:00', closed: false },
    Tuesday:   { open: '09:00', close: '20:00', closed: false },
    Wednesday: { open: '09:00', close: '20:00', closed: false },
    Thursday:  { open: '09:00', close: '20:00', closed: false },
    Friday:    { open: '09:00', close: '20:00', closed: false },
    Saturday:  { open: '09:00', close: '20:00', closed: false },
    Sunday:    { open: '10:00', close: '18:00', closed: false },
  },
  socialLinks: {
    instagram: '',
    facebook: '',
    youtube: '',
    whatsapp: '',
  },
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  notificationSettings: {
    emailOnBooking: true,
    pushOnBooking: true,
    telegramOnBooking: false,
    sendInvoiceEmail: true,
    sendThankYouEmail: true,
  },
};

export async function GET() {
  try {
    const doc = await adminDb.collection(Collections.SETTINGS).doc('salon').get();
    const settings = doc.exists ? { ...DEFAULT_SETTINGS, ...doc.data() } : DEFAULT_SETTINGS;

    // Don't expose API keys in GET
    const { resendApiKey: _, telegramBotToken: __, ...safeSettings } = settings as any;
    return NextResponse.json({ success: true, data: safeSettings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // Merge with existing
    await adminDb.collection(Collections.SETTINGS).doc('salon').set(body, { merge: true });
    await logActivity('settings_update', 'Admin settings updated');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
