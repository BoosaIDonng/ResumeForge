package com.example.airesume.ai.translate;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiTranslateController {
    private final AiTranslateService translateService;

    public AiTranslateController(AiTranslateService translateService) {
        this.translateService = translateService;
    }

    @PostMapping("/translate")
    public ApiResponse<TranslateResponse> translate(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @Valid @RequestBody TranslateRequest request
    ) {
        TranslateResponse response = translateService.translate(
            provider, apiKey, baseUrl, model,
            request.resumeId(), request.targetLanguage(), request.mode()
        );
        return ApiResponse.ok(response);
    }
}
