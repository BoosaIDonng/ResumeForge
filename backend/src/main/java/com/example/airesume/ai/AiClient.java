package com.example.airesume.ai;

import java.util.List;
import java.util.Map;

public interface AiClient {
    String completeJson(PromptType promptType, String systemPrompt, String userPrompt);
    String completeText(PromptType promptType, String systemPrompt, String userPrompt);

    /**
     * Complete with a full conversation history (system + user/assistant turns).
     * Default implementation falls back to two-message mode using the last user message.
     */
    default String completeJsonWithMessages(PromptType promptType, List<Map<String, String>> messages) {
        String userMsg = messages.stream()
            .filter(m -> "user".equals(m.get("role")))
            .reduce((a, b) -> b)
            .map(m -> m.get("content"))
            .orElse("");
        String sysMsg = messages.stream()
            .filter(m -> "system".equals(m.get("role")))
            .findFirst()
            .map(m -> m.get("content"))
            .orElse("");
        return completeJson(promptType, sysMsg, userMsg);
    }

    default String completeTextWithMessages(PromptType promptType, List<Map<String, String>> messages) {
        String userMsg = messages.stream()
            .filter(m -> "user".equals(m.get("role")))
            .reduce((a, b) -> b)
            .map(m -> m.get("content"))
            .orElse("");
        String sysMsg = messages.stream()
            .filter(m -> "system".equals(m.get("role")))
            .findFirst()
            .map(m -> m.get("content"))
            .orElse("");
        return completeText(promptType, sysMsg, userMsg);
    }
}
