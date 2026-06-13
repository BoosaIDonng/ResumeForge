package com.example.airesume.resume;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
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
    controllers = ResumeController.class,
    excludeAutoConfiguration = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        RabbitAutoConfiguration.class,
        RedisAutoConfiguration.class,
        FlywayAutoConfiguration.class
    }
)
class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResumeService resumeService;

    @Test
    void createResume_shouldReturn200WithResumeData() throws Exception {
        ResumeEntity entity = new ResumeEntity(0L, "Java简历", true, "{\"sections\":{}}");
        when(resumeService.create("Java简历", true)).thenReturn(entity);

        mockMvc.perform(post("/api/resumes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Java简历\",\"master\":true}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.title").value("Java简历"))
            .andExpect(jsonPath("$.data.master").value(true));
    }

    @Test
    void createResume_withBlankTitle_shouldReturn400() throws Exception {
        mockMvc.perform(post("/api/resumes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"\",\"master\":true}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void listResumes_shouldReturnArray() throws Exception {
        ResumeEntity r1 = new ResumeEntity(0L, "简历A", true, "{}");
        ResumeEntity r2 = new ResumeEntity(0L, "简历B", false, "{}");
        when(resumeService.list()).thenReturn(List.of(r1, r2));

        mockMvc.perform(get("/api/resumes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data.length()").value(2))
            .andExpect(jsonPath("$.data[0].title").value("简历A"));
    }

    @Test
    void getResume_shouldReturnSingleResume() throws Exception {
        ResumeEntity entity = new ResumeEntity(0L, "测试简历", true, "{\"basics\":{}}");
        when(resumeService.get(1L)).thenReturn(entity);

        mockMvc.perform(get("/api/resumes/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.title").value("测试简历"))
            .andExpect(jsonPath("$.data.resumeData").value("{\"basics\":{}}"));
    }

    @Test
    void updateResume_shouldReturnUpdatedResume() throws Exception {
        ResumeEntity entity = new ResumeEntity(0L, "更新后", true, "{\"new\":true}");
        when(resumeService.update(1L, "更新后", "{\"new\":true}")).thenReturn(entity);

        mockMvc.perform(put("/api/resumes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"更新后\",\"resumeData\":\"{\\\"new\\\":true}\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.title").value("更新后"));
    }

    @Test
    void updateResume_withBlankTitle_shouldReturn400() throws Exception {
        mockMvc.perform(put("/api/resumes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"\",\"resumeData\":\"{}\"}"))
            .andExpect(status().isBadRequest());
    }
}
