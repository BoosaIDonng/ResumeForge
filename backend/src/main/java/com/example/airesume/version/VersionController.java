package com.example.airesume.version;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.resume.dto.ResumeResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes/{resumeId}/versions")
public class VersionController {
    private final VersionService service;

    public VersionController(VersionService service) {
        this.service = service;
    }

    /**
     * Create a new version snapshot.
     */
    @PostMapping
    public ApiResponse<VersionResponse> createVersion(
            @PathVariable Long resumeId,
            @RequestParam(defaultValue = "手动保存") String description
    ) {
        VersionEntity v = service.createVersion(resumeId, description);
        return ApiResponse.ok(toResponse(v));
    }

    /**
     * List all versions for a resume.
     */
    @GetMapping
    public ApiResponse<List<VersionResponse>> listVersions(@PathVariable Long resumeId) {
        return ApiResponse.ok(service.listVersions(resumeId).stream().map(this::toResponse).toList());
    }

    /**
     * Restore to a specific version.
     */
    @PostMapping("/{versionId}/restore")
    public ApiResponse<ResumeResponse> restoreVersion(
            @PathVariable Long resumeId,
            @PathVariable Long versionId
    ) {
        var resume = service.restoreVersion(resumeId, versionId);
        return ApiResponse.ok(ResumeResponse.from(resume));
    }

    private VersionResponse toResponse(VersionEntity v) {
        return new VersionResponse(
            v.getId(),
            v.getResumeId(),
            v.getTitle(),
            v.getVersionNumber(),
            v.getChangeDescription(),
            v.getCreatedAt() != null ? v.getCreatedAt().toString() : null
        );
    }

    public record VersionResponse(
        Long id,
        Long resumeId,
        String title,
        Integer versionNumber,
        String changeDescription,
        String createdAt
    ) {}
}
