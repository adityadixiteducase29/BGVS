-- Migration to extend applications table with all form fields
-- This migration adds all the missing fields from the comprehensive form

-- Add personal information fields
ALTER TABLE applications 
ADD COLUMN gender VARCHAR(10) NULL,
ADD COLUMN languages VARCHAR(255) NULL,
ADD COLUMN father_name VARCHAR(100) NULL,
ADD COLUMN mother_name VARCHAR(100) NULL,
ADD COLUMN emergency_contact_number VARCHAR(20) NULL;

-- Add current address fields
ALTER TABLE applications 
ADD COLUMN current_house_no VARCHAR(100) NULL,
ADD COLUMN current_area_locality VARCHAR(255) NULL,
ADD COLUMN current_area_locality_2 VARCHAR(255) NULL,
ADD COLUMN current_district VARCHAR(100) NULL,
ADD COLUMN current_police_station VARCHAR(100) NULL,
ADD COLUMN current_pincode VARCHAR(10) NULL,
ADD COLUMN current_tehsil VARCHAR(100) NULL,
ADD COLUMN current_post_office VARCHAR(100) NULL,
ADD COLUMN current_landmark VARCHAR(255) NULL;

-- Add permanent address fields
ALTER TABLE applications 
ADD COLUMN use_current_as_permanent BOOLEAN DEFAULT FALSE,
ADD COLUMN permanent_house_no VARCHAR(100) NULL,
ADD COLUMN permanent_area_locality VARCHAR(255) NULL,
ADD COLUMN permanent_area_locality_2 VARCHAR(255) NULL,
ADD COLUMN permanent_district VARCHAR(100) NULL,
ADD COLUMN permanent_police_station VARCHAR(100) NULL,
ADD COLUMN permanent_pincode VARCHAR(10) NULL,
ADD COLUMN permanent_tehsil VARCHAR(100) NULL,
ADD COLUMN permanent_post_office VARCHAR(100) NULL,
ADD COLUMN permanent_landmark VARCHAR(255) NULL;

-- Add education fields
ALTER TABLE applications 
ADD COLUMN highest_education VARCHAR(255) NULL,
ADD COLUMN institute_name VARCHAR(255) NULL,
ADD COLUMN education_city VARCHAR(100) NULL,
ADD COLUMN grades VARCHAR(50) NULL,
ADD COLUMN education_from_date DATE NULL,
ADD COLUMN education_to_date DATE NULL,
ADD COLUMN education_address TEXT NULL;

-- Add reference fields
ALTER TABLE applications 
ADD COLUMN reference1_name VARCHAR(100) NULL,
ADD COLUMN reference1_address TEXT NULL,
ADD COLUMN reference1_relation VARCHAR(50) NULL,
ADD COLUMN reference1_contact VARCHAR(20) NULL,
ADD COLUMN reference1_police_station VARCHAR(100) NULL,
ADD COLUMN reference2_name VARCHAR(100) NULL,
ADD COLUMN reference2_address TEXT NULL,
ADD COLUMN reference2_relation VARCHAR(50) NULL,
ADD COLUMN reference2_contact VARCHAR(20) NULL,
ADD COLUMN reference2_police_station VARCHAR(100) NULL,
ADD COLUMN reference3_name VARCHAR(100) NULL,
ADD COLUMN reference3_address TEXT NULL,
ADD COLUMN reference3_relation VARCHAR(50) NULL,
ADD COLUMN reference3_contact VARCHAR(20) NULL,
ADD COLUMN reference3_police_station VARCHAR(100) NULL,
ADD COLUMN reference_address TEXT NULL;

-- Add identity document fields
ALTER TABLE applications 
ADD COLUMN aadhar_number VARCHAR(20) NULL,
ADD COLUMN pan_number VARCHAR(20) NULL;

-- Add employment fields
ALTER TABLE applications 
ADD COLUMN company_name VARCHAR(255) NULL,
ADD COLUMN designation VARCHAR(100) NULL,
ADD COLUMN employee_id VARCHAR(50) NULL,
ADD COLUMN employment_location VARCHAR(100) NULL,
ADD COLUMN employment_from_date DATE NULL,
ADD COLUMN employment_to_date DATE NULL,
ADD COLUMN hr_number VARCHAR(20) NULL,
ADD COLUMN hr_email VARCHAR(255) NULL,
ADD COLUMN work_responsibility TEXT NULL,
ADD COLUMN salary VARCHAR(50) NULL,
ADD COLUMN reason_of_leaving TEXT NULL,
ADD COLUMN previous_manager VARCHAR(100) NULL;

-- Add neighbor information fields
ALTER TABLE applications 
ADD COLUMN neighbour1_family_members VARCHAR(100) NULL,
ADD COLUMN neighbour1_name VARCHAR(100) NULL,
ADD COLUMN neighbour1_mobile VARCHAR(20) NULL,
ADD COLUMN neighbour1_since VARCHAR(50) NULL,
ADD COLUMN neighbour1_remark TEXT NULL,
ADD COLUMN neighbour2_name VARCHAR(100) NULL,
ADD COLUMN neighbour2_mobile VARCHAR(20) NULL,
ADD COLUMN neighbour2_since VARCHAR(50) NULL,
ADD COLUMN neighbour2_remark TEXT NULL;

-- Add residence information fields
ALTER TABLE applications 
ADD COLUMN residing_date DATE NULL,
ADD COLUMN residing_remark TEXT NULL,
ADD COLUMN bike_quantity INT DEFAULT 0,
ADD COLUMN car_quantity INT DEFAULT 0,
ADD COLUMN ac_quantity INT DEFAULT 0,
ADD COLUMN place VARCHAR(100) NULL,
ADD COLUMN house_owner_name VARCHAR(100) NULL,
ADD COLUMN house_owner_contact VARCHAR(20) NULL,
ADD COLUMN house_owner_address TEXT NULL,
ADD COLUMN residing VARCHAR(100) NULL;

-- Add computed address fields (for backward compatibility)
ALTER TABLE applications 
ADD COLUMN current_address VARCHAR(255) NULL,
ADD COLUMN permanent_address VARCHAR(255) NULL;

-- Add indexes for better performance
CREATE INDEX idx_applications_gender ON applications(gender);
CREATE INDEX idx_applications_aadhar ON applications(aadhar_number);
CREATE INDEX idx_applications_pan ON applications(pan_number);
CREATE INDEX idx_applications_company_name ON applications(company_name);
CREATE INDEX idx_applications_employment_from_date ON applications(employment_from_date);
CREATE INDEX idx_applications_employment_to_date ON applications(employment_to_date);

-- Update the comment for the table
ALTER TABLE applications COMMENT = 'Extended applications table with comprehensive form data';
