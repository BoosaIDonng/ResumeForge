package com.example.airesume.ai;

import com.example.airesume.common.ApiException;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OpenAiCompatibleClient implements AiClient {
    private final AiProperties properties;
    private final RestClient restClient;

    @Autowired
    public OpenAiCompatibleClient(AiProperties properties) {
        this(properties, RestClient.builder().build());
    }

    OpenAiCompatibleClient(AiProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    @Override
    public String completeJson(PromptType promptType, String systemPrompt, String userPrompt) {
        ChatCompletionResponse response = restClient.post()
            .uri(chatCompletionsUrl())
            .contentType(MediaType.APPLICATION_JSON)
            .headers(headers -> headers.setBearerAuth(properties.getApiKey()))
            .body(requestBody(systemPrompt, userPrompt))
            .retrieve()
            .body(ChatCompletionResponse.class);

        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new ApiException("AI_EMPTY_RESPONSE", "AI 响应为空");
        }

        String content = response.choices().get(0).message().content();
        if (content == null || content.isBlank()) {
            throw new ApiException("AI_EMPTY_RESPONSE", "AI 响应为空");
        }
        return content;
    }

    private String chatCompletionsUrl() {
        String baseUrl = properties.getBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new ApiException("AI_CONFIG_ERROR", "AI 服务地址未配置");
        }
        return baseUrl.replaceAll("/+$", "") + "/chat/completions";
    }

    private Map<String, Object> requestBody(String systemPrompt, String userPrompt) {
        return Map.of(
            "model", properties.getModel(),
            "temperature", 0.2,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "response_format", Map.of("type", "json_object")
        );
    }

    record ChatCompletionResponse(List<Choice> choices) {
    }

    record Choice(Message message) {
    }

    record Message(String content) {
    }
}
