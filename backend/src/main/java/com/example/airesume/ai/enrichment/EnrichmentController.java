package com.example.airesume.ai.enrichment;

import com.example.airesume.common.ApiResponse;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI-powered resume enrichment endpoints.
 * Based on Resume-Matcher's enrichment module.
 *
 * Flow: Analyze weak descriptions → Generate clarifying questions → User answers → Generate new bullets
 */
@RestController
@RequestMapping("/api/ai/enrichment")
public class EnrichmentController {
    private final AiEnrichmentService enrichmentService;

    public EnrichmentController(AiEnrichmentService enrichmentService) {
        this.enrichmentService = enrichmentService;
    }

    /**
     * Analyze a resume to find weak descriptions and generate clarifying questions.
     */
    @PostMapping("/analyze/{resumeId}")
    public ApiResponse<AiEnrichmentService.EnrichmentAnalysis> analyze(
            @PathVariable Long resumeId,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        return ApiResponse.ok(enrichmentService.analyze(resumeId, provider, apiKey, baseUrl, model));
    }

    /**
     * Generate enhanced bullets from user answers to clarifying questions.
     */
    @PostMapping("/enhance/{resumeId}")
    public ApiResponse<AiEnrichmentService.EnrichmentResult> enhance(
            @PathVariable Long resumeId,
            @RequestBody EnrichmentRequest request,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        return ApiResponse.ok(enrichmentService.enhance(resumeId, request.answers(), provider, apiKey, baseUrl, model));
    }

    /**
     * Apply enhancements to the resume — append new bullets to existing descriptions.
     */
    @PostMapping("/apply/{resumeId}")
    public ApiResponse<String> apply(
            @PathVariable Long resumeId,
            @RequestBody AiEnrichmentService.EnrichmentResult result
    ) {
        enrichmentService.apply(resumeId, result.enhancements());
        return ApiResponse.ok("增强已应用");
    }

    /**
     * Regenerate a single item's description based on user feedback.
     */
    @PostMapping("/regenerate/{resumeId}")
    public ApiResponse<AiEnrichmentService.EnrichmentResult> regenerate(
            @PathVariable Long resumeId,
            @RequestBody RegenerateRequest request,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        return ApiResponse.ok(enrichmentService.regenerateItem(
            resumeId, request.itemType(), request.itemId(), request.userInstruction(),
            provider, apiKey, baseUrl, model
        ));
    }

    public record RegenerateRequest(String itemType, String itemId, String userInstruction) {}
}
