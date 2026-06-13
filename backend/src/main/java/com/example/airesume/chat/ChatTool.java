package com.example.airesume.chat;

import java.util.Map;

public record ChatTool(
    String name,
    String description,
    Map<String, Object> parameters
) {
    public static ChatTool updateResume() {
        return new ChatTool(
            "update_resume_field",
            "更新简历中的指定字段。path 使用点号分隔如 basics.summary 或 sections.experience.items[0].summary",
            Map.of(
                "type", "object",
                "properties", Map.of(
                    "path", Map.of("type", "string", "description", "要修改的字段路径"),
                    "value", Map.of("type", "string", "description", "新的值")
                ),
                "required", java.util.List.of("path", "value")
            )
        );
    }

    public static ChatTool addSkill() {
        return new ChatTool(
            "add_skill",
            "为简历添加一项技能",
            Map.of(
                "type", "object",
                "properties", Map.of(
                    "name", Map.of("type", "string", "description", "技能类别名称"),
                    "keywords", Map.of("type", "array", "items", Map.of("type", "string"), "description", "具体技能关键词列表")
                ),
                "required", java.util.List.of("name", "keywords")
            )
        );
    }

    public static ChatTool improveText() {
        return new ChatTool(
            "improve_text",
            "优化简历中某个字段的文本表述",
            Map.of(
                "type", "object",
                "properties", Map.of(
                    "path", Map.of("type", "string", "description", "要优化的字段路径"),
                    "improved_text", Map.of("type", "string", "description", "优化后的文本")
                ),
                "required", java.util.List.of("path", "improved_text")
            )
        );
    }
}
