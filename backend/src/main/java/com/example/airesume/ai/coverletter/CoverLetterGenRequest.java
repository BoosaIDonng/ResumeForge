package com.example.airesume.ai.coverletter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CoverLetterGenRequest(
    @NotNull(message = "简历ID不能为空") Long resumeId,
    @NotBlank(message = "职位描述不能为空") String jobDescription,
    String tone,
    String language
) {
}
