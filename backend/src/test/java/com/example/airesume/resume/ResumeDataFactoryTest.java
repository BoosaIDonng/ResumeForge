package com.example.airesume.resume;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ResumeDataFactoryTest {
    @Test
    void createsDefaultResumeJsonWithRequiredSections() {
        String json = ResumeDataFactory.defaultResumeData();

        assertThat(json).contains("\"basics\"");
        assertThat(json).contains("\"summary\"");
        assertThat(json).contains("\"sections\"");
        assertThat(json).contains("\"experience\"");
        assertThat(json).contains("\"projects\"");
        assertThat(json).contains("\"skills\"");
    }
}
