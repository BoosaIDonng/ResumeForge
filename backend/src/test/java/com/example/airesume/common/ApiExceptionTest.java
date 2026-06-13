package com.example.airesume.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ApiExceptionTest {
    @Test
    void constructorShouldSetCodeAndMessage() {
        ApiException exception = new ApiException("TEST_CODE", "test message");

        assertThat(exception.code()).isEqualTo("TEST_CODE");
        assertThat(exception.getMessage()).isEqualTo("test message");
    }

    @Test
    void exceptionShouldExtendRuntimeException() {
        ApiException exception = new ApiException("CODE", "msg");
        assertThat(exception).isInstanceOf(RuntimeException.class);
    }

    @Test
    void constructorShouldAcceptNullCode() {
        ApiException exception = new ApiException(null, "message");

        assertThat(exception.code()).isNull();
        assertThat(exception.getMessage()).isEqualTo("message");
    }

    @Test
    void constructorShouldAcceptNullMessage() {
        ApiException exception = new ApiException("CODE", null);

        assertThat(exception.code()).isEqualTo("CODE");
        assertThat(exception.getMessage()).isNull();
    }

    @Test
    void constructorShouldAcceptAllNulls() {
        ApiException exception = new ApiException(null, null);

        assertThat(exception.code()).isNull();
        assertThat(exception.getMessage()).isNull();
    }
}
