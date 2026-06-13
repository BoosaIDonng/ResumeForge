package com.example.airesume;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;

class AiResumeApplicationTest {
    @Test
    void mainClassShouldBeAnnotatedWithSpringBootApplication() {
        assertThat(AiResumeApplication.class.getAnnotation(SpringBootApplication.class)).isNotNull();
    }

    @Test
    void mainMethodShouldExist() throws NoSuchMethodException {
        assertThat(AiResumeApplication.class.getDeclaredMethod("main", String[].class)).isNotNull();
    }
}