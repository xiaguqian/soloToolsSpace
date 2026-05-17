package com.xunreader.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "storage")
public class StorageConfig {
    private String type;
    private LocalConfig local;
    private QiniuConfig qiniu;
    private MinioConfig minio;

    @Data
    public static class LocalConfig {
        private String path;
    }

    @Data
    public static class QiniuConfig {
        private String accessKey;
        private String secretKey;
        private String bucket;
        private String domain;
    }

    @Data
    public static class MinioConfig {
        private String endpoint;
        private String accessKey;
        private String secretKey;
        private String bucket;
    }
}