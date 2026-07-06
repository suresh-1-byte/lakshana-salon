-- ═══════════════════════════════════════════════════════
-- Birthday Automation System Migration
-- ═══════════════════════════════════════════════════════

-- =====================================================
-- BIRTHDAY NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS birthday_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    birthday_date DATE NOT NULL,
    days_remaining INTEGER NOT NULL,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,
    message_sent BOOLEAN DEFAULT FALSE,
    message_sent_at TIMESTAMP,
    message_content TEXT,
    offer_percentage INTEGER DEFAULT 20,
    offer_valid_until DATE,
    whatsapp_message_id UUID,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'expired')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- BIRTHDAY TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS birthday_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL,
    message_text TEXT NOT NULL,
    offer_percentage INTEGER DEFAULT 20,
    offer_validity_days INTEGER DEFAULT 7,
    service_names TEXT[] DEFAULT ARRAY['Hair Spa', 'Facial'],
    coupon_code_prefix TEXT DEFAULT 'BDAY',
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- WHATSAPP MESSAGE LOGS TABLE (Enhanced)
-- =====================================================
-- Add columns to existing whatsapp_messages table if not present
DO $$ 
BEGIN
    -- Add birthday_notification_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_messages' 
        AND column_name = 'birthday_notification_id'
    ) THEN
        ALTER TABLE whatsapp_messages 
        ADD COLUMN birthday_notification_id UUID REFERENCES birthday_notifications(id) ON DELETE SET NULL;
    END IF;
    
    -- Add metadata column for additional data
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_messages' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE whatsapp_messages 
        ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_birthday_notifications_customer ON birthday_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_birthday_notifications_status ON birthday_notifications(status);
CREATE INDEX IF NOT EXISTS idx_birthday_notifications_days ON birthday_notifications(days_remaining);
CREATE INDEX IF NOT EXISTS idx_birthday_notifications_date ON birthday_notifications(birthday_date);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_birthday ON whatsapp_messages(birthday_notification_id);

-- =====================================================
-- INSERT DEFAULT BIRTHDAY TEMPLATES
-- =====================================================
INSERT INTO birthday_templates (
    template_name,
    message_text,
    offer_percentage,
    offer_validity_days,
    service_names,
    is_default
) VALUES 
(
    'Default Birthday Template',
    'Hi {{name}} 🎉\n\nYour birthday is coming up on {{birthday_date}}! As a special gift from Lakshana Beauty Salon, enjoy {{offer_percentage}}% OFF on any {{services}} service this week.\n\nUse code: {{coupon_code}}\nValid until: {{valid_until}}\n\nWe look forward to celebrating with you! 💖\n\nLakshana Beauty Salon\n✨ Where Beauty Meets Luxury',
    20,
    7,
    ARRAY['Hair Spa', 'Facial'],
    TRUE
),
(
    'Premium Birthday Offer',
    '🎂 Happy Birthday Month, {{name}}! 🎂\n\nCelebrate your special day with us!\n\n🎁 EXCLUSIVE OFFER: {{offer_percentage}}% OFF\n💇 Valid on: {{services}}\n📅 Valid till: {{valid_until}}\n🎟️ Code: {{coupon_code}}\n\nBook now and pamper yourself!\n\nLakshana Beauty Salon\n📞 Call us to book your slot',
    25,
    10,
    ARRAY['Hair Spa', 'Facial', 'Hair Coloring', 'Bridal Makeup'],
    FALSE
),
(
    'Simple Birthday Wish',
    'Hi {{name}} 🎉\n\nHappy Birthday from all of us at Lakshana Beauty Salon! 🎂\n\nEnjoy {{offer_percentage}}% off on your next visit as our gift to you!\n\nCode: {{coupon_code}}\nValid for {{validity_days}} days\n\nSee you soon! 💖',
    15,
    7,
    ARRAY['All Services'],
    FALSE
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTION: Get Upcoming Birthdays
-- =====================================================
CREATE OR REPLACE FUNCTION get_upcoming_birthdays(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    customer_id UUID,
    full_name TEXT,
    mobile_number TEXT,
    whatsapp_number TEXT,
    email TEXT,
    date_of_birth DATE,
    birthday_this_year DATE,
    days_until_birthday INTEGER,
    age INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.full_name,
        c.mobile_number,
        c.whatsapp_number,
        c.email,
        c.date_of_birth,
        (DATE_TRUNC('year', CURRENT_DATE) + 
         (EXTRACT(MONTH FROM c.date_of_birth) - 1) * INTERVAL '1 month' + 
         (EXTRACT(DAY FROM c.date_of_birth) - 1) * INTERVAL '1 day')::DATE as birthday_this_year,
        EXTRACT(DAY FROM 
            (DATE_TRUNC('year', CURRENT_DATE) + 
             (EXTRACT(MONTH FROM c.date_of_birth) - 1) * INTERVAL '1 month' + 
             (EXTRACT(DAY FROM c.date_of_birth) - 1) * INTERVAL '1 day') - CURRENT_DATE
        )::INTEGER as days_until_birthday,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.date_of_birth))::INTEGER as age
    FROM customers c
    WHERE 
        c.status = 'active' 
        AND c.date_of_birth IS NOT NULL
        AND EXTRACT(DAY FROM 
            (DATE_TRUNC('year', CURRENT_DATE) + 
             (EXTRACT(MONTH FROM c.date_of_birth) - 1) * INTERVAL '1 month' + 
             (EXTRACT(DAY FROM c.date_of_birth) - 1) * INTERVAL '1 day') - CURRENT_DATE
        ) BETWEEN 0 AND days_ahead
    ORDER BY days_until_birthday ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get Today's Birthdays
