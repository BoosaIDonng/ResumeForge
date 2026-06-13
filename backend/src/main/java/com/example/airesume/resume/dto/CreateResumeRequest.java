package com.example.airesume.resume.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateResumeRequest(
    @NotBlank String title,
    boolean master
) {
}
