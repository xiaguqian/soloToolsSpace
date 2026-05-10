package com.task.service;

import com.alibaba.fastjson.JSON;
import com.task.entity.Task;
import org.quartz.JobExecutionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class TaskJob extends QuartzJobBean {

    private static final Logger logger = LoggerFactory.getLogger(TaskJob.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${remote.execute.url}")
    private String remoteExecuteUrl;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        String jobId = context.getJobDetail().getKey().getName();
        String jobName = context.getJobDetail().getDescription();
        String taskTypeStr = context.getJobDetail().getJobDataMap().getString("taskType");
        String commandDetail = context.getJobDetail().getJobDataMap().getString("commandDetail");
        String parametersStr = context.getJobDetail().getJobDataMap().getString("parameters");
        Integer timeoutSeconds = context.getJobDetail().getJobDataMap().getInt("timeoutSeconds");

        Task.TaskType taskType = Task.TaskType.valueOf(taskTypeStr);

        logger.info("Executing task: jobId={}, jobName={}, taskType={}", jobId, jobName, taskType);

        try {
            executeRemote(jobId, jobName, taskType, commandDetail, parametersStr, timeoutSeconds);
        } catch (Exception e) {
            logger.error("Failed to execute task: jobId={}", jobId, e);
        }
    }

    private void executeRemote(String jobId, String jobName, Task.TaskType taskType, 
                                String commandDetail, String parametersStr, Integer timeoutSeconds) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("jobId", jobId);
            requestBody.put("jobName", jobName);
            requestBody.put("taskType", taskType.name());
            requestBody.put("commandDetail", commandDetail);
            requestBody.put("timeoutSeconds", timeoutSeconds);

            if (parametersStr != null && !parametersStr.isEmpty()) {
                try {
                    Map<String, Object> params = JSON.parseObject(parametersStr, Map.class);
                    requestBody.put("parameters", params);
                } catch (Exception e) {
                    logger.warn("Failed to parse parameters, using as string", e);
                }
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    remoteExecuteUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            logger.info("Remote execute response: {}", response.getBody());
        } catch (Exception e) {
            logger.error("Remote call failed", e);
            throw new RuntimeException("Remote execute failed", e);
        }
    }
}
