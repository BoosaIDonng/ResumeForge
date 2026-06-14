package com.example.airesume.ai;

import com.example.airesume.common.ApiException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Component
public class OpenAiCompatibleClient implements AiClient {
    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleClient.class);
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 2000L;

    private final AiProperties properties;
    private final RestClient restClient;

    @Autowired
    public OpenAiCompatibleClient(AiProperties properties) {
        this(properties, RestClient.builder().requestFactory(buildRequestFactory()).build());
    }

    OpenAiCompatibleClient(AiProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    private static ClientHttpRequestFactory buildRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(15).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(120).toMillis());
        return factory;
    }

    @Override
    public String completeJson(PromptType promptType, String systemPrompt, String userPrompt) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));
        return callWithRetry(promptType, messages, true);
    }

    @Override
    public String completeText(PromptType promptType, String systemPrompt, String userPrompt) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));
        return callWithRetry(promptType, messages, false);
    }

    @Override
    public String completeJsonWithMessages(PromptType promptType, List<Map<String, String>> messages) {
        return callWithRetry(promptType, messages, true);
    }

    @Override
    public String completeTextWithMessages(PromptType promptType, List<Map<String, String>> messages) {
        return callWithRetry(promptType, messages, false);
    }

    private String callWithRetry(PromptType promptType, List<Map<String, String>> messages, boolean jsonMode) {
        ApiException lastError = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                Map<String, Object> body = jsonMode ? requestBodyJson(messages) : requestBodyText(messages);

                ChatCompletionResponse response = restClient.post()
                    .uri(chatCompletionsUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> headers.setBearerAuth(properties.getApiKey()))
                    .body(body)
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

            } catch (HttpClientErrorException.TooManyRequests ex) {
                lastError = new ApiException("AI_RATE_LIMITED", "AI 服务限流，请稍后重试");
                log.warn("AI rate limited on attempt {}/{} for {}", attempt, MAX_RETRIES, promptType);
                if (attempt < MAX_RETRIES) sleep(RETRY_DELAY_MS * attempt);

            } catch (HttpClientErrorException ex) {
                lastError = new ApiException("AI_CLIENT_ERROR",
                    "AI 服务客户端错误: " + ex.getStatusCode() + " " + ex.getResponseBodyAsString());
                log.error("AI client error for {}: {} {}", promptType, ex.getStatusCode(), ex.getResponseBodyAsString());
                break;

            } catch (HttpServerErrorException ex) {
                lastError = new ApiException("AI_PROVIDER_ERROR",
                    "AI 服务暂时不可用: " + ex.getStatusCode());
                log.error("AI provider error for {}: {} {}", promptType, ex.getStatusCode(), ex.getResponseBodyAsString());
                if (attempt < MAX_RETRIES) sleep(RETRY_DELAY_MS * attempt);

            } catch (ResourceAccessException ex) {
                lastError = new ApiException("AI_TIMEOUT", "AI 服务连接超时或不可达: " + ex.getMessage());
                log.error("AI connection error for {}: {}", promptType, ex.getMessage());
                if (attempt < MAX_RETRIES) sleep(RETRY_DELAY_MS * attempt);

            } catch (ApiException ex) {
                throw ex;

            } catch (Exception ex) {
                lastError = new ApiException("AI_UNKNOWN_ERROR", "AI 调用失败: " + ex.getMessage());
                log.error("AI unknown error for {}", promptType, ex);
                break;
            }
        }

        throw lastError != null ? lastError : new ApiException("AI_UNKNOWN_ERROR", "AI 调用失败");
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String chatCompletionsUrl() {
        String baseUrl = properties.getBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new ApiException("AI_CONFIG_ERROR", "AI 服务地址未配置");
        }
        return baseUrl.replaceAll("/+$", "") + "/chat/completions";
    }

    private Map<String, Object> requestBodyJson(List<Map<String, String>> messages) {
        Map<String, Object> body = baseRequestBody(messages);
        body.put("response_format", Map.of("type", "json_object"));
        return body;
    }

    private Map<String, Object> requestBodyText(List<Map<String, String>> messages) {
        return baseRequestBody(messages);
    }

    private Map<String, Object> baseRequestBody(List<Map<String, String>> messages) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", properties.getModel());
        body.put("temperature", properties.getTemperature());

        if (properties.getMaxTokens() != null && properties.getMaxTokens() > 0) {
            body.put("max_tokens", properties.getMaxTokens());
        }

        body.put("messages", messages);

        return body;
    }

    record ChatCompletionResponse(List<Choice> choices) {
    }

    record Choice(Message message) {
    }

    record Message(String content) {
    }
}
