package com.example.airesume.interview;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
public class InterviewSessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;
    private Long jobId;
    private String role;
    private String level;
    private String type;

    @Column(length = 500)
    private String techStack;

    @Column(name = "question_count")
    private int questionCount = 5;

    private String persona;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected InterviewSessionEntity() {
    }

    public InterviewSessionEntity(Long resumeId, Long jobId, String role, String level, String type, String persona) {
        this(resumeId, jobId, role, level, type, persona, null, 5);
    }

    public InterviewSessionEntity(Long resumeId, Long jobId, String role, String level, String type,
                                   String persona, String techStack, int questionCount) {
        this.resumeId = resumeId;
        this.jobId = jobId;
        this.role = role;
        this.level = level;
        this.type = type;
        this.persona = persona;
        this.techStack = techStack;
        this.questionCount = questionCount > 0 ? questionCount : 5;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public String getRole() {
        return role;
    }

    public String getLevel() {
        return level;
    }

    public String getType() {
        return type;
    }

    public String getTechStack() {
        return techStack;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public String getPersona() {
        return persona;
    }

    public void setPersona(String persona) {
        this.persona = persona;
        this.updatedAt = LocalDateTime.now();
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void updateStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
}
