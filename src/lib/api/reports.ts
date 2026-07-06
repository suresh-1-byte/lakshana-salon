// ═══════════════════════════════════════════════════════
//  Reports API - Daily & Weekly Reports (Firebase)
// ═══════════════════════════════════════════════════════

import { adminDb, Collections } from '@/lib/firebase-admin';
import * as XLSX from 'xlsx';

export interface DailyReport {
  date: string;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  revenue: number;
  newCustomers: number;
  newEnquiries: number;
  paymentsCount: number;
  paymentsTotal: number;
  topServices: Array<{ service: string; count: number }>;
}

export interface WeeklyReport extends DailyReport {
  startDate: string;
  endDate: string;
  repeatCustomers: number;
  popularServices: Array<{ service: string; count: number; revenue: number }>;
  customerRetentionRate: number;
}

/**
 * Generate daily report
 */
export async function generateDailyReport(date?: string): Promise<DailyReport> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch bookings for the day
    const bookingsSnapshot = await adminDb
      .collection(Collections.BOOKINGS)
      .where('createdAt', '>=', startOfDay.toISOString())
      .where('createdAt', '<=', endOfDay.toISOString())
      .get();

    const bookings = bookingsSnapshot.docs.map(doc => doc.data());

    // Fetch payments for the day
    const paymentsSnapshot = await adminDb
      .collection(Collections.BILLING)
      .where('createdAt', '>=', startOfDay.toISOString())
      .where('createdAt', '<=', endOfDay.toISOString())
      .get();

    const payments = paymentsSnapshot.docs.map(doc => doc.data());

    // Fetch new customers
    const customersSnapshot = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('createdAt', '>=', startOfDay.toISOString())
      .where('createdAt', '<=', endOfDay.toISOString())
      .get();

    const customers = customersSnapshot.docs;

    // Fetch new enquiries
    const enquiriesSnapshot = await adminDb
      .collection(Collections.ENQUIRIES)
      .where('createdAt', '>=', startOfDay.toISOString())
      .where('createdAt', '<=', endOfDay.toISOString())
      .get();

    const enquiries = enquiriesSnapshot.docs;

    // Calculate stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const revenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.total || 0), 0);

    const newCustomers = customers.length;
    const newEnquiries = enquiries.length;
    const paymentsCount = payments.length;
    const paymentsTotal = payments.reduce((sum, p) => sum + (p.total || 0), 0);

    // Top services - count services from bookings
    const serviceCount: Record<string, number> = {};
    
    bookings.forEach(booking => {
      if (booking.services && Array.isArray(booking.services)) {
        booking.services.forEach((service: any) => {
          const serviceName = service.name || 'Unknown';
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });
      }
    });

    const topServices = Object.entries(serviceCount)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      date: targetDate,
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      revenue,
      newCustomers,
      newEnquiries,
      paymentsCount,
      paymentsTotal,
      topServices,
    };
  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
}

/**
 * Generate weekly report
 */