-- =====================================================
CREATE OR REPLACE FUNCTION get_todays_birthdays()
RETURNS TABLE (
    customer_id UUID,
    full_name TEXT,
    mobile_number TEXT,
    whatsapp_number TEXT,
    email TEXT,
    date_of_birth DATE,
    age INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.full_name,
        c.mobile_number,
        c.whatsapp_number,
        c.email,
        c.date_of_birth,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.date_of_birth))::INTEGER as age
    FROM customers c
    WHERE 
        c.status = 'active' 
        AND c.date_of_birth IS NOT NULL
        AND EXTRACT(MONTH FROM c.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM c.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Create Birthday Notifications
-- =====================================================
CREATE OR REPLACE FUNCTION create_birthday_notifications()
RETURNS INTEGER AS $$
DECLARE
    notification_count INTEGER := 0;
    customer_record RECORD;
    birthday_this_year DATE;
    days_until INTEGER;
    valid_until DATE;
BEGIN
    -- Loop through customers with birthdays in next 7 days
    FOR customer_record IN 
        SELECT * FROM get_upcoming_birthdays(7)
    LOOP
        -- Calculate valid until date (7 days from now)
        valid_until := CURRENT_DATE + INTERVAL '7 days';
        
        -- Check if notification already exists
        IF NOT EXISTS (
            SELECT 1 FROM birthday_notifications
            WHERE customer_id = customer_record.customer_id
            AND birthday_date = customer_record.birthday_this_year
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        ) THEN
            -- Create notification
            INSERT INTO birthday_notifications (
                customer_id,
                birthday_date,
                days_remaining,
                offer_valid_until,
                status
            ) VALUES (
                customer_record.customer_id,
                customer_record.birthday_this_year,
                customer_record.days_until_birthday,
                valid_until,
                'pending'
            );
            
            notification_count := notification_count + 1;
        ELSE
            -- Update days remaining for existing notification
            UPDATE birthday_notifications
            SET 
                days_remaining = customer_record.days_until_birthday,
                updated_at = NOW()
            WHERE 
                customer_id = customer_record.customer_id
                AND birthday_date = customer_record.birthday_this_year
                AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
        END IF;
    END LOOP;
    
    RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Auto-update birthday notification days
-- =====================================================
CREATE OR REPLACE FUNCTION update_birthday_days_remaining()
RETURNS TRIGGER AS $$
BEGIN
    NEW.days_remaining := EXTRACT(DAY FROM (NEW.birthday_date - CURRENT_DATE))::INTEGER;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_birthday_notifications_updated_at 
    BEFORE UPDATE ON birthday_notifications
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_birthday_templates_updated_at 
    BEFORE UPDATE ON birthday_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================

-- Enable RLS
ALTER TABLE birthday_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin)
CREATE POLICY "Allow all for authenticated users" ON birthday_notifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON birthday_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON birthday_notifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON birthday_templates
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE birthday_notifications IS 'Stores birthday reminder notifications and their status';
COMMENT ON TABLE birthday_templates IS 'Stores customizable birthday message templates';
COMMENT ON FUNCTION get_upcoming_birthdays IS 'Returns customers with birthdays in the next N days';
COMMENT ON FUNCTION get_todays_birthdays IS 'Returns customers with birthdays today';
COMMENT ON FUNCTION create_birthday_notifications IS 'Creates birthday notifications for upcoming birthdays';
