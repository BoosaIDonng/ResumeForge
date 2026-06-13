package com.example.airesume.optimization;

import java.util.List;

public record ValidationResult(
    List<ResumeChange> applied,
    List<RejectedChange> rejected
) {}
