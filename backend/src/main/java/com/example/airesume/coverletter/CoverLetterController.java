package com.example.airesume.coverletter;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.task.AiTaskEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cover-letters")
public class CoverLetterController {
    private final CoverLetterService service;

    public CoverLetterController(CoverLetterService service) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<TaskRef> submit(@RequestBody CoverLetterRequest request) {
        AiTaskEntity task = service.submit(request.resumeId(), request.jobId());
        return ApiResponse.ok(new TaskRef(task.getId(), task.getStatus()));
    }

    @GetMapping("/{id}")
    public ApiResponse<CoverLetterEntity> get(@PathVariable Long id) {
        return ApiResponse.ok(service.get(id));
    }

    record CoverLetterRequest(Long resumeId, Long jobId, String tone) {}
    record TaskRef(Long taskId, String status) {}
}
