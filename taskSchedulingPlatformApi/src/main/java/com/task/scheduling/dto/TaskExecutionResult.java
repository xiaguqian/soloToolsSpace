package com.task.scheduling.dto;

import com.task.scheduling.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskExecutionResult {
    private TaskStatus status;
    private String output;
    private String errorMessage;
    private long exitCode;
}
