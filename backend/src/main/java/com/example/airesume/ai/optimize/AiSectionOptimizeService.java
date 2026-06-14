package com.example.airesume.ai.optimize;

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
public class AiSectionOptimizeService {
    private static final Logger log = LoggerFactory.getLogger(AiSectionOptimizeService.class);
    private final AiClientFactory clientFactory;
    private final ObjectMapper objectMapper;

    public AiSectionOptimizeService(AiClientFactory clientFactory, ObjectMapper objectMapper) {
        this.clientFactory = clientFactory;
        this.objectMapper = objectMapper;
    }

    public SectionOptimizeResponse optimize(SectionOptimizeRequest request,
                                             String provider, String apiKey, String baseUrl, String model) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        String systemPrompt = buildSystemPrompt(request);
        String userPrompt = buildUserPrompt(request);

        try {
            String raw = client.completeJson(PromptType.OPTIMIZATION_DIFF, systemPrompt, userPrompt);
            return parseResponse(raw, request.currentContent());
        } catch (Exception e) {
            log.error("Section optimization failed for sectionType={}", request.sectionType(), e);
            throw new ApiException("OPTIMIZE_FAILED", "AI 优化失败: " + e.getMessage());
        }
    }

    private String buildSystemPrompt(SectionOptimizeRequest req) {
        String goalDesc = switch (req.goal() == null ? "improve_writing" : req.goal()) {
            case "improve_writing" -> "提升写作质量，使用更专业的表达";
            case "add_keywords" -> "添加行业关键词以提升 ATS 通过率";
            case "quantify_achievements" -> "量化成果，添加具体数字和指标";
            case "make_concise" -> "精简表达，去除冗余";
            case "tailor_jd" -> "针对职位描述优化内容匹配度";
            default -> "综合优化内容质量";
        };

        return """
            你是一位专业的简历优化顾问。你的任务是优化简历的「%s」部分。

            优化目标：%s

            规则：
            1. 保持原始信息的真实性，不编造经历
            2. 使用强动词开头（如：主导、构建、优化、提升）
            3. 尽量量化成果（数字、百分比、规模）
            4. 去除冗余和弱表达
            5. 保持专业但自然的语气

            必须返回 JSON 格式：
            {
              "optimizedContent": "优化后的内容（与输入格式相同）",
              "changes": [
                {"field": "字段名", "before": "原文", "after": "改后", "reason": "原因"}
              ],
              "scoreBefore": 60,
              "scoreAfter": 85
            }
            """.formatted(sectionName(req.sectionType()), goalDesc);
    }

    private String buildUserPrompt(SectionOptimizeRequest req) {
        StringBuilder sb = new StringBuilder();
        sb.append("当前内容：\n").append(req.currentContent());
        if (req.jobDescription() != null && !req.jobDescription().isBlank()) {
            sb.append("\n\n目标职位描述：\n").append(req.jobDescription());
        }
        if (req.userInstructions() != null && !req.userInstructions().isBlank()) {
            sb.append("\n\n用户额外要求：\n").append(req.userInstructions());
        }
        return sb.toString();
    }

    private SectionOptimizeResponse parseResponse(String raw, String originalContent) {
        try {
            Map<String, Object> map = objectMapper.readValue(raw, new TypeReference<>() {});
            String optimizedContent = (String) map.getOrDefault("optimizedContent", originalContent);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> changesRaw = (List<Map<String, Object>>) map.getOrDefault("changes", List.of());
            List<SectionOptimizeResponse.Change> changes = changesRaw.stream()
                .map(c -> new SectionOptimizeResponse.Change(
                    (String) c.getOrDefault("field", ""),
                    (String) c.getOrDefault("before", ""),
                    (String) c.getOrDefault("after", ""),
                    (String) c.getOrDefault("reason", "")
                ))
                .toList();
            Integer scoreBefore = map.containsKey("scoreBefore") ? ((Number) map.get("scoreBefore")).intValue() : null;
            Integer scoreAfter = map.containsKey("scoreAfter") ? ((Number) map.get("scoreAfter")).intValue() : null;
            return new SectionOptimizeResponse(optimizedContent, changes, scoreBefore, scoreAfter);
        } catch (Exception e) {
            log.warn("Failed to parse optimization response as JSON, returning raw text", e);
            return new SectionOptimizeResponse(raw, List.of(), null, null);
        }
    }

    private String sectionName(String type) {
        if (type == null) return "未知";
        return switch (type) {
            case "summary" -> "个人总结";
            case "experience" -> "工作经历";
            case "projects" -> "项目经验";
            case "education" -> "教育背景";
            case "skills" -> "技能";
            case "certifications" -> "证书";
            case "languages" -> "语言";
            case "awards" -> "奖项";
            default -> type;
        };
    }
}
