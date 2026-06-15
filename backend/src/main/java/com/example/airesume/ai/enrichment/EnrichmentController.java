package com.example.airesume.ai.enrichment;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
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
    @PostMapping("/analyze")
    public ApiResponse<AiEnrichmentService.EnrichmentAnalysis> analyze(
            @Valid @RequestBody EnrichmentAnalyzeRequest request,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        return ApiResponse.ok(enrichmentService.analyze(request.resumeData(), provider, apiKey, baseUrl, model));
    }

    /**
     * Generate enhanced bullets from user answers to clarifying questions.
     */
    @PostMapping("/enhance")
    public ApiResponse<AiEnrichmentService.EnrichmentResult> enhance(
            @Valid @RequestBody EnrichmentEnhanceRequest request,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        return ApiResponse.ok(enrichmentService.enhance(request.resumeData(), request.answers(), provider, apiKey, baseUrl, model));
    }

    /**
     * Apply enhancements to the resume — append new bullets and return modified resumeData.
     */
    @PostMapping("/apply")
    public ApiResponse<String> apply(
            @Valid @RequestBody EnrichmentApplyRequest request
    ) {
        String updated = enrichmentService.apply(request.resumeData(), request.enhancements());
        return ApiResponse.ok(updated);
    }

    /**
     * Regenerate a single item's description based on user feedback.
     */
    @PostMapping("/regenerate")
    public ApiResponse<AiEnrichmentService.EnrichmentResult> regenerate(
            @Valid @RequestBody EnrichmentRegenerateRequest request,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        return ApiResponse.ok(enrichmentService.regenerateItem(
            request.resumeData(), request.itemType(), request.itemId(), request.userInstruction(),
            provider, apiKey, baseUrl, model
        ));
    }

    // Request records
    public record EnrichmentAnalyzeRequest(@NotBlank String resumeData) {}

    public record EnrichmentEnhanceRequest(
            @NotBlank String resumeData,
            @NotNull List<EnrichmentRequest.AnswerItem> answers) {}

    public record EnrichmentApplyRequest(
            @NotBlank String resumeData,
            @NotNull List<AiEnrichmentService.EnrichmentResult.EnhancedItem> enhancements) {}

    public record EnrichmentRegenerateRequest(
            @NotBlank String resumeData,
            String itemType,
            String itemId,
            String userInstruction) {}
}
