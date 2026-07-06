import { utils, writeFile } from 'xlsx'

/**
 * Export data to Excel file
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  const ws = utils.json_to_sheet(data)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, sheetName)
  writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

/**
 * Export multiple sheets to single Excel file
 */
export function exportMultipleSheets(
  sheets: Array<{ name: string; data: any[] }>,
  filename: string
) {
  const wb = utils.book_new()

  sheets.forEach((sheet) => {
    const ws = utils.json_to_sheet(sheet.data)
    utils.book_append_sheet(wb, ws, sheet.name)
  })

  writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

/**
 * Format customer data for export
 */
export function formatCustomersForExport(customers: any[]) {
  return customers.map((customer) => ({
    'Customer ID': customer.customer_id,
    'Full Name': customer.full_name,
    'Mobile': customer.mobile_number,
    'WhatsApp': customer.whatsapp_number || '-',
    'Email': customer.email || '-',
    'Date of Birth': customer.date_of_birth || '-',
    'Gender': customer.gender || '-',
    'City': customer.city || '-',
    'Address': customer.address || '-',
    'Total Visits': customer.total_visits,
    'Total Spent': `₹${customer.total_spent.toFixed(2)}`,
    'Member Since': new Date(customer.member_since).toLocaleDateString(),
    'Status': customer.status,
  }))
}

/**
 * Format appointments for export
 */
export function formatAppointmentsForExport(appointments: any[]) {
  return appointments.map((apt) => ({
    'Booking ID': apt.booking_id,
    'Customer Name': apt.customers?.full_name || '-',
    'Mobile': apt.customers?.mobile_number || '-',
    'Service': apt.services?.name || '-',
    'Date': new Date(apt.appointment_date).toLocaleDateString(),
    'Time': apt.appointment_time,
    'Duration': `${apt.duration} mins`,
    'Stylist': apt.staff?.staff_name || '-',
    'Total Amount': `₹${apt.total_amount}`,
    'Advance': `₹${apt.advance_amount}`,
    'Balance': `₹${apt.balance_amount}`,
    'Booking Status': apt.booking_status,
    'Payment Status': apt.payment_status,
    'Created': new Date(apt.created_at).toLocaleDateString(),
  }))
}

/**
 * Format payments for export
 */
export function formatPaymentsForExport(payments: any[]) {
  return payments.map((payment) => ({
    'Invoice Number': payment.invoice_number,
    'Customer Name': payment.customers?.full_name || '-',
    'Mobile': payment.customers?.mobile_number || '-',
    'Booking ID': payment.appointments?.booking_id || '-',
    'Amount': `₹${payment.amount}`,
    'Payment Method': payment.payment_method,
    'Status': payment.payment_status,
    'Transaction ID': payment.transaction_id || '-',
    'Date': new Date(payment.payment_date).toLocaleDateString(),
  }))
}

/**
 * Format enquiries for export
 */
export function formatEnquiriesForExport(enquiries: any[]) {
  return enquiries.map((enq) => ({
    'Name': enq.name,
    'Phone': enq.phone,
    'Email': enq.email || '-',
    'Interested Service': enq.interested_service || '-',
    'Message': enq.message || '-',
    'Source': enq.source,
    'Status': enq.status,
    'Created': new Date(enq.created_at).toLocaleDateString(),
  }))
}

/**
 * Generate report filename with date
 */
export function generateReportFilename(reportType: string) {
  const date = new Date().toISOString().split('T')[0]
  return `${reportType}_report_${date}`
}
