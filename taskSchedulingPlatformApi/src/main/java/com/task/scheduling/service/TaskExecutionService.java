package com.task.scheduling.service;

import com.task.scheduling.dto.TaskExecutionResult;
import com.task.scheduling.dto.TaskRequest;
import com.task.scheduling.entity.TaskLog;
import com.task.scheduling.enums.TaskStatus;
import com.task.scheduling.executor.LocalCodeExecutor;
import com.task.scheduling.executor.RemoteHttpExecutor;
import com.task.scheduling.executor.ShellExecutor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class TaskExecutionService {
    
    private final ShellExecutor shellExecutor;
    private final LocalCodeExecutor localCodeExecutor;
    private final RemoteHttpExecutor remoteHttpExecutor;
    private final TaskLogService taskLogService;
    private final Executor taskExecutor;
    
    public TaskExecutionService(
            ShellExecutor shellExecutor,
            LocalCodeExecutor localCodeExecutor,
            RemoteHttpExecutor remoteHttpExecutor,
            TaskLogService taskLogService,
            @Qualifier("taskExecutor") Executor taskExecutor) {
        this.shellExecutor = shellExecutor;
        this.localCodeExecutor = localCodeExecutor;
        this.remoteHttpExecutor = remoteHttpExecutor;
        this.taskLogService = taskLogService;
        this.taskExecutor = taskExecutor;
    }
    
    public TaskLog executeTask(TaskRequest request) {
        LocalDateTime startTime = LocalDateTime.now();
        TaskExecutionResult result;
        int timeoutSeconds = request.getTimeoutSeconds() != null ? request.getTimeoutSeconds() : 60;
        
        try {
            switch (request.getTaskType()) {
                case LOCAL_SHELL:
                    result = shellExecutor.execute(
                            request.getCommandDetail(),
                            request.getJobId(),
                            request.getParameters(),
                            timeoutSeconds
                    );
                    break;
                case LOCAL_CODE:
                    result = localCodeExecutor.execute(
                            request.getCommandDetail(),
                            request.getJobId(),
                            request.getParameters(),
                            timeoutSeconds
                    );
                    break;
                case REMOTE_HTTP:
                    result = remoteHttpExecutor.execute(
                            request.getCommandDetail(),
                            request.getJobId(),
                            request.getParameters(),
                            timeoutSeconds
                    );
                    break;
                default:
                    result = TaskExecutionResult.builder()
                            .status(TaskStatus.FAILED)
                            .errorMessage("不支持的任务类型: " + request.getTaskType())
                            .build();
            }
        } catch (Exception e) {
            result = TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .errorMessage("任务执行异常: " + e.getMessage())
                    .build();
        }
        
        LocalDateTime endTime = LocalDateTime.now();
        long durationMs = java.time.Duration.between(startTime, endTime).toMillis();
        
        TaskLog taskLog = TaskLog.builder()
                .jobId(request.getJobId())
                .jobName(request.getJobName())
                .taskType(request.getTaskType())
                .commandDetail(request.getCommandDetail())
                .parameters(request.getParameters())
                .status(result.getStatus())
                .output(result.getOutput())
                .errorMessage(result.getErrorMessage())
                .exitCode(result.getExitCode())
                .startTime(startTime)
                .endTime(endTime)
                .durationMs(durationMs)
                .build();
        
        return taskLogService.save(taskLog);
    }
    
    public CompletableFuture<TaskLog> executeTaskAsync(TaskRequest request) {
        return CompletableFuture.supplyAsync(() -> executeTask(request), taskExecutor);
    }
}
