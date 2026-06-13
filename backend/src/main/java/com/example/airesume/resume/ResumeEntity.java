package com.example.airesume.resume;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
public class ResumeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String title;

    @Column(name = "is_master")
    private boolean master;

    @Lob
    @Column(name = "resume_data", nullable = false)
    private String resumeData;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected ResumeEntity() {
    }

    public ResumeEntity(Long userId, String title, boolean master, String resumeData) {
        this.userId = userId;
        this.title = title;
        this.master = master;
        this.resumeData = resumeData;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public boolean isMaster() {
        return master;
    }

    public String getResumeData() {
        return resumeData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void update(String title, String resumeData) {
        this.title = title;
        this.resumeData = resumeData;
        this.updatedAt = LocalDateTime.now();
    }
}
