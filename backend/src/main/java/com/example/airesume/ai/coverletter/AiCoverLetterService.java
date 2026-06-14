package com.example.airesume.ai.coverletter;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.PromptType;
import com.example.airesume.common.ApiException;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeRepository;
import org.springframework.stereotype.Service;

@Service
public class AiCoverLetterService {
    private final AiClientFactory clientFactory;
    private final ResumeRepository resumeRepository;

    public AiCoverLetterService(AiClientFactory clientFactory, ResumeRepository resumeRepository) {
        this.clientFactory = clientFactory;
        this.resumeRepository = resumeRepository;
    }

    public CoverLetterGenResponse generate(String provider, String apiKey, String baseUrl, String model,
                                           Long resumeId, String jobDescription, String tone, String language) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        ResumeEntity resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ApiException("RESUME_NOT_FOUND", "简历不存在"));

        String resolvedTone = (tone != null && !tone.isBlank()) ? tone : "formal";
        String lang = (language != null && !language.isBlank()) ? language : "zh";

        String toneDescription = switch (resolvedTone) {
            case "friendly" -> "友好、亲切的语气";
            case "confident" -> "自信、有力的语气";
            default -> "正式、专业的语气";
        };

        String systemPrompt = """
            你是一位求职信撰写专家。根据简历内容和职位描述，撰写一封高质量的求职信。
            要求：
            1. 语气：%s
            2. 语言：%s
            3. 突出简历中最相关的经验和技能
            4. 展示对该公司和职位的理解
            5. 包含具体的数据和成果
            6. 长度适中，约 300-500 字

            输出严格 JSON 格式：
            {
              "title": "求职信标题",
              "content": "求职信正文内容"
            }""".formatted(toneDescription, lang);

        String userPrompt = """
            简历内容:
            %s

            ---

            职位描述:
            %s""".formatted(resume.getResumeData(), jobDescription);

        String response = client.completeText(PromptType.COVER_LETTER_GENERATE, systemPrompt, userPrompt);

        // Try to parse as JSON first, fall back to plain text
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var tree = mapper.readTree(response);
            String title = tree.has("title") ? tree.get("title").asText() : "求职信";
            String content = tree.has("content") ? tree.get("content").asText() : response;
            return new CoverLetterGenResponse(title, content);
        } catch (Exception e) {
            return new CoverLetterGenResponse("求职信", response);
        }
    }
}
