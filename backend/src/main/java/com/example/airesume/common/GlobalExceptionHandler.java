package com.example.airesume.common;

import com.example.airesume.ai.AiResponseFormatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

/**
 * 全局异常处理。
 * 统一捕获所有未处理异常，避免堆栈/内部信息泄露，保证响应结构一致。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 业务异常：返回 400 + 业务错误码 */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.fail(ex.code(), ex.getMessage()));
    }

    /** AI 响应格式异常（JSON 解析/截断修复失败）：返回 422，提示用户重试 */
    @ExceptionHandler(AiResponseFormatException.class)
    public ResponseEntity<ApiResponse<Void>> handleAiResponseFormat(AiResponseFormatException ex) {
        log.warn("AI 响应格式异常: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.fail("AI_RESPONSE_FORMAT_ERROR", "AI 响应格式异常，请重试"));
    }

    /** @Valid 校验失败：返回 400 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.fail("VALIDATION_ERROR", "请求参数不合法"));
    }

    /** 必需的请求参数缺失：返回 400 */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.fail("MISSING_PARAM", "缺少必需参数: " + ex.getParameterName()));
    }

    /** multipart 文件字段缺失：返回 400 */
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingPart(MissingServletRequestPartException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.fail("MISSING_PART", "缺少必需的文件字段: " + ex.getRequestPartName()));
    }

    /** 非 multipart 请求访问了需要文件上传的端点：返回 400 */
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMultipart(MultipartException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.fail("NOT_MULTIPART", "请使用 multipart/form-data 格式上传文件"));
    }

    /** 请求体不可读（非 JSON / 为空）：返回 400 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.fail("INVALID_BODY", "请求体格式错误或为空"));
    }

    /** 兜底：所有其他异常（NPE/IllegalArgumentException 等）返回 500，记录日志但不泄露细节 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        log.error("未处理的异常", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("INTERNAL_ERROR", "服务器内部错误"));
    }
}
