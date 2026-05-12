package com.xunfood.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.xunfood.config.AiConfig;
import com.xunfood.entity.Recipe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AiService {

    private final AiConfig aiConfig;
    private final RestTemplate restTemplate;

    public AiService(AiConfig aiConfig) {
        this.aiConfig = aiConfig;
        this.restTemplate = new RestTemplate();
    }

    public List<Recipe.Step> splitRecipeSteps(Recipe recipe) {
        if (!Boolean.TRUE.equals(aiConfig.getEnabled())) {
            log.info("AI服务已禁用，使用兜底逻辑");
            return fallbackSplitSteps(recipe);
        }

        try {
            List<Recipe.Step> aiSteps = callAiSplitSteps(recipe);
            if (aiSteps != null && !aiSteps.isEmpty()) {
                return aiSteps;
            }
            log.warn("AI返回空结果，使用兜底逻辑");
            return fallbackSplitSteps(recipe);
        } catch (Exception e) {
            log.error("AI调用失败，使用兜底逻辑", e);
            return fallbackSplitSteps(recipe);
        }
    }

    private List<Recipe.Step> callAiSplitSteps(Recipe recipe) throws Exception {
        AiConfig.AiModelConfig modelConfig = aiConfig.getCurrentModel();
        if (modelConfig == null || modelConfig.getApiKey() == null || modelConfig.getApiKey().startsWith("your-")) {
            log.warn("AI模型未配置，使用兜底逻辑");
            return null;
        }

        String prompt = buildPrompt(recipe);

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", "你是一个专业的厨师助手，擅长将菜谱步骤拆分为精准的计时步骤。请将菜谱步骤拆分为多个子步骤，每个子步骤都需要估算时间（以秒为单位）。返回JSON格式：{\"steps\": [{\"order\": 1, \"description\": \"步骤描述\", \"duration\": 300}]}");

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", prompt);

        messages.add(systemMsg);
        messages.add(userMsg);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelConfig.getModel());
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(modelConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                modelConfig.getBaseUrl() + "/chat/completions",
                HttpMethod.POST,
                entity,
                String.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            JSONObject json = JSON.parseObject(response.getBody());
            JSONArray choices = json.getJSONArray("choices");
            if (choices != null && !choices.isEmpty()) {
                String content = choices.getJSONObject(0).getJSONObject("message").getString("content");
                return parseAiResponse(content);
            }
        }
        return null;
    }

    private String buildPrompt(Recipe recipe) {
        StringBuilder sb = new StringBuilder();
        sb.append("菜谱标题：").append(recipe.getTitle()).append("\n");
        sb.append("菜谱简介：").append(recipe.getDescription()).append("\n");
        sb.append("烹饪时间：").append(recipe.getCookTime()).append("分钟\n");
        sb.append("步骤列表：\n");
        
        List<Recipe.Step> originalSteps = recipe.getStepList();
        if (originalSteps != null) {
            for (Recipe.Step step : originalSteps) {
                sb.append("步骤").append(step.getOrder()).append(": ").append(step.getDescription()).append("\n");
            }
        }
        return sb.toString();
    }

    private List<Recipe.Step> parseAiResponse(String content) {
        try {
            int jsonStart = content.indexOf("{");
            int jsonEnd = content.lastIndexOf("}");
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                String jsonStr = content.substring(jsonStart, jsonEnd + 1);
                JSONObject json = JSON.parseObject(jsonStr);
                JSONArray stepsJson = json.getJSONArray("steps");
                if (stepsJson != null) {
                    return stepsJson.toJavaList(Recipe.Step.class);
                }
            }
        } catch (Exception e) {
            log.error("解析AI响应失败", e);
        }
        return null;
    }

    private List<Recipe.Step> fallbackSplitSteps(Recipe recipe) {
        List<Recipe.Step> result = new ArrayList<>();
        List<Recipe.Step> originalSteps = recipe.getStepList();
        
        if (originalSteps == null || originalSteps.isEmpty()) {
            Recipe.Step step = new Recipe.Step();
            step.setOrder(1);
            step.setDescription("按照菜谱完成制作");
            step.setDuration(Math.max(recipe.getCookTime() * 60, 600));
            result.add(step);
            return result;
        }

        int totalOriginalTime = recipe.getCookTime() * 60;
        int avgTimePerStep = Math.max(totalOriginalTime / originalSteps.size(), 60);

        for (int i = 0; i < originalSteps.size(); i++) {
            Recipe.Step original = originalSteps.get(i);
            Recipe.Step newStep = new Recipe.Step();
            newStep.setOrder(i + 1);
            newStep.setDescription(original.getDescription());
            newStep.setImage(original.getImage());
            
            String desc = original.getDescription();
            int estimatedTime = estimateStepTime(desc, avgTimePerStep);
            newStep.setDuration(estimatedTime);
            
            result.add(newStep);
        }

        return result;
    }

    private int estimateStepTime(String description, int avgTime) {
        String lowerDesc = description.toLowerCase();
        
        if (lowerDesc.contains("煮") || lowerDesc.contains("炖") || lowerDesc.contains("蒸") || lowerDesc.contains("煲")) {
            return Math.max(avgTime * 2, 600);
        }
        if (lowerDesc.contains("炒") || lowerDesc.contains("煎") || lowerDesc.contains("炸")) {
            return Math.max(avgTime, 300);
        }
        if (lowerDesc.contains("切") || lowerDesc.contains("备") || lowerDesc.contains("准备") || lowerDesc.contains("洗")) {
            return Math.max(avgTime / 2, 180);
        }
        if (lowerDesc.contains("腌") || lowerDesc.contains("泡") || lowerDesc.contains("醒") || lowerDesc.contains("静置")) {
            return Math.max(avgTime * 2, 900);
        }
        
        return avgTime;
    }
}
