package com.example.airesume.interview.dto;

import java.util.List;

public record InterviewFeedbackResult(
    int totalScore,
    List<CategoryScore> categoryScores,
    List<String> strengths,
    List<String> areasForImprovement,
    String finalAssessment,
    List<String> improvementPlan
) {}
