package com.example.airesume.ai.coverletter;

import jakarta.validation.constraints.NotBlank;

public record CoverLetterGenRequest(
    @NotBlank(message = "简历内容不能为空") String resumeText,
    @NotBlank(message = "职位描述不能为空") String jobDescription,
    String tone,
    String language
) {
}
