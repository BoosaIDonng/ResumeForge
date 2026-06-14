package com.example.airesume.ai.diff;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DiffApplyRequest(
    @NotNull Long resumeId,
    @NotNull List<ResumeChange> changes
) {}
