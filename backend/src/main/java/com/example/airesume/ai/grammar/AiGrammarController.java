package com.example.airesume.ai.grammar;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiGrammarController {
    private final AiGrammarService grammarService;

    public AiGrammarController(AiGrammarService grammarService) {
        this.grammarService = grammarService;
    }

    @PostMapping("/grammar-check")
    public ApiResponse<GrammarCheckResponse> grammarCheck(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @Valid @RequestBody GrammarCheckRequest request
    ) {
        GrammarCheckResponse response = grammarService.check(
            provider, apiKey, baseUrl, model, request.resumeText()
        );
        return ApiResponse.ok(response);
    }
}
