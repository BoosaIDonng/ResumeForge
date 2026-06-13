package com.example.airesume.export;

import com.example.airesume.ai.AiPhraseRefiner;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class PdfExportService {
    private final TemplateEngine templateEngine;
    private final ObjectMapper objectMapper;
    private final AiPhraseRefiner phraseRefiner;

    public PdfExportService(TemplateEngine templateEngine, ObjectMapper objectMapper, AiPhraseRefiner phraseRefiner) {
        this.templateEngine = templateEngine;
        this.objectMapper = objectMapper;
        this.phraseRefiner = phraseRefiner;
    }

    public byte[] generatePdf(String resumeDataJson, TemplateType template, boolean refine) {
        Map<String, Object> data = parseResumeData(resumeDataJson);

        if (refine) {
            refineTexts(data);
        }

        String html = renderHtml(data, template);
        return htmlToPdf(html);
    }

    private Map<String, Object> parseResumeData(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("简历数据解析失败", e);
        }
    }

    @SuppressWarnings("unchecked")
    private void refineTexts(Map<String, Object> data) {
        Object summary = data.get("summary");
        if (summary instanceof Map<?, ?> summaryMap) {
            Map<String, Object> sm = (Map<String, Object>) summaryMap;
            if (sm.get("content") instanceof String content) {
                sm.put("content", phraseRefiner.refine(content));
            }
        }

        Object sections = data.get("sections");
        if (sections instanceof Map<?, ?> sectionsMap) {
            for (Object sectionValue : ((Map<String, Object>) sectionsMap).values()) {
                if (sectionValue instanceof Map<?, ?> section) {
                    Object items = ((Map<String, Object>) section).get("items");
                    if (items instanceof List<?> itemList) {
                        for (Object item : itemList) {
                            if (item instanceof Map<?, ?> itemMap) {
                                Map<String, Object> im = (Map<String, Object>) itemMap;
                                if (im.get("summary") instanceof String s) {
                                    im.put("summary", phraseRefiner.refine(s));
                                }
                                if (im.get("description") instanceof String d) {
                                    im.put("description", phraseRefiner.refine(d));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private String renderHtml(Map<String, Object> data, TemplateType template) {
        Context context = new Context();
        context.setVariable("resume", data);
        return templateEngine.process("export/" + template.getTemplateName(), context);
    }

    private byte[] htmlToPdf(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);

            ClassPathResource fontResource = new ClassPathResource("fonts/NotoSansSC-Regular.ttf");
            if (fontResource.exists()) {
                builder.useFont(() -> {
                    try {
                        return fontResource.getInputStream();
                    } catch (Exception e) {
                        return InputStream.nullInputStream();
                    }
                }, "SimHei");
            }

            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF 生成失败: " + e.getMessage(), e);
        }
    }
}
