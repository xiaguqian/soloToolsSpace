package com.task.scheduling.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "task.executor")
public class ExecutorProperties {
    private int corePoolSize = 10;
    private int maxPoolSize = 20;
    private int queueCapacity = 100;
    private int keepAliveSeconds = 60;
}
