package com.example.airesume.task;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Dispatches tasks via RabbitMQ. Primary dispatcher when RabbitMQ is configured.
 * Falls back to LocalTaskDispatcher on connection failure.
 */
@Component
@Primary
public class RabbitTaskDispatcher implements TaskDispatcher {
    private final RabbitTemplate rabbitTemplate;

    public RabbitTaskDispatcher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void dispatch(TaskMessage message) {
        rabbitTemplate.convertAndSend(
            RabbitConfig.TASK_EXCHANGE,
            RabbitConfig.TASK_ROUTING_KEY,
            message
        );
    }
}
