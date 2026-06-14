package com.example.airesume.ai.diff;

import java.util.List;

public record DiffApplyResult(
    String updatedResumeJson,
    List<ResumeChange> applied,
    List<ResumeChange> rejected,
    List<String> warnings
) {}
