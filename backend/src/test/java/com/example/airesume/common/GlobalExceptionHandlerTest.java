package com.example.airesume.common;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;

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

    @Test
    void handlesValidationException() throws NoSuchMethodException {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        // 模拟 MethodArgumentNotValidException
        MethodParameter methodParameter = new MethodParameter(
            this.getClass().getDeclaredMethod("handlesValidationException"), -1);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getTarget()).thenReturn(new Object());
        when(bindingResult.getObjectName()).thenReturn("testObject");

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ApiResponse<Void>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
        assertThat(response.getBody().code()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getBody().message()).isEqualTo("请求参数不合法");
    }

    @Test
    void handlesValidationExceptionWithFieldErrors() throws NoSuchMethodException {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        MethodParameter methodParameter = new MethodParameter(
            this.getClass().getDeclaredMethod("handlesValidationExceptionWithFieldErrors"), -1);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getTarget()).thenReturn(new Object());
        when(bindingResult.getObjectName()).thenReturn("testObject");
        when(bindingResult.getAllErrors()).thenReturn(List.of(
            new FieldError("testObject", "name", "名称不能为空"),
            new FieldError("testObject", "email", "邮箱格式不正确")
        ));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ApiResponse<Void>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
        assertThat(response.getBody().code()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getBody().message()).isEqualTo("请求参数不合法");
    }

    @Test
    void handlesValidationExceptionWithEmptyErrorList() throws NoSuchMethodException {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        MethodParameter methodParameter = new MethodParameter(
            this.getClass().getDeclaredMethod("handlesValidationExceptionWithEmptyErrorList"), -1);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getTarget()).thenReturn(new Object());
        when(bindingResult.getObjectName()).thenReturn("testObject");
        when(bindingResult.getAllErrors()).thenReturn(List.of());

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ApiResponse<Void>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("VALIDATION_ERROR");
    }

    @Test
    void handlesValidationExceptionWithObjectError() throws NoSuchMethodException {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        MethodParameter methodParameter = new MethodParameter(
            this.getClass().getDeclaredMethod("handlesValidationExceptionWithObjectError"), -1);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getTarget()).thenReturn(new Object());
        when(bindingResult.getObjectName()).thenReturn("testObject");
        when(bindingResult.getAllErrors()).thenReturn(List.of(
            new ObjectError("testObject", "全局验证失败")
        ));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ApiResponse<Void>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
        assertThat(response.getBody().code()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getBody().message()).isEqualTo("请求参数不合法");
    }
}
