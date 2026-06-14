package com.example.airesume.ai.jdmatch;

import java.util.List;
import java.util.Map;

/**
 * JD match analysis response with structured keyword data.
 * Inspired by Resume-Matcher's structured analysis approach.
 */
public record JdMatchResponse(
    int overallScore,
    List<String> keywordMatches,
    List<String> missingKeywords,
    List<Map<String, String>> suggestions,
    int atsScore,
    String summary,
    Long reportId,
    // New structured fields
    JdKeywordsResult jdKeywords,
    List<String> requiredSkillsMatched,
    List<String> requiredSkillsMissing,
    List<String> preferredSkillsMatched,
    List<String> preferredSkillsMissing,
    int keywordMatchPercentage,
    int potentialMatchPercentage
) {}
