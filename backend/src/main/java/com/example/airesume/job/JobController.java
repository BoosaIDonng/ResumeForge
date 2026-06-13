package com.example.airesume.job;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.job.dto.CreateJobRequest;
import com.example.airesume.job.dto.JobResponse;
import com.example.airesume.job.dto.UpdateJobRequest;
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
public class JobController {
    private final JobService service;

    public JobController(JobService service) {
        this.service = service;
    }

    @PostMapping("/api/jobs")
    public ApiResponse<JobResponse> create(@Valid @RequestBody CreateJobRequest request) {
        return ApiResponse.ok(JobResponse.from(
            service.create(request.resumeId(), request.title(), request.company(), request.description())
        ));
    }

    @GetMapping("/api/resumes/{resumeId}/jobs")
    public ApiResponse<List<JobResponse>> listByResume(@PathVariable Long resumeId) {
        return ApiResponse.ok(service.listByResume(resumeId).stream()
            .map(JobResponse::from)
            .toList());
    }

    @GetMapping("/api/jobs/{id}")
    public ApiResponse<JobResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(JobResponse.from(service.get(id)));
    }

    @PutMapping("/api/jobs/{id}")
    public ApiResponse<JobResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateJobRequest request
    ) {
        return ApiResponse.ok(JobResponse.from(
            service.update(id, request.title(), request.company(), request.description())
        ));
    }
}
