// ═══════════════════════════════════════════════════════
//  Google Sheets Integration API - Supabase Implementation
// ═══════════════════════════════════════════════════════

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface GoogleSheetsConfig {
  spreadsheetId?: string;
  serviceAccountEmail?: string;
  privateKey?: string;
}

interface SyncLog {
  id?: string;
  entity_type: string;
  entity_id: string;
  action: 'insert' | 'update' | 'delete';
  sync_status: 'pending' | 'success' | 'failed';
  error_message?: string;
  retry_count: number;
}

const MAX_RETRIES = 3;

/**
 * Get Google Sheets client
 */
async function getSheetsClient() {
  const config: GoogleSheetsConfig = {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!config.spreadsheetId || !config.serviceAccountEmail || !config.privateKey) {
    throw new Error('Google Sheets configuration missing');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.serviceAccountEmail,
      private_key: config.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  return { sheets, spreadsheetId: config.spreadsheetId };
}

/**
 * Sync customer to Google Sheets
 */
export async function syncCustomerToSheets(customerId: string, operation: 'insert' | 'update' | 'delete') {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();

    if (operation === 'delete') {
      // Find and delete row
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Customers!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === customerId);

      if (rowIndex > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: 0, // Customers sheet
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            }],
          },
        });
      }

      return { success: true };
    }

    // Fetch customer data
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error || !customer) {
      return { success: false, error: 'Customer not found' };
    }

    const rowData = [
      customerId,
      customer.full_name || '',
      customer.mobile_number || '',
      customer.email || '',
      customer.total_visits || 0,
      customer.total_spent || 0,
      customer.status || 'active',
      customer.date_of_birth || '',
      customer.last_visit || '',
      customer.created_at || '',
    ];

    if (operation === 'insert') {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Customers!A:J',
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData],
        },
      });
    } else {
      // Update existing row
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Customers!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === customerId);

      if (rowIndex > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Customers!A${rowIndex + 1}:J${rowIndex + 1}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData],
          },
        });
      } else {
        // If not found, insert
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Customers!A:J',
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData],
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing customer to sheets:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sync appointment to Google Sheets
 */
export async function syncAppointmentToSheets(appointmentId: string, operation: 'insert' | 'update' | 'delete') {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();

    if (operation === 'delete') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Appointments!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === appointmentId);

      if (rowIndex > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: 1, // Appointments sheet
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            }],
          },
        });
      }

      return { success: true };
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (
          full_name,
          mobile_number
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    const rowData = [
      appointmentId,
      appointment.booking_id || '',
      appointment.customers?.full_name || '',
      appointment.customers?.mobile_number || '',
      appointment.appointment_date || '',
      appointment.appointment_time || '',
      appointment.booking_status || '',
      appointment.total_amount || 0,
      appointment.created_at || '',
    ];

    if (operation === 'insert') {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Appointments!A:I',
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData],
        },
      });
    } else {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Appointments!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === appointmentId);

      if (rowIndex > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Appointments!A${rowIndex + 1}:I${rowIndex + 1}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData],
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing appointment to sheets:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sync payment to Google Sheets
 */
export async function syncPaymentToSheets(paymentId: string, operation: 'insert' | 'update' | 'delete') {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();

    if (operation === 'delete') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Payments!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === paymentId);

      if (rowIndex > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: 2, // Payments sheet
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            }],
          },
        });
      }

      return { success: true };
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        customers (
          full_name,
          mobile_number
        )
      `)
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return { success: false, error: 'Payment not found' };
    }

    const rowData = [
      paymentId,
      payment.invoice_number || '',
      payment.customers?.full_name || '',
      payment.customers?.mobile_number || '',
      payment.amount || 0,
      payment.payment_method || '',
      payment.payment_status || '',
      payment.payment_date || '',
    ];

    if (operation === 'insert') {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Payments!A:H',
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData],
        },
      });
    } else {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Payments!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === paymentId);

      if (rowIndex > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Payments!A${rowIndex + 1}:H${rowIndex + 1}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData],
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing payment to sheets:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Add sync job to queue
 */
export async function addSyncJob(
  entityType: string,
  entityId: string,
  action: 'insert' | 'update' | 'delete'
) {
  try {
    const syncLog: SyncLog = {
      entity_type: entityType,
      entity_id: entityId,
      action,
      sync_status: 'pending',
      retry_count: 0,
    };

    await supabase.from('google_sheets_sync_log').insert([syncLog]);
  } catch (error) {
    console.error('Error adding sync job:', error);
  }
}

/**
 * Process pending sync jobs
 */
export async function processSyncQueue() {
  try {
    const { data: jobs, error } = await supabase
      .from('google_sheets_sync_log')
      .select('*')
      .eq('sync_status', 'pending')
      .lt('retry_count', MAX_RETRIES)
      .limit(10);

    if (error || !jobs) return { success: false, processed: 0 };

    let processed = 0;

    for (const job of jobs) {
      let result;
      
      if (job.entity_type === 'customers') {
        result = await syncCustomerToSheets(job.entity_id, job.action);
      } else if (job.entity_type === 'appointments') {
        result = await syncAppointmentToSheets(job.entity_id, job.action);
      } else if (job.entity_type === 'payments') {
        result = await syncPaymentToSheets(job.entity_id, job.action);
      } else {
        continue;
      }

      if (result.success) {
        await supabase
          .from('google_sheets_sync_log')
          .update({ 
            sync_status: 'success',
            synced_at: new Date().toISOString()
          })
          .eq('id', job.id);
        processed++;
      } else {
        await supabase
          .from('google_sheets_sync_log')
          .update({
            sync_status: job.retry_count >= MAX_RETRIES - 1 ? 'failed' : 'pending',
            retry_count: job.retry_count + 1,
            error_message: result.error,
          })
          .eq('id', job.id);
      }
    }

    return { success: true, processed };
  } catch (error) {
    console.error('Error processing sync queue:', error);
    return { success: false, processed: 0 };
  }
}
