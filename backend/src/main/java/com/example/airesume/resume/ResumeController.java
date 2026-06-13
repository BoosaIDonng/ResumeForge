package com.example.airesume.resume;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.resume.dto.CreateResumeRequest;
import com.example.airesume.resume.dto.ResumeResponse;
import com.example.airesume.resume.dto.UpdateResumeRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    private final ResumeService service;

    public ResumeController(ResumeService service) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<ResumeResponse> create(@Valid @RequestBody CreateResumeRequest request) {
        return ApiResponse.ok(ResumeResponse.from(service.create(request.title(), request.master())));
    }

    @GetMapping
    public ApiResponse<List<ResumeResponse>> list() {
        return ApiResponse.ok(service.list().stream()
            .map(ResumeResponse::from)
            .toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<ResumeResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(ResumeResponse.from(service.get(id)));
    }

    @PutMapping("/{id}")
    public ApiResponse<ResumeResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateResumeRequest request
    ) {
        return ApiResponse.ok(ResumeResponse.from(service.update(id, request.title(), request.resumeData())));
    }
}
