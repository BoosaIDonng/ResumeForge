package com.example.airesume.export;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Iterator;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class HtmlGenerator {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public String generate(String resumeDataJson, String template) {
        try {
            JsonNode root = MAPPER.readTree(resumeDataJson);
            JsonNode basics = root.path("basics");
            JsonNode summary = root.path("summary");
            JsonNode sections = root.path("sections");

            String primaryColor = getTemplateColor(template);
            String fontFamily = getTemplateFont(template);

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html lang=\"zh\"><head><meta charset=\"UTF-8\">");
            html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.append("<title>").append(esc(basics.path("name").asText("简历"))).append("</title>");
            html.append("<style>");
            html.append(getCss(template, primaryColor, fontFamily));
            html.append("</style></head><body>");

            // Header
            html.append("<div class=\"header\">");
            html.append("<h1>").append(esc(basics.path("name").asText())).append("</h1>");
            if (basics.path("headline").asText().isEmpty() == false) {
                html.append("<p class=\"headline\">").append(esc(basics.path("headline").asText())).append("</p>");
            }
            html.append("<p class=\"contact\">");
            appendIfNotEmpty(html, basics.path("email").asText());
            appendIfNotEmpty(html, basics.path("phone").asText());
            appendIfNotEmpty(html, basics.path("location").asText());
            appendIfNotEmpty(html, basics.path("website").asText());
            html.append("</p></div>");

            // Summary
            if (!summary.isMissingNode() && !summary.path("content").asText().isEmpty()) {
                if (!summary.path("hidden").asBoolean(false)) {
                    html.append("<section><h2>").append(esc(summary.path("title").asText("个人总结"))).append("</h2>");
                    html.append("<p class=\"summary-text\">").append(esc(summary.path("content").asText())).append("</p></section>");
                }
            }

            // Sections
            String[] sectionOrder = {"profiles", "experience", "projects", "education", "skills", "languages", "certifications", "awards"};
            for (String key : sectionOrder) {
                JsonNode section = sections.path(key);
                if (section.isMissingNode() || section.path("hidden").asBoolean(false)) continue;
                JsonNode items = section.path("items");
                if (!items.isArray() || items.isEmpty()) continue;

                html.append("<section><h2>").append(esc(section.path("title").asText(key))).append("</h2>");
                renderSection(html, key, items);
                html.append("</section>");
            }

            // Custom sections
            JsonNode customSections = root.path("customSections");
            if (customSections.isArray()) {
                for (JsonNode cs : customSections) {
                    if (cs.path("hidden").asBoolean(false)) continue;
                    JsonNode items = cs.path("items");
                    if (!items.isArray() || items.isEmpty()) continue;
                    html.append("<section><h2>").append(esc(cs.path("title").asText("自定义"))).append("</h2>");
                    for (JsonNode item : items) {
                        html.append("<div class=\"item\">");
                        String name = item.has("name") ? item.path("name").asText() : item.path("title").asText("");
                        if (!name.isEmpty()) html.append("<strong>").append(esc(name)).append("</strong> ");
                        String desc = item.path("description").asText("");
                        if (!desc.isEmpty()) html.append("<p>").append(esc(desc)).append("</p>");
                        html.append("</div>");
                    }
                    html.append("</section>");
                }
            }

            html.append("</body></html>");
            return html.toString();
        } catch (Exception e) {
            throw new RuntimeException("HTML generation failed", e);
        }
    }

    private void renderSection(StringBuilder html, String key, JsonNode items) {
        switch (key) {
            case "profiles" -> {
                for (JsonNode item : items) {
                    html.append("<div class=\"item\">");
                    html.append("<strong>").append(esc(item.path("network").asText())).append("</strong>: ");
                    html.append(esc(item.path("username").asText()));
                    if (!item.path("url").asText().isEmpty()) {
                        html.append(" (<a href=\"").append(esc(item.path("url").asText())).append("\">").append(esc(item.path("url").asText())).append("</a>)");
                    }
                    html.append("</div>");
                }
            }
            case "experience" -> {
                for (JsonNode item : items) {
                    html.append("<div class=\"item\">");
                    html.append("<div class=\"item-header\"><strong>").append(esc(item.path("company").asText())).append("</strong>");
                    html.append("<span class=\"period\">").append(esc(item.path("period").asText())).append("</span></div>");
                    html.append("<div class=\"item-sub\">").append(esc(item.path("position").asText()));
                    if (!item.path("location").asText().isEmpty()) html.append(" · ").append(esc(item.path("location").asText()));
                    html.append("</div>");
                    if (!item.path("description").asText().isEmpty()) html.append("<p>").append(esc(item.path("description").asText())).append("</p>");
                    html.append("</div>");
                }
            }
            case "projects" -> {
                for (JsonNode item : items) {
                    html.append("<div class=\"item\">");
                    html.append("<div class=\"item-header\"><strong>").append(esc(item.path("name").asText())).append("</strong>");
                    if (!item.path("period").asText().isEmpty()) html.append("<span class=\"period\">").append(esc(item.path("period").asText())).append("</span>");
                    html.append("</div>");
                    html.append("<div class=\"item-sub\">").append(esc(item.path("role").asText())).append("</div>");
                    if (!item.path("description").asText().isEmpty()) html.append("<p>").append(esc(item.path("description").asText())).append("</p>");
                    html.append("</div>");
                }
            }
            case "education" -> {
                for (JsonNode item : items) {
                    html.append("<div class=\"item\">");
                    html.append("<div class=\"item-header\"><strong>").append(esc(item.path("school").asText())).append("</strong>");
                    html.append("<span class=\"period\">").append(esc(item.path("period").asText())).append("</span></div>");
                    html.append("<div class=\"item-sub\">").append(esc(item.path("degree").asText()));
                    if (!item.path("area").asText().isEmpty()) html.append(" · ").append(esc(item.path("area").asText()));
                    html.append("</div>");
                    if (!item.path("description").asText().isEmpty()) html.append("<p>").append(esc(item.path("description").asText())).append("</p>");
                    html.append("</div>");
                }
            }
            case "skills" -> {
                html.append("<div class=\"skills-list\">");
                for (JsonNode item : items) {
                    html.append("<span class=\"skill-tag\">").append(esc(item.path("name").asText()));
                    if (item.has("level")) html.append(" ★").append(item.path("level").asInt());
                    html.append("</span>");
                }
                html.append("</div>");
            }
            case "languages" -> {
                for (JsonNode item : items) {
                    html.append("<div class=\"item\">");
                    html.append("<strong>").append(esc(item.path("name").asText())).append("</strong>");
                    if (!item.path("level").asText().isEmpty()) html.append(" — ").append(esc(item.path("level").asText()));
                    html.append("</div>");
                }
            }
            case "certifications" -> {
                for (JsonNode item : items) {
                    html.append("<div class=\"item\">");
                    html.append("<strong>").append(esc(item.path("name").asText())).append("</strong>");
                    if (!item.path("issuer").asText().isEmpty()) html.append(" — ").append(esc(item.path("issuer").asText()));
                    if (!item.path("date").asText().isEmpty()) html.append(" <span class=\"period\">").append(esc(item.path("date").asText())).append("</span>");
                    html.append("</div>");
                }
            }
            case "awards" -> {
                for (JsonNode item : items) {
                    html.append("<div class=\"item\">");
                    html.append("<strong>").append(esc(item.path("title").asText())).append("</strong>");
                    if (!item.path("issuer").asText().isEmpty()) html.append(" — ").append(esc(item.path("issuer").asText()));
                    if (!item.path("date").asText().isEmpty()) html.append(" <span class=\"period\">").append(esc(item.path("date").asText())).append("</span>");
                    if (!item.path("description").asText().isEmpty()) html.append("<p>").append(esc(item.path("description").asText())).append("</p>");
                    html.append("</div>");
                }
            }
        }
    }

    private String getCss(String template, String primary, String font) {
        return """
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: %s; color: #18181b; line-height: 1.6; max-width: 210mm; margin: 0 auto; padding: 24px; }
            .header { text-align: center; border-bottom: 2px solid %s; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { font-size: 28px; color: %s; }
            .headline { font-size: 16px; color: #52525b; margin-top: 4px; }
            .contact { font-size: 13px; color: #71717a; margin-top: 8px; }
            section { margin-bottom: 16px; }
            h2 { font-size: 16px; color: %s; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .item { margin-bottom: 10px; }
            .item-header { display: flex; justify-content: space-between; align-items: baseline; }
            .item-sub { font-size: 14px; color: #52525b; }
            .period { font-size: 12px; color: #a1a1aa; }
            .summary-text { font-size: 14px; color: #3f3f46; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background: %s15; color: %s; padding: 2px 10px; border-radius: 12px; font-size: 13px; }
            p { font-size: 14px; color: #3f3f46; margin-top: 4px; white-space: pre-wrap; }
            a { color: %s; text-decoration: none; }
            @media print { body { padding: 0; } }
            """.formatted(font, primary, primary, primary, primary, primary, primary, primary);
    }

    private String getTemplateColor(String template) {
        if (template == null) return "#2563eb";
        return switch (template) {
            case "modern" -> "#1e40af";
            case "classic" -> "#18181b";
            case "minimal" -> "#52525b";
            default -> "#2563eb";
        };
    }

    private String getTemplateFont(String template) {
        if (template == null) return "Inter, system-ui, sans-serif";
        return switch (template) {
            case "classic" -> "Georgia, 'Times New Roman', serif";
            case "minimal" -> "'Helvetica Neue', Arial, sans-serif";
            default -> "Inter, system-ui, sans-serif";
        };
    }

    private String esc(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private void appendIfNotEmpty(StringBuilder sb, String value) {
        if (value != null && !value.isEmpty()) {
            if (sb.length() > 0 && sb.charAt(sb.length() - 1) != '>') sb.append(" | ");
            sb.append(esc(value));
        }
    }
}
