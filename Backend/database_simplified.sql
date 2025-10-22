-- Simplified Background Verification System Database Schema
-- This removes the confusion between companies and clients
-- A "client" is actually a "company" in this system

USE background_verification_system;

-- Drop existing tables in correct order (due to foreign key constraints)
DROP TABLE IF EXISTS application_documents;
DROP TABLE IF EXISTS verification_history;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS client_services;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS verifier_assignments;
DROP TABLE IF EXISTS companies;

-- Users table (for Admin, Verifier, and Company users)
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('admin', 'verifier', 'company') NOT NULL DEFAULT 'verifier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Companies table (this replaces the clients table)
CREATE TABLE companies (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    verification_form_link VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_verification_form_link (verification_form_link),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Company services table (replaces client_services)
CREATE TABLE company_services (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    service_name ENUM(
        'personal_information',
        'education',
        'reference',
        'documentation',
        'employment_information',
        'tenancy_information',
        'residential'
    ) NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_company_service (company_id, service_name),
    INDEX idx_company_id (company_id),
    INDEX idx_service_name (service_name),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verifier assignments to companies
CREATE TABLE verifier_assignments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    verifier_id BIGINT UNSIGNED NOT NULL,
    company_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id),
    FOREIGN KEY (verifier_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_verifier_company (verifier_id, company_id),
    INDEX idx_verifier_id (verifier_id),
    INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications table (background verification forms)
CREATE TABLE applications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    applicant_first_name VARCHAR(100) NOT NULL,
    applicant_last_name VARCHAR(100) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    applicant_dob DATE,
    applicant_address TEXT,
    position_applied VARCHAR(255),
    department VARCHAR(100),
    application_status ENUM('pending', 'assigned', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
    assigned_verifier_id BIGINT UNSIGNED NULL,
    assigned_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_verifier_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_company_id (company_id),
    INDEX idx_application_status (application_status),
    INDEX idx_assigned_verifier_id (assigned_verifier_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application documents/attachments
CREATE TABLE application_documents (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id BIGINT UNSIGNED NOT NULL,
    document_type ENUM('id_proof', 'address_proof', 'education_certificate', 'employment_certificate', 'reference_letter', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT UNSIGNED,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_document_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application verification history
CREATE TABLE verification_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id BIGINT UNSIGNED NOT NULL,
    verifier_id BIGINT UNSIGNED NOT NULL,
    action ENUM('assigned', 'started_review', 'completed_review', 'approved', 'rejected') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (verifier_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_application_id (application_id),
    INDEX idx_verifier_id (verifier_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Admin@123)
INSERT INTO users (email, password, first_name, last_name, user_type) VALUES 
('admin@verificationsystem.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHqHqHq', 'System', 'Administrator', 'admin');

-- Insert default company
INSERT INTO companies (name, email, password, industry, address, contact_person, contact_phone, verification_form_link, created_by) VALUES 
('Default Company', 'default@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHqHqHq', 'Technology', 'Default Address', 'Default Contact', '+1234567890', 'default-link', 1);

-- Create indexes for better performance
CREATE INDEX idx_applications_company_status ON applications(company_id, application_status);
CREATE INDEX idx_applications_verifier_status ON applications(assigned_verifier_id, application_status);
CREATE INDEX idx_verifier_assignments_active ON verifier_assignments(verifier_id, is_active);
CREATE INDEX idx_companies_created_by ON companies(created_by);
CREATE INDEX idx_company_services_enabled ON company_services(company_id, is_enabled);
