package com.example.airesume.application.dto;

import com.example.airesume.application.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record UpdateApplicationRequest(
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
