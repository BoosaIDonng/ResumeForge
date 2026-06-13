-- Fix TEXT columns to LONGTEXT to match @Lob entity annotations
ALTER TABLE ai_call_logs MODIFY COLUMN error_message LONGTEXT NULL;
ALTER TABLE ai_tasks MODIFY COLUMN error_message LONGTEXT NULL;
ALTER TABLE jobs MODIFY COLUMN description LONGTEXT NOT NULL;
ALTER TABLE analysis_reports MODIFY COLUMN summary LONGTEXT NOT NULL;
ALTER TABLE interview_questions MODIFY COLUMN question LONGTEXT NOT NULL;
ALTER TABLE interview_questions MODIFY COLUMN answer LONGTEXT NULL;
ALTER TABLE interview_feedback MODIFY COLUMN final_assessment LONGTEXT NOT NULL;
