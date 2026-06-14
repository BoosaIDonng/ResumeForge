CREATE TABLE IF NOT EXISTS resume_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    title VARCHAR(255),
    resume_data LONGTEXT,
    version_number INT NOT NULL,
    change_description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resume_id (resume_id),
    INDEX idx_version_number (version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
