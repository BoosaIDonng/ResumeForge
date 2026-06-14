package com.example.airesume.application.dto;

import com.example.airesume.application.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record CreateApplicationRequest(
    Long resumeId,
    Long jobId,
    @NotBlank String company,
    @NotBlank String position,
    ApplicationStatus status,
    LocalDate appliedDate,
    String salaryRange,
    String jobUrl,
    String contactPerson,
    String notes
) {
}
