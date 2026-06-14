package com.example.airesume.ai.chat;

import java.util.List;

public record ChatResponse(String reply, List<ToolCall> toolCalls) {

    public record ToolCall(String type, String description, Object params) {
    }
}
