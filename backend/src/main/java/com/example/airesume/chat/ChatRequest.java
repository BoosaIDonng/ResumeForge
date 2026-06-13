package com.example.airesume.chat;

import java.util.List;

public record ChatRequest(
    Long resumeId,
    List<ChatMessage> messages
) {}
