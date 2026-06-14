ALTER TABLE interview_sessions ADD COLUMN tech_stack VARCHAR(500) NULL AFTER type;
ALTER TABLE interview_sessions ADD COLUMN question_count INT NOT NULL DEFAULT 5 AFTER tech_stack;
