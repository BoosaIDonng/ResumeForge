package com.example.airesume.ai.grammar;

import jakarta.validation.constraints.NotNull;

public record GrammarCheckRequest(
    @NotNull(message = "简历ID不能为空") Long resumeId
) {
}
