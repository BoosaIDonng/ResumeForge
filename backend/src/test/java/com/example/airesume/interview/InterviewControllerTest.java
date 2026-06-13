package com.example.airesume.interview;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.airesume.common.ApiException;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskType;
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
    controllers = InterviewController.class,
    excludeAutoConfiguration = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        RabbitAutoConfiguration.class,
        RedisAutoConfiguration.class,
        FlywayAutoConfiguration.class
    }
)
class InterviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InterviewService interviewService;

    @Test
    void createInterview_shouldReturnSessionAndTaskId() throws Exception {
        InterviewSessionEntity session = new InterviewSessionEntity(1L, 2L, "Java后端", "中级", "技术面", "TECHNICAL");
        AiTaskEntity task = new AiTaskEntity(TaskType.INTERVIEW_QUESTION_GENERATION.name(), 1L, 2L);
        when(interviewService.createSession(1L, 2L, "Java后端", "中级", "技术面", "TECHNICAL")).thenReturn(session);
        when(interviewService.submitQuestionGeneration(any())).thenReturn(task);

        mockMvc.perform(post("/api/interviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"resumeId\":1,\"jobId\":2,\"role\":\"Java后端\",\"level\":\"中级\",\"type\":\"技术面\",\"persona\":\"TECHNICAL\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").exists());
    }

    @Test
    void getInterview_shouldReturnSessionAndQuestions() throws Exception {
        InterviewSessionEntity session = new InterviewSessionEntity(1L, 2L, "前端", "初级", "技术面", null);
        InterviewQuestionEntity q1 = new InterviewQuestionEntity();
        InterviewQuestionEntity q2 = new InterviewQuestionEntity();
        when(interviewService.getSession(1L)).thenReturn(session);
        when(interviewService.getQuestions(1L)).thenReturn(List.of(q1, q2));

        mockMvc.perform(get("/api/interviews/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.session").exists())
            .andExpect(jsonPath("$.data.questions").isArray())
            .andExpect(jsonPath("$.data.questions.length()").value(2));
    }

    @Test
    void getInterview_shouldReturn400WhenNotFound() throws Exception {
        when(interviewService.getSession(99L)).thenThrow(new ApiException("SESSION_NOT_FOUND", "面试会话不存在"));

        mockMvc.perform(get("/api/interviews/99"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("SESSION_NOT_FOUND"));
    }

    @Test
    void answerQuestion_shouldReturnUpdatedQuestion() throws Exception {
        InterviewQuestionEntity question = new InterviewQuestionEntity();
        question.answer("测试回答");
        when(interviewService.answerQuestion(eq(5L), eq("测试回答"))).thenReturn(question);

        mockMvc.perform(post("/api/interviews/1/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"questionId\":5,\"answer\":\"测试回答\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.answer").value("测试回答"));
    }

    @Test
    void submitFeedback_shouldReturnTaskRef() throws Exception {
        AiTaskEntity task = new AiTaskEntity(TaskType.INTERVIEW_FEEDBACK.name(), 1L, 2L);
        when(interviewService.submitFeedback(1L)).thenReturn(task);

        mockMvc.perform(post("/api/interviews/1/feedback"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").exists());
    }

    @Test
    void getFeedback_shouldReturn400WhenNotFound() throws Exception {
        when(interviewService.getFeedback(1L)).thenThrow(new ApiException("FEEDBACK_NOT_FOUND", "面试反馈不存在"));

        mockMvc.perform(get("/api/interviews/1/feedback"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("FEEDBACK_NOT_FOUND"));
    }
}
