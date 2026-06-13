package com.example.airesume.interview;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class InterviewPromptBuilderTest {
    @Test
    void questionPromptIncludesRoleLevelTypeAndTechStack() {
        InterviewPromptBuilder builder = new InterviewPromptBuilder();

        String prompt = builder.questionPrompt("Java 后端工程师", "初级", "技术面", "Spring Boot, Redis", 5);

        assertThat(prompt).contains("Java 后端工程师");
        assertThat(prompt).contains("初级");
        assertThat(prompt).contains("技术面");
        assertThat(prompt).contains("Spring Boot, Redis");
        assertThat(prompt).contains("5");
    }

    @Test
    void feedbackPromptIncludesTranscript() {
        InterviewPromptBuilder builder = new InterviewPromptBuilder();

        String prompt = builder.feedbackPrompt("Java 后端", "中级", "技术面", "Q: 什么是IoC? A: 控制反转");

        assertThat(prompt).contains("Java 后端");
        assertThat(prompt).contains("Q: 什么是IoC?");
    }

    @Test
    void questionSystemPromptWithPersonaIncludesPersonaName() {
        InterviewPromptBuilder builder = new InterviewPromptBuilder();

        String hrPrompt = builder.questionSystemPrompt(InterviewerPersona.HR);
        assertThat(hrPrompt).contains("李雯");
        assertThat(hrPrompt).contains("HR总监");

        String techPrompt = builder.questionSystemPrompt(InterviewerPersona.TECHNICAL);
        assertThat(techPrompt).contains("张明");

        String archPrompt = builder.questionSystemPrompt(InterviewerPersona.ARCHITECTURE);
        assertThat(archPrompt).contains("王强");

        String leaderPrompt = builder.questionSystemPrompt(InterviewerPersona.LEADERSHIP);
        assertThat(leaderPrompt).contains("赵伟");
    }

    @Test
    void questionSystemPromptWithoutPersonaDefaultsToTechnical() {
        InterviewPromptBuilder builder = new InterviewPromptBuilder();

        String defaultPrompt = builder.questionSystemPrompt();
        String technicalPrompt = builder.questionSystemPrompt(InterviewerPersona.TECHNICAL);

        assertThat(defaultPrompt).isEqualTo(technicalPrompt);
    }
}
