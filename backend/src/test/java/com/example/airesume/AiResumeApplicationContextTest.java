package com.example.airesume;

import com.example.airesume.ai.AiClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.NONE
)
class AiResumeApplicationContextTest {

    @MockBean
    private AiClient aiClient;

    @Test
    void contextLoads() {
    }
}
