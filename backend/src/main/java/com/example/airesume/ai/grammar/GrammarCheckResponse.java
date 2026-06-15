package com.example.airesume.ai.grammar;

import java.util.List;

public record GrammarCheckResponse(
    List<GrammarIssue> issues,
    String summary,
    int score,
    List<SectionScore> sectionScores,
    List<Suggestion> suggestions
) {
    public record GrammarIssue(
        String sectionId,
        String sectionTitle,
        String type,
        String original,
        String suggestion,
        String severity
    ) {
    }

    public record SectionScore(
        String sectionType,
        String sectionName,
        int score,
        String feedback
    ) {
    }

    public record Suggestion(
        String priority,
        String section,
        String message,
        String example
    ) {
    }
}
