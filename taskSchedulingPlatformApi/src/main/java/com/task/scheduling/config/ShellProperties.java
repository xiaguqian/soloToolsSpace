package com.task.scheduling.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "task.shell")
public class ShellProperties {
    private String trustedDir = "/opt/executor/scripts/";
    private int timeoutSeconds = 60;
    private List<String> blacklist;
    private String allowedUser = "executor";
}
