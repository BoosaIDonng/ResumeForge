package com.example.airesume.export;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.example.airesume.ai.AiPhraseRefiner;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

class PdfExportServiceTest {
    @Test
    void generatesNonEmptyPdf() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode("HTML");
        resolver.setCharacterEncoding("UTF-8");

        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);

        AiPhraseRefiner refiner = new AiPhraseRefiner();
        ObjectMapper mapper = new ObjectMapper();

        PdfExportService service = new PdfExportService(engine, mapper, refiner);

        String resumeJson = """
            {
              "basics": {"name": "张三", "headline": "Java工程师", "email": "test@test.com", "phone": "13800000000", "location": "北京"},
              "summary": {"content": "5年Java开发经验"},
              "sections": {
                "experience": {"name": "工作经历", "items": [
                  {"position": "高级工程师", "company": "测试公司", "startDate": "2020-01", "endDate": "2024-01", "summary": "负责后端开发"}
                ]},
                "education": {"name": "教育经历", "items": [
                  {"institution": "清华大学", "studyType": "本科", "area": "计算机科学", "startDate": "2015", "endDate": "2019"}
                ]},
                "skills": {"name": "技能", "items": [
                  {"name": "后端", "keywords": ["Java", "Spring Boot", "MySQL"]}
                ]},
                "projects": {"name": "项目经历", "items": []}
              },
              "metadata": {"template": "clean", "language": "zh-CN"}
            }
            """;

        byte[] pdf = service.generatePdf(resumeJson, TemplateType.CLEAN, false);
        assertThat(pdf).isNotEmpty();
        assertThat(pdf[0]).isEqualTo((byte) '%');
        assertThat(pdf[1]).isEqualTo((byte) 'P');
        assertThat(pdf[2]).isEqualTo((byte) 'D');
        assertThat(pdf[3]).isEqualTo((byte) 'F');
    }

    @Test
    void templateTypeFromString() {
        assertThat(TemplateType.fromString("clean")).isEqualTo(TemplateType.CLEAN);
        assertThat(TemplateType.fromString("MODERN")).isEqualTo(TemplateType.MODERN);
        assertThat(TemplateType.fromString("minimal")).isEqualTo(TemplateType.MINIMAL);
        assertThat(TemplateType.fromString("invalid")).isEqualTo(TemplateType.CLEAN);
        assertThat(TemplateType.fromString(null)).isEqualTo(TemplateType.CLEAN);
        assertThat(TemplateType.fromString("")).isEqualTo(TemplateType.CLEAN);
    }
}
