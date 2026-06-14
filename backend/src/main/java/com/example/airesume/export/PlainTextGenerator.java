package com.example.airesume.export;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class PlainTextGenerator {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public String generate(String resumeDataJson) {
        try {
            JsonNode root = MAPPER.readTree(resumeDataJson);
            JsonNode basics = root.path("basics");
            JsonNode summary = root.path("summary");
            JsonNode sections = root.path("sections");

            StringBuilder sb = new StringBuilder();

            // Header
            sb.append(basics.path("name").asText()).append("\n");
            if (!basics.path("headline").asText().isEmpty()) sb.append(basics.path("headline").asText()).append("\n");
            sb.append(String.join(" | ",
                filterEmpty(basics.path("email").asText()),
                filterEmpty(basics.path("phone").asText()),
                filterEmpty(basics.path("location").asText()),
                filterEmpty(basics.path("website").asText())
            )).append("\n");
            sb.append("=".repeat(50)).append("\n\n");

            // Summary
            if (!summary.isMissingNode() && !summary.path("hidden").asBoolean(false) && !summary.path("content").asText().isEmpty()) {
                sb.append(summary.path("title").asText("个人总结").toUpperCase()).append("\n");
                sb.append(summary.path("content").asText()).append("\n\n");
            }

            // Sections
            String[] order = {"experience", "projects", "education", "skills", "languages", "certifications", "awards"};
            for (String key : order) {
                JsonNode section = sections.path(key);
                if (section.isMissingNode() || section.path("hidden").asBoolean(false)) continue;
                JsonNode items = section.path("items");
                if (!items.isArray() || items.isEmpty()) continue;

                sb.append(section.path("title").asText(key).toUpperCase()).append("\n");

                switch (key) {
                    case "experience" -> {
                        for (JsonNode item : items) {
                            sb.append("  ").append(item.path("company").asText());
                            if (!item.path("period").asText().isEmpty()) sb.append(" (").append(item.path("period").asText()).append(")");
                            sb.append("\n");
                            sb.append("  ").append(item.path("position").asText()).append("\n");
                            if (!item.path("description").asText().isEmpty()) sb.append("  * ").append(item.path("description").asText()).append("\n");
                            sb.append("\n");
                        }
                    }
                    case "projects" -> {
                        for (JsonNode item : items) {
                            sb.append("  ").append(item.path("name").asText());
                            if (!item.path("period").asText().isEmpty()) sb.append(" (").append(item.path("period").asText()).append(")");
                            sb.append("\n");
                            sb.append("  ").append(item.path("role").asText()).append("\n");
                            if (!item.path("description").asText().isEmpty()) sb.append("  * ").append(item.path("description").asText()).append("\n");
                            sb.append("\n");
                        }
                    }
                    case "education" -> {
                        for (JsonNode item : items) {
                            sb.append("  ").append(item.path("school").asText());
                            if (!item.path("period").asText().isEmpty()) sb.append(" (").append(item.path("period").asText()).append(")");
                            sb.append("\n");
                            sb.append("  ").append(item.path("degree").asText());
                            if (!item.path("area").asText().isEmpty()) sb.append(" · ").append(item.path("area").asText());
                            sb.append("\n\n");
                        }
                    }
                    case "skills" -> {
                        for (JsonNode item : items) {
                            sb.append("  * ").append(item.path("name").asText());
                            if (item.has("level")) sb.append(" (").append(item.path("level").asInt()).append("/5)");
                            sb.append("\n");
                        }
                        sb.append("\n");
                    }
                    case "languages" -> {
                        for (JsonNode item : items) {
                            sb.append("  * ").append(item.path("name").asText());
                            if (!item.path("level").asText().isEmpty()) sb.append(" - ").append(item.path("level").asText());
                            sb.append("\n");
                        }
                        sb.append("\n");
                    }
                    case "certifications" -> {
                        for (JsonNode item : items) {
                            sb.append("  * ").append(item.path("name").asText());
                            if (!item.path("issuer").asText().isEmpty()) sb.append(" - ").append(item.path("issuer").asText());
                            sb.append("\n");
                        }
                        sb.append("\n");
                    }
                    case "awards" -> {
                        for (JsonNode item : items) {
                            sb.append("  * ").append(item.path("title").asText());
                            if (!item.path("issuer").asText().isEmpty()) sb.append(" - ").append(item.path("issuer").asText());
                            sb.append("\n");
                        }
                        sb.append("\n");
                    }
                }
            }

            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Plain text generation failed", e);
        }
    }

    private String filterEmpty(String s) {
        return (s == null || s.isEmpty()) ? "" : s;
    }
}
