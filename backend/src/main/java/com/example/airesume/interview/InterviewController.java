package com.example.airesume.interview;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.interview.dto.AnswerRequest;
import com.example.airesume.interview.dto.CreateInterviewRequest;
import com.example.airesume.task.AiTaskEntity;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    public ApiResponse<List<InterviewSessionEntity>> list() {
        return ApiResponse.ok(interviewService.listSessions());
    }

    @PostMapping
    public ApiResponse<SessionRef> create(@RequestBody CreateInterviewRequest request) {
        InterviewSessionEntity session = interviewService.createSession(
            request.resumeId(), request.jobId(), request.role(), request.level(), request.type(), request.persona()
        );
        AiTaskEntity task = interviewService.submitQuestionGeneration(session.getId());
        return ApiResponse.ok(new SessionRef(session.getId(), task.getId(), task.getStatus()));
    }

    @GetMapping("/{id}")
    public ApiResponse<InterviewDetail> get(@PathVariable Long id) {
        InterviewSessionEntity session = interviewService.getSession(id);
        List<InterviewQuestionEntity> questions = interviewService.getQuestions(id);
        return ApiResponse.ok(new InterviewDetail(session, questions));
    }

    @PostMapping("/{id}/answers")
    public ApiResponse<InterviewQuestionEntity> answer(@PathVariable Long id, @RequestBody AnswerRequest request) {
        return ApiResponse.ok(interviewService.answerQuestion(request.questionId(), request.answer()));
    }

    @PostMapping("/{id}/feedback")
    public ApiResponse<TaskRef> submitFeedback(@PathVariable Long id) {
        AiTaskEntity task = interviewService.submitFeedback(id);
        return ApiResponse.ok(new TaskRef(task.getId(), task.getStatus()));
    }

    @GetMapping("/{id}/feedback")
    public ApiResponse<InterviewFeedbackEntity> getFeedback(@PathVariable Long id) {
        return ApiResponse.ok(interviewService.getFeedback(id));
    }

    record SessionRef(Long sessionId, Long taskId, String status) {}
    record TaskRef(Long taskId, String status) {}
    record InterviewDetail(InterviewSessionEntity session, List<InterviewQuestionEntity> questions) {}
}
