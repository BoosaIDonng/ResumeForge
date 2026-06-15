package com.example.airesume.ai.diff;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DiffApplyRequest(
    @NotBlank String resumeDataJson,
    @NotNull List<ResumeChange> changes
) {}
