package com.task.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LogService {

    private static final Logger logger = LoggerFactory.getLogger(LogService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${remote.logs.url}")
    private String remoteLogsUrl;

    public List<Map<String, Object>> getAllLogs() {
        try {
            String url = remoteLogsUrl;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JSONArray jsonArray = JSON.parseArray(response.getBody());
                return convertToMapList(jsonArray);
            }
        } catch (Exception e) {
            logger.error("Failed to get all logs", e);
        }
        return null;
    }

    public Map<String, Object> getLogById(String id) {
        try {
            String url = remoteLogsUrl + "/" + id;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return convertToMap(JSON.parseObject(response.getBody()));
            }
        } catch (Exception e) {
            logger.error("Failed to get log by id: {}", id, e);
        }
        return null;
    }

    public List<Map<String, Object>> getLogsByJobName(String jobName) {
        try {
            String url = remoteLogsUrl + "/name/" + jobName;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JSONArray jsonArray = JSON.parseArray(response.getBody());
                return convertToMapList(jsonArray);
            }
        } catch (Exception e) {
            logger.error("Failed to get logs by jobName: {}", jobName, e);
        }
        return null;
    }

    public List<Map<String, Object>> getLogsByDate(String date) {
        try {
            String url = remoteLogsUrl + "/date/" + date;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JSONArray jsonArray = JSON.parseArray(response.getBody());
                return convertToMapList(jsonArray);
            }
        } catch (Exception e) {
            logger.error("Failed to get logs by date: {}", date, e);
        }
        return null;
    }

    public Map<String, Object> executeTask(String jobId, String jobName, String taskType,
                                           String commandDetail, String parameters,
                                           Integer timeoutSeconds) {
        try {
            String url = remoteLogsUrl.replace("/logs", "/execute");
            
            JSONObject requestBody = new JSONObject();
            requestBody.put("jobId", jobId);
            requestBody.put("jobName", jobName);
            requestBody.put("taskType", taskType);
            requestBody.put("commandDetail", commandDetail);
            requestBody.put("timeoutSeconds", timeoutSeconds);

            if (parameters != null && !parameters.isEmpty()) {
                try {
                    JSONObject params = JSON.parseObject(parameters);
                    requestBody.put("parameters", params);
                } catch (Exception e) {
                    logger.warn("Failed to parse parameters, using as string");
                }
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<JSONObject> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getBody() != null) {
                return convertToMap(JSON.parseObject(response.getBody()));
            }
        } catch (Exception e) {
            logger.error("Failed to execute task: jobId={}", jobId, e);
            throw new RuntimeException("执行任务失败: " + e.getMessage());
        }
        return null;
    }

    private List<Map<String, Object>> convertToMapList(JSONArray jsonArray) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (jsonArray != null) {
            for (int i = 0; i < jsonArray.size(); i++) {
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                result.add(convertToMap(jsonObject));
            }
        }
        return result;
    }

    private Map<String, Object> convertToMap(JSONObject jsonObject) {
        Map<String, Object> result = new HashMap<>();
        if (jsonObject != null) {
            for (Map.Entry<String, Object> entry : jsonObject.entrySet()) {
                result.put(entry.getKey(), entry.getValue());
            }
        }
        return result;
    }
}
