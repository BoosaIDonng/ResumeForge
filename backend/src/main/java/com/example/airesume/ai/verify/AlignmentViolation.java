package com.example.airesume.ai.verify;

public record AlignmentViolation(
    String fieldPath,
    String violationType,  // "fabricated_skill", "fabricated_cert", "fabricated_company", "invented_metric", "skill_variant"
    String value,
    String severity        // "critical", "warning", "info"
) {}
