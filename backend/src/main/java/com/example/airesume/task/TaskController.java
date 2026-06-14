package com.example.airesume.task;

import com.example.airesume.common.ApiResponse;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private static final long EVENT_INTERVAL_MILLIS = 1_000L;
    private static final long EMITTER_TIMEOUT_MILLIS = 300_000L;

    private final TaskService service;
    private final ExecutorService taskSseExecutor;

    public TaskController(TaskService service, @Qualifier("taskSseExecutor") ExecutorService taskSseExecutor) {
        this.service = service;
        this.taskSseExecutor = taskSseExecutor;
    }

    @GetMapping("/{id}")
    public ApiResponse<AiTaskEntity> get(@PathVariable Long id) {
        return ApiResponse.ok(service.get(id));
    }

    @GetMapping(path = "/{id}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter events(@PathVariable Long id) {
        service.get(id);

        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MILLIS);
        Future<?> stream = taskSseExecutor.submit(() -> streamEvents(id, emitter));
        emitter.onCompletion(() -> stream.cancel(true));
        emitter.onTimeout(() -> {
            stream.cancel(true);
            emitter.complete();
        });
        emitter.onError(error -> stream.cancel(true));
        return emitter;
    }

    @PostMapping("/{id}/retry")
    public ApiResponse<AiTaskEntity> retry(@PathVariable Long id) {
        return ApiResponse.ok(service.retry(id));
    }

    private void streamEvents(Long id, SseEmitter emitter) {
        try {
            while (true) {
                TaskService.TaskProgress progress = service.progress(id);
                emitter.send(SseEmitter.event().name("progress").data(progress));
                if (isTerminal(progress.status())) {
                    emitter.complete();
                    return;
                }
                Thread.sleep(EVENT_INTERVAL_MILLIS);
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            emitter.completeWithError(ex);
        } catch (IOException | RuntimeException ex) {
            emitter.completeWithError(ex);
        }
    }

    private boolean isTerminal(String status) {
        return TaskStatus.SUCCEEDED.name().equals(status) || TaskStatus.FAILED.name().equals(status);
    }
}
