package com.example.airesume.task;

public record TaskMessage(
    Long taskId,
    TaskType taskType,
    Long resumeId,
    Long jobId
) {
}
