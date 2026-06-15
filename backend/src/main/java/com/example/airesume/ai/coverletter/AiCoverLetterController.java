package com.example.airesume.ai.coverletter;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiCoverLetterController {
    private final AiCoverLetterService coverLetterService;

    public AiCoverLetterController(AiCoverLetterService coverLetterService) {
        this.coverLetterService = coverLetterService;
    }

    @PostMapping("/generate-cover-letter")
    public ApiResponse<CoverLetterGenResponse> generateCoverLetter(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @Valid @RequestBody CoverLetterGenRequest request
    ) {
        CoverLetterGenResponse response = coverLetterService.generate(
            provider, apiKey, baseUrl, model,
            request.resumeText(), request.jobDescription(),
            request.tone(), request.language()
        );
        return ApiResponse.ok(response);
    }
}
