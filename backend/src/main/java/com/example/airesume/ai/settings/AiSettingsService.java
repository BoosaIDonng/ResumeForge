package com.example.airesume.ai.settings;

import com.example.airesume.ai.AiProperties;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AiSettingsService {
    private final AiProperties properties;

    public AiSettingsService(AiProperties properties) {
        this.properties = properties;
    }

    public Map<String, Object> getSettings() {
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("provider", "openai-compatible");
        settings.put("baseUrl", properties.getBaseUrl() != null ? properties.getBaseUrl() : "");
        settings.put("model", properties.getModel() != null ? properties.getModel() : "");
        settings.put("temperature", properties.getTemperature());
        settings.put("maxTokens", properties.getMaxTokens() != null ? properties.getMaxTokens() : 0);

        // Mask API key: show first 4 and last 4 characters
        String apiKey = properties.getApiKey();
        if (apiKey != null && apiKey.length() > 8) {
            settings.put("apiKey", apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length() - 4));
        } else if (apiKey != null && !apiKey.isBlank()) {
            settings.put("apiKey", "****");
        } else {
            settings.put("apiKey", "");
        }

        return settings;
    }

    public Map<String, Object> updateSettings(String provider, String apiKey, String baseUrl, String model) {
        if (apiKey != null && !apiKey.isBlank()) {
            properties.setApiKey(apiKey);
        }
        if (baseUrl != null && !baseUrl.isBlank()) {
            properties.setBaseUrl(baseUrl);
        }
        if (model != null && !model.isBlank()) {
            properties.setModel(model);
        }
        // provider is informational; we only support openai-compatible
        return getSettings();
    }
}
