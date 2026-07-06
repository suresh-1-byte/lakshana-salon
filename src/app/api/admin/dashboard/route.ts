import { NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';
import type { DashboardStats } from '@/types/admin';
import { getTodaysBirthdays } from '@/lib/api/birthdays';
import { getTodaysAppointments } from '@/lib/api/appointments';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel including birthdays and appointments
    const [
      bookingsSnap,
      customersSnap,
      billingSnap,
      notificationsSnap,
      reviewsSnap,
      servicesSnap,
      birthdays,
      todayAppointments,
    ] = await Promise.all([
      adminDb.collection(Collections.BOOKINGS).get(),
      adminDb.collection(Collections.CUSTOMERS).get(),
      adminDb.collection(Collections.BILLING).get(),
      adminDb.collection(Collections.NOTIFICATIONS).where('status', '==', 'sent').get(),
      adminDb.collection(Collections.REVIEWS).where('status', '==', 'pending').get(),
      adminDb.collection(Collections.SERVICES).where('isActive', '==', true).get(),
      getTodaysBirthdays(),
      getTodaysAppointments(),
    ]);

    const bookings = bookingsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
    const customers = customersSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
    const bills = billingSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];

    // Compute stats
    const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
    const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;

    const todayBills = bills.filter((b: any) => {
      const d = new Date(b.createdAt);
      return d >= todayStart;
    });
    const monthBills = bills.filter((b: any) => {
      const d = new Date(b.createdAt);
      return d >= monthStart;
    });

    const todayRevenue = todayBills.reduce((sum: any, b) => sum + (b.total || 0), 0);
    const monthlyRevenue = monthBills.reduce((sum: any, b) => sum + (b.total || 0), 0);
    const totalRevenue = bills.reduce((sum: any, b) => sum + (b.total || 0), 0);

    const todayCustomers = customers.filter((c: any) => {
      if (!c.lastVisit) return false;
      const d = c.lastVisit?.toDate ? c.lastVisit.toDate() : new Date(c.lastVisit);
      return d >= todayStart;
    }).length;

    const monthlyCustomers = customers.filter((c: any) => {
      if (!c.createdAt) return false;
      const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      return d >= monthStart;
    }).length;

    const stats: DashboardStats = {
      totalCustomers: customers.length,
      todayCustomers,
      monthlyCustomers,
      totalBookings: bookings.length,
      pendingBookings,
      completedBookings,
      todayRevenue,
      monthlyRevenue,
      totalRevenue,
      notificationsSent: notificationsSnap.size,
      newReviews: reviewsSnap.size,
      activeServices: servicesSnap.size,
    };

    // Revenue chart data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const revenueChart = last7Days.map(day => {
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayRevenue = bills
        .filter((b: any) => {
          const bd = new Date(b.createdAt);
          return bd >= dayStart && bd < dayEnd;
        })
        .reduce((sum: any, b) => sum + (b.total || 0), 0);

      return {
        date: day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      };
    });

    // Monthly bookings chart (last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });

    const bookingChart = last6Months.map(month => {
      const ms = new Date(month.getFullYear(), month.getMonth(), 1);
      const me = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      const count = bookings.filter((b: any) => {
        const bd = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return bd >= ms && bd < me;
      }).length;
      return {
        month: month.toLocaleDateString('en-IN', { month: 'short' }),
        bookings: count,
      };
    });

    // Service popularity (from bills)
    const serviceCount: Record<string, number> = {};
    bills.forEach((b: any) => {
      (b.items || []).forEach((item: any) => {
        if (item.type === 'service') {
          serviceCount[item.name] = (serviceCount[item.name] || 0) + item.quantity;
        }
      });
    });
    const popularServices = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        revenueChart,
        bookingChart,
        popularServices,
        birthdays,
        todayAppointments,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
