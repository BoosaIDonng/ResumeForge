package com.example.airesume.job.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateJobRequest(
    @NotBlank String title,
    String company,
    @NotBlank String description
) {
}
