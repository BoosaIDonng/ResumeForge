package com.example.airesume.ai.optimize;

import jakarta.validation.constraints.NotBlank;

/**
 * Request to optimize a single section of a resume via AI.
 */
public record SectionOptimizeRequest(
    /** Section type: "summary", "experience", "projects", "education", "skills", etc. */
    String sectionType,
    /** The current content of the section (text, or JSON string of items) */
    @NotBlank(message = "优化内容不能为空") String currentContent,
    /** Optimization goal: "improve_writing", "add_keywords", "quantify_achievements", "make_concise", "tailor_jd" */
    String goal,
    /** Optional: job description to tailor towards */
    String jobDescription,
    /** Optional: specific instructions from the user */
    String userInstructions
) {
}
