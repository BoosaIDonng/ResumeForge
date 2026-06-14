package com.example.airesume.application;

import com.example.airesume.application.dto.ApplicationResponse;
import com.example.airesume.application.dto.CreateApplicationRequest;
import com.example.airesume.application.dto.UpdateApplicationRequest;
import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<ApplicationResponse> create(@Valid @RequestBody CreateApplicationRequest request) {
        return ApiResponse.ok(ApplicationResponse.from(
            service.create(request.resumeId(), request.jobId(), request.company(), request.position(),
                request.status(), request.appliedDate(), request.salaryRange(), request.jobUrl(),
                request.contactPerson(), request.notes())
        ));
    }

    @GetMapping
    public ApiResponse<List<ApplicationResponse>> list() {
        return ApiResponse.ok(service.listAll().stream()
            .map(ApplicationResponse::from)
            .toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<ApplicationResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(ApplicationResponse.from(service.get(id)));
    }

    @PutMapping("/{id}")
    public ApiResponse<ApplicationResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateApplicationRequest request
    ) {
        return ApiResponse.ok(ApplicationResponse.from(
            service.update(id, request.company(), request.position(), request.status(),
                request.appliedDate(), request.salaryRange(), request.jobUrl(),
                request.contactPerson(), request.notes())
        ));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> stats() {
        return ApiResponse.ok(service.getStats());
    }
}
