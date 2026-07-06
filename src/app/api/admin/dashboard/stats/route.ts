// ═══════════════════════════════════════════════════════
//  Dashboard Stats API
// ═══════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getAdminDb, Timestamp } from '@/lib/firebase-admin';
import { Collections } from '@/lib/firebase-collections';

export async function GET() {
  const db = getAdminDb();
  
  if (!db) {
    return NextResponse.json({
      success: true,
      stats: {
        todayRevenue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        totalCustomers: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        completedToday: 0,
        newCustomersToday: 0,
      },
    });
  }

  try {
    const now = new Date();
    
    // Today boundaries
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Week boundaries
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    // Month boundaries
    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch data in parallel
    const [
      todayPayments,
      weekPayments,
      monthPayments,
      totalCustomers,
      todayAppointments,
      todayBookings,
      todayCustomers,
    ] = await Promise.all([
      // Today's revenue
      db.collection(Collections.BILLING)
        .where('createdAt', '>=', Timestamp.fromDate(startOfToday))
        .where('createdAt', '<=', Timestamp.fromDate(endOfToday))
        .where('status', '==', 'paid')
        .get(),
      
      // Weekly revenue
      db.collection(Collections.BILLING)
        .where('createdAt', '>=', Timestamp.fromDate(startOfWeek))
        .where('status', '==', 'paid')
        .get(),
      
      // Monthly revenue
      db.collection(Collections.BILLING)
        .where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
        .where('status', '==', 'paid')
        .get(),
      
      // Total customers
      db.collection(Collections.CUSTOMERS)
        .where('isDeleted', '==', false)
        .count()
        .get(),
      
      // Today's appointments
      db.collection(Collections.APPOINTMENTS)
        .where('appointmentDate', '==', now.toISOString().split('T')[0])
        .get(),
      
      // Today's bookings
      db.collection(Collections.BOOKINGS)
        .where('createdAt', '>=', Timestamp.fromDate(startOfToday))
        .where('createdAt', '<=', Timestamp.fromDate(endOfToday))
        .get(),
      
      // New customers today
      db.collection(Collections.CUSTOMERS)
        .where('createdAt', '>=', Timestamp.fromDate(startOfToday))
        .where('createdAt', '<=', Timestamp.fromDate(endOfToday))
        .count()
        .get(),
    ]);

    // Calculate stats
    const todayRevenue = todayPayments.docs.reduce((sum: any, doc) => {
      const data = doc.data();
      return sum + (data.total || 0);
    }, 0);

    const weeklyRevenue = weekPayments.docs.reduce((sum: any, doc) => {
      const data = doc.data();
      return sum + (data.total || 0);
    }, 0);

    const monthlyRevenue = monthPayments.docs.reduce((sum: any, doc) => {
      const data = doc.data();
      return sum + (data.total || 0);
    }, 0);

    const pendingAppointments = todayAppointments.docs.filter((doc: any) => {
      const data = doc.data();
      return data.status === 'scheduled' || data.status === 'confirmed';
    }).length;

    const completedToday = todayBookings.docs.filter((doc: any) => {
      const data = doc.data();
      return data.status === 'completed';
    }).length;

    return NextResponse.json({
      success: true,
      stats: {
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        totalCustomers: totalCustomers.data().count,
        todayAppointments: todayAppointments.size,
        pendingAppointments,
        completedToday,
        newCustomersToday: todayCustomers.data().count,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
