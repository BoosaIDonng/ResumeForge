package com.example.airesume.ai.diff;

/**
 * A single targeted change to a resume field.
 * Inspired by Resume-Matcher's diff-based improvement approach.
 */
public record ResumeChange(
    String path,      // e.g., "summary", "workExperience[0].description[1]"
    String action,    // "replace", "append", "reorder", "add_skill"
    String original,  // exact original text (for verification)
    Object value,     // new value (String for replace/append, List for reorder)
    String reason     // why this change helps
) {}
