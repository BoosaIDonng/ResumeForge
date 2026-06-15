package com.example.airesume.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayDeque;
import java.util.Deque;
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

        // Step 6: Attempt to repair truncated JSON (output cut off by max_tokens limit)
        String truncated = repairTruncatedJson(cleaned);
        if (truncated != null) {
            result = tryParse(truncated, type);
            if (result != null) return result;
        }

        throw new AiResponseFormatException("AI JSON 解析失败: 多步修复后仍无法解析", null);
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

    /**
     * 尝试修复被截断的 JSON（AI 输出因 max_tokens 限制被切断）。
     * 补全未闭合的字符串，清理尾部残留，补全未闭合的括号。
     */
    private String repairTruncatedJson(String text) {
        int start = text.indexOf('{');
        if (start == -1) return null;

        String json = text.substring(start);

        boolean inString = false;
        boolean escaped = false;
        Deque<Character> stack = new ArrayDeque<>();

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (escaped) {
                escaped = false;
                continue;
            }
            if (c == '\\' && inString) {
                escaped = true;
                continue;
            }
            if (c == '"') {
                inString = !inString;
                continue;
            }
            if (inString) continue;
            if (c == '{' || c == '[') {
                stack.push(c);
            } else if (c == '}' && !stack.isEmpty() && stack.peek() == '{') {
                stack.pop();
            } else if (c == ']' && !stack.isEmpty() && stack.peek() == '[') {
                stack.pop();
            }
        }

        StringBuilder sb = new StringBuilder(json);

        // 补全未闭合的字符串
        if (inString) {
            sb.append('"');
        }

        // 清理尾部残留的逗号和空白
        String cleanedStr = sb.toString().replaceAll("[,\\s]+$", "");

        // 冒号结尾说明键值被截断，补 null
        if (cleanedStr.endsWith(":")) {
            cleanedStr = cleanedStr + "null";
        }

        // 补全未闭合的括号（按栈逆序）
        StringBuilder result = new StringBuilder(cleanedStr);
        for (char open : stack) {
            result.append(open == '{' ? '}' : ']');
        }

        return result.toString();
    }
}
