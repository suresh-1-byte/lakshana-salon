-- =====================================================
-- SERVICE CATEGORIES UPGRADE
-- Migration: 002_service_categories.sql
-- Purpose: Add service categories and upgrade services table
-- =====================================================

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- Icon name or emoji
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add category_id to existing services table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE services ADD COLUMN category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_service_categories_status ON service_categories(status);

-- Add display_order to services for sorting within category
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'display_order'
    ) THEN
        ALTER TABLE services ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Insert default service categories
INSERT INTO service_categories (name, description, icon, display_order, status)
VALUES 
    ('Threading', 'Threading services for face and body', '🧵', 1, 'active'),
    ('Hair', 'Hair care and styling services', '💇', 2, 'active'),
    ('Makeup', 'Professional makeup services', '💄', 3, 'active'),
    ('Facial', 'Facial treatments and skin care', '✨', 4, 'active'),
    ('Waxing', 'Waxing services for smooth skin', '🪒', 5, 'active'),
    ('Nails', 'Nail care and nail art services', '💅', 6, 'active')
ON CONFLICT (name) DO NOTHING;

-- Update existing services to link with categories (if category field exists as text)
DO $$
DECLARE
    cat_id UUID;
    cat_name TEXT;
BEGIN
    -- Threading category
    SELECT id INTO cat_id FROM service_categories WHERE name = 'Threading';
    UPDATE services SET category_id = cat_id WHERE category ILIKE '%thread%' AND category_id IS NULL;
    
    -- Hair category
    SELECT id INTO cat_id FROM service_categories WHERE name = 'Hair';
    UPDATE services SET category_id = cat_id WHERE (
        category ILIKE '%hair%' OR 
        category ILIKE '%keratin%' OR 
        category ILIKE '%botox%' OR
        category ILIKE '%smooth%' OR
        category ILIKE '%color%'
    ) AND category_id IS NULL;
    
    -- Makeup category
    SELECT id INTO cat_id FROM service_categories WHERE name = 'Makeup';
    UPDATE services SET category_id = cat_id WHERE category ILIKE '%makeup%' AND category_id IS NULL;
    
    -- Facial category
    SELECT id INTO cat_id FROM service_categories WHERE name = 'Facial';
    UPDATE services SET category_id = cat_id WHERE (
        category ILIKE '%facial%' OR 
        category ILIKE '%cleanup%' OR
        category ILIKE '%hydra%'
    ) AND category_id IS NULL;
    
    -- Waxing category
    SELECT id INTO cat_id FROM service_categories WHERE name = 'Waxing';
    UPDATE services SET category_id = cat_id WHERE category ILIKE '%wax%' AND category_id IS NULL;
    
    -- Nails category
    SELECT id INTO cat_id FROM service_categories WHERE name = 'Nails';
    UPDATE services SET category_id = cat_id WHERE (
        category ILIKE '%nail%' OR 
        category ILIKE '%manicure%' OR
        category ILIKE '%pedicure%'
    ) AND category_id IS NULL;
END $$;

