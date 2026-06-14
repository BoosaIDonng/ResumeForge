package com.example.airesume.task;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Fallback task dispatcher that runs tasks in a local thread pool.
 * Used when RabbitMQ dispatch fails.
 */
@Component("localTaskDispatcher")
public class LocalTaskDispatcher implements TaskDispatcher {
    private static final Logger log = LoggerFactory.getLogger(LocalTaskDispatcher.class);

    private final TaskWorker taskWorker;
    private final ExecutorService executor = Executors.newFixedThreadPool(4, r -> {
        Thread t = new Thread(r, "local-task-" + System.nanoTime());
        t.setDaemon(true);
        return t;
    });

    public LocalTaskDispatcher(TaskWorker taskWorker) {
        this.taskWorker = taskWorker;
        log.info("LocalTaskDispatcher available as fallback");
    }

    @Override
    public void dispatch(TaskMessage message) {
        executor.submit(() -> {
            try {
                taskWorker.handle(message);
            } catch (Exception ex) {
                log.error("Local task execution failed for task {}", message.taskId(), ex);
            }
        });
    }
}
