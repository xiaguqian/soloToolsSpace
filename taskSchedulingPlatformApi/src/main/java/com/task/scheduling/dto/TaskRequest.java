package com.task.scheduling.dto;

import com.task.scheduling.enums.TaskType;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
public class TaskRequest {
    @NotBlank(message = "任务ID不能为空")
    private String jobId;
    
    @NotBlank(message = "任务名称不能为空")
    private String jobName;
    
    @NotNull(message = "调用类型不能为空")
    private TaskType taskType;
    
    @NotBlank(message = "命令详情不能为空")
    private String commandDetail;
    
    private Map<String, Object> parameters;
    
    private Integer timeoutSeconds;
}
