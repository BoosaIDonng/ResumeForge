package com.example.airesume.ai;

public interface AiClient {
    String completeJson(PromptType promptType, String systemPrompt, String userPrompt);
}
