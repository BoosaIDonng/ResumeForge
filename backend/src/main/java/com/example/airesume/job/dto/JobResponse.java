package com.example.airesume.job.dto;

import com.example.airesume.job.JobEntity;
import java.time.LocalDateTime;

public record JobResponse(
    Long id,
    Long resumeId,
    String title,
    String company,
    String description,
    String extractedKeywords,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static JobResponse from(JobEntity entity) {
        return new JobResponse(
            entity.getId(),
            entity.getResumeId(),
            entity.getTitle(),
            entity.getCompany(),
            entity.getDescription(),
            entity.getExtractedKeywords(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
