package com.example.airesume.ai.enrichment;

import java.util.List;

public record EnrichmentRequest(
    Long resumeId,
    List<AnswerItem> answers
) {
    public record AnswerItem(
        String questionId,
        String itemId,
        String question,
        String answer
    ) {}
}
