package com.example.airesume.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class JsonResponseParser {
    private final ObjectMapper objectMapper;

    public JsonResponseParser() {
        this(new ObjectMapper());
    }

    public JsonResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public <T> T parse(String text, Class<T> type) {
        String trimmed = text == null ? "" : text.trim();
        if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
            throw new AiResponseFormatException("AI 响应不是纯 JSON 对象", null);
        }

        try {
            return objectMapper.readValue(trimmed, type);
        } catch (Exception ex) {
            throw new AiResponseFormatException("AI JSON 解析失败", ex);
        }
    }
}
