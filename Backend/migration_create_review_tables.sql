-- Create field reviews table
CREATE TABLE IF NOT EXISTS field_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT,
    review_status ENUM('approved', 'rejected', 'pending') DEFAULT 'pending',
    review_notes TEXT,
    reviewed_by BIGINT UNSIGNED NOT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_field_review (application_id, field_name)
);

-- Create file reviews table
CREATE TABLE IF NOT EXISTS file_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL,
    file_id BIGINT UNSIGNED NOT NULL,
    review_status ENUM('approved', 'rejected', 'pending') DEFAULT 'pending',
    review_notes TEXT,
    reviewed_by BIGINT UNSIGNED NOT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES application_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_file_review (application_id, file_id)
);

-- Create application review summary table
CREATE TABLE IF NOT EXISTS application_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL,
    overall_status ENUM('approved', 'rejected', 'pending', 'under_review') DEFAULT 'pending',
    review_notes TEXT,
    reviewed_by BIGINT UNSIGNED NOT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application_review (application_id)
);

-- Add indexes for better performance
CREATE INDEX idx_field_reviews_application ON field_reviews(application_id);
CREATE INDEX idx_field_reviews_status ON field_reviews(review_status);
CREATE INDEX idx_file_reviews_application ON file_reviews(application_id);
CREATE INDEX idx_file_reviews_status ON file_reviews(review_status);
CREATE INDEX idx_application_reviews_status ON application_reviews(overall_status);
