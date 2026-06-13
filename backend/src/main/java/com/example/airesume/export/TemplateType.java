package com.example.airesume.export;

public enum TemplateType {
    CLEAN("clean"),
    MODERN("modern"),
    MINIMAL("minimal");

    private final String templateName;

    TemplateType(String templateName) {
        this.templateName = templateName;
    }

    public String getTemplateName() {
        return templateName;
    }

    public static TemplateType fromString(String value) {
        if (value == null || value.isBlank()) return CLEAN;
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return CLEAN;
        }
    }
}
