-- BuildFlow Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE website_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE element_type AS ENUM ('text', 'image', 'button', 'form', 'video', 'container', 'spacer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(status);
CREATE INDEX IF NOT EXISTS idx_pages_website_id ON pages(website_id);
CREATE INDEX IF NOT EXISTS idx_elements_page_id ON elements(page_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, email_verified, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@buildflow.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Admin User',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create default settings
INSERT INTO settings (key, value, created_at, updated_at)
VALUES 
    ('site_name', 'BuildFlow', NOW(), NOW()),
    ('site_description', 'Drag & Drop Website Builder', NOW(), NOW()),
    ('max_websites_per_user', '10', NOW(), NOW()),
    ('max_pages_per_website', '50', NOW(), NOW()),
    ('max_elements_per_page', '100', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
