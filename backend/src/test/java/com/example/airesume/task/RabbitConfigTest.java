package com.example.airesume.task;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

class RabbitConfigTest {
    @Test
    void configuresJsonMessageConverter() {
        RabbitConfig config = new RabbitConfig();

        assertThat(config.jsonMessageConverter()).isInstanceOf(Jackson2JsonMessageConverter.class);
    }
}
