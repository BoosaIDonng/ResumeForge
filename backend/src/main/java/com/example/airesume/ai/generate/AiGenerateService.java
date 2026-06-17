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
            You are a professional resume writer. Generate a complete, professional resume from the given information.
            You MUST use the EXACT field names shown in the schema below.

            RULES:
            1. Use quantified achievements with specific metrics
            2. Start bullet points with strong action verbs
            3. Include relevant tech stacks in skills and project technologies
            4. Keep content realistic — do not fabricate
            5. Output language: %s
            6. Return ONLY valid JSON — no markdown, no code fences
            7. SKILLS FORMAT: Each skill item MUST be {name: "Category", keywords: ["Skill1","Skill2"]}. Group skills by category.
            8. SECTION TITLES: Use the output language. Chinese → Chinese titles (工作经历, 技能). English → English titles (Experience, Skills).

            JSON SCHEMA (use these EXACT field names):
            {
              "basics": {
                "name": "Full Name",
                "headline": "Professional Title",
                "email": "email@example.com",
                "phone": "+86-138-0000-0000",
                "location": "City, Country",
                "website": "https://example.com",
                "age": "",
                "gender": "",
                "politicalStatus": "",
                "ethnicity": "",
                "hometown": "",
                "maritalStatus": "",
                "yearsOfExperience": "",
                "educationLevel": "",
                "wechat": "",
                "avatar": ""
              },
              "summary": {
                "title": "个人总结",
                "content": "Professional summary paragraph",
                "hidden": false
              },
              "sections": {
                "experience": {
                  "title": "工作经历",
                  "hidden": false,
                  "items": [
                    {
                      "company": "Company Name",
                      "position": "Job Title",
                      "startDate": "2020-01",
                      "endDate": null,
                      "location": "City",
                      "description": "Brief role overview",
                      "highlights": ["Achievement 1 with metrics", "Achievement 2 with metrics"],
                      "technologies": ["Tech1", "Tech2"]
                    }
                  ]
                },
                "education": {
                  "title": "教育经历",
                  "hidden": false,
                  "items": [
                    {
                      "school": "University Name",
                      "degree": "Bachelor's",
                      "area": "Computer Science",
                      "startDate": "2016-09",
                      "endDate": "2020-06",
                      "gpa": "3.8/4.0",
                      "highlights": ["Honors", "Relevant coursework"]
                    }
                  ]
                },
                "skills": {
                  "title": "技能",
                  "hidden": false,
                  "items": [
                    {"name": "Frontend", "keywords": ["React", "Vue", "TypeScript"]},
                    {"name": "Backend", "keywords": ["Java", "Spring Boot", "MySQL"]},
                    {"name": "Tools", "keywords": ["Git", "Docker", "Kubernetes"]}
                  ]
                },
                "projects": {
                  "title": "项目经历",
                  "hidden": false,
                  "items": [
                    {
                      "name": "Project Name",
                      "role": "Your Role",
                      "startDate": "2022-01",
                      "endDate": "2022-12",
                      "description": "What the project does",
                      "highlights": ["Key contribution 1", "Key contribution 2"],
                      "technologies": ["React", "Node.js"],
                      "url": "https://..."
                    }
                  ]
                },
                "languages": {"title": "语言", "hidden": false, "items": [{"name": "English", "level": "Fluent"}]},
                "certifications": {"title": "证书", "hidden": false, "items": []},
                "awards": {"title": "荣誉奖项", "hidden": false, "items": []}
              },
              "customSections": [],
              "enabledSections": ["basics","summary","experience","projects","education","skills","design"],
              "metadata": {"template": "default", "language": "%s"}
            }

            CRITICAL: experience.endDate = null for current jobs. highlights = string[] array. education uses "school" not "institution". projects uses "technologies" not "keywords"."""
            .formatted(lang, lang);

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
