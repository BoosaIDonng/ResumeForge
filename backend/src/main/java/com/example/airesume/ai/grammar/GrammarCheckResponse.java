package com.example.airesume.ai.grammar;

import java.util.List;

public record GrammarCheckResponse(
    List<GrammarIssue> issues,
    String summary,
    int score
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
}
