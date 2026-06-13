package com.example.airesume.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateJobRequest(
    @NotNull Long resumeId,
    @NotBlank String title,
    String company,
    @NotBlank String description
) {
}
