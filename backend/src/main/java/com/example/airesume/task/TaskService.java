package com.example.airesume.task;

import com.example.airesume.common.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
    private static final Logger log = LoggerFactory.getLogger(TaskService.class);
    static final String PROGRESS_KEY_PATTERN = "task:%d:progress";

    private final AiTaskRepository repository;
    private final TaskDispatcher dispatcher;
    private final LocalTaskDispatcher localDispatcher;
    private final ProgressTracker progressTracker;

    public TaskService(
        AiTaskRepository repository,
        TaskDispatcher dispatcher,
        LocalTaskDispatcher localDispatcher,
        ProgressTracker progressTracker
    ) {
        this.repository = repository;
        this.dispatcher = dispatcher;
        this.localDispatcher = localDispatcher;
        this.progressTracker = progressTracker;
    }

    public AiTaskEntity create(TaskType taskType, Long resumeId, Long jobId) {
        AiTaskEntity task = repository.save(new AiTaskEntity(taskType.name(), resumeId, jobId));
        progressTracker.setProgress(task.getId(), 0);
        TaskMessage message = new TaskMessage(task.getId(), taskType, resumeId, jobId);
        try {
            dispatcher.dispatch(message);
        } catch (Exception ex) {
            log.warn("Primary dispatcher failed ({}), falling back to local execution", ex.getMessage());
            localDispatcher.dispatch(message);
        }
        return task;
    }

    public AiTaskEntity createWithSession(TaskType taskType, Long resumeId, Long jobId, Long sessionId) {
        AiTaskEntity task = repository.save(new AiTaskEntity(taskType.name(), resumeId, jobId));
        progressTracker.setProgress(task.getId(), 0);
        TaskMessage message = new TaskMessage(task.getId(), taskType, resumeId, jobId, sessionId);
        try {
            dispatcher.dispatch(message);
        } catch (Exception ex) {
            log.warn("Primary dispatcher failed ({}), falling back to local execution", ex.getMessage());
            localDispatcher.dispatch(message);
        }
        return task;
    }

    public AiTaskEntity get(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ApiException("TASK_NOT_FOUND", "Task not found"));
    }

    public AiTaskEntity retry(Long id) {
        AiTaskEntity oldTask = get(id);
        if (!"FAILED".equals(oldTask.getStatus())) {
            throw new ApiException("TASK_NOT_RETRYABLE", "只有失败的任务可以重试");
        }
        TaskType taskType = TaskType.valueOf(oldTask.getTaskType());
        return create(taskType, oldTask.getResumeId(), oldTask.getJobId());
    }

    public TaskProgress progress(Long id) {
        AiTaskEntity task = get(id);
        int progress = progressTracker.getProgress(task.getId(), task.getProgress());
        return new TaskProgress(task.getId(), task.getStatus(), progress);
    }

    static String progressKey(Long taskId) {
        return PROGRESS_KEY_PATTERN.formatted(taskId);
    }

    public record TaskProgress(Long taskId, String status, int progress) {
    }
}
