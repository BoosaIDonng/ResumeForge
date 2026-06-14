package com.example.airesume.ai.quality;

import java.util.List;

/**
 * Response from resume quality scoring (no JD required).
 */
public record QualityScoreResponse(
    /** Overall score 0-100 */
    Integer overallScore,
    /** Section-level scores */
    List<SectionScore> sectionScores,
    /** Actionable improvement suggestions */
    List<Suggestion> suggestions,
    /** Brief summary of resume quality */
    String summary
) {
    public record SectionScore(
        String sectionType,
        String sectionName,
        Integer score,
        String feedback
    ) {
    }

    public record Suggestion(
        /** Priority: "high", "medium", "low" */
        String priority,
        /** Which section this applies to */
        String section,
        /** What to improve */
        String message,
        /** Concrete example of better wording */
        String example
    ) {
    }
}
