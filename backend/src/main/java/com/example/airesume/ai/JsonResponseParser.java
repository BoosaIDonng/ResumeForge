package com.example.airesume.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class JsonResponseParser {
    private final ObjectMapper objectMapper;

    private static final Pattern THINK_BLOCK = Pattern.compile("<think>.*?</think>", Pattern.DOTALL);
    private static final Pattern MARKDOWN_FENCE = Pattern.compile("```(?:json)?\\s*\\n?(.*?)\\n?```", Pattern.DOTALL);
    private static final Pattern JSON_ARRAY_BRUTE = Pattern.compile("\\[.*\\]", Pattern.DOTALL);

    public JsonResponseParser() {
        this(new ObjectMapper());
    }

    public JsonResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public <T> T parse(String text, Class<T> type) {
        if (text == null || text.isBlank()) {
            throw new AiResponseFormatException("AI 响应为空", null);
        }

        String cleaned = text;

        // Step 1: Strip <think> blocks (reasoning models like deepseek-r1, qwen3)
        cleaned = THINK_BLOCK.matcher(cleaned).replaceAll("");

        // Step 2: Try direct parse
        T result = tryParse(cleaned.trim(), type);
        if (result != null) return result;

        // Step 3: Extract from markdown code fence
        Matcher fenceMatcher = MARKDOWN_FENCE.matcher(cleaned);
        if (fenceMatcher.find()) {
            result = tryParse(fenceMatcher.group(1).trim(), type);
            if (result != null) return result;
        }

        // Step 4: Brute-force extract outermost JSON object or array
        boolean isArrayType = type.isArray() || java.util.List.class.isAssignableFrom(type);
        if (isArrayType) {
            Matcher arrayMatcher = JSON_ARRAY_BRUTE.matcher(cleaned);
            if (arrayMatcher.find()) {
                result = tryParse(arrayMatcher.group(), type);
                if (result != null) return result;
            }
        }

        // Try finding the deepest nested JSON object using brace matching
        String extracted = extractDeepJson(cleaned);
        if (extracted != null) {
            result = tryParse(extracted, type);
            if (result != null) return result;
        }

        // Step 5: Attempt to repair common issues (trailing commas, unquoted keys)
        String repaired = repairJson(cleaned);
        result = tryParse(repaired, type);
        if (result != null) return result;

        throw new AiResponseFormatException("AI JSON 解析失败: 多步修复后仍无法解析", null);
    }

    /**
     * Parse a JSON array from text. Supports String[] result.
     */
    public <T> T parseArray(String text, Class<T> type) {
        return parse(text, type);
    }

    private <T> T tryParse(String json, Class<T> type) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception ex) {
            return null;
        }
    }

    private String extractDeepJson(String text) {
        int start = text.indexOf('{');
        if (start == -1) return null;

        int depth = 0;
        int end = -1;
        for (int i = start; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '{') depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) {
                    end = i;
                    break;
                }
            }
        }

        if (end == -1) return null;
        return text.substring(start, end + 1);
    }

    private String repairJson(String text) {
        String extracted = extractDeepJson(text);
        if (extracted == null) return text;

        // Remove trailing commas before } or ]
        String repaired = extracted.replaceAll(",\\s*([}\\]])", "$1");
        // Remove single-line comments
        repaired = repaired.replaceAll("//[^\n]*", "");
        return repaired;
    }
}
