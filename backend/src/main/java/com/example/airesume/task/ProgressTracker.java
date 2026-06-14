package com.example.airesume.task;

/**
 * Abstraction for tracking task progress.
 * Two implementations: Redis (production) and InMemory (dev fallback).
 */
public interface ProgressTracker {
    void setProgress(Long taskId, int progress);
    int getProgress(Long taskId, int fallback);
}
