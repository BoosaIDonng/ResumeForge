CREATE TABLE resumes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  title VARCHAR(120) NOT NULL,
  is_master BOOLEAN NOT NULL DEFAULT FALSE,
  resume_data LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resume_id BIGINT NOT NULL,
  title VARCHAR(160) NOT NULL,
  company VARCHAR(160) NULL,
  description TEXT NOT NULL,
  extracted_keywords LONGTEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE ai_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_type VARCHAR(60) NOT NULL,
  status VARCHAR(40) NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  resume_id BIGINT NULL,
  job_id BIGINT NULL,
  result_ref_type VARCHAR(80) NULL,
  result_ref_id BIGINT NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE analysis_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resume_id BIGINT NOT NULL,
  job_id BIGINT NOT NULL,
  overall_score INT NOT NULL,
  ats_score INT NOT NULL,
  keyword_matches LONGTEXT NOT NULL,
  missing_keywords LONGTEXT NOT NULL,
  suggestions LONGTEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE optimization_proposals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  analysis_report_id BIGINT NOT NULL,
  status VARCHAR(40) NOT NULL,
  changes LONGTEXT NOT NULL,
  applied_changes LONGTEXT NOT NULL,
  rejected_changes LONGTEXT NOT NULL,
  preview LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL,
  applied_at DATETIME NULL
);

CREATE TABLE interview_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resume_id BIGINT NOT NULL,
  job_id BIGINT NULL,
  role VARCHAR(160) NOT NULL,
  level VARCHAR(80) NOT NULL,
  type VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE interview_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  sort_order INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NULL,
  created_at DATETIME NOT NULL,
  answered_at DATETIME NULL
);

CREATE TABLE interview_feedback (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  total_score INT NOT NULL,
  category_scores LONGTEXT NOT NULL,
  strengths LONGTEXT NOT NULL,
  areas_for_improvement LONGTEXT NOT NULL,
  final_assessment TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE ai_call_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NULL,
  provider VARCHAR(80) NOT NULL,
  model VARCHAR(120) NOT NULL,
  prompt_type VARCHAR(80) NOT NULL,
  request_tokens INT NULL,
  response_tokens INT NULL,
  status VARCHAR(40) NOT NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL
);
