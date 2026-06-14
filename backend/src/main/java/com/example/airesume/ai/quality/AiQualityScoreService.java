package com.example.airesume.ai.quality;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.PromptType;
import com.example.airesume.common.ApiException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AiQualityScoreService {
    private static final Logger log = LoggerFactory.getLogger(AiQualityScoreService.class);
    private final AiClientFactory clientFactory;
    private final ObjectMapper objectMapper;

    public AiQualityScoreService(AiClientFactory clientFactory, ObjectMapper objectMapper) {
        this.clientFactory = clientFactory;
        this.objectMapper = objectMapper;
    }

    public QualityScoreResponse score(String resumeDataJson,
                                       String provider, String apiKey, String baseUrl, String model) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        String systemPrompt = """
            你是一位资深简历评估专家。请对以下简历进行全面质量评估。

            评估维度：
            1. 内容完整性 - 是否包含所有关键部分
            2. 写作质量 - 用词是否专业、表达是否清晰
            3. 成果量化 - 是否用数字和指标量化了工作成果
            4. 关键词丰富度 - 是否包含行业关键词
            5. 格式与结构 - 信息组织是否合理

            必须返回 JSON 格式：
            {
              "overallScore": 75,
              "sectionScores": [
                {"sectionType": "summary", "sectionName": "个人总结", "score": 80, "feedback": "评价"},
                {"sectionType": "experience", "sectionName": "工作经历", "score": 70, "feedback": "评价"}
              ],
              "suggestions": [
                {"priority": "high", "section": "experience", "message": "建议", "example": "示例改写"}
              ],
              "summary": "整体评价"
            }
            """;

        try {
            String raw = client.completeJson(PromptType.GRAMMAR_CHECK, systemPrompt, resumeDataJson);
            return parseResponse(raw);
        } catch (Exception e) {
            log.error("Quality scoring failed", e);
            throw new ApiException("QUALITY_SCORE_FAILED", "简历评分失败: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private QualityScoreResponse parseResponse(String raw) {
        try {
            Map<String, Object> map = objectMapper.readValue(raw, new TypeReference<>() {});
            Integer overallScore = map.containsKey("overallScore") ? ((Number) map.get("overallScore")).intValue() : 0;

            List<Map<String, Object>> ssRaw = (List<Map<String, Object>>) map.getOrDefault("sectionScores", List.of());
            List<QualityScoreResponse.SectionScore> sectionScores = ssRaw.stream()
                .map(s -> new QualityScoreResponse.SectionScore(
                    (String) s.getOrDefault("sectionType", ""),
                    (String) s.getOrDefault("sectionName", ""),
                    s.containsKey("score") ? ((Number) s.get("score")).intValue() : 0,
                    (String) s.getOrDefault("feedback", "")
                ))
                .toList();

            List<Map<String, Object>> sugRaw = (List<Map<String, Object>>) map.getOrDefault("suggestions", List.of());
            List<QualityScoreResponse.Suggestion> suggestions = sugRaw.stream()
                .map(s -> new QualityScoreResponse.Suggestion(
                    (String) s.getOrDefault("priority", "medium"),
                    (String) s.getOrDefault("section", ""),
                    (String) s.getOrDefault("message", ""),
                    (String) s.getOrDefault("example", "")
                ))
                .toList();

            String summary = (String) map.getOrDefault("summary", "");
            return new QualityScoreResponse(overallScore, sectionScores, suggestions, summary);
        } catch (Exception e) {
            log.warn("Failed to parse quality score response", e);
            return new QualityScoreResponse(0, List.of(), List.of(), "评分解析失败");
        }
    }
}
