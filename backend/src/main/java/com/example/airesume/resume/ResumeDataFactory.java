package com.example.airesume.resume;

public final class ResumeDataFactory {
    private ResumeDataFactory() {
    }

    public static String defaultResumeData() {
        return """
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
                "profiles": { "title": "个人资料", "hidden": false, "items": [] },
                "experience": { "title": "工作经历", "hidden": false, "items": [] },
                "projects": { "title": "项目经历", "hidden": false, "items": [] },
                "education": { "title": "教育经历", "hidden": false, "items": [] },
                "skills": { "title": "技能", "hidden": false, "items": [] },
                "languages": { "title": "语言", "hidden": false, "items": [] },
                "certifications": { "title": "证书", "hidden": false, "items": [] },
                "awards": { "title": "荣誉奖项", "hidden": false, "items": [] }
              },
              "customSections": [],
              "metadata": {
                "template": "default",
                "language": "zh"
              }
            }
            """;
    }
}
