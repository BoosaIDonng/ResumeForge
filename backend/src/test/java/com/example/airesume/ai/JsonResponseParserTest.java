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
    void rejectsMarkdownWrappedJson() {
        JsonResponseParser parser = new JsonResponseParser();

        assertThatThrownBy(() -> parser.parse("```json\n{\"score\":88}\n```", ScoreResponse.class))
            .isInstanceOf(AiResponseFormatException.class);
    }
}
