import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/admin/reports?type=revenue|customers|services&from=&to=
 * Returns JSON report data for dashboard charts / reports page.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'revenue';
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 86400000);
    const to   = searchParams.get('to')   ? new Date(searchParams.get('to')!)   : new Date();

    if (type === 'revenue') {
      const snap = await adminDb.collection(Collections.BILLING).orderBy('createdAt', 'desc').get();
      const bills = snap.docs.map((d: any) => ({
        total: d.data().total || 0,
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(d.data().createdAt || 0),
        paymentMethod: d.data().paymentMethod,
      })).filter((b: any) => b.createdAt >= from && b.createdAt <= to);

      // Group by day
      const byDay: Record<string, { revenue: number; count: number }> = {};
      bills.forEach((b: any) => {
        const key = b.createdAt.toISOString().slice(0, 10);
        if (!byDay[key]) byDay[key] = { revenue: 0, count: 0 };
        byDay[key].revenue += b.total;
        byDay[key].count   += 1;
      });

      const totalRevenue = bills.reduce((s: any, b) => s + b.total, 0);
      const avgPerDay    = Object.keys(byDay).length > 0 ? totalRevenue / Object.keys(byDay).length : 0;

      // Payment method breakdown
      const byPayment: Record<string, number> = {};
      bills.forEach((b: any) => { byPayment[b.paymentMethod] = (byPayment[b.paymentMethod] || 0) + b.total; });

      return NextResponse.json({
        success: true,
        data: {
          chart: Object.entries(byDay).sort().map(([date, v]) => ({ date, ...v })),
          totalRevenue,
          avgPerDay: Math.round(avgPerDay),
          paymentBreakdown: byPayment,
          billCount: bills.length,
        },
      });
    }

    if (type === 'customers') {
      const snap = await adminDb.collection(Collections.CUSTOMERS).orderBy('createdAt', 'desc').get();
      const customers = snap.docs.map((d: any) => ({
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(d.data().createdAt || 0),
        loyaltyStatus: d.data().loyaltyStatus || 'Bronze',
        totalSpent: d.data().totalSpent || 0,
      })).filter((c: any) => c.createdAt >= from && c.createdAt <= to);

      // Group by month
      const byMonth: Record<string, number> = {};
      customers.forEach((c: any) => {
        const key = c.createdAt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        byMonth[key] = (byMonth[key] || 0) + 1;
      });

      // Loyalty breakdown
      const byLoyalty: Record<string, number> = {};
      const allCust = snap.docs.map((d: any) => d.data().loyaltyStatus || 'Bronze');
      allCust.forEach((l: any) => { byLoyalty[l] = (byLoyalty[l] || 0) + 1; });

      return NextResponse.json({
        success: true,
        data: {
          chart: Object.entries(byMonth).map(([month, count]) => ({ month, count })),
          totalNew: customers.length,
          loyaltyBreakdown: byLoyalty,
          totalAll: snap.size,
        },
      });
    }

    if (type === 'services') {
      const snap = await adminDb.collection(Collections.BILLING).get();
      const serviceCount: Record<string, { count: number; revenue: number }> = {};
      snap.docs.forEach((d: any) => {
        const items = d.data().items || [];
        items.forEach((item: any) => {
          if (item.type === 'service') {
            if (!serviceCount[item.name]) serviceCount[item.name] = { count: 0, revenue: 0 };
            serviceCount[item.name].count   += item.quantity || 1;
            serviceCount[item.name].revenue += item.total || 0;
          }
        });
      });

      const ranked = Object.entries(serviceCount)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([name, v]) => ({ name, ...v }));

      return NextResponse.json({ success: true, data: { ranked } });
    }

    return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
  } catch (err) {
    console.error('Report error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
