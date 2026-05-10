package com.task.scheduling.config;

import com.task.scheduling.enums.TaskType;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "task.system")
public class SystemProperties {
    private String tempDir = "/tmp";
}
