package com.example.airesume.version;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "resume_versions")
public class VersionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String resumeData;

    private Integer versionNumber;

    private String changeDescription;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public VersionEntity() {}

    public VersionEntity(Long resumeId, String title, String resumeData, Integer versionNumber, String changeDescription) {
        this.resumeId = resumeId;
        this.title = title;
        this.resumeData = resumeData;
        this.versionNumber = versionNumber;
        this.changeDescription = changeDescription;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getResumeData() { return resumeData; }
    public void setResumeData(String resumeData) { this.resumeData = resumeData; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getChangeDescription() { return changeDescription; }
    public void setChangeDescription(String changeDescription) { this.changeDescription = changeDescription; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
