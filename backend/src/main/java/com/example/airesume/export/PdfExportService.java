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
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringReader;
import java.io.StringWriter;

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

    public byte[] generatePdf(String resumeDataJson, TemplateType template, boolean refine, boolean fitOnePage) {
        Map<String, Object> data = parseResumeData(resumeDataJson);

        if (refine) {
            refineTexts(data);
        }

        String html = renderHtml(data, template);

        if (fitOnePage) {
            html = compressToOnePage(html);
        }

        return htmlToPdf(html);
    }

    private String compressToOnePage(String html) {
        double[] scaleFactors = {0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50};

        for (double factor : scaleFactors) {
            String scaledHtml = applyScaleFactor(html, factor);
            byte[] pdf = htmlToPdf(scaledHtml);
            if (isOnePage(pdf)) {
                return scaledHtml;
            }
        }

        return applyScaleFactor(html, 0.50);
    }

    private String applyScaleFactor(String html, double factor) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);
            factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(html)));

            Element body = doc.getDocumentElement();
            scaleElement(body, factor);

            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(writer));
            return writer.toString();
        } catch (Exception e) {
            return html;
        }
    }

    private void scaleElement(Element element, double factor) {
        if (element.hasAttribute("style")) {
            String style = element.getAttribute("style");
            style = scaleFontSize(style, factor);
            element.setAttribute("style", style);
        }

        NodeList children = element.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            if (children.item(i) instanceof Element child) {
                scaleElement(child, factor);
            }
        }
    }

    private String scaleFontSize(String style, double factor) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("font-size:\\s*([0-9.]+)(pt|px|em|rem)");
        java.util.regex.Matcher matcher = pattern.matcher(style);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            double size = Double.parseDouble(matcher.group(1));
            String unit = matcher.group(2);
            double newSize = Math.round(size * factor * 10.0) / 10.0;
            if (newSize < 5.0) newSize = 5.0;
            matcher.appendReplacement(sb, "font-size:" + newSize + unit);
        }
        matcher.appendTail(sb);

        java.util.regex.Pattern lineHeightPattern = java.util.regex.Pattern.compile("line-height:\\s*([0-9.]+)");
        java.util.regex.Matcher lhMatcher = lineHeightPattern.matcher(sb.toString());
        StringBuffer lhSb = new StringBuffer();
        while (lhMatcher.find()) {
            double lh = Double.parseDouble(lhMatcher.group(1));
            double newLh = Math.round(lh * (factor + (1 - factor) * 0.5) * 100.0) / 100.0;
            if (newLh < 1.0) newLh = 1.0;
            lhMatcher.appendReplacement(lhSb, "line-height:" + newLh);
        }
        lhMatcher.appendTail(lhSb);

        return lhSb.toString();
    }

    private boolean isOnePage(byte[] pdf) {
        try {
            org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.pdmodel.PDDocument.load(pdf);
            int pages = document.getNumberOfPages();
            document.close();
            return pages <= 1;
        } catch (Exception e) {
            return false;
        }
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
