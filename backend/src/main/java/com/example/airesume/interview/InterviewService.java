package com.example.airesume.interview;

import com.example.airesume.common.ApiException;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class InterviewService {
    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final TaskService taskService;

    public InterviewService(
        InterviewSessionRepository sessionRepository,
        InterviewQuestionRepository questionRepository,
        InterviewFeedbackRepository feedbackRepository,
        TaskService taskService
    ) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.feedbackRepository = feedbackRepository;
        this.taskService = taskService;
    }

    public InterviewSessionEntity createSession(Long resumeId, Long jobId, String role, String level, String type) {
        return createSession(resumeId, jobId, role, level, type, null);
    }

    public InterviewSessionEntity createSession(Long resumeId, Long jobId, String role, String level, String type, String persona) {
        InterviewSessionEntity session = new InterviewSessionEntity(resumeId, jobId, role, level, type, persona);
        return sessionRepository.save(session);
    }

    public List<InterviewSessionEntity> listSessions() {
        return sessionRepository.findAll();
    }

    public InterviewSessionEntity getSession(Long id) {
        return sessionRepository.findById(id)
            .orElseThrow(() -> new ApiException("SESSION_NOT_FOUND", "面试会话不存在"));
    }

    public List<InterviewQuestionEntity> getQuestions(Long sessionId) {
        return questionRepository.findBySessionIdOrderBySortOrder(sessionId);
    }

    public InterviewQuestionEntity answerQuestion(Long questionId, String answer) {
        InterviewQuestionEntity question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ApiException("QUESTION_NOT_FOUND", "面试题目不存在"));
        question.answer(answer);
        return questionRepository.save(question);
    }

    public AiTaskEntity submitQuestionGeneration(Long sessionId) {
        InterviewSessionEntity session = getSession(sessionId);
        return taskService.create(TaskType.INTERVIEW_QUESTION_GENERATION, session.getResumeId(), session.getJobId());
    }

    public AiTaskEntity submitFeedback(Long sessionId) {
        InterviewSessionEntity session = getSession(sessionId);
        return taskService.create(TaskType.INTERVIEW_FEEDBACK, session.getResumeId(), session.getJobId());
    }

    public InterviewFeedbackEntity getFeedback(Long sessionId) {
        return feedbackRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new ApiException("FEEDBACK_NOT_FOUND", "面试反馈不存在"));
    }
}
