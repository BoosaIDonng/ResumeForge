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
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

class TaskServiceTest {
    private AiTaskRepository repository;
    private RabbitTemplate rabbitTemplate;
    private ValueOperations<String, String> valueOperations;
    private TaskService service;

    @BeforeEach
    void setUp() {
        repository = mock(AiTaskRepository.class);
        rabbitTemplate = mock(RabbitTemplate.class);
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = valueOperations();
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(repository.save(any())).thenAnswer(invocation -> {
            AiTaskEntity task = invocation.getArgument(0);
            ReflectionTestUtils.setField(task, "id", 1L);
            return task;
        });

        service = new TaskService(repository, rabbitTemplate, redisTemplate);
    }

    @Test
    void createsPendingTaskAndPublishesMessage() {
        AiTaskEntity task = service.create(TaskType.JD_ANALYSIS, 1L, 2L);

        assertThat(task.getId()).isEqualTo(1L);
        assertThat(task.getTaskType()).isEqualTo(TaskType.JD_ANALYSIS.name());
        assertThat(task.getStatus()).isEqualTo(TaskStatus.PENDING.name());
        assertThat(task.getProgress()).isZero();

        ArgumentCaptor<TaskMessage> messageCaptor = ArgumentCaptor.forClass(TaskMessage.class);
        verify(rabbitTemplate).convertAndSend(
            eq(RabbitConfig.TASK_EXCHANGE),
            eq(RabbitConfig.TASK_ROUTING_KEY),
            messageCaptor.capture()
        );
        TaskMessage message = messageCaptor.getValue();
        assertThat(message.taskId()).isEqualTo(1L);
        assertThat(message.taskType()).isEqualTo(TaskType.JD_ANALYSIS);
        assertThat(message.resumeId()).isEqualTo(1L);
        assertThat(message.jobId()).isEqualTo(2L);
    }

    @Test
    void initializesRedisBeforePublishingMessage() {
        service.create(TaskType.JD_ANALYSIS, 1L, 2L);

        InOrder inOrder = inOrder(repository, valueOperations, rabbitTemplate);
        inOrder.verify(repository).save(any(AiTaskEntity.class));
        inOrder.verify(valueOperations).set(TaskService.progressKey(1L), "0");
        inOrder.verify(rabbitTemplate).convertAndSend(
            eq(RabbitConfig.TASK_EXCHANGE),
            eq(RabbitConfig.TASK_ROUTING_KEY),
            any(TaskMessage.class)
        );
    }

    @SuppressWarnings("unchecked")
    private ValueOperations<String, String> valueOperations() {
        return mock(ValueOperations.class);
    }
}
