package com.example.airesume.ai.chat;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.JsonResponseParser;
import com.example.airesume.ai.PromptType;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * @deprecated Use {@link com.example.airesume.ai.tools.ToolChatService} instead.
 */
@Deprecated
@Service
public class AiChatService {
    private final AiClientFactory clientFactory;
    private final JsonResponseParser jsonParser;

    public AiChatService(AiClientFactory clientFactory, JsonResponseParser jsonParser) {
        this.clientFactory = clientFactory;
        this.jsonParser = jsonParser;
    }

    public ChatResponse chat(String provider, String apiKey, String baseUrl, String model,
                             String resumeData, String message, List<ChatMessage> history) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        String resumeContext = "";
        if (resumeData != null && !resumeData.isBlank()) {
            resumeContext = "\n\n当前简历内容:\n" + resumeData;
        }

        String systemPrompt = "你是简历优化专家助手。根据用户的简历内容提供具体、可操作的建议。" +
            "回复使用 JSON 格式: {\"reply\": \"你的回答\", \"toolCalls\": [{\"type\": \"action_type\", \"description\": \"描述\", \"params\": {}}]}" +
            "toolCalls 可以为空数组。常见 action_type: update_section, add_item, rewrite_bullet." +
            resumeContext;

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (history != null) {
            for (ChatMessage msg : history) {
                messages.add(Map.of("role", msg.role(), "content", msg.content()));
            }
        }
        messages.add(Map.of("role", "user", "content", message));

        String response = client.completeJsonWithMessages(PromptType.AI_CHAT, messages);
        return jsonParser.parse(response, ChatResponse.class);
    }
}
