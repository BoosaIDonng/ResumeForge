package com.example.airesume.resume.dto;

import com.example.airesume.resume.ResumeEntity;
import java.time.LocalDateTime;

public record ResumeResponse(
    Long id,
    Long userId,
    String title,
    boolean master,
    String resumeData,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ResumeResponse from(ResumeEntity entity) {
        return new ResumeResponse(
            entity.getId(),
            entity.getUserId(),
            entity.getTitle(),
            entity.isMaster(),
            entity.getResumeData(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
