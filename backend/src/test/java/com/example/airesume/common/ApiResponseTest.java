package com.example.airesume.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ApiResponseTest {
    @Test
    void okShouldReturnSuccessResponse() {
        String data = "test";
        ApiResponse<String> response = ApiResponse.ok(data);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo("OK");
        assertThat(response.message()).isEqualTo("success");
        assertThat(response.data()).isEqualTo("test");
    }

    @Test
    void failShouldReturnFailureResponse() {
        ApiResponse<Void> response = ApiResponse.fail("ERROR_CODE", "error message");

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEqualTo("ERROR_CODE");
        assertThat(response.message()).isEqualTo("error message");
        assertThat(response.data()).isNull();
    }

    @Test
    void okWithNullDataShouldWork() {
        ApiResponse<Object> response = ApiResponse.ok(null);

        assertThat(response.success()).isTrue();
        assertThat(response.code()).isEqualTo("OK");
        assertThat(response.message()).isEqualTo("success");
        assertThat(response.data()).isNull();
    }

    @Test
    void failWithNullCodeAndMessageShouldPreserveValues() {
        ApiResponse<Void> response = ApiResponse.fail(null, null);

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isNull();
        assertThat(response.message()).isNull();
        assertThat(response.data()).isNull();
    }

    @Test
    void failWithBlankStringsShouldPreserveValues() {
        ApiResponse<Void> response = ApiResponse.fail("", "  ");

        assertThat(response.success()).isFalse();
        assertThat(response.code()).isEmpty();
        assertThat(response.message()).isEqualTo("  ");
        assertThat(response.data()).isNull();
    }
}
