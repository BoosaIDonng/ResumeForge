package com.example.airesume.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.test.util.ReflectionTestUtils;

class TaskServiceTest {
    private AiTaskRepository repository;
    private TaskDispatcher dispatcher;
    private LocalTaskDispatcher localDispatcher;
    private ProgressTracker progressTracker;
    private TaskService service;

    @BeforeEach
    void setUp() {
        repository = mock(AiTaskRepository.class);
        dispatcher = mock(TaskDispatcher.class);
        localDispatcher = mock(LocalTaskDispatcher.class);
        progressTracker = mock(ProgressTracker.class);
        when(repository.save(any())).thenAnswer(invocation -> {
            AiTaskEntity task = invocation.getArgument(0);
            ReflectionTestUtils.setField(task, "id", 1L);
            return task;
        });

        service = new TaskService(repository, dispatcher, localDispatcher, progressTracker);
    }

    @Test
    void createsPendingTaskAndDispatchesMessage() {
        AiTaskEntity task = service.create(TaskType.JD_ANALYSIS, 1L, 2L);

        assertThat(task.getId()).isEqualTo(1L);
        assertThat(task.getTaskType()).isEqualTo(TaskType.JD_ANALYSIS.name());
        assertThat(task.getStatus()).isEqualTo(TaskStatus.PENDING.name());
        assertThat(task.getProgress()).isZero();

        ArgumentCaptor<TaskMessage> messageCaptor = ArgumentCaptor.forClass(TaskMessage.class);
        verify(dispatcher).dispatch(messageCaptor.capture());
        TaskMessage message = messageCaptor.getValue();
        assertThat(message.taskId()).isEqualTo(1L);
        assertThat(message.taskType()).isEqualTo(TaskType.JD_ANALYSIS);
        assertThat(message.resumeId()).isEqualTo(1L);
        assertThat(message.jobId()).isEqualTo(2L);
    }

    @Test
    void initializesProgressBeforeDispatchingMessage() {
        service.create(TaskType.JD_ANALYSIS, 1L, 2L);

        InOrder inOrder = inOrder(repository, progressTracker, dispatcher);
        inOrder.verify(repository).save(any(AiTaskEntity.class));
        inOrder.verify(progressTracker).setProgress(1L, 0);
        inOrder.verify(dispatcher).dispatch(any(TaskMessage.class));
    }
}
