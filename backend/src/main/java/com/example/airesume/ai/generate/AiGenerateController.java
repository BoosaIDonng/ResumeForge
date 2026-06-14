package com.example.airesume.ai.generate;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiGenerateController {
    private final AiGenerateService generateService;

    public AiGenerateController(AiGenerateService generateService) {
        this.generateService = generateService;
    }

    @PostMapping("/generate-resume")
    public ApiResponse<GenerateResumeResponse> generateResume(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @Valid @RequestBody GenerateResumeRequest request
    ) {
        GenerateResumeResponse response = generateService.generate(
            provider, apiKey, baseUrl, model,
            request.jobTitle(), request.yearsOfExperience(),
            request.skills(), request.industry(),
            request.experience(), request.language()
        );
        return ApiResponse.ok(response);
    }
}
