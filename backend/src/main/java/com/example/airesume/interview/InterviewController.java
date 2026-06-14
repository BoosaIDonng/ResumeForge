package com.example.airesume.interview;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.interview.dto.AnswerRequest;
import com.example.airesume.interview.dto.CreateInterviewRequest;
import com.example.airesume.task.AiTaskEntity;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    private final InterviewService interviewService;
    private final InterviewChatService interviewChatService;
    private final InterviewSessionRepository sessionRepository;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public InterviewController(InterviewService interviewService, InterviewChatService interviewChatService,
                               InterviewSessionRepository sessionRepository) {
        this.interviewService = interviewService;
        this.interviewChatService = interviewChatService;
        this.sessionRepository = sessionRepository;
    }

    @GetMapping
    public ApiResponse<List<InterviewSessionEntity>> list() {
        return ApiResponse.ok(interviewService.listSessions());
    }

    @PostMapping
    public ApiResponse<SessionRef> create(@RequestBody CreateInterviewRequest request) {
        InterviewSessionEntity session = interviewService.createSession(
            request.resumeId(), request.jobId(), request.role(), request.level(), request.type(),
            request.persona(), request.techStack(), request.questionCount()
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

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        interviewService.deleteSession(id);
        return ApiResponse.ok(null);
    }

    @PostMapping(value = "/{id}/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@PathVariable Long id, @RequestBody Map<String, String> request) {
        SseEmitter emitter = new SseEmitter(120_000L);
        String message = request.get("message");

        executor.execute(() -> {
            try {
                interviewChatService.streamChat(id, message, chunk -> {
                    try {
                        emitter.send(SseEmitter.event().data(chunk));
                    } catch (Exception e) {
                        emitter.completeWithError(e);
                    }
                });
                emitter.send(SseEmitter.event().name("done").data(""));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    @GetMapping("/{id}/messages")
    public ApiResponse<List<InterviewMessageEntity>> getMessages(@PathVariable Long id) {
        return ApiResponse.ok(interviewChatService.getMessages(id));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        long total = sessionRepository.count();
        long completed = sessionRepository.countByStatus("COMPLETED");
        long pending = sessionRepository.countByStatus("PENDING");
        long inProgress = sessionRepository.countByStatus("IN_PROGRESS");
        return ApiResponse.ok(Map.of(
            "total", total,
            "completed", completed,
            "pending", pending,
            "inProgress", inProgress
        ));
    }

    record SessionRef(Long sessionId, Long taskId, String status) {}
    record TaskRef(Long taskId, String status) {}
    record InterviewDetail(InterviewSessionEntity session, List<InterviewQuestionEntity> questions) {}
}
