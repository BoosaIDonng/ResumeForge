package com.example.airesume.optimization;

public record ResumeChange(
    String path,
    ChangeAction action,
    String original,
    String value,
    String reason
) {}
