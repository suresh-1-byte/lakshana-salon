// ═══════════════════════════════════════════════════════
//  Notifications API Route
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { notifyNewBooking } from '@/lib/api/notifications';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/notifications
 * Get all notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Check if collection exists by trying to get documents
    const notificationsSnap = await adminDb
      .collection(Collections.NOTIFICATIONS)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    // If no documents, return empty array (this is not an error)
    if (notificationsSnap.empty) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const notifications = notificationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      scheduledAt: doc.data().scheduledAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    // More detailed error logging
    console.error('Error fetching notifications:', {
      message: error?.message,
      code: error?.code,
      details: error
    });
    
    // Return empty array instead of error if it's just an empty collection
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

/**
 * POST /api/admin/notifications
 * Send a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Save notification to database
    const notificationRef = await adminDb.collection(Collections.NOTIFICATIONS).add({
      title: body.title,
      body: body.body,
      types: body.types || ['push'],
      targetUrl: body.targetUrl || '/',
      email: body.email || null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      status: 'sent',
      createdAt: new Date(),
    });

    // Send notification
    await notifyNewBooking(body);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      id: notificationRef.id,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

