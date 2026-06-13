package com.example.airesume.coverletter;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.airesume.common.ApiException;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
    controllers = CoverLetterController.class,
    excludeAutoConfiguration = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        RabbitAutoConfiguration.class,
        RedisAutoConfiguration.class,
        FlywayAutoConfiguration.class
    }
)
class CoverLetterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CoverLetterService coverLetterService;

    @Test
    void submit_shouldReturnTaskRef() throws Exception {
        AiTaskEntity task = new AiTaskEntity(TaskType.COVER_LETTER.name(), 1L, 2L);
        when(coverLetterService.submit(1L, 2L)).thenReturn(task);

        mockMvc.perform(post("/api/cover-letters")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"resumeId\":1,\"jobId\":2,\"tone\":\"formal\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").exists());
    }

    @Test
    void get_shouldReturnCoverLetter() throws Exception {
        CoverLetterEntity entity = new CoverLetterEntity(1L, 2L, "formal", "尊敬的招聘经理...");
        when(coverLetterService.get(1L)).thenReturn(entity);

        mockMvc.perform(get("/api/cover-letters/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").value("尊敬的招聘经理..."))
            .andExpect(jsonPath("$.data.tone").value("formal"));
    }

    @Test
    void get_shouldReturn400WhenNotFound() throws Exception {
        when(coverLetterService.get(99L)).thenThrow(new ApiException("COVER_LETTER_NOT_FOUND", "求职信不存在"));

        mockMvc.perform(get("/api/cover-letters/99"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("COVER_LETTER_NOT_FOUND"));
    }
}
