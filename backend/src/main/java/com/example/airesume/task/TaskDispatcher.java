package com.example.airesume.task;

/**
 * Abstraction for dispatching async tasks.
 * Two implementations: RabbitMQ (production) and Local (dev fallback).
 */
public interface TaskDispatcher {
    void dispatch(TaskMessage message);
}
