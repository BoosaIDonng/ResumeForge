package com.example.airesume.ai;

import com.example.airesume.common.ApiResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiConfigController {
    private final AiProperties properties;

    public AiConfigController(AiProperties properties) {
        this.properties = properties;
    }

    @GetMapping("/config")
    public ApiResponse<Map<String, Object>> getConfig() {
        return ApiResponse.ok(Map.of(
            "baseUrl", properties.getBaseUrl() != null ? properties.getBaseUrl() : "",
            "model", properties.getModel() != null ? properties.getModel() : "",
            "temperature", properties.getTemperature(),
            "maxTokens", properties.getMaxTokens() != null ? properties.getMaxTokens() : 0
        ));
    }

    @PutMapping("/config")
    public ApiResponse<Map<String, Object>> updateConfig(@RequestBody UpdateAiConfigRequest request) {
        if (request.model() != null && !request.model().isBlank()) {
            properties.setModel(request.model());
        }
        if (request.temperature() != null) {
            properties.setTemperature(request.temperature());
        }
        if (request.maxTokens() != null) {
            properties.setMaxTokens(request.maxTokens());
        }
        return getConfig();
    }

    public record UpdateAiConfigRequest(
        String model,
        Double temperature,
        Integer maxTokens
    ) {}
}
