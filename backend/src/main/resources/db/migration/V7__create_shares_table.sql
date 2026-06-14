CREATE TABLE shares (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    view_count INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    INDEX idx_shares_resume_id (resume_id),
    INDEX idx_shares_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
