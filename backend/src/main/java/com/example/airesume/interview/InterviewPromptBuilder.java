package com.example.airesume.interview;

import org.springframework.stereotype.Component;

@Component
public class InterviewPromptBuilder {

    public String questionSystemPrompt(InterviewerPersona persona) {
        return persona.getSystemPromptPrefix() + """
            \n\n请根据以上身份生成面试问题。输出为 JSON 数组，每个元素是一个字符串问题。\
            不要使用特殊符号和 Markdown 格式。只输出 JSON 数组，不要其他内容。""";
    }

    // Backward compatible overload — defaults to TECHNICAL persona
    public String questionSystemPrompt() {
        return questionSystemPrompt(InterviewerPersona.TECHNICAL);
    }

    public String questionPrompt(String role, String level, String type, String techStack, int amount) {
        return """
            为以下岗位生成 %d 道面试题：
            岗位: %s
            级别: %s
            面试类型: %s
            技术栈: %s

            返回 JSON 字符串数组。""".formatted(amount, role, level, type, techStack);
    }

    public String feedbackSystemPrompt() {
        return """
            你是一位资深的面试评估专家。根据面试记录生成评估报告。\
            输出 JSON 格式，包含以下字段：\
            totalScore (0-100整数), \
            categoryScores (数组，每项含 name, score, comment), \
            strengths (字符串数组), \
            areasForImprovement (字符串数组), \
            finalAssessment (字符串), \
            improvementPlan (字符串数组，3-5条具体改进建议)。\
            只输出 JSON，不要 Markdown 格式。""";
    }

    public String feedbackPrompt(String role, String level, String type, String transcript) {
        return """
            评估以下面试记录：
            岗位: %s
            级别: %s
            面试类型: %s

            面试记录:
            %s""".formatted(role, level, type, transcript);
    }
}
