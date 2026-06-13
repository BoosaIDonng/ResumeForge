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
                "website": ""
              },
              "summary": {
                "content": ""
              },
              "sections": {
                "experience": { "items": [] },
                "projects": { "items": [] },
                "education": { "items": [] },
                "skills": { "items": [] }
              },
              "customSections": [],
              "metadata": {
                "template": "clean",
                "language": "zh-CN"
              }
            }
            """;
    }
}
