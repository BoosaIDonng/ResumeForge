package com.example.airesume.ai.verify;

import java.util.List;

public record AlignmentReport(
    boolean isAligned,
    List<AlignmentViolation> violations,
    double confidenceScore
) {}
