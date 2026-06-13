package com.example.airesume.optimization;

public record RejectedChange(
    ResumeChange change,
    String reason
) {}
