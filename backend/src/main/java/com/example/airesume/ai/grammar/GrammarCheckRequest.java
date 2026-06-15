package com.example.airesume.ai.grammar;

import jakarta.validation.constraints.NotBlank;

public record GrammarCheckRequest(
    @NotBlank(message = "简历内容不能为空") String resumeText
) {
}
