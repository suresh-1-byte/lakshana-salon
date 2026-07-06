-- =====================================================
-- SERVICE ADD-ONS SYSTEM
-- Migration: 003_service_addons.sql
-- Purpose: Add service add-ons management system
-- =====================================================

-- Create service_addons table
CREATE TABLE IF NOT EXISTS service_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duration INTEGER DEFAULT 0, -- Additional duration in minutes
    icon TEXT, -- Emoji or icon
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create junction table for service-addon relationships
CREATE TABLE IF NOT EXISTS service_addon_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES service_addons(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE, -- Pre-select by default
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, addon_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_addons_status ON service_addons(status);
CREATE INDEX IF NOT EXISTS idx_service_addon_mappings_service ON service_addon_mappings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_addon_mappings_addon ON service_addon_mappings(addon_id);

-- Insert default add-ons
INSERT INTO service_addons (name, description, price, duration, icon, display_order, status)
VALUES 
    ('Hair Serum Treatment', 'Nourishing serum for healthier hair', 500, 10, '💧', 1, 'active'),
    ('Deep Conditioning', 'Intensive moisture treatment', 800, 15, '🧴', 2, 'active'),
    ('Scalp Massage', 'Relaxing scalp massage therapy', 300, 10, '💆', 3, 'active'),
    ('Hair Styling Products', 'Premium styling products application', 600, 5, '✨', 4, 'active'),
    ('Anti-Frizz Treatment', 'Controls frizz and adds shine', 700, 10, '🌟', 5, 'active'),
    ('Hair Glossing', 'Adds shine and vibrancy', 1000, 15, '💎', 6, 'active'),
    ('Protein Treatment', 'Strengthening protein therapy', 1200, 20, '💪', 7, 'active'),
    ('Hair Mask', 'Deep nourishing hair mask', 400, 15, '🎭', 8, 'active'),
    ('Eyebrow Shaping', 'Perfect eyebrow shape', 100, 5, '✏️', 9, 'active'),
    ('Nail Polish Change', 'Quick polish change', 150, 10, '💅', 10, 'active'),
    ('Makeup Touch-up', 'Quick makeup refresh', 300, 10, '💄', 11, 'active'),
    ('Face Massage', 'Relaxing facial massage', 400, 15, '😌', 12, 'active')
ON CONFLICT DO NOTHING;

-- Auto-assign relevant add-ons to hair services
DO $$
DECLARE
    hair_addon_ids UUID[];
    hair_service RECORD;
    addon RECORD;
BEGIN
    -- Get hair-related addon IDs
    SELECT ARRAY_AGG(id) INTO hair_addon_ids
    FROM service_addons
    WHERE name IN (
        'Hair Serum Treatment',
        'Deep Conditioning',
        'Scalp Massage',
        'Hair Styling Products',
        'Anti-Frizz Treatment',
        'Hair Glossing',
        'Protein Treatment',
        'Hair Mask'
    );
    
    -- Assign to all hair services
    FOR hair_service IN 
        SELECT id FROM services 
        WHERE category ILIKE '%hair%' 
        OR name ILIKE '%hair%'
    LOOP
        FOR addon IN 
            SELECT id FROM service_addons 
            WHERE name IN (
                'Hair Serum Treatment',
                'Deep Conditioning',
                'Scalp Massage',
                'Hair Styling Products',
                'Anti-Frizz Treatment',
                'Hair Glossing',
                'Protein Treatment',
                'Hair Mask'
            )
        LOOP
            INSERT INTO service_addon_mappings (service_id, addon_id, is_default)
            VALUES (hair_service.id, addon.id, FALSE)
            ON CONFLICT (service_id, addon_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Auto-assign threading addon to threading services
DO $$
DECLARE
    threading_service RECORD;
    eyebrow_addon_id UUID;
BEGIN
    SELECT id INTO eyebrow_addon_id
    FROM service_addons
    WHERE name = 'Eyebrow Shaping'
    LIMIT 1;
    
    IF eyebrow_addon_id IS NOT NULL THEN
        FOR threading_service IN 
            SELECT id FROM services 
            WHERE category ILIKE '%thread%'
        LOOP
            INSERT INTO service_addon_mappings (service_id, addon_id, is_default)
            VALUES (threading_service.id, eyebrow_addon_id, FALSE)
            ON CONFLICT (service_id, addon_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- Auto-assign makeup addon to makeup services
DO $$
DECLARE
    makeup_service RECORD;
    touchup_addon_id UUID;
BEGIN
    SELECT id INTO touchup_addon_id
    FROM service_addons
    WHERE name = 'Makeup Touch-up'
    LIMIT 1;
    
    IF touchup_addon_id IS NOT NULL THEN
        FOR makeup_service IN 
            SELECT id FROM services 
            WHERE category ILIKE '%makeup%'
        LOOP
            INSERT INTO service_addon_mappings (service_id, makeup_service.id, is_default)
            VALUES (makeup_service.id, touchup_addon_id, FALSE)
            ON CONFLICT (service_id, addon_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- Auto-assign face massage to facial services
DO $$
DECLARE
    facial_service RECORD;
    massage_addon_id UUID;
BEGIN
    SELECT id INTO massage_addon_id
    FROM service_addons
    WHERE name = 'Face Massage'
    LIMIT 1;
    
    IF massage_addon_id IS NOT NULL THEN
        FOR facial_service IN 
            SELECT id FROM services 
            WHERE category ILIKE '%facial%'
        LOOP
            INSERT INTO service_addon_mappings (service_id, addon_id, is_default)
            VALUES (facial_service.id, massage_addon_id, FALSE)
            ON CONFLICT (service_id, addon_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_service_addons_updated_at ON service_addons;
CREATE TRIGGER update_service_addons_updated_at
    BEFORE UPDATE ON service_addons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE service_addons IS 'Reusable add-ons that can be attached to multiple services';
COMMENT ON TABLE service_addon_mappings IS 'Maps which add-ons are available for which services';
COMMENT ON COLUMN service_addon_mappings.is_default IS 'Whether this addon should be pre-selected for the service';
