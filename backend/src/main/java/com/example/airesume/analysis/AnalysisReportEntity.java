package com.example.airesume.analysis;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_reports")
public class AnalysisReportEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;

    @Column(nullable = true)
    private Long jobId;
    private int overallScore;
    private int atsScore;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String keywordMatches;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String missingKeywords;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String suggestions;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String summary;

    private LocalDateTime createdAt;

    protected AnalysisReportEntity() {
    }

    public AnalysisReportEntity(
        Long resumeId,
        Long jobId,
        int overallScore,
        int atsScore,
        String keywordMatches,
        String missingKeywords,
        String suggestions,
        String summary
    ) {
        this.resumeId = resumeId;
        this.jobId = jobId;
        this.overallScore = overallScore;
        this.atsScore = atsScore;
        this.keywordMatches = keywordMatches;
        this.missingKeywords = missingKeywords;
        this.suggestions = suggestions;
        this.summary = summary;
        this.createdAt = LocalDateTime.now();
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

    public int getOverallScore() {
        return overallScore;
    }

    public int getAtsScore() {
        return atsScore;
    }

    public String getKeywordMatches() {
        return keywordMatches;
    }

    public String getMissingKeywords() {
        return missingKeywords;
    }

    public String getSuggestions() {
        return suggestions;
    }

    public String getSummary() {
        return summary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
