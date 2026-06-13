package com.example.airesume.task;

import com.example.airesume.common.ApiException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
    static final String PROGRESS_KEY_PATTERN = "task:%d:progress";

    private final AiTaskRepository repository;
    private final RabbitTemplate rabbitTemplate;
    private final StringRedisTemplate redisTemplate;

    public TaskService(
        AiTaskRepository repository,
        RabbitTemplate rabbitTemplate,
        StringRedisTemplate redisTemplate
    ) {
        this.repository = repository;
        this.rabbitTemplate = rabbitTemplate;
        this.redisTemplate = redisTemplate;
    }

    public AiTaskEntity create(TaskType taskType, Long resumeId, Long jobId) {
        AiTaskEntity task = repository.save(new AiTaskEntity(taskType.name(), resumeId, jobId));
        redisTemplate.opsForValue().set(progressKey(task.getId()), "0");
        rabbitTemplate.convertAndSend(
            RabbitConfig.TASK_EXCHANGE,
            RabbitConfig.TASK_ROUTING_KEY,
            new TaskMessage(task.getId(), taskType, resumeId, jobId)
        );
        return task;
    }

    public AiTaskEntity get(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ApiException("TASK_NOT_FOUND", "Task not found"));
    }

    public TaskProgress progress(Long id) {
        AiTaskEntity task = get(id);
        return new TaskProgress(task.getId(), task.getStatus(), readProgress(task));
    }

    private int readProgress(AiTaskEntity task) {
        String value = redisTemplate.opsForValue().get(progressKey(task.getId()));
        if (value == null || value.isBlank()) {
            return task.getProgress();
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return task.getProgress();
        }
    }

    static String progressKey(Long taskId) {
        return PROGRESS_KEY_PATTERN.formatted(taskId);
    }

    public record TaskProgress(Long taskId, String status, int progress) {
    }
}
