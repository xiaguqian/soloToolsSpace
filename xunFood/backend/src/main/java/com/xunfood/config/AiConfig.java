package com.xunfood.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "xunfood.ai")
public class AiConfig {
    private String provider;
    private Map<String, AiModelConfig> models;
    private Boolean enabled;
    private Long timeout;

    @Data
    public static class AiModelConfig {
        private String apiKey;
        private String baseUrl;
        private String model;
    }

    public AiModelConfig getCurrentModel() {
        return models != null ? models.get(provider) : null;
    }
}
