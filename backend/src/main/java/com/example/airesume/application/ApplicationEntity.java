package com.example.airesume.application;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class ApplicationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;
    private Long jobId;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ApplicationStatus status = ApplicationStatus.PREPARING;

    private LocalDate appliedDate;
    private String salaryRange;

    @Column(length = 500)
    private String jobUrl;

    private String contactPerson;

    @Lob
    @Column(columnDefinition = "text")
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected ApplicationEntity() {
    }

    public ApplicationEntity(Long resumeId, Long jobId, String company, String position,
                             ApplicationStatus status, LocalDate appliedDate,
                             String salaryRange, String jobUrl, String contactPerson, String notes) {
        this.resumeId = resumeId;
        this.jobId = jobId;
        this.company = company;
        this.position = position;
        this.status = status != null ? status : ApplicationStatus.PREPARING;
        this.appliedDate = appliedDate;
        this.salaryRange = salaryRange;
        this.jobUrl = jobUrl;
        this.contactPerson = contactPerson;
        this.notes = notes;
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

    public String getCompany() {
        return company;
    }

    public String getPosition() {
        return position;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void update(String company, String position, ApplicationStatus status,
                       LocalDate appliedDate, String salaryRange, String jobUrl,
                       String contactPerson, String notes) {
        this.company = company;
        this.position = position;
        if (status != null) {
            this.status = status;
        }
        this.appliedDate = appliedDate;
        this.salaryRange = salaryRange;
        this.jobUrl = jobUrl;
        this.contactPerson = contactPerson;
        this.notes = notes;
        this.updatedAt = LocalDateTime.now();
    }
}
