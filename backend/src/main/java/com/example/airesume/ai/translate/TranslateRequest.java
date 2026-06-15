package com.example.airesume.ai.translate;

import jakarta.validation.constraints.NotBlank;

public record TranslateRequest(
    @NotBlank(message = "简历内容不能为空") String resumeData,
    @NotBlank(message = "目标语言不能为空") String targetLanguage,
    String mode
) {
}
