package com.example.airesume.chat;

import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatStreamService chatStreamService;
    private final ResumeService resumeService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public ChatController(ChatStreamService chatStreamService, ResumeService resumeService) {
        this.chatStreamService = chatStreamService;
        this.resumeService = resumeService;
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(120_000L);

        executor.execute(() -> {
            try {
                String resumeJson = null;
                if (request.resumeId() != null) {
                    try {
                        ResumeEntity resume = resumeService.get(request.resumeId());
                        resumeJson = resume.getResumeData();
                    } catch (Exception e) {
                        resumeJson = null;
                    }
                }

                chatStreamService.streamChat(request.messages(), resumeJson, chunk -> {
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
}
