package com.example.airesume.ai.optimize;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiSectionOptimizeController {
    private final AiSectionOptimizeService service;

    public AiSectionOptimizeController(AiSectionOptimizeService service) {
        this.service = service;
    }

    @PostMapping("/optimize-section")
    public ApiResponse<SectionOptimizeResponse> optimizeSection(
            @Valid @RequestBody SectionOptimizeRequest request,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        return ApiResponse.ok(service.optimize(request, provider, apiKey, baseUrl, model));
    }
}
