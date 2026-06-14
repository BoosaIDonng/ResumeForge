package com.example.airesume.ai.chat;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @deprecated Use {@link com.example.airesume.ai.tools.ToolChatController} instead.
 * This basic chat has no tool execution capability.
 */
@Deprecated
@RestController
@RequestMapping("/api/ai")
public class AiChatController {
    private final AiChatService chatService;

    public AiChatController(AiChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @Valid @RequestBody ChatRequest request
    ) {
        ChatResponse response = chatService.chat(
            provider, apiKey, baseUrl, model,
            request.resumeId(), request.message(), request.conversationHistory()
        );
        return ApiResponse.ok(response);
    }
}
