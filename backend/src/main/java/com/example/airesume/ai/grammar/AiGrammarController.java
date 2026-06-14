package com.example.airesume.ai.grammar;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
            provider, apiKey, baseUrl, model, request.resumeId()
        );
        return ApiResponse.ok(response);
    }

    @PostMapping("/grammar-check/apply")
    public ApiResponse<GrammarApplyResponse> applyFixes(@Valid @RequestBody GrammarApplyRequest request) {
        GrammarApplyResponse response = grammarService.applyFixes(request.resumeId(), request.fixes());
        return ApiResponse.ok(response);
    }

    @GetMapping("/grammar-check/history")
    public ApiResponse<List<GrammarCheckHistoryEntity>> getHistory(@RequestParam Long resumeId) {
        return ApiResponse.ok(grammarService.getHistory(resumeId));
    }

    @DeleteMapping("/grammar-check/history/{historyId}")
    public ApiResponse<Void> deleteHistory(@PathVariable Long historyId) {
        grammarService.deleteHistory(historyId);
        return ApiResponse.ok(null);
    }
}
