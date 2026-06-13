package com.example.airesume.resume;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.JsonResponseParser;
import com.example.airesume.ai.PromptType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ResumeParseServiceTest {
    @Mock
    private AiClient aiClient;

    private JsonResponseParser jsonParser;
    private ResumeParseService service;

    @BeforeEach
    void setUp() {
        jsonParser = new JsonResponseParser(new ObjectMapper());
        service = new ResumeParseService(aiClient, jsonParser);
    }

    @Test
    void parsesToStructuredData() {
        String mockResponse = """
            {
              "basics": {
                "name": "张三",
                "headline": "Java工程师",
                "email": "zhang@example.com",
                "phone": "13800138000",
                "location": "北京",
                "url": "",
                "summary": "5年Java开发经验"
              },
              "sections": {
                "experience": {
                  "name": "工作经历",
                  "items": [{"company": "ABC公司", "position": "高级工程师", "startDate": "2020-01", "endDate": "2024-01", "summary": "负责核心系统开发"}]
                },
                "skills": {
                  "name": "技能",
                  "items": [{"name": "Java", "keywords": ["Spring Boot", "Redis"]}]
                }
              }
            }""";
        when(aiClient.completeJson(eq(PromptType.JD_ANALYSIS), any(), any())).thenReturn(mockResponse);

        ResumeData result = service.parseToStructured("张三\nJava工程师\n经验：5年");

        assertThat(result.basics().name()).isEqualTo("张三");
        assertThat(result.basics().email()).isEqualTo("zhang@example.com");
        assertThat(result.sections()).containsKey("experience");
    }
}
