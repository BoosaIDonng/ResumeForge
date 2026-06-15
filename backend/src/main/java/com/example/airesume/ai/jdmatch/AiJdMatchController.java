package com.example.airesume.ai.jdmatch;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiJdMatchController {
    private final AiJdMatchService jdMatchService;

    public AiJdMatchController(AiJdMatchService jdMatchService) {
        this.jdMatchService = jdMatchService;
    }

    @PostMapping("/jd-match")
    public ApiResponse<JdMatchResponse> jdMatch(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @Valid @RequestBody JdMatchRequest request
    ) {
        JdMatchResponse response = jdMatchService.match(
            provider, apiKey, baseUrl, model,
            request.resumeText(), request.jobDescription()
        );
        return ApiResponse.ok(response);
    }
}
