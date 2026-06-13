package com.example.airesume.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class JsonResponseParserTest {
    record ScoreResponse(int score, String summary) {
    }

    @Test
    void parsesPlainJson() {
        JsonResponseParser parser = new JsonResponseParser();

        ScoreResponse response = parser.parse("{\"score\":88,\"summary\":\"匹配度较高\"}", ScoreResponse.class);

        assertThat(response.score()).isEqualTo(88);
        assertThat(response.summary()).isEqualTo("匹配度较高");
    }

    @Test
    void parsesMarkdownWrappedJson() {
        JsonResponseParser parser = new JsonResponseParser();

        ScoreResponse response = parser.parse("```json\n{\"score\":88,\"summary\":\"好\"}\n```", ScoreResponse.class);

        assertThat(response.score()).isEqualTo(88);
        assertThat(response.summary()).isEqualTo("好");
    }

    @Test
    void parsesWithThinkBlockPrefix() {
        JsonResponseParser parser = new JsonResponseParser();

        String input = "<think>Let me analyze this resume...</think>{\"score\":92,\"summary\":\"非常匹配\"}";
        ScoreResponse response = parser.parse(input, ScoreResponse.class);

        assertThat(response.score()).isEqualTo(92);
        assertThat(response.summary()).isEqualTo("非常匹配");
    }

    @Test
    void parsesWithMultiLineThinkBlock() {
        JsonResponseParser parser = new JsonResponseParser();

        String input = "<think>\nThis is a complex reasoning block.\nLine 2.\n</think>\n{\"score\":75,\"summary\":\"一般\"}";
        ScoreResponse response = parser.parse(input, ScoreResponse.class);

        assertThat(response.score()).isEqualTo(75);
        assertThat(response.summary()).isEqualTo("一般");
    }

    @Test
    void parsesFromMarkdownCodeFence() {
        JsonResponseParser parser = new JsonResponseParser();

        String input = "Here is the result:\n```json\n{\"score\":60,\"summary\":\"匹配度一般\"}\n```\nHope this helps!";
        ScoreResponse response = parser.parse(input, ScoreResponse.class);

        assertThat(response.score()).isEqualTo(60);
        assertThat(response.summary()).isEqualTo("匹配度一般");
    }

    @Test
    void parsesFromMarkdownFenceWithoutJsonLabel() {
        JsonResponseParser parser = new JsonResponseParser();

        String input = "```\n{\"score\":55,\"summary\":\"较低\"}\n```";
        ScoreResponse response = parser.parse(input, ScoreResponse.class);

        assertThat(response.score()).isEqualTo(55);
        assertThat(response.summary()).isEqualTo("较低");
    }

    @Test
    void parsesWithTrailingCommas() {
        JsonResponseParser parser = new JsonResponseParser();

        String input = "{\"score\":70,\"summary\":\"还行\",}";
        ScoreResponse response = parser.parse(input, ScoreResponse.class);

        assertThat(response.score()).isEqualTo(70);
        assertThat(response.summary()).isEqualTo("还行");
    }

    @Test
    void bruteForceExtractsJsonFromSurroundingText() {
        JsonResponseParser parser = new JsonResponseParser();

        String input = "Based on my analysis, the result is: {\"score\":85,\"summary\":\"高度匹配\"} and that's it.";
        ScoreResponse response = parser.parse(input, ScoreResponse.class);

        assertThat(response.score()).isEqualTo(85);
        assertThat(response.summary()).isEqualTo("高度匹配");
    }

    @Test
    void bruteForceExtractsNestedJson() {
        JsonResponseParser parser = new JsonResponseParser();

        String input = "Sure! Here you go:\n\n{\"score\":99,\"summary\":\"完美匹配\"}\n\nLet me know if you need more.";
        ScoreResponse response = parser.parse(input, ScoreResponse.class);

        assertThat(response.score()).isEqualTo(99);
        assertThat(response.summary()).isEqualTo("完美匹配");
    }

    @Test
    void throwsOnNullInput() {
        JsonResponseParser parser = new JsonResponseParser();

        assertThatThrownBy(() -> parser.parse(null, ScoreResponse.class))
            .isInstanceOf(AiResponseFormatException.class)
            .hasMessageContaining("响应为空");
    }

    @Test
    void throwsOnBlankInput() {
        JsonResponseParser parser = new JsonResponseParser();

        assertThatThrownBy(() -> parser.parse("   ", ScoreResponse.class))
            .isInstanceOf(AiResponseFormatException.class)
            .hasMessageContaining("响应为空");
    }

    @Test
    void throwsOnUnparseableContent() {
        JsonResponseParser parser = new JsonResponseParser();

        assertThatThrownBy(() -> parser.parse("This is just plain text with no JSON.", ScoreResponse.class))
            .isInstanceOf(AiResponseFormatException.class)
            .hasMessageContaining("多步修复后仍无法解析");
    }
}
