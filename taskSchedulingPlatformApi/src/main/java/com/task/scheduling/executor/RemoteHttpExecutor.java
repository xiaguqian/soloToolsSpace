package com.task.scheduling.executor;

import com.alibaba.fastjson.JSON;
import com.task.scheduling.dto.TaskExecutionResult;
import com.task.scheduling.enums.TaskStatus;
import com.task.scheduling.util.TemplateResolver;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.*;

@Component
public class RemoteHttpExecutor {
    
    private final TemplateResolver templateResolver;
    private final RestTemplate restTemplate;
    
    public RemoteHttpExecutor(TemplateResolver templateResolver) {
        this.templateResolver = templateResolver;
        this.restTemplate = new RestTemplate();
    }
    
    public TaskExecutionResult execute(String commandDetail, String jobId, Map<String, Object> parameters, int timeoutSeconds) {
        String resolvedUrl = templateResolver.resolve(commandDetail, jobId, parameters);
        Map<String, Object> resolvedParams = templateResolver.resolveMap(parameters, jobId);
        
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<TaskExecutionResult> future = executor.submit(() -> {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                String requestBody = JSON.toJSONString(resolvedParams);
                HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
                
                ResponseEntity<String> response = restTemplate.exchange(
                        resolvedUrl,
                        HttpMethod.POST,
                        entity,
                        String.class
                );
                
                boolean success = response.getStatusCode().is2xxSuccessful();
                
                return TaskExecutionResult.builder()
                        .status(success ? TaskStatus.SUCCESS : TaskStatus.FAILED)
                        .output(response.getBody() != null ? response.getBody() : "")
                        .errorMessage(success ? "" : "HTTP请求失败，状态码: " + response.getStatusCode())
                        .exitCode(response.getStatusCodeValue())
                        .build();
                        
            } catch (Exception e) {
                return TaskExecutionResult.builder()
                        .status(TaskStatus.FAILED)
                        .output("")
                        .errorMessage("HTTP请求异常: " + e.getMessage())
                        .exitCode(-1)
                        .build();
            }
        });
        
        try {
            int timeout = timeoutSeconds > 0 ? timeoutSeconds : 60;
            return future.get(timeout, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            return TaskExecutionResult.builder()
                    .status(TaskStatus.TIMEOUT)
                    .output("")
                    .errorMessage("HTTP请求超时，已超过 " + timeout + " 秒")
                    .exitCode(-1)
                    .build();
        } catch (Exception e) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .output("")
                    .errorMessage("执行异常: " + e.getMessage())
                    .exitCode(-1)
                    .build();
        } finally {
            executor.shutdownNow();
        }
    }
}
