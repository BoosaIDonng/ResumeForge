package com.example.airesume.optimization;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "optimization_proposals")
public class OptimizationProposalEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long analysisReportId;
    private String status;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String changes;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String appliedChanges;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String rejectedChanges;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String preview;

    private LocalDateTime createdAt;
    private LocalDateTime appliedAt;

    protected OptimizationProposalEntity() {
    }

    public OptimizationProposalEntity(Long analysisReportId, String changes, String preview) {
        this.analysisReportId = analysisReportId;
        this.status = "PENDING";
        this.changes = changes;
        this.appliedChanges = "[]";
        this.rejectedChanges = "[]";
        this.preview = preview;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getAnalysisReportId() {
        return analysisReportId;
    }

    public String getStatus() {
        return status;
    }

    public String getChanges() {
        return changes;
    }

    public String getAppliedChanges() {
        return appliedChanges;
    }

    public String getRejectedChanges() {
        return rejectedChanges;
    }

    public String getPreview() {
        return preview;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void markGenerated(String changes, String preview) {
        this.status = "GENERATED";
        this.changes = changes;
        this.preview = preview;
    }

    public void apply(String appliedChanges, String rejectedChanges, String preview) {
        this.status = "APPLIED";
        this.appliedChanges = appliedChanges;
        this.rejectedChanges = rejectedChanges;
        this.preview = preview;
        this.appliedAt = LocalDateTime.now();
    }
}
