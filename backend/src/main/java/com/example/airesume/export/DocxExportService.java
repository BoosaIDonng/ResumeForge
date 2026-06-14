package com.example.airesume.export;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import java.math.BigInteger;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTP;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSpacing;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STLineSpacingRule;
import org.springframework.stereotype.Service;

@Service
public class DocxExportService {
    private final ObjectMapper objectMapper;

    public DocxExportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @SuppressWarnings("unchecked")
    public byte[] generateDocx(String resumeDataJson) {
        Map<String, Object> data;
        try {
            data = objectMapper.readValue(resumeDataJson, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("简历数据解析失败", e);
        }

        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Map<String, Object> basics = (Map<String, Object>) data.get("basics");
            if (basics != null) {
                // Name as title
                String name = getString(basics, "name");
                if (name != null && !name.isEmpty()) {
                    addTitle(doc, name);
                }

                // Headline
                String headline = getString(basics, "headline");
                if (headline != null && !headline.isEmpty()) {
                    addSubtitle(doc, headline);
                }

                // Contact info line
                StringBuilder contact = new StringBuilder();
                appendIfPresent(contact, getString(basics, "email"));
                appendIfPresent(contact, getString(basics, "phone"));
                appendIfPresent(contact, getString(basics, "location"));
                appendIfPresent(contact, getString(basics, "website"));
                if (contact.length() > 0) {
                    addNormalParagraph(doc, contact.toString());
                }

                // Custom fields
                List<Map<String, Object>> customFields = (List<Map<String, Object>>) basics.get("customFields");
                if (customFields != null) {
                    for (Map<String, Object> cf : customFields) {
                        String cfName = getString(cf, "name");
                        String cfValue = getString(cf, "value");
                        if (cfName != null && cfValue != null) {
                            addNormalParagraph(doc, cfName + ": " + cfValue);
                        }
                    }
                }
            }

            // Summary
            Map<String, Object> summary = (Map<String, Object>) data.get("summary");
            if (summary != null) {
                Boolean hidden = (Boolean) summary.get("hidden");
                if (hidden == null || !hidden) {
                    String summaryTitle = getString(summary, "title");
                    String summaryContent = getString(summary, "content");
                    if (summaryContent != null && !summaryContent.isEmpty()) {
                        addHeading(doc, summaryTitle != null ? summaryTitle : "个人简介");
                        addNormalParagraph(doc, summaryContent);
                    }
                }
            }

            // Sections
            Map<String, Map<String, Object>> sections = (Map<String, Map<String, Object>>) data.get("sections");
            if (sections != null) {
                for (Map.Entry<String, Map<String, Object>> entry : sections.entrySet()) {
                    Map<String, Object> section = entry.getValue();
                    Boolean secHidden = (Boolean) section.get("hidden");
                    if (secHidden != null && secHidden) {
                        continue;
                    }

                    String sectionTitle = getString(section, "title");
                    if (sectionTitle == null || sectionTitle.isEmpty()) {
                        sectionTitle = entry.getKey();
                    }
                    addHeading(doc, sectionTitle);

                    List<Map<String, Object>> items = (List<Map<String, Object>>) section.get("items");
                    if (items != null) {
                        for (Map<String, Object> item : items) {
                            renderSectionItem(doc, item);
                        }
                    }
                }
            }

            // Custom sections
            List<Map<String, Object>> customSections = (List<Map<String, Object>>) data.get("customSections");
            if (customSections != null) {
                for (Map<String, Object> cs : customSections) {
                    Boolean csHidden = (Boolean) cs.get("hidden");
                    if (csHidden != null && csHidden) {
                        continue;
                    }
                    String csTitle = getString(cs, "title");
                    if (csTitle != null && !csTitle.isEmpty()) {
                        addHeading(doc, csTitle);
                    }
                    List<Map<String, Object>> items = (List<Map<String, Object>>) cs.get("items");
                    if (items != null) {
                        for (Map<String, Object> item : items) {
                            renderSectionItem(doc, item);
                        }
                    }
                }
            }

            doc.write(out);
            return out.toByteArray();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("DOCX生成失败: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private void renderSectionItem(XWPFDocument doc, Map<String, Object> item) {
        // Try to show a primary line (company/org + title, or school + degree, etc.)
        String primary = coalesce(
            getString(item, "company"),
            getString(item, "organization"),
            getString(item, "institution"),
            getString(item, "school"),
            getString(item, "name")
        );
        String secondary = coalesce(
            getString(item, "position"),
            getString(item, "title"),
            getString(item, "degree"),
            getString(item, "role")
        );
        String dateRange = buildDateRange(item);
        String location = getString(item, "location");

        if (primary != null || secondary != null) {
            StringBuilder line = new StringBuilder();
            if (primary != null) {
                line.append(primary);
            }
            if (secondary != null) {
                if (line.length() > 0) line.append(" - ");
                line.append(secondary);
            }
            XWPFParagraph para = doc.createParagraph();
            XWPFRun run = para.createRun();
            run.setBold(true);
            run.setText(line.toString());
            run.setFontSize(11);

            // Date and location on the same run or a sub-line
            if (dateRange != null || location != null) {
                XWPFParagraph subPara = doc.createParagraph();
                XWPFRun subRun = subPara.createRun();
                subRun.setColor("666666");
                subRun.setFontSize(10);
                StringBuilder sub = new StringBuilder();
                if (dateRange != null) sub.append(dateRange);
                if (location != null) {
                    if (sub.length() > 0) sub.append(" | ");
                    sub.append(location);
                }
                subRun.setText(sub.toString());
            }
        }

        // Summary or description as bullet text
        String summary = getString(item, "summary");
        if (summary != null && !summary.isEmpty()) {
            addBullet(doc, summary);
        }
        String description = getString(item, "description");
        if (description != null && !description.isEmpty()) {
            addBullet(doc, description);
        }

        // Highlights
        List<String> highlights = (List<String>) item.get("highlights");
        if (highlights != null) {
            for (String h : highlights) {
                addBullet(doc, h);
            }
        }

        // Skills list
        List<String> skills = (List<String>) item.get("skills");
        if (skills != null && !skills.isEmpty()) {
            addBullet(doc, String.join(", ", skills));
        }

        // Keywords list
        List<String> keywords = (List<String>) item.get("keywords");
        if (keywords != null && !keywords.isEmpty()) {
            addBullet(doc, String.join(", ", keywords));
        }
    }

    private String buildDateRange(Map<String, Object> item) {
        String start = getString(item, "startDate");
        String end = getString(item, "endDate");
        if (start != null && end != null) {
            return start + " - " + end;
        } else if (start != null) {
            return start + " - 至今";
        } else if (end != null) {
            return end;
        }
        return null;
    }

    private void addTitle(XWPFDocument doc, String text) {
        XWPFParagraph para = doc.createParagraph();
        para.setAlignment(org.apache.poi.xwpf.usermodel.ParagraphAlignment.CENTER);
        XWPFRun run = para.createRun();
        run.setBold(true);
        run.setFontSize(22);
        run.setText(text);
    }

    private void addSubtitle(XWPFDocument doc, String text) {
        XWPFParagraph para = doc.createParagraph();
        para.setAlignment(org.apache.poi.xwpf.usermodel.ParagraphAlignment.CENTER);
        XWPFRun run = para.createRun();
        run.setColor("555555");
        run.setFontSize(13);
        run.setText(text);
    }

    private void addHeading(XWPFDocument doc, String text) {
        XWPFParagraph para = doc.createParagraph();
        setParagraphSpacing(para, 200, 80);
        // Add a bottom border to simulate a heading underline
        para.getCTP().addNewPPr().addNewPBdr().addNewBottom()
            .setVal(org.openxmlformats.schemas.wordprocessingml.x2006.main.STBorder.SINGLE);
        para.getCTP().getPPr().getPBdr().getBottom().setSz(BigInteger.valueOf(4));
        para.getCTP().getPPr().getPBdr().getBottom().setColor("CCCCCC");

        XWPFRun run = para.createRun();
        run.setBold(true);
        run.setFontSize(14);
        run.setText(text);
    }

    private void addNormalParagraph(XWPFDocument doc, String text) {
        XWPFParagraph para = doc.createParagraph();
        XWPFRun run = para.createRun();
        run.setFontSize(11);
        run.setText(text);
    }

    private void addBullet(XWPFDocument doc, String text) {
        XWPFParagraph para = doc.createParagraph();
        para.setIndentationLeft(720); // ~0.5 inch indent
        XWPFRun run = para.createRun();
        run.setFontSize(11);
        run.setText("• " + text);
    }

    private void setParagraphSpacing(XWPFParagraph para, int before, int after) {
        CTP ctp = para.getCTP();
        CTPPr ppr = ctp.isSetPPr() ? ctp.getPPr() : ctp.addNewPPr();
        CTSpacing spacing = ppr.isSetSpacing() ? ppr.getSpacing() : ppr.addNewSpacing();
        spacing.setBefore(BigInteger.valueOf(before));
        spacing.setAfter(BigInteger.valueOf(after));
        spacing.setLineRule(STLineSpacingRule.AUTO);
    }

    private static String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof String s && !s.isEmpty()) {
            return s;
        }
        return null;
    }

    private static void appendIfPresent(StringBuilder sb, String value) {
        if (value != null) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append(value);
        }
    }

    private static String coalesce(String... values) {
        for (String v : values) {
            if (v != null) return v;
        }
        return null;
    }
}
