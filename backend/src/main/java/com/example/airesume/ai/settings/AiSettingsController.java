package com.example.airesume.ai.settings;

import com.example.airesume.common.ApiResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/settings")
public class AiSettingsController {
    private final AiSettingsService settingsService;

    public AiSettingsController(AiSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> getSettings() {
        return ApiResponse.ok(settingsService.getSettings());
    }

    @PutMapping
    public ApiResponse<Map<String, Object>> updateSettings(@RequestBody UpdateSettingsRequest request) {
        return ApiResponse.ok(settingsService.updateSettings(
            request.provider(), request.apiKey(), request.baseUrl(), request.model()
        ));
    }

    public record UpdateSettingsRequest(
        String provider,
        String apiKey,
        String baseUrl,
        String model
    ) {
    }
}
