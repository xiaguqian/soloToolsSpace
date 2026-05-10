package com.task.scheduling.entity;

import com.task.scheduling.enums.TaskStatus;
import com.task.scheduling.enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskLog {
    private String id;
    private String jobId;
    private String jobName;
    private TaskType taskType;
    private String commandDetail;
    private Map<String, Object> parameters;
    private TaskStatus status;
    private String output;
    private String errorMessage;
    private Long exitCode;
    private Long durationMs;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
