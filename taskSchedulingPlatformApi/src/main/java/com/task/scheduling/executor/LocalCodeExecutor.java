package com.task.scheduling.executor;

import com.task.scheduling.dto.TaskExecutionResult;
import com.task.scheduling.enums.TaskStatus;
import com.task.scheduling.util.TemplateResolver;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.concurrent.*;

@Component
public class LocalCodeExecutor {
    
    private final ApplicationContext applicationContext;
    private final TemplateResolver templateResolver;
    
    public LocalCodeExecutor(ApplicationContext applicationContext, TemplateResolver templateResolver) {
        this.applicationContext = applicationContext;
        this.templateResolver = templateResolver;
    }
    
    public TaskExecutionResult execute(String commandDetail, String jobId, Map<String, Object> parameters, int timeoutSeconds) {
        String resolvedCommand = templateResolver.resolve(commandDetail, jobId, parameters);
        Map<String, Object> resolvedParams = templateResolver.resolveMap(parameters, jobId);
        
        String[] parts = resolvedCommand.split("\\.");
        if (parts.length != 2) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .output("")
                    .errorMessage("命令详情格式错误，应为 beanName.methodName")
                    .exitCode(-1)
                    .build();
        }
        
        String beanName = parts[0];
        String methodName = parts[1];
        
        Object bean;
        try {
            bean = applicationContext.getBean(beanName);
        } catch (Exception e) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .output("")
                    .errorMessage("未找到Bean: " + beanName + ", 错误: " + e.getMessage())
                    .exitCode(-1)
                    .build();
        }
        
        Method targetMethod;
        try {
            targetMethod = bean.getClass().getMethod(methodName, Map.class);
        } catch (NoSuchMethodException e) {
            return TaskExecutionResult.builder()
                    .status(TaskStatus.FAILED)
                    .output("")
                    .errorMessage("未找到方法: " + methodName + "，方法签名应为 methodName(Map<String, Object>)")
                    .exitCode(-1)
                    .build();
        }
        
        int timeout = timeoutSeconds > 0 ? timeoutSeconds : 60;
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<TaskExecutionResult> future = executor.submit(() -> {
            try {
                Object result = targetMethod.invoke(bean, resolvedParams);
                if (result instanceof TaskExecutionResult) {
                    return (TaskExecutionResult) result;
                } else {
                    return TaskExecutionResult.builder()
                            .status(TaskStatus.SUCCESS)
                            .output(result != null ? result.toString() : "")
                            .errorMessage("")
                            .exitCode(0)
                            .build();
                }
            } catch (Exception e) {
                return TaskExecutionResult.builder()
                        .status(TaskStatus.FAILED)
                        .output("")
                        .errorMessage("方法执行异常: " + e.getMessage())
                        .exitCode(-1)
                        .build();
            }
        });
        
        try {
            return future.get(timeout, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            return TaskExecutionResult.builder()
                    .status(TaskStatus.TIMEOUT)
                    .output("")
                    .errorMessage("执行超时，已超过 " + timeout + " 秒")
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
