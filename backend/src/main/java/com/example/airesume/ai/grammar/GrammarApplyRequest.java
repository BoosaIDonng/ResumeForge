package com.example.airesume.ai.grammar;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record GrammarApplyRequest(
    @NotNull Long resumeId,
    @NotNull List<GrammarFix> fixes
) {
    public record GrammarFix(
        String original,
        String suggestion
    ) {}
}
