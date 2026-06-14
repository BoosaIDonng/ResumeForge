package com.example.airesume.ai;

import org.springframework.stereotype.Component;

@Component
public class AiClientFactory {
    private final AiProperties defaultProperties;

    public AiClientFactory(AiProperties defaultProperties) {
        this.defaultProperties = defaultProperties;
    }

    /**
     * Create an AiClient with optional header overrides.
     * Falls back to default application.yml config when headers are null/blank.
     */
    public AiClient create(String provider, String apiKey, String baseUrl, String model) {
        if (isBlank(provider) && isBlank(apiKey) && isBlank(baseUrl) && isBlank(model)) {
            return new OpenAiCompatibleClient(defaultProperties);
        }

        AiProperties props = new AiProperties();
        props.setBaseUrl(isBlank(baseUrl) ? defaultProperties.getBaseUrl() : baseUrl);
        props.setApiKey(isBlank(apiKey) ? defaultProperties.getApiKey() : apiKey);
        props.setModel(isBlank(model) ? defaultProperties.getModel() : model);
        props.setTemperature(defaultProperties.getTemperature());
        props.setMaxTokens(defaultProperties.getMaxTokens());
        return new OpenAiCompatibleClient(props);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
