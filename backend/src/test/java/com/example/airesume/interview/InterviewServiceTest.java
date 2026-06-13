package com.example.airesume.interview;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.airesume.common.ApiException;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InterviewServiceTest {

    private InterviewSessionRepository sessionRepository;
    private InterviewQuestionRepository questionRepository;
    private InterviewFeedbackRepository feedbackRepository;
    private TaskService taskService;
    private InterviewService service;

    @BeforeEach
    void setUp() {
        sessionRepository = mock(InterviewSessionRepository.class);
        questionRepository = mock(InterviewQuestionRepository.class);
        feedbackRepository = mock(InterviewFeedbackRepository.class);
        taskService = mock(TaskService.class);
        service = new InterviewService(sessionRepository, questionRepository, feedbackRepository, taskService);
    }

    @Test
    void createSession_savesAndReturnsSession() {
        when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InterviewSessionEntity session = service.createSession(1L, 2L, "Java后端", "中级", "技术面", "TECHNICAL");

        assertThat(session.getResumeId()).isEqualTo(1L);
        assertThat(session.getJobId()).isEqualTo(2L);
        assertThat(session.getRole()).isEqualTo("Java后端");
        assertThat(session.getLevel()).isEqualTo("中级");
        assertThat(session.getType()).isEqualTo("技术面");
        verify(sessionRepository).save(any(InterviewSessionEntity.class));
    }

    @Test
    void createSession_withoutPersona_usesOverloadedMethod() {
        when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InterviewSessionEntity session = service.createSession(1L, 2L, "Java后端", "高级", "行为面");

        assertThat(session.getRole()).isEqualTo("Java后端");
        assertThat(session.getLevel()).isEqualTo("高级");
    }

    @Test
    void getSession_throwsWhenNotFound() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getSession(99L))
            .isInstanceOf(ApiException.class)
            .hasMessage("面试会话不存在");
    }

    @Test
    void getSession_returnsExistingSession() {
        InterviewSessionEntity entity = new InterviewSessionEntity(1L, 2L, "前端", "初级", "技术面", null);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(entity));

        InterviewSessionEntity result = service.getSession(1L);

        assertThat(result).isSameAs(entity);
    }

    @Test
    void answerQuestion_updatesAnswer() {
        InterviewQuestionEntity question = new InterviewQuestionEntity();
        when(questionRepository.findById(5L)).thenReturn(Optional.of(question));
        when(questionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InterviewQuestionEntity result = service.answerQuestion(5L, "我的回答是...");

        assertThat(result.getAnswer()).isEqualTo("我的回答是...");
        verify(questionRepository).save(question);
    }

    @Test
    void answerQuestion_throwsWhenQuestionNotFound() {
        when(questionRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.answerQuestion(404L, "answer"))
            .isInstanceOf(ApiException.class)
            .hasMessage("面试题目不存在");
    }

    @Test
    void getQuestions_delegatesToRepository() {
        InterviewQuestionEntity q1 = new InterviewQuestionEntity();
        InterviewQuestionEntity q2 = new InterviewQuestionEntity();
        when(questionRepository.findBySessionIdOrderBySortOrder(1L)).thenReturn(List.of(q1, q2));

        List<InterviewQuestionEntity> result = service.getQuestions(1L);

        assertThat(result).hasSize(2);
    }

    @Test
    void submitQuestionGeneration_createsTaskWithCorrectType() {
        InterviewSessionEntity session = new InterviewSessionEntity(10L, 20L, "后端", "中级", "技术面", null);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        AiTaskEntity task = new AiTaskEntity(TaskType.INTERVIEW_QUESTION_GENERATION.name(), 10L, 20L);
        when(taskService.create(TaskType.INTERVIEW_QUESTION_GENERATION, 10L, 20L)).thenReturn(task);

        AiTaskEntity result = service.submitQuestionGeneration(1L);

        assertThat(result.getTaskType()).isEqualTo(TaskType.INTERVIEW_QUESTION_GENERATION.name());
    }

    @Test
    void submitFeedback_createsTaskWithCorrectType() {
        InterviewSessionEntity session = new InterviewSessionEntity(10L, 20L, "后端", "高级", "技术面", null);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        AiTaskEntity task = new AiTaskEntity(TaskType.INTERVIEW_FEEDBACK.name(), 10L, 20L);
        when(taskService.create(TaskType.INTERVIEW_FEEDBACK, 10L, 20L)).thenReturn(task);

        AiTaskEntity result = service.submitFeedback(1L);

        assertThat(result.getTaskType()).isEqualTo(TaskType.INTERVIEW_FEEDBACK.name());
    }

    @Test
    void getFeedback_throwsWhenNotFound() {
        when(feedbackRepository.findBySessionId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getFeedback(1L))
            .isInstanceOf(ApiException.class)
            .hasMessage("面试反馈不存在");
    }
}
