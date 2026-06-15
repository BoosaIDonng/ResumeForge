package com.example.airesume.ai.generate;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.PromptType;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AiGenerateService {
    private final AiClientFactory clientFactory;

    public AiGenerateService(AiClientFactory clientFactory) {
        this.clientFactory = clientFactory;
    }

    public GenerateResumeResponse generate(String provider, String apiKey, String baseUrl, String model,
                                           String jobTitle, Integer yearsOfExperience,
                                           List<String> skills, String industry,
                                           String experience, String language) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        String lang = (language != null && !language.isBlank()) ? language : "zh";

        String systemPrompt = """
            你是一位专业的简历撰写专家。根据用户提供的信息生成一份完整的、专业的简历。
            要求：
            1. 使用量化成果和具体数据来描述工作成就
            2. 使用强有力的动词开头
            3. 技能部分要包含相关技术栈和工具
            4. 内容真实可信，避免夸大
            5. 输出语言为：%s

            输出严格 JSON 格式（不要 Markdown），结构如下：
            {
              "basics": {
                "name": "",
                "headline": "",
                "email": "",
                "phone": "",
                "location": "",
                "website": "",
                "customFields": []
              },
              "summary": {
                "title": "个人总结",
                "content": "",
                "hidden": false
              },
              "sections": {
                "experience": {
                  "title": "工作经历",
                  "hidden": false,
                  "items": [
                    {
                      "company": "",
                      "position": "",
                      "startDate": "",
                      "endDate": "",
                      "summary": ""
                    }
                  ]
                },
                "education": {
                  "title": "教育经历",
                  "hidden": false,
                  "items": [
                    {
                      "institution": "",
                      "studyType": "",
                      "area": "",
                      "startDate": "",
                      "endDate": ""
                    }
                  ]
                },
                "skills": {
                  "title": "技能",
                  "hidden": false,
                  "items": [
                    { "name": "", "keywords": [] }
                  ]
                },
                "projects": {
                  "title": "项目经历",
                  "hidden": false,
                  "items": [
                    {
                      "name": "",
                      "description": "",
                      "startDate": "",
                      "endDate": "",
                      "keywords": []
                    }
                  ]
                },
                "languages": { "title": "语言", "hidden": false, "items": [] },
                "certifications": { "title": "证书", "hidden": false, "items": [] },
                "awards": { "title": "荣誉奖项", "hidden": false, "items": [] }
              },
              "customSections": [],
              "metadata": {
                "template": "default",
                "language": "%s"
              }
            }""".formatted(lang, lang);

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("职位: ").append(jobTitle);
        if (yearsOfExperience != null) {
            userPrompt.append("\n工作年限: ").append(yearsOfExperience).append(" 年");
        }
        if (skills != null && !skills.isEmpty()) {
            userPrompt.append("\n技能: ").append(String.join(", ", skills));
        }
        if (industry != null && !industry.isBlank()) {
            userPrompt.append("\n行业: ").append(industry);
        }
        if (experience != null && !experience.isBlank()) {
            userPrompt.append("\n经历描述: ").append(experience);
        }

        String response = client.completeJson(PromptType.RESUME_GENERATE, systemPrompt, userPrompt.toString());

        String title = jobTitle + " - AI 生成简历";
        return new GenerateResumeResponse(title, response);
    }
}
