package com.example.airesume.ai.generate;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record GenerateResumeRequest(
    @NotBlank(message = "职位名称不能为空") String jobTitle,
    Integer yearsOfExperience,
    List<String> skills,
    String industry,
    String experience,
    String language
) {
}
