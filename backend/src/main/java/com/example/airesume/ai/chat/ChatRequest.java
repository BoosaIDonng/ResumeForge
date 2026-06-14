package com.example.airesume.ai.chat;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ChatRequest(
    Long resumeId,
    @NotBlank(message = "消息不能为空") String message,
    List<ChatMessage> conversationHistory
) {
}
