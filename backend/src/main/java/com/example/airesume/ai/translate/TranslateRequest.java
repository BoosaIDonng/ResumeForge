package com.example.airesume.ai.translate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TranslateRequest(
    @NotNull(message = "简历ID不能为空") Long resumeId,
    @NotBlank(message = "目标语言不能为空") String targetLanguage,
    String mode
) {
}
