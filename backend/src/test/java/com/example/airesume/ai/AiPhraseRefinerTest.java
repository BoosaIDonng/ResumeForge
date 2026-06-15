package com.example.airesume.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AiPhraseRefinerTest {
    private final AiPhraseRefiner refiner = new AiPhraseRefiner();

    @Test
    void replacesOverusedActionVerbs() {
        String input = "Spearheaded the development of a cutting-edge platform";
        String result = refiner.refine(input);
        assertThat(result).containsIgnoringCase("led");
        assertThat(result).containsIgnoringCase("modern");
        assertThat(result).doesNotContainIgnoringCase("Spearheaded");
        assertThat(result).doesNotContain("cutting-edge");
    }

    @Test
    void replacesFillerPhrases() {
        String input = "In order to improve efficiency, due to the fact that the system was slow";
        String result = refiner.refine(input);
        assertThat(result).containsIgnoringCase("to improve");
        assertThat(result).contains("because");
        assertThat(result).doesNotContain("In order to");
        assertThat(result).doesNotContain("due to the fact that");
    }

    @Test
    void normalizesEmDashes() {
        String input = "Built the backend—integrated Redis";
        String result = refiner.refine(input);
        assertThat(result).contains(" - ");
        assertThat(result).doesNotContain("—");
    }

    @Test
    void preservesNormalText() {
        String input = "Developed REST APIs using Spring Boot and deployed to AWS";
        String result = refiner.refine(input);
        assertThat(result).isEqualTo(input);
    }
}
