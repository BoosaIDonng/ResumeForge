package com.example.airesume.job;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class JobEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;
    private String title;
    private String company;

    @Lob
    @Column(nullable = false)
    private String description;

    @Lob
    private String extractedKeywords;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected JobEntity() {
    }

    public JobEntity(Long resumeId, String title, String company, String description) {
        this.resumeId = resumeId;
        this.title = title;
        this.company = company;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public String getTitle() {
        return title;
    }

    public String getCompany() {
        return company;
    }

    public String getDescription() {
        return description;
    }

    public String getExtractedKeywords() {
        return extractedKeywords;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void update(String title, String company, String description) {
        this.title = title;
        this.company = company;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateExtractedKeywords(String extractedKeywords) {
        this.extractedKeywords = extractedKeywords;
        this.updatedAt = LocalDateTime.now();
    }
}
