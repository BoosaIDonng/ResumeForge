package com.example.airesume.ai.quality;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes")
public class AiQualityScoreController {
    private final AiQualityScoreService service;
    private final ResumeRepository resumeRepository;

    public AiQualityScoreController(AiQualityScoreService service, ResumeRepository resumeRepository) {
        this.service = service;
        this.resumeRepository = resumeRepository;
    }

    @GetMapping("/{id}/quality-score")
    public ApiResponse<QualityScoreResponse> score(
            @PathVariable Long id,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        ResumeEntity resume = resumeRepository.findById(id)
            .orElseThrow(() -> new com.example.airesume.common.ApiException("RESUME_NOT_FOUND", "简历不存在"));
        return ApiResponse.ok(service.score(resume.getResumeData(), provider, apiKey, baseUrl, model));
    }
}
