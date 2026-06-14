package com.example.airesume.application.dto;

import com.example.airesume.application.ApplicationEntity;
import com.example.airesume.application.ApplicationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ApplicationResponse(
    Long id,
    Long resumeId,
    Long jobId,
    String company,
    String position,
    ApplicationStatus status,
    LocalDate appliedDate,
    String salaryRange,
    String jobUrl,
    String contactPerson,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ApplicationResponse from(ApplicationEntity entity) {
        return new ApplicationResponse(
            entity.getId(),
            entity.getResumeId(),
            entity.getJobId(),
            entity.getCompany(),
            entity.getPosition(),
            entity.getStatus(),
            entity.getAppliedDate(),
            entity.getSalaryRange(),
            entity.getJobUrl(),
            entity.getContactPerson(),
            entity.getNotes(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
