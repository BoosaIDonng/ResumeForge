package com.example.airesume.ai.jdmatch;

import java.util.List;

/**
 * Structured JD keyword extraction result.
 * Inspired by Resume-Matcher's EXTRACT_KEYWORDS_PROMPT output.
 */
public record JdKeywordsResult(
    String company,
    String role,
    List<String> requiredSkills,
    List<String> preferredSkills,
    List<String> experienceRequirements,
    List<String> educationRequirements,
    List<String> keyResponsibilities,
    List<String> keywords,
    Integer experienceYears,
    String seniorityLevel
) {}
