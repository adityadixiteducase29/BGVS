-- Migration to add client_id column to applications table
USE background_verification_system;

-- Add client_id column to applications table
ALTER TABLE applications ADD COLUMN client_id BIGINT UNSIGNED NOT NULL AFTER company_id;

-- Add foreign key constraint
ALTER TABLE applications ADD CONSTRAINT fk_applications_client_id 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_applications_client_id ON applications(client_id);

-- Insert default company if it doesn't exist
INSERT IGNORE INTO companies (id, name, industry, address, contact_person, contact_email, contact_phone, verification_form_link, created_by) VALUES 
(1, 'Default Company', 'Technology', 'Default Address', 'Default Contact', 'contact@default.com', '+1234567890', 'default-link', 1);
