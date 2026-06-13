package com.example.airesume.task;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.airesume.common.ApiException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;

class TaskControllerTest {
    @Test
    void validatesTaskExistsBeforeReturningEventsEmitter() {
        TaskService service = mock(TaskService.class);
        ExecutorService executor = Executors.newSingleThreadExecutor();
        TaskController controller = new TaskController(service, executor);
        when(service.get(404L)).thenThrow(new ApiException("TASK_NOT_FOUND", "Task not found"));

        assertThatThrownBy(() -> controller.events(404L))
            .isInstanceOf(ApiException.class)
            .hasMessage("Task not found");

        verify(service).get(404L);
        executor.shutdownNow();
    }
}
