import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Collections } from '@/lib/firebase-admin';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'customers';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();

    let worksheetData: Record<string, unknown>[] = [];
    let sheetName = 'Export';

    if (type === 'customers') {
      sheetName = 'Customers';
      const snap = await adminDb.collection(Collections.CUSTOMERS).orderBy('createdAt', 'desc').get();
      worksheetData = snap.docs.map(d => {
        const data = d.data();
        return {
          'Name':          data.name,
          'Phone':         data.phone,
          'Email':         data.email || '',
          'Address':       data.address || '',
          'Total Visits':  data.totalVisits || 0,
          'Total Spent':   `₹${data.totalSpent || 0}`,
          'Last Visit':    data.lastVisit?.toDate?.()?.toLocaleDateString('en-IN') || '',
          'Loyalty':       data.loyaltyStatus || 'Bronze',
          'Joined':        data.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '',
        };
      });
    } else if (type === 'billing') {
      sheetName = 'Billing Report';
      const snap = await adminDb.collection(Collections.BILLING).orderBy('createdAt', 'desc').get();
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      worksheetData = docs
        .filter(b => {
          const d = b.createdAt?.toDate?.() ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return d >= fromDate && d <= toDate;
        })
        .map(b => ({
          'Invoice No':     b.invoiceNumber,
          'Customer':       b.customerName,
          'Phone':          b.customerPhone,
          'Services':       b.items?.filter((i: any) => i.type === 'service').map((i: any) => i.name).join(', ') || '',
          'Subtotal':       `₹${b.subtotal || 0}`,
          'Discount':       `₹${b.discount || 0}`,
          'Tax':            `₹${b.tax || 0}`,
          'Total':          `₹${b.total || 0}`,
          'Payment':        b.paymentMethod,
          'Status':         b.status,
          'Date':           b.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '',
        }));
    } else if (type === 'revenue') {
      sheetName = 'Revenue Report';
      const snap = await adminDb.collection(Collections.BILLING).orderBy('createdAt', 'desc').get();
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      // Group by day
      const grouped: Record<string, { revenue: number; count: number }> = {};
      docs
        .filter(b => {
          const d = b.createdAt?.toDate?.() ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return d >= fromDate && d <= toDate;
        })
        .forEach(b => {
          const d = b.createdAt?.toDate?.() ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          const key = d.toLocaleDateString('en-IN');
          if (!grouped[key]) grouped[key] = { revenue: 0, count: 0 };
          grouped[key].revenue += b.total || 0;
          grouped[key].count += 1;
        });

      worksheetData = Object.entries(grouped).map(([date, val]) => ({
        'Date':          date,
        'Transactions':  val.count,
        'Revenue':       `₹${val.revenue}`,
      }));
    } else if (type === 'appointments') {
      sheetName = 'Appointments';
      const snap = await adminDb.collection(Collections.BOOKINGS).orderBy('createdAt', 'desc').get();
      worksheetData = snap.docs.map(d => {
        const data = d.data();
        return {
          'Name':      data.name,
          'Phone':     data.phone,
          'Email':     data.email || '',
          'Services':  data.services?.map((s: any) => s.name).join(', ') || '',
          'Status':    data.status,
          'Date':      data.scheduledDate || '',
          'Time':      data.scheduledTime || '',
          'Created':   data.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '',
        };
      });
    }

    if (worksheetData.length === 0) {
      worksheetData = [{ Message: 'No data found for selected range' }];
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Style column widths
    const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="lakshana-${type}-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
