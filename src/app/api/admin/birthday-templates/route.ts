// ═══════════════════════════════════════════════════════
//  Birthday offer templates (admin)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, logActivity } from '@/lib/firebase-admin';
import { toIso } from '@/lib/server/admin-catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTION = 'birthday_templates';

function serialize(id: string, d: any) {
  return {
    id,
    templateName: d.templateName || '',
    messageText: d.messageText || '',
    offerPercentage: Number(d.offerPercentage) || 0,
    offerValidityDays: Number(d.offerValidityDays) || 7,
    serviceNames: Array.isArray(d.serviceNames) ? d.serviceNames : [],
    couponCodePrefix: d.couponCodePrefix || 'BDAY',
    isActive: d.isActive !== false,
    isDefault: d.isDefault === true,
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
  };
}

export async function GET() {
  try {
    const snap = await adminDb.collection(COLLECTION).get();
    const templates = snap.docs
      .map((d: any) => serialize(d.id, d.data()))
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.templateName.localeCompare(b.templateName));
    return NextResponse.json({ success: true, templates });
  } catch (err) {
    console.error('Fetch birthday templates error:', err);
    return NextResponse.json({ success: false, error: 'Failed to load templates' }, { status: 500 });
  }
}

/** Create a template, or update it when the body carries an `id` */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const templateName = String(body.templateName || '').trim();
    if (!templateName) {
      return NextResponse.json({ success: false, error: 'Template name is required' }, { status: 400 });
    }

    const data = {
      templateName,
      messageText: String(body.messageText || ''),
      offerPercentage: Number(body.offerPercentage) || 0,
      offerValidityDays: Number(body.offerValidityDays) || 7,
      serviceNames: Array.isArray(body.serviceNames) ? body.serviceNames.map(String) : [],
      couponCodePrefix: String(body.couponCodePrefix || 'BDAY').toUpperCase(),
      isActive: body.isActive !== false,
      isDefault: body.isDefault === true,
      updatedAt: FieldValue.serverTimestamp(),
    };

    let ref;
    if (body.id) {
      ref = adminDb.collection(COLLECTION).doc(String(body.id));
      if (!(await ref.get()).exists) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }
      await ref.update(data);
    } else {
      ref = await adminDb.collection(COLLECTION).add({ ...data, createdAt: FieldValue.serverTimestamp() });
    }

    // Only one default template
    if (data.isDefault) {
      const others = await adminDb.collection(COLLECTION).where('isDefault', '==', true).get();
      const batch = adminDb.batch();
      others.docs.forEach((d: any) => {
        if (d.id !== ref.id) batch.update(d.ref, { isDefault: false });
      });
      await batch.commit();
    }

    await logActivity(body.id ? 'birthday_template_update' : 'birthday_template_create', {
      entityType: 'birthday_template',
      entityId: ref.id,
    });

    const saved = await ref.get();
    return NextResponse.json({ success: true, id: ref.id, template: serialize(ref.id, saved.data()) });
  } catch (err) {
    console.error('Save birthday template error:', err);
    return NextResponse.json({ success: false, error: 'Failed to save template' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Template id is required' }, { status: 400 });
    await adminDb.collection(COLLECTION).doc(id).delete();
    await logActivity('birthday_template_delete', { entityType: 'birthday_template', entityId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete birthday template error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete template' }, { status: 500 });
  }
}
