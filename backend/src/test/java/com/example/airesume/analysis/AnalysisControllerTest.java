package com.example.airesume.analysis;

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
    controllers = AnalysisController.class,
    excludeAutoConfiguration = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        RabbitAutoConfiguration.class,
        RedisAutoConfiguration.class,
        FlywayAutoConfiguration.class
    }
)
class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalysisService analysisService;

    @Test
    void submitJdMatch_shouldReturnTaskRef() throws Exception {
        AiTaskEntity task = new AiTaskEntity(TaskType.JD_ANALYSIS.name(), 1L, 2L);
        when(analysisService.submitJdAnalysis(1L, 2L)).thenReturn(task);

        mockMvc.perform(post("/api/analysis/jd-match")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"resumeId\":1,\"jobId\":2}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").exists());
    }

    @Test
    void getReport_shouldReturnReport() throws Exception {
        AnalysisReportEntity report = new AnalysisReportEntity(1L, 2L, 85, 90, "[\"Java\"]", "[\"K8s\"]", "[\"建议1\"]", "匹配度较高");
        when(analysisService.getReport(1L)).thenReturn(report);

        mockMvc.perform(get("/api/analysis/reports/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.overallScore").value(85))
            .andExpect(jsonPath("$.data.atsScore").value(90))
            .andExpect(jsonPath("$.data.summary").value("匹配度较高"));
    }

    @Test
    void getReport_shouldReturn400WhenNotFound() throws Exception {
        when(analysisService.getReport(99L)).thenThrow(new ApiException("REPORT_NOT_FOUND", "分析报告不存在"));

        mockMvc.perform(get("/api/analysis/reports/99"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("REPORT_NOT_FOUND"));
    }
}
