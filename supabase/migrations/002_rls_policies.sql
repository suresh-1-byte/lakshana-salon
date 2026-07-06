-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sheets_sync_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - Allow all operations for authenticated users
-- In production, you should implement proper role-based access
-- =====================================================

-- Customers
CREATE POLICY "Allow all for authenticated users" ON customers
    FOR ALL USING (true) WITH CHECK (true);

-- Services
CREATE POLICY "Allow all for authenticated users" ON services
    FOR ALL USING (true) WITH CHECK (true);

-- Packages
CREATE POLICY "Allow all for authenticated users" ON packages
    FOR ALL USING (true) WITH CHECK (true);

-- Staff
CREATE POLICY "Allow all for authenticated users" ON staff
    FOR ALL USING (true) WITH CHECK (true);

-- Appointments
CREATE POLICY "Allow all for authenticated users" ON appointments
    FOR ALL USING (true) WITH CHECK (true);

-- Payments
CREATE POLICY "Allow all for authenticated users" ON payments
    FOR ALL USING (true) WITH CHECK (true);

-- Consultations
CREATE POLICY "Allow all for authenticated users" ON consultations
    FOR ALL USING (true) WITH CHECK (true);

-- Enquiries
CREATE POLICY "Allow all for authenticated users" ON enquiries
    FOR ALL USING (true) WITH CHECK (true);

-- Memberships
CREATE POLICY "Allow all for authenticated users" ON memberships
    FOR ALL USING (true) WITH CHECK (true);

-- Customer Packages
CREATE POLICY "Allow all for authenticated users" ON customer_packages
    FOR ALL USING (true) WITH CHECK (true);

-- Photo Gallery
CREATE POLICY "Allow all for authenticated users" ON photo_gallery
    FOR ALL USING (true) WITH CHECK (true);

-- WhatsApp Messages
CREATE POLICY "Allow all for authenticated users" ON whatsapp_messages
    FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Allow all for authenticated users" ON notifications
    FOR ALL USING (true) WITH CHECK (true);

-- Audit Logs
CREATE POLICY "Allow all for authenticated users" ON audit_logs
    FOR ALL USING (true) WITH CHECK (true);

-- Message Templates
CREATE POLICY "Allow all for authenticated users" ON message_templates
    FOR ALL USING (true) WITH CHECK (true);

-- Google Sheets Sync Log
CREATE POLICY "Allow all for authenticated users" ON google_sheets_sync_log
    FOR ALL USING (true) WITH CHECK (true);