-- Insert sample services for each category
DO $$
DECLARE
    threading_id UUID;
    hair_id UUID;
    makeup_id UUID;
    facial_id UUID;
    waxing_id UUID;
    nails_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO threading_id FROM service_categories WHERE name = 'Threading';
    SELECT id INTO hair_id FROM service_categories WHERE name = 'Hair';
    SELECT id INTO makeup_id FROM service_categories WHERE name = 'Makeup';
    SELECT id INTO facial_id FROM service_categories WHERE name = 'Facial';
    SELECT id INTO waxing_id FROM service_categories WHERE name = 'Waxing';
    SELECT id INTO nails_id FROM service_categories WHERE name = 'Nails';
    
    -- Threading services
    INSERT INTO services (name, category, category_id, description, price, duration, display_order, status)
    VALUES 
        ('Eyebrow Threading', 'Threading', threading_id, 'Professional eyebrow shaping', 50, 15, 1, 'active'),
        ('Upper Lip Threading', 'Threading', threading_id, 'Upper lip hair removal', 30, 10, 2, 'active'),
        ('Forehead Threading', 'Threading', threading_id, 'Forehead hair removal', 40, 10, 3, 'active'),
        ('Chin Threading', 'Threading', threading_id, 'Chin hair removal', 40, 10, 4, 'active'),
        ('Full Face Threading', 'Threading', threading_id, 'Complete face threading', 150, 30, 5, 'active')
    ON CONFLICT DO NOTHING;
    
    -- Hair services
    INSERT INTO services (name, category, category_id, description, price, duration, display_order, status)
    VALUES 
        ('Hair Cut', 'Hair', hair_id, 'Professional hair cutting', 300, 45, 1, 'active'),
        ('Hair Spa', 'Hair', hair_id, 'Relaxing hair spa treatment', 800, 60, 2, 'active'),
        ('Hair Coloring', 'Hair', hair_id, 'Professional hair coloring', 1500, 120, 3, 'active'),
        ('Hair Smoothening', 'Hair', hair_id, 'Smoothening treatment', 3000, 180, 4, 'active'),
        ('Keratin Treatment', 'Hair', hair_id, 'Keratin hair treatment', 4000, 180, 5, 'active'),
        ('Hair Botox', 'Hair', hair_id, 'Hair botox treatment', 3500, 150, 6, 'active')
    ON CONFLICT DO NOTHING;
    
    -- Makeup services
    INSERT INTO services (name, category, category_id, description, price, duration, display_order, status)
    VALUES 
        ('Party Makeup', 'Makeup', makeup_id, 'Makeup for parties and events', 1500, 60, 1, 'active'),
        ('Bridal Makeup', 'Makeup', makeup_id, 'Complete bridal makeup', 5000, 120, 2, 'active'),
        ('Engagement Makeup', 'Makeup', makeup_id, 'Engagement ceremony makeup', 3000, 90, 3, 'active'),
        ('Reception Makeup', 'Makeup', makeup_id, 'Reception party makeup', 4000, 90, 4, 'active')
    ON CONFLICT DO NOTHING;
    
    -- Facial services
    INSERT INTO services (name, category, category_id, description, price, duration, display_order, status)
    VALUES 
        ('Cleanup', 'Facial', facial_id, 'Basic facial cleanup', 400, 30, 1, 'active'),
        ('Fruit Facial', 'Facial', facial_id, 'Refreshing fruit facial', 600, 45, 2, 'active'),
        ('Gold Facial', 'Facial', facial_id, 'Luxurious gold facial', 1200, 60, 3, 'active'),
        ('Diamond Facial', 'Facial', facial_id, 'Premium diamond facial', 1500, 60, 4, 'active'),
        ('Hydra Facial', 'Facial', facial_id, 'Deep hydrating facial', 2000, 75, 5, 'active')
    ON CONFLICT DO NOTHING;
    
    -- Waxing services
    INSERT INTO services (name, category, category_id, description, price, duration, display_order, status)
    VALUES 
        ('Full Hand Wax', 'Waxing', waxing_id, 'Full arm waxing', 300, 30, 1, 'active'),
        ('Half Hand Wax', 'Waxing', waxing_id, 'Half arm waxing', 200, 20, 2, 'active'),
        ('Full Leg Wax', 'Waxing', waxing_id, 'Full leg waxing', 400, 40, 3, 'active'),
        ('Half Leg Wax', 'Waxing', waxing_id, 'Half leg waxing', 300, 30, 4, 'active'),
        ('Underarm Wax', 'Waxing', waxing_id, 'Underarm waxing', 150, 15, 5, 'active')
    ON CONFLICT DO NOTHING;
    
    -- Nails services
    INSERT INTO services (name, category, category_id, description, price, duration, display_order, status)
    VALUES 
        ('Nail Polish', 'Nails', nails_id, 'Basic nail polish', 200, 20, 1, 'active'),
        ('Gel Polish', 'Nails', nails_id, 'Long-lasting gel polish', 400, 30, 2, 'active'),
        ('Nail Extension', 'Nails', nails_id, 'Nail extension service', 800, 60, 3, 'active'),
        ('Nail Art', 'Nails', nails_id, 'Creative nail art designs', 500, 45, 4, 'active')
    ON CONFLICT DO NOTHING;
END $$;

-- Update appointments table to support multiple services
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'selected_services'
    ) THEN
        ALTER TABLE appointments ADD COLUMN selected_services JSONB DEFAULT '[]';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE service_categories IS 'Service categories for organizing services';
COMMENT ON COLUMN services.category_id IS 'Foreign key to service_categories table';
COMMENT ON COLUMN services.display_order IS 'Order of display within category';
COMMENT ON COLUMN appointments.selected_services IS 'Array of selected service objects with IDs and details';

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_service_categories_updated_at ON service_categories;
CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON service_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
