package com.example.airesume.task;

public record TaskMessage(
    Long taskId,
    TaskType taskType,
    Long resumeId,
    Long jobId,
    Long sessionId
) {
    public TaskMessage(Long taskId, TaskType taskType, Long resumeId, Long jobId) {
        this(taskId, taskType, resumeId, jobId, null);
    }
}
