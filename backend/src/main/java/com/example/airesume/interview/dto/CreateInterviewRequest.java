package com.example.airesume.interview.dto;

public record CreateInterviewRequest(
    Long resumeId,
    Long jobId,
    String role,
    String level,
    String type,
    String techStack,
    int questionCount,
    String persona
) {}
