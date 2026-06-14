package com.example.airesume.ai.grammar;

import java.util.List;

public record GrammarApplyResponse(
    int appliedCount,
    int failedCount,
    List<String> failedOriginals
) {}
