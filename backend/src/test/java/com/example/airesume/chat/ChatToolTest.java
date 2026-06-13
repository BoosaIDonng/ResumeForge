package com.example.airesume.chat;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ChatToolTest {
    @Test
    void updateResumeToolHasCorrectStructure() {
        ChatTool tool = ChatTool.updateResume();
        assertThat(tool.name()).isEqualTo("update_resume_field");
        assertThat(tool.parameters()).containsKey("properties");
    }

    @Test
    void addSkillToolHasCorrectStructure() {
        ChatTool tool = ChatTool.addSkill();
        assertThat(tool.name()).isEqualTo("add_skill");
        assertThat(tool.description()).contains("技能");
    }

    @Test
    void improveTextToolHasCorrectStructure() {
        ChatTool tool = ChatTool.improveText();
        assertThat(tool.name()).isEqualTo("improve_text");
        assertThat(tool.parameters()).containsKey("required");
    }
}
