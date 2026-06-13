package com.example.airesume.analysis.dto;

import java.util.List;

public record JdAnalysisResult(
    int overallScore,
    int atsScore,
    List<String> keywordMatches,
    List<String> missingKeywords,
    List<AnalysisSuggestion> suggestions,
    String summary
) {}
