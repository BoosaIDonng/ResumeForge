package com.example.airesume.task;

import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/**
 * In-memory progress tracker. Used when Redis is not available (dev mode).
 */
@Component
@ConditionalOnMissingBean(RedisProgressTracker.class)
public class InMemoryProgressTracker implements ProgressTracker {
    private static final Logger log = LoggerFactory.getLogger(InMemoryProgressTracker.class);
    private final ConcurrentHashMap<Long, Integer> progressMap = new ConcurrentHashMap<>();

    public InMemoryProgressTracker() {
        log.info("InMemoryProgressTracker active — progress stored in memory (no Redis)");
    }

    @Override
    public void setProgress(Long taskId, int progress) {
        progressMap.put(taskId, progress);
    }

    @Override
    public int getProgress(Long taskId, int fallback) {
        return progressMap.getOrDefault(taskId, fallback);
    }
}