export async function generateWeeklyReport(startDate?: string, endDate?: string): Promise<WeeklyReport> {
  try {
    const start = startDate ? new Date(startDate) : getStartOfWeek();
    const end = endDate ? new Date(endDate) : (() => {
      const e = new Date(start);
      e.setDate(e.getDate() + 6);
      e.setHours(23, 59, 59, 999);
      return e;
    })();

    // Ensure end is set to end of day
    end.setHours(23, 59, 59, 999);

    // Fetch bookings for the week
    const bookingsSnapshot = await adminDb
      .collection(Collections.BOOKINGS)
      .where('createdAt', '>=', start.toISOString())
      .where('createdAt', '<=', end.toISOString())
      .get();

    const bookings = bookingsSnapshot.docs.map(doc => doc.data());

    // Fetch payments for the week
    const paymentsSnapshot = await adminDb
      .collection(Collections.BILLING)
      .where('createdAt', '>=', start.toISOString())
      .where('createdAt', '<=', end.toISOString())
      .get();

    const payments = paymentsSnapshot.docs.map(doc => doc.data());

    // Fetch customers for the week
    const customersSnapshot = await adminDb
      .collection(Collections.CUSTOMERS)
      .where('createdAt', '>=', start.toISOString())
      .where('createdAt', '<=', end.toISOString())
      .get();

    const newCustomers = customersSnapshot.docs;

    // Fetch enquiries for the week
    const enquiriesSnapshot = await adminDb
      .collection(Collections.ENQUIRIES)
      .where('createdAt', '>=', start.toISOString())
      .where('createdAt', '<=', end.toISOString())
      .get();

    const enquiries = enquiriesSnapshot.docs;

    // Calculate stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const revenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.total || 0), 0);

    const paymentsCount = payments.length;
    const paymentsTotal = payments.reduce((sum, p) => sum + (p.total || 0), 0);

    // Calculate repeat customers
    const customerIds = new Set(bookings.map(b => b.customerId).filter(Boolean));
    let repeatCustomers = 0;

    for (const customerId of customerIds) {
      // Check if customer had bookings before this week
      const previousSnapshot = await adminDb
        .collection(Collections.BOOKINGS)
        .where('customerId', '==', customerId)
        .where('createdAt', '<', start.toISOString())
        .limit(1)
        .get();

      if (!previousSnapshot.empty) {
        repeatCustomers++;
      }
    }

    // Popular services with revenue
    const serviceStats: Record<string, { count: number; revenue: number }> = {};

    bookings.forEach(booking => {
      if (booking.services && Array.isArray(booking.services)) {
        booking.services.forEach((service: any) => {
          const serviceName = service.name || 'Unknown';
          if (!serviceStats[serviceName]) {
            serviceStats[serviceName] = { count: 0, revenue: 0 };
          }
          serviceStats[serviceName].count++;
        });
      }
    });

    // Add revenue from payments
    payments.forEach(payment => {
      if (payment.items && Array.isArray(payment.items)) {
        payment.items.forEach((item: any) => {
          if (item.type === 'service') {
            const serviceName = item.name;
            if (serviceStats[serviceName]) {
              serviceStats[serviceName].revenue += item.total || 0;
            }
          }
        });
      }
    });

    const popularServices = Object.entries(serviceStats)
      .map(([service, stats]) => ({
        service,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topServices = popularServices.slice(0, 5).map(s => ({
      service: s.service,
      count: s.count,
    }));

    // Customer retention rate
    const totalCustomersThisWeek = customerIds.size;
    const customerRetentionRate = totalCustomersThisWeek > 0
      ? (repeatCustomers / totalCustomersThisWeek) * 100
      : 0;

    return {
      date: start.toISOString().split('T')[0],
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      revenue,
      newCustomers: newCustomers.length,
      newEnquiries: enquiries.length,
      paymentsCount,
      paymentsTotal,
      topServices,
      repeatCustomers,
      popularServices,
      customerRetentionRate: Math.round(customerRetentionRate),
    };
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
}

/**
 * Export daily report to Excel
 */
export async function exportDailyReportToExcel(report: DailyReport): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Lakshana Beauty Salon - Daily Report'],
    ['Date', report.date],
    [''],
    ['Metric', 'Value'],
    ['Total Bookings', report.totalBookings],
    ['Completed Bookings', report.completedBookings],
    ['Pending Bookings', report.pendingBookings],
    ['Cancelled Bookings', report.cancelledBookings],
    ['Revenue', `₹${report.revenue.toFixed(2)}`],
    ['New Customers', report.newCustomers],
    ['New Enquiries', report.newEnquiries],
    ['Payments Count', report.paymentsCount],
    ['Payments Total', `₹${report.paymentsTotal.toFixed(2)}`],
    [''],
    ['Top Services'],
    ['Service', 'Count'],
    ...report.topServices.map(s => [s.service, s.count]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

/**
 * Export weekly report to Excel
 */
export async function exportWeeklyReportToExcel(report: WeeklyReport): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Lakshana Beauty Salon - Weekly Report'],
    ['Period', `${report.startDate} to ${report.endDate}`],
    [''],
    ['Metric', 'Value'],
    ['Total Bookings', report.totalBookings],
    ['Completed Bookings', report.completedBookings],
    ['Pending Bookings', report.pendingBookings],
    ['Cancelled Bookings', report.cancelledBookings],
    ['Revenue', `₹${report.revenue.toFixed(2)}`],
    ['New Customers', report.newCustomers],
    ['Repeat Customers', report.repeatCustomers],
    ['Customer Retention Rate', `${report.customerRetentionRate}%`],
    ['New Enquiries', report.newEnquiries],
    ['Payments Count', report.paymentsCount],
    ['Payments Total', `₹${report.paymentsTotal.toFixed(2)}`],
    [''],
    ['Popular Services'],
    ['Service', 'Count', 'Revenue'],
    ...report.popularServices.map(s => [s.service, s.count, `₹${s.revenue.toFixed(2)}`]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

/**
 * Helper: Get start of week (Monday)
 */
function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
