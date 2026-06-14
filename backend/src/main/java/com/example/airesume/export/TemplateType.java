package com.example.airesume.export;

public enum TemplateType {
    CLEAN("clean", "简洁", "经典简洁的简历布局，适合大多数行业"),
    MODERN("modern", "现代", "深色头部设计，现代感强烈"),
    MINIMAL("minimal", "极简", "极简风格，大量留白，优雅克制"),
    PROFESSIONAL("professional", "专业", "蓝色主题，专业稳重，适合商务领域"),
    EXECUTIVE("executive", "高管", "深色调，庄重大气，适合管理层"),
    CREATIVE("creative", "创意", "色彩丰富，个性化布局，适合设计行业"),
    TIMELINE("timeline", "时间线", "时间轴设计，清晰展示职业发展历程"),
    TWO_COLUMN("two_column", "双栏", "双栏布局，信息密度高，层次分明"),
    SIDEBAR("sidebar", "侧边栏", "侧边栏设计，个人信息与经历分栏展示"),
    COMPACT("compact", "紧凑", "紧凑排版，适合内容丰富的简历"),
    ATS_FRIENDLY("ats_friendly", "ATS友好", "针对ATS系统优化，纯文本结构，高可读性"),
    ELEGANT("elegant", "优雅", "精致排版，衬线字体，学术与文化行业首选"),
    ACADEMIC("academic", "学术", "学术风格，突出教育背景与研究成果");

    private final String templateName;
    private final String displayName;
    private final String description;

    TemplateType(String templateName, String displayName, String description) {
        this.templateName = templateName;
        this.displayName = displayName;
        this.description = description;
    }

    public String getTemplateName() {
        return templateName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
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
