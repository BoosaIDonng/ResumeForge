package com.example.airesume.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class GlobalExceptionHandlerTest {
    @Test
    void handlesApiExceptionWithCodeAndMessage() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ResponseEntity<ApiResponse<Void>> response =
            handler.handleApiException(new ApiException("RESUME_NOT_FOUND", "简历不存在"));

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
        assertThat(response.getBody().code()).isEqualTo("RESUME_NOT_FOUND");
        assertThat(response.getBody().message()).isEqualTo("简历不存在");
    }
}
