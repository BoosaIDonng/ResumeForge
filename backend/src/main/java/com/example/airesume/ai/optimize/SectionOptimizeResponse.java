package com.example.airesume.ai.optimize;

import java.util.List;

/**
 * Response from section optimization.
 */
public record SectionOptimizeResponse(
    /** The optimized content (same format as input) */
    String optimizedContent,
    /** List of changes made */
    List<Change> changes,
    /** Quality improvement estimate */
    Integer scoreBefore,
    Integer scoreAfter
) {
    public record Change(
        String field,
        String before,
        String after,
        String reason
    ) {
    }
}
