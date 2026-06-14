package com.example.airesume.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tasks")
public class AiTaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String taskType;
    private String status;
    private int progress;
    private Long resumeId;
    private Long jobId;
    private String resultRefType;
    private Long resultRefId;

    @Lob
    @Column(columnDefinition = "longtext")
    private String errorMessage;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected AiTaskEntity() {
    }

    public AiTaskEntity(String taskType, Long resumeId, Long jobId) {
        this.taskType = taskType;
        this.status = "PENDING";
        this.progress = 0;
        this.resumeId = resumeId;
        this.jobId = jobId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTaskType() {
        return taskType;
    }

    public String getStatus() {
        return status;
    }

    public int getProgress() {
        return progress;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public String getResultRefType() {
        return resultRefType;
    }

    public Long getResultRefId() {
        return resultRefId;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void updateProgress(String status, int progress) {
        this.status = status;
        this.progress = progress;
        this.updatedAt = LocalDateTime.now();
    }

    public void complete(String resultRefType, Long resultRefId) {
        this.status = "SUCCEEDED";
        this.progress = 100;
        this.resultRefType = resultRefType;
        this.resultRefId = resultRefId;
        this.updatedAt = LocalDateTime.now();
    }

    public void fail(String errorMessage) {
        this.status = "FAILED";
        this.errorMessage = errorMessage;
        this.updatedAt = LocalDateTime.now();
    }
}
