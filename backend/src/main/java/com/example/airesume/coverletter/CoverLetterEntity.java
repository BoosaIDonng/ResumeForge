package com.example.airesume.coverletter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "cover_letters")
public class CoverLetterEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;
    private Long jobId;
    private String tone;

    @Lob
    @Column(nullable = false)
    private String content;

    private LocalDateTime createdAt;

    protected CoverLetterEntity() {}

    public CoverLetterEntity(Long resumeId, Long jobId, String tone, String content) {
        this.resumeId = resumeId;
        this.jobId = jobId;
        this.tone = tone;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getResumeId() { return resumeId; }
    public Long getJobId() { return jobId; }
    public String getTone() { return tone; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
