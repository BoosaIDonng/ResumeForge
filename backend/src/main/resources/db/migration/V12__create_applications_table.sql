CREATE TABLE applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  resume_id BIGINT,
  job_id BIGINT,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PREPARING',
  applied_date DATE,
  salary_range VARCHAR(100),
  job_url VARCHAR(500),
  contact_person VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
