package com.example.airesume.resume.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateResumeRequest(
    @NotBlank String title,
    @NotBlank String resumeData
) {
}
