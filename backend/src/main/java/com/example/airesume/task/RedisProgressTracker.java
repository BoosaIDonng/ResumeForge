package com.example.airesume.task;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Tracks task progress in Redis. Primary tracker.
 * Falls back to InMemoryProgressTracker on connection failure.
 */
@Component
@Primary
public class RedisProgressTracker implements ProgressTracker {
    private static final Logger log = LoggerFactory.getLogger(RedisProgressTracker.class);
    private final StringRedisTemplate redisTemplate;

    public RedisProgressTracker(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void setProgress(Long taskId, int progress) {
        try {
            redisTemplate.opsForValue().set(TaskService.progressKey(taskId), String.valueOf(progress));
        } catch (Exception ex) {
            log.warn("Redis setProgress failed for task {}: {}", taskId, ex.getMessage());
        }
    }

    @Override
    public int getProgress(Long taskId, int fallback) {
        try {
            String value = redisTemplate.opsForValue().get(TaskService.progressKey(taskId));
            if (value == null || value.isBlank()) return fallback;
            return Integer.parseInt(value);
        } catch (Exception ex) {
            log.warn("Redis getProgress failed for task {}: {}", taskId, ex.getMessage());
            return fallback;
        }
    }
}
