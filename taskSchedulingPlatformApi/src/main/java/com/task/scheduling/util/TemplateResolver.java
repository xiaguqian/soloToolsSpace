package com.task.scheduling.util;

import com.task.scheduling.config.SystemProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TemplateResolver {
    
    private final SystemProperties systemProperties;
    
    private static final Pattern TEMPLATE_PATTERN = Pattern.compile("\\$\\{([^}]+)\\}");
    
    public TemplateResolver(SystemProperties systemProperties) {
        this.systemProperties = systemProperties;
    }
    
    public String resolve(String template, String jobId, Map<String, Object> parameters) {
        if (template == null || template.isEmpty()) {
            return template;
        }
        
        Map<String, Object> context = buildContext(jobId, parameters);
        
        StringBuffer sb = new StringBuffer();
        Matcher matcher = TEMPLATE_PATTERN.matcher(template);
        
        while (matcher.find()) {
            String key = matcher.group(1);
            String value = getValueFromContext(context, key);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(value != null ? value : ""));
        }
        matcher.appendTail(sb);
        
        return sb.toString();
    }
    
    public Map<String, Object> resolveMap(Map<String, Object> parameters, String jobId) {
        if (parameters == null || parameters.isEmpty()) {
            return new HashMap<>();
        }
        
        Map<String, Object> resolved = new HashMap<>();
        Map<String, Object> context = buildContext(jobId, parameters);
        
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            Object value = entry.getValue();
            if (value instanceof String) {
                resolved.put(entry.getKey(), resolve((String) value, jobId, parameters));
            } else {
                resolved.put(entry.getKey(), value);
            }
        }
        
        return resolved;
    }
    
    private Map<String, Object> buildContext(String jobId, Map<String, Object> parameters) {
        Map<String, Object> context = new HashMap<>();
        
        context.put("sys.tempDir", systemProperties.getTempDir());
        context.put("job.execId", UUID.randomUUID().toString().replace("-", ""));
        context.put("job.id", jobId);
        context.put("job.executionTime", System.currentTimeMillis());
        
        if (parameters != null) {
            for (Map.Entry<String, Object> entry : parameters.entrySet()) {
                context.put("param." + entry.getKey(), entry.getValue());
            }
        }
        
        return context;
    }
    
    private String getValueFromContext(Map<String, Object> context, String key) {
        Object value = context.get(key);
        if (value != null) {
            return String.valueOf(value);
        }
        
        if (key.startsWith("param.")) {
            String paramKey = key.substring("param.".length());
            if (context.containsKey("param." + paramKey)) {
                return String.valueOf(context.get("param." + paramKey));
            }
        }
        
        return "";
    }
}
