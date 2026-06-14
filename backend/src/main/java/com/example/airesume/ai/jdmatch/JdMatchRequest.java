package com.example.airesume.ai.jdmatch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JdMatchRequest(
    @NotNull(message = "简历ID不能为空") Long resumeId,
    @NotBlank(message = "职位描述不能为空") String jobDescription
) {
}
